# create-npm-library

A tool to quickly start a npm library project

## Create Your First library

> **Compatibility Note:**
> Requires [Node.js](https://nodejs.org/en/) version 14.18+, 16+. However, some templates require a higher Node.js version to work, please upgrade if your package manager warns about it.

With NPM:

```bash
$ npm create npm library
```

With Yarn:

```bash
$ yarn create npm library
```

Then follow the prompts!

You can also directly specify the project name and the template you want to use via additional command line options. For example:

```bash
# npm
npm create npm library my-library --template react

# yarn
yarn create npm library my-library --template react-ts


```

Currently supported template presets include:

- `react`
- `react-ts`

You can use `.` for the project name to create in the current directory.
