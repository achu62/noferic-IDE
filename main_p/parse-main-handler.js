//jai sri ram
import { Worker } from "worker_threads"



const Diagonostic_provider = new Worker("./main_p/custom-diagnostics.js")

async function getDiagnostics(path , code) {
    Diagonostic_provider.postMessage({
        type: "provide_diagnostics",
        code: code,
        path:path
    })
    const promise = new Promise((res, rej) => {
        Diagonostic_provider.on("message", (mes) => {
            res(mes)
        })
    })
    return promise;

}


export async function req_Diagnostic(path, code) {
   return await getDiagnostics(path , code)
}


