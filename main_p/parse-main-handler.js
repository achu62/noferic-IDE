//jai sri ram
import { Worker } from "worker_threads"
import { fileURLToPath } from "node:url";

import np from "node:path"

const AST_provider = new Worker("./main_p/parser-worker.js")
//const Diagonostic_provider = new Worker()
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
export function UpdateASt(path, code) {
    if (treemap[path]) {
        treemap[path] = getParsedCode(code, path)
    }
}

export async function req_Diagnostic(path, code) {
    treemap[path] = await getParsedCode(code, path)
}
await req_Diagnostic("/main.js", "let a; const a = null;")
console.log(JSON.stringify(treemap))


