//jai sri ram
let diagnostics = [];
let importantcachediagnostics = [];
importantcachediagnostics["constants"] = [];
let mapofconsts = {};
import { parentPort } from "node:worker_threads";
function getnodeBytype(nodes, type) {
  let name;
  let out = {};
  nodes.forEach((e) => {
    if (e.type == type) {
      name = e;
    }
  });
  out["out"] = name;
  out["exists"] = name ? true : false;
  return out;
}

function di(nodes) {
  nodes.forEach((node) => {
    if (node.type == "lexical_declaration") {
      if (getnodeBytype(node.children, "const").exists == true) {
        const n = getnodeBytype(node.children, "variable_declarator").out;
        const n_name = n.name;

        importantcachediagnostics.constants.push(n_name);
        const n_pos = {
          stpos: n.startPosition,
          epos: n.endPosition,
        };
        mapofconsts[n_name] = n_pos;
      }
    }
    if (node.type == "expression_statement") {
      const assignment = getnodeBytype(node.children, "assignment_expression");

      if (assignment.exists) {
        const identifierCheck = getnodeBytype(
          assignment.out.children,
          "identifier",
        );

        if (identifierCheck.exists) {
          const targetName = identifierCheck.out.text;
          if (importantcachediagnostics.constants.includes(targetName)) {
            diagnostics.push({
              message: `Noferic-Diagnostics: the constant ${targetName} has been re-assigned\nconstants can't be re-assigned`,
              severity: 1,
              line: identifierCheck.out.startPosition.row + 1,
              column: identifierCheck.out.startPosition.column + 1,
              endLine: identifierCheck.out.endPosition.row + 1,
              endColumn: identifierCheck.out.endPosition.column + 1,
            });
          }
        }
      }
    }
    if (node.children) {
      di(node.children);
    }
  });
}
parentPort.on("message", (e) => {
  const mes = e;

  if (mes.type === "provide_diagnostics") {
    di(mes.ast);
    parentPort.postMessage(diagnostics);
    diagnostics = [];
    importantcachediagnostics.constants = [];
    mapofconsts = {};
  }
});
