import prompts, { Answers, PromptObject } from "prompts";
import colors from "colors";
import figlet from "figlet";
import { formatTargetDir, isEmptyDir } from "./utils";
import fs from "node:fs";
import { DEFAULT_DIR, LIBRARY_TYPES } from "./constants";

export class CLiCnL {
  private questions: PromptObject[];
  private targetDir: string = DEFAULT_DIR;

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
        name: "framework",
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
    ];
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
    let answers: Answers<"projectName" | "overwrite" | "packageName">;

    try {
      answers = await prompts(this.questions, {
        onCancel: () => {
          throw new Error("✖".red + " Operation cancelled");
        },
      });
    } catch (cancelled: any) {
      console.log(cancelled.message);
      return;
    }
  }
}
