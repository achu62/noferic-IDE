//jai sri ram
/**@param {ts.LanguageServiceHost} hostforpresentfile */
/**@param  {string} DirPath */
/**@param {Array} list*/
/**@param {Array} details*/

import path from "path"
import fs from "fs"
import ts from "typescript"
let details = []
let round_one_file_paths = [];
let round_two_file_paths = [];
let round_three_file_paths = [];
const MonacoCompletionItemKind = {
    Method: 0,
    Function: 1,
    Constructor: 2,
    Field: 3,
    Variable: 4,
    Class: 5,
    Interface: 6,
    Module: 8,
    Property: 9,
    Unit: 10,
    Value: 11,
    Enum: 12,
    Keyword: 13,
    Snippet: 14,
    Color: 15,
    File: 16,
    Reference: 17,
    Folder: 18,
    EnumMember: 19,
    Constant: 20,
    Struct: 21,
    Event: 22,
    Operator: 23,
    TypeParameter: 24
};

function convertCompletionKind(kind) {
    switch (kind) {
        case ts.ScriptElementKind.memberFunctionElement:
            return MonacoCompletionItemKind.Method;

        case ts.ScriptElementKind.functionElement:
        case ts.ScriptElementKind.localFunctionElement:
            return MonacoCompletionItemKind.Function;

        case ts.ScriptElementKind.constructorImplementationElement:
            return MonacoCompletionItemKind.Constructor;

        case ts.ScriptElementKind.memberVariableElement:
            return MonacoCompletionItemKind.Field;

        case ts.ScriptElementKind.variableElement:
        case ts.ScriptElementKind.localVariableElement:
        case ts.ScriptElementKind.letElement:
        case ts.ScriptElementKind.parameterElement:
            return MonacoCompletionItemKind.Variable;

        case ts.ScriptElementKind.classElement:
        case ts.ScriptElementKind.localClassElement:
            return MonacoCompletionItemKind.Class;

        case ts.ScriptElementKind.interfaceElement:
            return MonacoCompletionItemKind.Interface;

        case ts.ScriptElementKind.moduleElement:
            return MonacoCompletionItemKind.Module;

        case ts.ScriptElementKind.propertyElement:
            return MonacoCompletionItemKind.Property;

        case ts.ScriptElementKind.enumElement:
            return MonacoCompletionItemKind.Enum;

        case ts.ScriptElementKind.enumMemberElement:
            return MonacoCompletionItemKind.EnumMember;

        case ts.ScriptElementKind.constElement:
            return MonacoCompletionItemKind.Constant;

        case ts.ScriptElementKind.keyword:
            return MonacoCompletionItemKind.Keyword;

        case ts.ScriptElementKind.alias:
            return MonacoCompletionItemKind.Reference;

        case ts.ScriptElementKind.typeElement:
            return MonacoCompletionItemKind.TypeParameter;

        default:
            return MonacoCompletionItemKind.Text;
    }
}

let statemanager = { version: "1", filepath: null, currentcode: null }
const currentFiles = new Map();
const fileVersions = new Map();
const excludedDirectories =
    ["node_modules", "dist", ".code", ".noferic-ide", ".zed", ".idea", ".git", "monaco-editor"]
const IncludedExtensions = [
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".cjs",
    ".mjs",
    ".cts",
    ".d.ts"
];


function sourceFileToTree(sourceFile) {
    function visit(node) {
        const children = [];

        ts.forEachChild(node, child => {
            children.push(visit(child));
        });

        return {
            kind: ts.SyntaxKind[node.kind],
            pos: node.pos,
            end: node.end,
            children
        };
    }

    return visit(sourceFile);
}
async function scanafolder(Dirpath) {
    const files = fs.readdirSync(Dirpath, { withFileTypes: true });
    console.log("1")
    for (const file of files) {
        console.log("2")
        const fullpath = path.join(Dirpath, file.name);
        if (file.isDirectory()) {
            if (excludedDirectories.includes(file.name) === false) {
                await scanafolder(fullpath);

            }
        } else {
            if (IncludedExtensions.includes(path.extname(file.name))) {
                round_three_file_paths.push(`${toNormalisedWindowsId(fullpath)}`)

            }
        }
    }

}
function toNormalisedWindowsId(inputPath) {
    return path.win32.normalize(inputPath).replace(/\\/g, "/");

}
/**@param {ts.LanguageService} hostforpresentfile */
let hostforpresentfile;

async function PlanTheMap(DirPath) {
    if (fs.existsSync(toNormalisedWindowsId(path.join(DirPath, "package.json")))) {
        await scanafolder(DirPath)

        const packagejson = JSON.parse(fs.readFileSync(toNormalisedWindowsId(path.join(DirPath, "package.json"))))
        if (packagejson.main) {
            const MainPath = toNormalisedWindowsId(path.join(DirPath, packagejson.main))
            console.log(MainPath)
            details.push({ "mainpath": MainPath })
            const program = ts.createProgram(
                [MainPath],
                {
                    allowJs: true,
                    checkJs: false
                }
            );

            for (const sourceFile of program.getSourceFiles()) {
                if (sourceFile.fileName.includes("node_modules")) {
                    round_two_file_paths.push(`${toNormalisedWindowsId(sourceFile.fileName)}`);

                }
                else {
                    round_one_file_paths.push(`${toNormalisedWindowsId(sourceFile.fileName)}`);

                }
            }
            round_three_file_paths = round_three_file_paths.filter(x => !round_one_file_paths.includes(x));

        }
        return { round_one_file_paths, round_two_file_paths, round_three_file_paths }
    }
    else {
        await scanafolder(DirPath)
    }
}
let state = { files: null, version: 1 }

export async function initialisetds(projectRoot) {
    if (hostforpresentfile) hostforpresentfile.dispose()
    await PlanTheMap(projectRoot)
    state.files = [...round_one_file_paths, ...round_two_file_paths, ...round_three_file_paths]

    console.log(round_one_file_paths, round_two_file_paths, round_three_file_paths)



    const configPath = path.join(projectRoot, "tsconfig.json");

    let compilerOptions = {
        module: ts.ModuleKind.NodeNext,
        target: ts.ScriptTarget.ESNext,
        types: ["node", "electron"],
        sourceMap: true,
        declaration: true,
        declarationMap: true,
        noUncheckedIndexedAccess: true,
        strict: true,
        jsx: ts.JsxEmit.ReactJSX,
        verbatimModuleSyntax: true,
        isolatedModules: true,
        noUncheckedSideEffectImports: true,
        moduleDetection: ts.ModuleDetectionKind.Force,
        skipLibCheck: false,
        allowJs: true,
        checkJs: true
    };

    if (ts.sys.fileExists(configPath)) {
        const configFile = ts.readConfigFile(
            configPath,
            ts.sys.readFile
        );

        if (!configFile.error) {
            const parsed = ts.parseJsonConfigFileContent(
                configFile.config,
                ts.sys,
                projectRoot
            );

            compilerOptions = parsed.options;
        }
    }

    const host = {
        getScriptFileNames() {
            return state.files ?? []
        },
        getScriptVersion(fileName) {
            return state.version
        },
        getScriptSnapshot(fileName) {
            const normalizedFileName = toNormalisedWindowsId(fileName);
            const code = currentFiles.has(normalizedFileName)
                ? currentFiles.get(normalizedFileName)
                : ts.sys.readFile(fileName);

            if (code === undefined) {
                return undefined;
            }

            return ts.ScriptSnapshot.fromString(code);
        },
        getCurrentDirectory() {
            return projectRoot;
        },
        getCompilationSettings() {
            return compilerOptions
        },
        getDefaultLibFileName(options) {
            return ts.getDefaultLibFileName(options)
        },
        fileExists: ts.sys.fileExists,
        readFile: ts.sys.readFile,
        readDirectory: ts.sys.readDirectory,
    };

    hostforpresentfile = ts.createLanguageService(host);

}







export async function getSyntacticDiagnosticsfromts(fileName) {
    if (!fileName || typeof fileName !== "string") {
        return [];
    }

    if (!hostforpresentfile) {
        console.warn("Language service host not initialized");
        return [];
    }

    let syntacticDiagnostics = [];
    let semanticDiagnostics = [];

    try {
        syntacticDiagnostics = hostforpresentfile.getSyntacticDiagnostics(fileName) || [];
    } catch (e) {
        console.error("Error getting syntactic diagnostics:", e);
        syntacticDiagnostics = [];
    }

    try {
        semanticDiagnostics = hostforpresentfile.getSemanticDiagnostics(fileName) || [];
    } catch (e) {
        console.error("Error getting semantic diagnostics:", e);
        semanticDiagnostics = [];
    }

    if (!Array.isArray(syntacticDiagnostics)) syntacticDiagnostics = [];
    if (!Array.isArray(semanticDiagnostics)) semanticDiagnostics = [];

    const diagnostics = [...syntacticDiagnostics, ...semanticDiagnostics];
    console.log(diagnostics);

    return diagnostics.map((d) => {
        if (!d || typeof d !== "object") {
            return null;
        }

        if (!d.file || d.start === undefined || d.start === null) {
            return null;
        }

        if (typeof d.start !== "number" || d.start < 0) {
            return null;
        }

        if (!d.file.getLineAndCharacterOfPosition || typeof d.file.getLineAndCharacterOfPosition !== "function") {
            return null;
        }

        let start, end;
        try {
            start = d.file.getLineAndCharacterOfPosition(d.start);
            if (!start || typeof start.line !== "number" || typeof start.character !== "number") {
                return null;
            }

            const length = typeof d.length === "number" && d.length > 0 ? d.length : 1;
            end = d.file.getLineAndCharacterOfPosition(d.start + length);
            if (!end || typeof end.line !== "number" || typeof end.character !== "number") {
                return null;
            }
        } catch (e) {
            console.error("Error getting line/character position:", e);
            return null;
        }

        let messageText = "";
        if (d.messageText) {
            try {
                messageText = ts.flattenDiagnosticMessageText(d.messageText, "\n") || "";
            } catch (e) {
                console.error("Error flattening diagnostic message:", e);
                messageText = String(d.messageText || "");
            }
        }

        const type = d.semantic ? "semantic" : "syntax";
        const severity = typeof d.category === "number" ? d.category : 0;
        const code = d.code ?? null;

        return {
            line: start.line + 1,
            column: start.character + 1,
            endLine: end.line + 1,
            endColumn: end.character + 1,
            message: `source:ts-intelligence\n type:${type}\n error:${messageText}`,
            severity: severity,
            code: code
        };
    }).filter(Boolean);
} function quickInfoToMonaco(info, ts) {
    if (!info) return null;

    const signature = ts.displayPartsToString(info.displayParts);

    const documentation = info.documentation
        ? ts.displayPartsToString(info.documentation)
        : "";

    const contents = [];

    if (signature) {
        contents.push({
            value: `\`\`\`typescript\n${signature}\n\`\`\``
        });
    }

    if (documentation) {
        contents.push({
            value: `source:typescript-intelligence  , ${documentation}`
        });
    }

    if (info.tags?.length) {
        for (const tag of info.tags) {
            const text = tag.text
                ? typeof tag.text === "string"
                    ? tag.text
                    : ts.displayPartsToString(tag.text)
                : "";

            contents.push({
                value: `**@${tag.name}**${text ? ` ${text}` : ""}`
            });
        }
    }

    return {
        contents
    };
}
export async function GetHover(filePath, position) {
    return quickInfoToMonaco(hostforpresentfile.getQuickInfoAtPosition(toNormalisedWindowsId(filePath), position), ts)
}
export async function GetAutoComplete(c, fpath) {
    console.log(toNormalisedWindowsId(fpath))
    console.log(c)
    try {
        const result = hostforpresentfile.getCompletionsAtPosition(
            fpath,
            c,
            {
                triggerKind: ts.CompletionTriggerKind.Invoked,
                includeCompletionsForModuleExports: true,
                includeCompletionsWithInsertText: true,
                includeAutomaticOptionalChainCompletions: true,
                includeCompletionsWithSnippetText: true
            }
        );
        console.log(JSON.stringify(result))

        if (!result) {
            return {
                suggestions: []
            };
        }

        return {
            suggestions: result.entries.map((entry) => ({
                label: entry.name,

                kind: convertCompletionKind(entry.kind),

                detail: entry.kindModifiers
                    ? `${entry.kind} ${entry.kindModifiers}`
                    : entry.kind,

                insertText: entry.name,

                sortText: entry.sortText,

                filterText: entry.name,

                range: undefined
            }))
        };
    }
    catch (e) {
        console.log(e)
    }

}

export async function updateList(filePath) {
    const normalizedFilePath = toNormalisedWindowsId(filePath);
    state.files.push(normalizedFilePath)
    state.version = state.version + 1
}
