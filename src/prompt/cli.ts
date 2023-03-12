import prompts, { Answers, PromptObject } from "prompts";
import colors from "colors";
import figlet from "figlet";
import {
  cleanDir,
  copy,
  formatPackageName,
  formatTargetDir,
  isEmptyDir,
  isValidPackageName,
  pkgFromUserAgent,
  renameFile,
} from "./utils";
import fs from "node:fs";
import { DEFAULT_DIR, LIBRARY_TYPES } from "./constants";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { LibraryType, IPackageJson } from "./interfaces";
import { Command, CommandOptions } from "commander";
import { myPackageJson } from "./utils";

interface MyCommandOptions extends CommandOptions {
  template?: string;
}

export class CLiCnL {
  private questions: PromptObject[];

  private argvCommand: Command = new Command(myPackageJson().name)
    .version(myPackageJson().version)
    .option("<project-directory>", "Path to save library")
    .usage(`${"<project-directory>".green} [options]`)
    .option(
      "-t, --template <path-to-template>",
      "specify a template for the created project"
    )
    .parse(process.argv);
  private options: MyCommandOptions = this.argvCommand.opts();
  private cwd: string = process.cwd();
  private root: string = path.join(this.cwd, DEFAULT_DIR);
  private argvTemplate: string | undefined = this.options.template;
  private pkgInfo = pkgFromUserAgent(process.env.npm_config_user_agent);
  private pkgManager = this.pkgInfo ? this.pkgInfo.name : "npm";
  private targetDir: string = this.argvTargetDir || DEFAULT_DIR;
  private answers:
    | Answers<
        "projectName" | "overwrite" | "packageName" | "libraryType" | "variant"
      >
    | undefined;

  constructor() {
    colors.enable();

    this.questions = [
      {
        type: this.argvTargetDir ? null : "text",
        name: "projectName",
        message: "Project name:",
        initial: DEFAULT_DIR,
        onState: (state) => {
          this.targetDir = formatTargetDir(state.value) || DEFAULT_DIR;
        },
      },
      {
        type: () =>
          !fs.existsSync(this.targetDir) || isEmptyDir(this.targetDir)
            ? null
            : "confirm",
        name: "overwrite",
        message: () =>
          (this.targetDir === "."
            ? "Current directory"
            : `Target directory "${this.targetDir}"`) +
          ` is not empty. Remove existing files and continue?`,
      },
      {
        type: (_, { overwrite }: { overwrite?: boolean }) => {
          if (overwrite === false) {
            throw new Error("✖".red + " Operation cancelled");
          }
          return null;
        },
        name: "overwriteChecker",
      },
      {
        type: () => (isValidPackageName(this.getProjectName) ? null : "text"),
        name: "packageName",
        message: "Package name:",
        initial: () => formatPackageName(this.getProjectName),
        validate: (dir) =>
          isValidPackageName(dir) || "Invalid package.json name",
      },
      {
        type:
          this.argvTemplate && this.templates.includes(this.argvTemplate)
            ? null
            : "select",
        name: "libraryType",
        message:
          typeof this.argvTemplate === "string" &&
          !this.templates.includes(this.argvTemplate)
            ? `"${this.argvTemplate}" isn't a valid template. Please choose from below: `
            : "Select a library type:",
        initial: 0,
        choices: LIBRARY_TYPES.map((library) => {
          const libraryColor = library.color;
          return {
            title: libraryColor(library.display || library.name),
            value: library,
          };
        }),
      },
      {
        type: (libraryType: LibraryType) =>
          libraryType && libraryType.variants ? "select" : null,
        name: "variant",
        message: "Select a variant:",
        choices: (libraryType: LibraryType) =>
          libraryType.variants.map((variant) => {
            const variantColor = variant.color;
            return {
              title: variantColor(variant.display || variant.name),
              value: variant.name,
            };
          }),
      },
    ];
  }

  private get template(): string {
    const template: string =
      this.answers?.variant ||
      this.answers?.libraryType ||
      this.options.template;

    return template;
  }

  private get templateDir(): string {
    return path.resolve(
      fileURLToPath(`file://${__dirname}`),
      "../../templates",
      `${this.template}`
    );
  }

  private get argvTargetDir(): string | undefined {
    return formatTargetDir(this.argvCommand.args[0]);
  }

  private get templates() {
    const TEMPLATES = LIBRARY_TYPES.map(
      (library) =>
        (library.variants && library.variants.map((v) => v.name)) || [
          library.name,
        ]
    ).reduce((a, b) => a.concat(b), []);
    return TEMPLATES;
  }
  private get getProjectName() {
    return this.targetDir === "."
      ? path.basename(path.resolve())
      : this.targetDir;
  }

  private createDir() {
    try {
      if (this.answers?.overwrite) {
        cleanDir(this.root);
      } else if (!fs.existsSync(this.root)) {
        fs.mkdirSync(this.root, { recursive: true });
      }
    } catch (error) {
      console.log(error);
    }
  }

  private writeFile(file: string, content?: string) {
    try {
      const targetPath = path.join(this.root, renameFile[file] ?? file);
      if (content) {
        fs.writeFileSync(targetPath, content);
      } else {
        copy(path.join(this.templateDir, file), targetPath);
      }
    } catch (error) {
      console.log(error);
    }
  }

  private writeTemplatesFiles() {
    try {
      const files = fs.readdirSync(this.templateDir);
      for (const file of files.filter((f) => f !== "package.json")) {
        this.writeFile(file);
      }
    } catch (error) {
      console.log(error);
    }
  }
  private writePkg() {
    try {
      const pkg: IPackageJson = JSON.parse(
        fs.readFileSync(path.join(this.templateDir, `package.json`), "utf-8")
      );

      pkg.name = this.answers?.packageName || this.getProjectName;
      this.writeFile("package.json", JSON.stringify(pkg, null, 2));
    } catch (error) {
      console.log(error);
    }
  }
  private instructions() {
    const cdProjectName = path.relative(this.cwd, this.root);
    console.log(`\n${"Done".green}. Now run:\n`);
    if (this.root !== this.cwd) {
      console.log(
        `  cd ${
          cdProjectName.includes(" ") ? `"${cdProjectName}"` : cdProjectName
        }`
      );
    }
    switch (this.pkgManager) {
      case "yarn":
        console.log("  yarn");
        break;
      default:
        console.log(`  ${this.pkgManager} install`);
        break;
    }
    console.log();
  }

  public async run() {
    console.clear();
    console.log(
      colors.green(
        figlet.textSync("CLN", {
          font: "3D-ASCII",
          horizontalLayout: "full",
          verticalLayout: "full",
          width: 80,
          whitespaceBreak: true,
        })
      )
    );
    console.log("======================================".green);
    console.log(`           Create ${"NPM".blue} library`.white);
    console.log("======================================\n".green);

    try {
      this.answers = await prompts(this.questions, {
        onCancel: () => {
          throw new Error("✖".red + " Operation cancelled");
        },
      });
      this.createDir();
      console.log(`\Creating project in ${this.root}...`);
      this.writeTemplatesFiles();
      this.writePkg();
      this.instructions();
    } catch (cancelled: any) {
      console.log(cancelled.message);
      return;
    }
  }
}
