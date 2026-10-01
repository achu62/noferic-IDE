//jai sri ram
import { Worker } from "worker_threads"
import { fileURLToPath } from "node:url";

import np from "node:path"

const AST_provider = new Worker("./main_p/parser-worker.js")
const Diagonostic_provider = new Worker("./main_p/custom-diagnostics.js")
let treemap = {}

async function getParsedCode(code, path) {
    AST_provider.postMessage({
        type: "parse-code",
        code: code,
        path: path
    });
    const promise = new Promise((res, rej) => {
        AST_provider.on("message", (mes) => {
            if (mes.type == "parse-code") {
                res(JSON.parse(mes.ast))
            }
        })
    })
    return promise;
}
async function getDiagnostics(ast){
    Diagonostic_provider.postMessage({
        type:"provide_diagnostics",
        ast:ast
    })
}
export function UpdateASt(path, code) {
    if (treemap[path]) {
        treemap[path] = getParsedCode(code, path)
    }
}

export async function req_Diagnostic(path, code) {
    treemap[path] = await getParsedCode(code, path)

}

console.log(JSON.stringify(treemap))


