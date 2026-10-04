//jai sri ram

import { parentPort } from "worker_threads";
import ts, { getModeForResolutionAtIndex } from "typescript";
import fs from "fs"
let function_param_map = {}
let list_consts = []

async function getDiagnosticsnf(path, code) {
  const sourceFile = ts.createSourceFile(
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS
  );
  /**
 * @param {import("typescript").Node} node
 */


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
      if(function_param_map[funcName] && function_param_map[funcName] !== passedCount){
        console.log(`errror , the function expects ${function_param_map[funcName] } params but given ${passedCount}`)
      }
    }

    ts.forEachChild(node, walk);
  }

  walk(sourceFile);
}
getDiagnosticsnf("/home/charan/noferic-IDE/main_p/main.js", "let a = null; const b = 10;\n function as(b , c){()=>{ \n b=10 ; b=100; b=1099}()}\nas(1,2)\nas(1)\nas(12,23,34)\nas(a)")
//parentPort.on("message", (e) => {
//const mes = e;

//if (mes.type === "provide_diagnostics") {
//getDiagnosticsnf(mes.path, mes.code);
//parentPort.postMessage(null);
//}
//});
