//jai sri ram
import { URI } from "vscode-uri"
/**@param {import("vscode-jsonrpc").MessageConnection} connection  */
export async function initialisets(connection, path) {
    const validRootUri = URI.file(path).toString();
    console.log(validRootUri)
    const initparams = {
        // 1. Set to null so the server does not tie its lifecycle to your process ID
        processId: null,

        rootUri: validRootUri,
        rootPath: path,

        // 2. Comprehensive capabilities object to unlock all LSP features
        capabilities: {
            workspace: {
                applyEdit: true,
                workspaceEdit: { documentChanges: true },
                didChangeConfiguration: { dynamicRegistration: true },
                symbol: { dynamicRegistration: true },
                executeCommand: { dynamicRegistration: true }
            },
            textDocument: {
                synchronization: {
                    dynamicRegistration: true,
                    willSave: true,
                    willSaveWaitUntil: true,
                    didSave: true
                },
                completion: {
                    dynamicRegistration: true,
                    completionItem: {
                        snippetSupport: true,
                        commitCharactersSupport: true,
                        documentationFormat: ['markdown', 'plaintext'],
                        deprecatedSupport: true,
                        preselectSupport: true,
                        tagSupport: { valueSet: [1] },
                        insertReplaceSupport: true,
                        resolveSupport: { properties: ['documentation', 'detail', 'additionalTextEdits'] }
                    }
                },
                hover: {
                    dynamicRegistration: true,
                    contentFormat: ['markdown', 'plaintext']
                },
                signatureHelp: { dynamicRegistration: true },
                definition: { dynamicRegistration: true },
                typeDefinition: { dynamicRegistration: true },
                implementation: { dynamicRegistration: true },
                references: { dynamicRegistration: true },
                documentSymbol: { dynamicRegistration: true },
                codeAction: {
                    dynamicRegistration: true,
                    codeActionLiteralSupport: {
                        codeActionKind: {
                            valueSet: [
                                "",
                                "quickfix",
                                "refactor",
                                "refactor.extract",
                                "refactor.inline",
                                "refactor.rewrite",
                                "source",
                                "source.organizeImports"
                            ]
                        }
                    },
                    resolveSupport: { properties: ['edit'] }
                },
                rename: { dynamicRegistration: true, prepareSupport: true },
                publishDiagnostics: { relatedInformation: true, tagSupport: { valueSet: [1, 2] } },
                inlayHint: { dynamicRegistration: true }
            }
        },

        // 3. Keep initializationOptions minimal and force max performance
        initializationOptions: {
            // Do not provide custom host info or limit behaviors
            tsserver: {
                // Passing NO maxTsServerMemory ensures it uses Node's default or V8's unconstrained pool
                maxTsServerMemory: undefined,
                logVerbosity: "off"
            }
        }
    }
    try {
        const res = await connection.sendRequest("initialize", initparams)
        console.log(res)
    }
    catch(e){
        console.log(e)
    }
}