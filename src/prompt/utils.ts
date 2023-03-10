import fs from "node:fs";
import path from "node:path";

export const formatTargetDir = (targetDir: string | undefined) => {
  return targetDir?.trim().replace(/\/+$/g, "");
};
export const isEmptyDir = (path: string) => {
  const files = fs.readdirSync(path);

  return files.length === 0 || (files.length === 1 && files[0] === ".git");
};
export const isValidPackageName = (projectName: string) => {
  return /^(?:@[a-z\d\-*~][a-z\d\-*._~]*\/)?[a-z\d\-~][a-z\d\-._~]*$/.test(
    projectName
  );
};

export const formatPackageName = (projectName: string) => {
  return projectName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/^[._]/, "")
    .replace(/[^a-z\d\-~]+/g, "-");
};
export const cleanDir = (dir: string) => {
  try {
    if (!fs.existsSync(dir)) {
      return;
    }
    for (const file of fs.readdirSync(dir)) {
      if (file === ".git") {
        continue;
      }
      fs.rmSync(path.resolve(dir, file), { recursive: true, force: true });
    }
  } catch (error) {
    console.log(error);
    return;
  }
};

export const copy = (src: string, dest: string) => {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    copyDir(src, dest);
  } else {
    fs.copyFileSync(src, dest);
  }
};
export const copyDir = (srcDir: string, destDir: string) => {
  fs.mkdirSync(destDir, { recursive: true });
  for (const file of fs.readdirSync(srcDir)) {
    const srcFile = path.resolve(srcDir, file);
    const destFile = path.resolve(destDir, file);
    copy(srcFile, destFile);
  }
};
export const renameFile: Record<string, string | undefined> = {
  _gitignore: ".gitignore",
  _babelrc: ".babelrc",
};
