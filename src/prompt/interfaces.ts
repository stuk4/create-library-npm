import { Color } from "colors";
export interface LibraryType {
  name: string;
  display: string;
  color: Color;
  variants: LibraryVariants[];
}
export interface LibraryVariants {
  name: string;
  display: string;
  color: Color;
}

export interface IPackageJson {
  name: string;
  version: string;
  description: string;
  author: string;
  main: string;
  module: string;
  types: string;
  license: string;
  repository: Repository;
  keywords: string[];
  engines: Engines;
  files: string[];
  scripts: Scripts;
  dependencies: Record<string, string>;
  peerDependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

export interface Engines {
  node: string;
}

export interface PeerDependencies {
  react: string;
}

export interface Repository {
  type: string;
  url: string;
}

export interface Scripts {
  build: string;
  test: string;
}
