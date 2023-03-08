import colors from "colors";
import { LibraryType } from "./interfaces";

export const DEFAULT_DIR = "library-npm-project";
export const LIBRARY_TYPES: LibraryType[] = [
  {
    name: "react",
    display: "React",
    color: colors.cyan,
    variants: [
      {
        name: "react",
        display: "JavaScript",
        color: colors.yellow,
      },
      {
        name: "react-ts",
        display: "TypeScript",
        color: colors.blue,
      },
    ],
  },
];
