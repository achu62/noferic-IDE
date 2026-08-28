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


export async function initialisetds(projectRoot) {
    if (hostforpresentfile) hostforpresentfile.dispose()
    await PlanTheMap(projectRoot)
    console.log(round_one_file_paths, round_two_file_paths, round_three_file_paths)



    const configPath = path.join(projectRoot, "tsconfig.json");

    let compilerOptions = {
        allowJs: true,
        checkJs: false,
        types: ["node"]
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
            return [...round_one_file_paths, ...round_two_file_paths, ...round_three_file_paths]
        },
        getScriptVersion() {
            return statemanager.version
        },
        getScriptSnapshot(fileName) {
            const code = ts.sys.readFile(fileName);

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
    const diagnostics =
        hostforpresentfile.getSyntacticDiagnostics(fileName);

    return diagnostics.map((d) => {
        if (!d.file || d.start === undefined) {
            return null;
        }

        const start =
            d.file.getLineAndCharacterOfPosition(d.start);

        const end =
            d.file.getLineAndCharacterOfPosition(
                d.start + (d.length ?? 1)
            );

        return {
            line: start.line + 1,
            column: start.character + 1,

            endLine: end.line + 1,
            endColumn: end.character + 1,

            message: `source:ts-intelligence\n type:syntax\n error:${ts.flattenDiagnosticMessageText(

                d.messageText,
                "\n")
                }`,

            severity: d.category,
            code: d.code
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
    console.log(quickInfoToMonaco(hostforpresentfile.getQuickInfoAtPosition(toNormalisedWindowsId(filePath), position), ts))
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

