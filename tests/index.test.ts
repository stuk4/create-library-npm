// import type { ExecaSyncReturnValue, SyncOptions } from "execa";
// import { execaCommandSync } from "execa";
import path, { join } from "path";
const CLI_PATH = join(__dirname, "../dist/index.js");
import * as childProcess from "child_process";
import fs from "fs-extra";

const projectName = "library-test";
const genPath = join(__dirname, projectName);
// const run = (
//   args: string[],
//   options: SyncOptions = {}
// ): ExecaSyncReturnValue => {
//   return execaCommandSync(`node ${CLI_PATH} ${args.join(" ")}`, options);
// };
describe("CLI tool create-library-npm", () => {
  beforeAll(() => fs.remove(genPath));
  afterEach(() => fs.remove(genPath));

  it("prompts of cnl for the project name if none supplied ", () => {
    const output = childProcess.execSync(`cnl`, {
      encoding: "utf8",
    });
    expect(output).toContain("Project name:");
  });

  it("prompts of create-library-npm for the project name if none supplied ", () => {
    const output = childProcess.execSync(`create-library-npm`, {
      encoding: "utf8",
    });
    expect(output).toContain("Project name:");
  });

  it("prompts for the library type if none supplied when target dir is current directory", () => {
    fs.mkdirSync(genPath);
    const output = childProcess.execSync(`create-library-npm .`, {
      encoding: "utf8",
      cwd: genPath,
    });
    expect(output).toContain("Select a library type:");
  });

  it("prompts for the library on not supplying a value for --template", () => {
    try {
      childProcess.execSync(`cnl ${projectName} --template`, {
        encoding: "utf8",
      });
    } catch (error: any) {
      expect(error.output[2]).toContain(
        "error: option '-t, --template <path-to-template>' argument missing"
      );
    }
  });

  it("prompts for the library on supplying an invalid template", () => {
    const output = childProcess.execSync(
      `cnl ${projectName} --template unknown`,
      {
        encoding: "utf8",
      }
    );
    expect(output).toContain(
      `"unknown" isn't a valid template. Please choose from below:`
    );
  });
});
