//jai sri ram
import * as rpc from "vscode-jsonrpc";
import { getpath } from "./findpath.js"
import { spawn } from "child_process";
import * as nodepath from "path"
import fs from "fs"
import { provideAutoCompleteforts } from "./autocomplete.js";
let prevpath = {
    path: "",
    version: 1,
}
let isCompleted = true;
let connection;
export async function starttsserver(path) {
    const tsprocess = spawn(getpath(), ["--stdio"])
    connection = rpc.createMessageConnection(
        new rpc.StreamMessageReader(tsprocess.stdout),
        new rpc.StreamMessageWriter(tsprocess.stdin),
    );
    connection.listen()
    tsprocess.stdout.on("data" , async(data)=>{
        ///fs.writeFileSync(`/home/charan/noferic-IDE/tslogs/tsstdout${Date.now()}`, `${path, JSON.stringify(prevpath)},${data.toString()}`)

    })

    const inres = await connection.sendRequest("initialize", {

        processId: process.pid,
        rootUri: `file://${decodeURIComponent(path)}`,
            capabilities: {
                workspace: {
                    workspaceFolders: true,
                    configuration: true
                },

                textDocument: {
                    synchronization: {
                        didSave: false,
                        willSave: false,
                        willSaveWaitUntil: false
                    },

                    

                    hover: {
                        contentFormat: ["markdown", "plaintext"]
                    },

                    signatureHelp: {
                        signatureInformation: {
                            documentationFormat: ["markdown", "plaintext"]
                        }
                    }
                }
            }
,
        workspaceFolders: [
            {
                uri: `file://${decodeURIComponent(path)}`,
                name: nodepath.basename(path)
            }
        ]
    }
    )
    connection.sendNotification("initialized", {}

    )
    connection.onRequest("workspace/configuration", (params) => {
        return params.items.map(() => ({}));
    });
}
export async function provideautocomplete(path, content, char, line) {
    //console.log("yes\n\n\n\n\n\n\n\n\n\n\n\n\n\\n\n\n")
    if (!isCompleted) { return }
    isCompleted = false;
    if (path !== prevpath.path) {

        let ext;
        if (nodepath.extname(path) === ".js" || nodepath.extname(path) === ".jsx") {
            ext = "javascript";
        }
        else if (nodepath.extname(path) === ".ts" || nodepath.extname(path) === ".tsx") {
            ext = "typescript"
        }
        else {
            return null;
        }
        connection.sendNotification("textDocument/didClose", {
            textDocument: {
                uri: `file:///${decodeURIComponent(prevpath.path)}`,
            }
        });
        prevpath.path = path;
        prevpath.version = 1;
        connection.sendNotification("textDocument/didOpen", {
            textDocument: {
                uri: `file://${decodeURIComponent(path)}`,
                languageId: `${ext}`,
                version: 1,
                text: `[${content}]`
            }
        });

    }
    else {


        prevpath.path = path;
        prevpath.version = prevpath.version + 1;
        connection.sendNotification("textDocument/didChange", {
            textDocument: {
                uri: `file://${decodeURIComponent(path)}`,
                version: prevpath.version,
            }, "contentChanges": {
                text: `${content}`
            }
        });

    }


    const returncode = await provideAutoCompleteforts(connection, {
        path:
            path,
        position: {
            line: line,
            character: char
        }

    })
    isCompleted = true;
    return returncode;
}
export async function ProvideDiagnostics() {
    //console.log("rec............\n")
    if(!connection) return;
    return new Promise((resolve, rej) => {
        const listener = connection.onNotification(
            "textDocument/publishDiagnostics",
            (params) => {
                fs.writeFileSync(`/home/charan/noferic-IDE/tslogs/tsd${Date.now()}`, `,${JSON.stringify(params, null, 2)}`)

                resolve(params);
                listener.dispose();
            },
        );
    });
}
export async function GotoDefintion(position){
    const result = await connection.sendRequest("textDocument/definition", {
        textDocument: {
            uri: `file://${decodeURIComponent(prevpath.path)}`,
        },
        position: {
            line: position.lineNumber - 1,
            character: position.column - 1
        }
    });
    console.log(result)
   return result;
}
export async function HOVERFUNCTION(filePath  , position ){
    const result = await connection.sendRequest("textDocument/hover", {
        textDocument: {
            uri: `file://${decodeURIComponent(filePath)}`,
        },
        position: {
            line: position.line,
            character: position.character,
        },
    });

    return result;
}