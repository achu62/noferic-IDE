//jai sri ram
import { spawn } from "node:child_process";
import { URI } from "vscode-uri"

import fs from "node:fs"
import { getEssentials } from "../main.js";
import { initialisets } from "./initialisetsls.js"
import path from "node:path";
import * as rpc from "vscode-jsonrpc/node"
function toNormalisedWindowsId(inputPath) {
    return path.win32.normalize(inputPath).replace(/\\/g, "/");
}
const ll = {
    ".ts": "typescript",
    ".tsx": "typescriptreact",
    ".d.ts": "typescript",
    ".js": "javascript",
    ".jsx": "javascriptreact",
    ".mjs": "javascript",
    ".cjs": "javascript",
    ".mts": "typescript",
    ".cts": "typescript",
    ".d.mts": "typescript",
    ".d.cts": "typescript"
}
let list = {

}

export function createTsProject(nodebinpath, tslspath, projectpathraw) {
    const baseDir = getEssentials().dirname;
    const projectpath = toNormalisedWindowsId(projectpathraw)
    const nodebin = path.resolve(baseDir, "lsps", nodebinpath);
    const tsls = path.resolve(baseDir, "lsps", tslspath);

    const lspprocess = spawn(nodebin, [tsls, "--stdio"], {
        cwd: projectpath,
        stdio: ["pipe", "pipe", "pipe"]
    });
    const connection = rpc.createMessageConnection(
        new rpc.StreamMessageReader(lspprocess.stdout),
        new rpc.StreamMessageWriter(lspprocess.stdin)
    )
    connection.listen()

    console.log("LSP PID:", lspprocess.pid, connection);
    initialisets(connection, projectpath)
    connection.sendNotification("initialized")
    const tools = {
        openfile: async (filepath, content) => {
            const promise = new Promise((res, rej) => {
                const langid = ll[path.extname(toNormalisedWindowsId(filepath))]
                if (!langid) {
                    rej()
                }
                else {
                    connection.sendNotification("textDocument/didOpen", {
                        textDocument: {
                            uri: URI.file(filepath).toString(),
                            languageId: langid,
                            version: 1,
                            text: content
                        }
                    });
                    list[filepath] = 1;
                    res()
                }
            })
            return promise;
        },
        changefile: async (filepath, content) => {

            const promise = new Promise((res, rej) => {

                const DidChangeNotification = new rpc.NotificationType('textDocument/didChange');
                connection.sendNotification(DidChangeNotification, {
                    textDocument: { uri: URI.file(filepath).toString(), version: list[filepath] + 1 },
                    contentChanges: [{ text: content }]
                });
                list[filepath] += 1;
                res()
            })
            return promise;

        },
        provideautocomplete: async (filepath, position) => {
            try {
                const result = await connection.sendRequest(
                    "textDocument/completion",
                    {
                        textDocument: {
                            uri: URI.file(filepath).toString()
                        },
                        position: {
                            line: position.lineNumber - 1,
                            character: position.column - 1
                        },
                        context: {
                            triggerKind: 1
                        }
                    }
                );
                console.log(`${result} is the result`)
                return result;
            }
            catch (e) {

            }
        }
    }
    return tools;
}