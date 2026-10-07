//jai sri ram

import { parentPort, Worker } from "worker_threads";
import { Project } from "ts-morph"
import ts from "typescript";
import fs from "fs"
let function_param_map = {}
let list_consts = []
/** @type {import("ts-morph").Project} */
let project;

function awakeInitialisation() {
  project = new Project({
    useInMemoryFileSystem: true
  });
}
awakeInitialisation()
async function getDiagnosticsnf(path, code) {

  /**
 * @param {import("typescript").Node} node
 */
  const sourceFile = project.createSourceFile("any.ts", code).compilerNode
  const typeChecker = project.getTypeChecker();
  console.log(typeChecker)
  function walk(node) {
    if (ts.isVariableDeclaration(node) && ts.isVariableDeclarationList && (node.parent.flags & ts.NodeFlags.Const)) {
      console.log(node.name.text, "is a const")
      list_consts.push(node.name.text)
    }
    if (ts.isBinaryExpression(node) && node.operatorToken.kind == ts.SyntaxKind.EqualsToken && ts.isIdentifier(node.left)) {
      if (list_consts.includes(node.left.text)) {
        console.log(`what are you even doing.....${node.left.text} WHAT!!`)
      }
    }
    if (ts.isFunctionDeclaration(node) && node.name) {
      function_param_map[node.name.text] = node.parameters.length;
    }

    if (ts.isCallExpression(node)) {
      const funcName = node.expression.getText(sourceFile);
      const passedCount = node.arguments.length;
      if (function_param_map[funcName] && function_param_map[funcName] !== passedCount) {
        console.log(`errror , the function expects ${function_param_map[funcName]} params but given ${passedCount}`)
      }
    }

    ts.forEachChild(node, walk);
  }

  walk(sourceFile);
}
//parentPort.on("message", async (e) => {
//const mes = e;

//if (mes.type === "provide_diagnostics") {
//await getDiagnosticsnf(mes.path, mes.code)

//}
//});
await getDiagnosticsnf("", "function app(n , p ,o ){const b = null ; \n b = false; }\n\napp(1)  \n app(2,3,4,4,5)")