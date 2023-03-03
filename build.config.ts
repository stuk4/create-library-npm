export default {
  entries: ["src/index"],
  clean: true,
  rollup: {
    inlineDependencies: true,
    esbuild: {
      minify: true,
    },
  },
  // Generates .d.ts declaration file
  declaration: true,
};
