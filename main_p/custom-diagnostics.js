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
        if(ts.isVariableDeclaration(symbol.valueDeclaration) && ts.isVariableDeclarationList && (symbol.valueDeclaration.parent.flags & ts.NodeFlags.Const)){
          console.log("YALLERT")
        }
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
await getDiagnosticsnf("", `const b = 1;
b = 2;  
b=3;
b=4;
function a() {
  let b = 0;
  b=909099
  b = 2;  
  b=2;
  b=3;
  b=4;  


  function d() {
    const b = 0;

    b = 3;      
  }
}

        `)