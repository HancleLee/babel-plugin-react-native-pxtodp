const { transformFromAstSync } = require("@babel/core");
const parser = require("@babel/parser");
const plugin = require("../lib/index");
const fs = require("fs");
const path = require("path");

const sourceCode = fs.readFileSync(path.join(__dirname, "./sourceCode.js"), {
  encoding: "utf-8"
});

const ast = parser.parse(sourceCode, {
  sourceType: "unambiguous",
  plugins: ["jsx"]
});

const { code } = transformFromAstSync(ast, sourceCode, {
  filename: path.join(__dirname, "./sourceCode.js"),
  plugins: [
    [
      plugin,
      {
        uiWidth: 750,
        includes: ["sourceCode"]
      }
    ]
  ]
});

console.log("code", code);

console.log('\n*********************************************************************************\n')

const ignoreSourceCode = fs.readFileSync(path.join(__dirname, "./ignoreSourceCode.js"), {
  encoding: "utf-8"
});

const ignoreAst = parser.parse(ignoreSourceCode, {
  sourceType: "unambiguous",
  plugins: ["jsx"]
});

const { code: ignoreCode } = transformFromAstSync(ignoreAst, ignoreSourceCode, {
  filename: path.join(__dirname, "./ignoreSourceCode.js"),
  plugins: [
    [
      plugin,
      {
        uiWidth: 750,
        includes: ["ignoreSourceCode"]
      }
    ]
  ]
});

console.log("ignoreCode: \n", ignoreCode);

