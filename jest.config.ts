/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

export default {
  clearMocks: true,
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.ts?$": "ts-jest",
  },
  coveragePathIgnorePatterns: ["templates"],
  modulePathIgnorePatterns: ["templates"],
  // transformIgnorePatterns: ["<rootDir>/node_modules/"],
};
