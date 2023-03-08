import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import postcss from "rollup-plugin-postcss";
import { terser } from "rollup-plugin-terser";
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import packageJson from "./package.json" assert { type: "json" };
import babel from 'rollup-plugin-babel'
// const packageJson = require("./package.json")
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
    file: packageJson.main,
    format: "cjs",
    sourcemap: true,
  }
] 

export default [
  {
    input: "src/index.js",
    output:outputFormat === "esm" ? outputEsm: outputCjs,
    external: [
      'react',
      'react-proptypes'
    ],
    plugins: [
      babel({
        exclude: 'node_modules/**',
        extensions: ['.js',".jsx"],
      }),
      peerDepsExternal(),
      resolve(),
      commonjs(),
      postcss({
        extensions: ['.css']
    }),
    terser() ,
   
    ],
  }
];