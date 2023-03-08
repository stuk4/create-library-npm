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
  renameGit,
} from "./utils";
import fs from "node:fs";
import { DEFAULT_DIR, LIBRARY_TYPES } from "./constants";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { LibraryType, IPackageJson } from "./interfaces";
import minimist from "minimist";
export class CLiCnL {
  private questions: PromptObject[];
  private cwd: string = process.cwd();
  private root: string = path.join(this.cwd, DEFAULT_DIR);
  private argv = minimist<{
    t?: string;
    template?: string;
  }>(process.argv.slice(2), { string: ["_"] });
  private answers:
    | Answers<
        "projectName" | "overwrite" | "packageName" | "libraryType" | "variant"
      >
    | undefined;
  private targetDir: string = this.argvTargetDir || DEFAULT_DIR;

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
        type: (framework: LibraryType) =>
          framework && framework.variants ? "select" : null,
        name: "variant",
        message: "Select a variant:",
        choices: (framework: LibraryType) =>
          framework.variants.map((variant) => {
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
      this.answers?.variant || this.answers?.libraryType.name;
    return template;
  }

  private get templateDir(): string {
    return path.resolve(
      fileURLToPath(import.meta.url),
      "../../../templates",
      `${this.template}`
    );
  }

  private get argvTargetDir(): string | undefined {
    return formatTargetDir(this.argv._[0]);
  }
  private get argvTemplate(): string | undefined {
    return this.argv.template || this.argv.t;
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
  public async run() {
    console.clear();
    console.log(
      colors.green(
        figlet.textSync("CNL", {
          font: "3D-ASCII",
          horizontalLayout: "full",
          verticalLayout: "full",
          width: 80,
          whitespaceBreak: true,
        })
      )
    );
    console.log("======================================".green);
    console.log(`           Creae ${"NPM".blue} library`.white);
    console.log("======================================\n".green);
    // let answers: Answers<
    //   "projectName" | "overwrite" | "packageName" | "libraryType" | "variant"
    // >;

    try {
      this.answers = await prompts(this.questions, {
        onCancel: () => {
          throw new Error("✖".red + " Operation cancelled");
        },
      });
      this.createDir();
      console.log(`\Creting project in ${this.root}...`);
      console.table({
        template: this.template,
        templateDir: this.templateDir,
      });
      this.writeTemplatesFiles();
      this.writePkg();
    } catch (cancelled: any) {
      console.log(cancelled.message);
      return;
    }
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
      const targetPath = path.join(this.root, renameGit[file] ?? file);
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
      console.log(pkg);
      pkg.name = this.answers?.packageName || this.getProjectName;
      // TODO: LINE 380
      this.writeFile("package.json", JSON.stringify(pkg, null, 2));
    } catch (error) {
      console.log(error);
    }
  }
}
