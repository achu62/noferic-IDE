//jai sri ram
import { parentPort } from "worker_threads";
import ts from "typescript";
import fs from "fs"
let list_consts = []
async function getDiagnosticsnf(path, code) {
  const sourceFile = ts.createSourceFile(
    path,
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
        console.log(`bro what are you even doing.....${node.left.text} WHAT!!`)
      }
    }
    if (ts.isFunctionDeclaration(node) && node.name) {
      console.log(`this ${node.name.text} function hell has ${node.parameters.length} parameter`)
    }


    ts.forEachChild(node, walk);
  }

  walk(sourceFile);
}
getDiagnosticsnf("/home/charan/noferic-IDE/main_p/main.js", "let a = null; const b = 10;\n function as(b , c){()=>{ \n b=10 ; b=100; b=1099}()}")
//parentPort.on("message", (e) => {
//const mes = e;

//if (mes.type === "provide_diagnostics") {
//getDiagnosticsnf(mes.path, mes.code);
//parentPort.postMessage(null);
//}
//});
