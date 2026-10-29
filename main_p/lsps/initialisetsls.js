//jai sri ram
//jai sri ram
import { URI } from "vscode-uri"
import nodepath from "node:path"
/**@param {import("vscode-jsonrpc").MessageConnection} connection  */
export async function initialisets(connection, path) {
    const validRootUri = URI.file(path).toString();
    console.log(validRootUri)

    const initparams = {
        processId: process.pid,
        rootUri: URI.file(path).toString(),
        capabilities: {
            workspace: {
                workspaceFolders: true,
                configuration: true
            },
            textDocument: {
                synchronization: {
                    didSave: true,
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
        },
        workspaceFolders: [
            {
                uri: URI.file(path).toString(),
                name: nodepath.basename(path)
            }
        ],
        // 🧠 THIS IS THE SAUCE WE ADDED:
        initializationOptions: {
            preferences: {
                includePackageJsonAutoImports: "auto",
                allowRenameOfImportPath: true
            },
            configuration: {
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
            }
        }
    }

    try {
        const res = await connection.sendRequest("initialize", initparams)

        console.log(res)
      
    }
    catch (e) {
        console.log(e)
    }
}
