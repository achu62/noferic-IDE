//jai sri ram

import { parentPort, Worker } from "worker_threads";
import { Project } from "ts-morph"
import ts from "typescript";
import fs from "fs"
let diagnostics = []
/** @type {import("ts-morph").Project} */
let project;
function awakeInitialisation() {
  project = new Project({
    useInMemoryFileSystem: true,
    compilerOptions: {
      target: ts.ScriptTarget.Latest,
      module: ts.ModuleKind.ESNext,
      allowJs: true,
      checkJs: true
    }
  });
}
awakeInitialisation()
async function getDiagnosticsnf(path, code) {

  /**
 * @param {import("typescript").Node} node
 */
  //await getDiagnosticsnf(mes.path, mes.code)
  const sourceFile = project.createSourceFile("any.ts", code, { overwrite: true }).compilerNode
  const typeChecker = project.getTypeChecker().compilerObject;
  // console.log(typeChecker)
  function walk(node) {
    if (ts.isBinaryExpression(node) && node.operatorToken.kind == ts.SyntaxKind.EqualsToken && ts.isIdentifier(node.left)) {
      const symbol = typeChecker.getSymbolAtLocation(node.left);
      //console.log(symbol)
      if (symbol) {
        if (ts.isVariableDeclaration(symbol.valueDeclaration) && ts.isVariableDeclarationList && (symbol.valueDeclaration.parent.flags & ts.NodeFlags.Const)) {
          const line = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
          const column = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).character + 1;
          console.log(line, column)
          diagnostics.push({
            message: `source:noferic-intelligence\nconstants cannot be reassigned`,
            line: sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1,
            column: sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).character + 1,
            endLine: sourceFile.getLineAndCharacterOfPosition(node.getEnd(sourceFile)).line + 1,
            endColumn: sourceFile.getLineAndCharacterOfPosition(node.getEnd(sourceFile)).line + 1,
            severity: 1


          })
        }
      }
    }



    ts.forEachChild(node, walk);
  }

  walk(sourceFile);
}
parentPort.on("message", async (e) => {
const mes = e;

if (mes.type === "provide_diagnostics") {
await getDiagnosticsnf(mes.path, mes.code)
parentPort.postMessage(diagnostics)
}
});
