import prompts, { Answers, PromptObject } from "prompts";
import colors from "colors";
import figlet from "figlet";
import { cleanDir, formatTargetDir, isEmptyDir, renameGit } from "./utils";
import fs from "node:fs";
import { DEFAULT_DIR, LIBRARY_TYPES } from "./constants";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { copyDir } from "./utils";
import { LibraryType, IPackageJson } from "./interfaces";
export class CLiCnL {
  private questions: PromptObject[];
  private targetDir: string = DEFAULT_DIR;
  private cwd: string = process.cwd();
  private root: string = path.join(this.cwd, DEFAULT_DIR);

  private answers:
    | Answers<
        "projectName" | "overwrite" | "packageName" | "libraryType" | "variant"
      >
    | undefined;
  constructor() {
    colors.enable();
    this.questions = [
      {
        type: "text",
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
        type: "select",
        name: "libraryType",
        message: "Select a type of library:",
        initial: 0,
        choices: LIBRARY_TYPES.map((library) => {
          const frameworkColor = library.color;
          return {
            title: frameworkColor(library.display || library.name),
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
    } catch (cancelled: any) {
      console.log(cancelled.message);
      return;
    }
  }

  private createDir() {
    if (this.answers?.overwrite) {
      cleanDir(this.root);
    } else if (!fs.existsSync(this.root)) {
      fs.mkdirSync(this.root, { recursive: true });
    }
  }

  private writeFile(file: string, content?: string) {
    const targetPath = path.join(this.root, renameGit[file] ?? file);
    console.table({ targetPath });
    if (content) {
      fs.writeFileSync(targetPath, content);
    } else {
      copyDir(path.join(this.templateDir, file), targetPath);
    }
  }

  private writeTemplatesFiles() {
    const files = fs.readdirSync(this.templateDir);
    for (const file of files.filter((f) => f !== "package.json")) {
      this.writeFile(file);
    }
  }
  private writePkg() {
    const pkg: IPackageJson = JSON.parse(
      fs.readFileSync(path.join(this.templateDir, `package.json`), "utf-8")
    );
    pkg.name = this.answers?.packageName;

    this.writeFile("package.json", JSON.stringify(pkg, null, 2));
  }
}
