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
function toMonacoCompletions(result, position) {
    const items = Array.isArray(result)
        ? result
        : result?.items ?? [];

    return {
        suggestions: items.map((item) => ({
            label: item.label,
            kind: item.kind ?? 1,
            detail: item.detail,
            documentation:
                typeof item.documentation === "string"
                    ? item.documentation
                    : item.documentation?.value,
            insertText: item.insertText ?? item.label,
            insertTextRules:
                item.insertTextFormat === 2 ? 4 : undefined,
            range: {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: position.column,
                endColumn: position.column,
            },
            sortText: item.sortText,
            filterText: item.filterText,
            preselect: item.preselect,
        })),
    };
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
export async function createTsProject(tslspath, projectpathraw) {
    const baseDir = getEssentials().dirname;
    const projectpath = toNormalisedWindowsId(projectpathraw)
    const list = Object.create(null);

    const tsls = path.resolve(baseDir, "lsps", tslspath);


    const lspprocess = spawn(tsls, ['--lsp', '--stdio'], {
        cwd: projectpath,
        stdio: ['pipe', 'pipe', 'pipe'],
    });

    const connection = rpc.createMessageConnection(
        new rpc.StreamMessageReader(lspprocess.stdout),
        new rpc.StreamMessageWriter(lspprocess.stdin)
    )
    connection.listen()
    console.log({
        projectpath,
        cwd: lspprocess.spawnargs,
        tsls,
        tsconfigExists: fs.existsSync(
            path.join(projectpath, "tsconfig.json")
        ),
        packageJsonExists: fs.existsSync(
            path.join(projectpath, "package.json")
        )
    });
    console.log("LSP PID:", lspprocess.pid, connection);
    await initialisets(connection, projectpath)
    connection.onRequest("workspace/configuration", (params) => {
        return params.items.map((item) => {
            return {
                typescript: {
                    inlayHints: {
                        includeInlayParameterNameHints: "all",
                        includeInlayFunctionLikeReturnTypeHints: true
                    }
                },
                compilerOptions: {
                    allowJs: true,
                    checkJs: true,
                    noEmit: true,
                    module: "CommonJS",
                    moduleResolution: "node",
                    target: "ES2022",
                    allowSyntheticDefaultImports: true,
                    esModuleInterop: true,
                    skipLibCheck: false
                }
            };
        });
    });
    connection.sendNotification("initialized", {})

    const tools = {
        openfile: async (filepath, content) => {
            const promise = new Promise((res, rej) => {
                const langid = ll[path.extname(toNormalisedWindowsId(filepath))]
                console.log(langid)
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
            const langid = ll[path.extname(toNormalisedWindowsId(filepath))];
            if (!langid) {
                throw new Error(`Unsupported file type: ${filepath}`);
            }

            const uri = URI.file(filepath).toString();
            const version = list[filepath];
            if (version === undefined) {
                connection.sendNotification("textDocument/didOpen", {
                    textDocument: {
                        uri,
                        languageId: langid,
                        version: 1,
                        text: content
                    }
                });
                list[filepath] = 1;
                return;
            }

            const nextVersion = version + 1;
            connection.sendNotification("textDocument/didChange", {
                textDocument: { uri, version: nextVersion },
                contentChanges: [{ text: content }]
            });
            list[filepath] = nextVersion;
        },
        provideautocomplete: async (filepath, position) => {
            console.log(" i got req")
            const symbols = await connection.sendRequest("workspace/symbol", {
                query: ""
            });

            console.log(symbols);
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
                console.log("got resul ,", JSON.stringify(result))
                console.log(`${result} is the result`)
                return toMonacoCompletions(result, position);
            }
            catch (e) {
                console.error(e)
            }
        }
    }
    return tools;
}