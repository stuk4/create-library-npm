import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import postcss from "rollup-plugin-postcss";
import dts from "rollup-plugin-dts";
import { terser } from "rollup-plugin-terser";
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import packageJson from "./package.json" assert { type: "json" };

const outputFormat = process.env.OUTPUT_FORMAT;

const outputEsm = [
  {
    file: packageJson.module ,
    format: "esm",
    sourcemap: true,
  }
]
const outputCjs = [
  ...outputEsm,
  {
    file: packageJson.main ,
    format: "cjs",
    sourcemap: true,
  }
] 

export default [
  {
    input: "src/index.ts",
    output:outputFormat === "esm" ? outputEsm: outputCjs,
    plugins: [
      peerDepsExternal(),
      resolve(),
      commonjs(),
      typescript({ tsconfig: "./tsconfig.json" }),
      postcss({
        extensions: ['.css']
    }),
    terser(),
    ],
  },
  {
    input: "dist/esm/index.d.ts",
    output: [{ file: "dist/index.d.ts", format: "esm" }],
    plugins: [dts()],
    external: [/\.css$/],
  }
];