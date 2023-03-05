import colors, { Color } from "colors";
interface LibraryTypes {
  name: string;
  display: string;
  color: Color;
  variants: LibraryVariants[];
}
interface LibraryVariants {
  name: string;
  display: string;
  color: Color;
}

export const DEFAULT_DIR = "library-npm-project";
export const LIBRARY_TYPES: LibraryTypes[] = [
  {
    name: "vanilla",
    display: "Vanilla",
    color: colors.yellow,
    variants: [
      {
        name: "vanilla",
        display: "JavaScript",
        color: colors.yellow,
      },
      {
        name: "vanilla-ts",
        display: "TypeScript",
        color: colors.blue,
      },
    ],
  },
  {
    name: "react",
    display: "React",
    color: colors.blue,
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
