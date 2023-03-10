export default {
  entries: ["src/index"],
  clean: true,
  rollup: {
    inlineDependencies: true,
    esbuild: {
      minify: true,
    },
  },
  declaration: false,
};
