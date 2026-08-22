//jai sri ram
import path from "path"
import fs from "fs"
import ts from "typescript"
/**@param {ts.LanguageServiceHost} host */
/**@param  {string} DirPath */
/**@param {Array} list*/
/**@param {Array} details*/

let details = []
let round_one_file_paths = [];
let round_two_file_paths = [];
let round_three_file_paths = [];


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
    for (const file of files) {
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
let hostforpresentfile;

async function PlanTheMap(DirPath) {
    if (fs.existsSync(toNormalisedWindowsId(path.join(DirPath, "package.json")))) {
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
            await scanafolder(DirPath)
            round_three_file_paths = round_three_file_paths.filter(x => !round_one_file_paths.includes(x));
            fs.promises.writeFile(toNormalisedWindowsId("D:\\newfoldernf\\main_p\\ts-features\\round_one_file_paths.js"), `let round_one_file_paths =  [${round_one_file_paths}]; \n let round_three_file_paths =   [${round_three_file_paths};] \n let r2 = [${round_two_file_paths}]`)

        }
        return { round_one_file_paths, round_two_file_paths, round_three_file_paths }
    }
}


export async function initialisetds(projectRoot) {
    if (hostforpresentfile) hostforpresentfile.dispose()
    await PlanTheMap(projectRoot)



    const configPath = path.join(projectRoot, "tsconfig.json");

    let compilerOptions = {
        allowJs: true,
        checkJs: false
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

    console.log(hostforpresentfile)
}
initialisetds(toNormalisedWindowsId("D:\\newfoldernf\\"))







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

            message: `source:ts-intelligence\ntype:syntax\n error:${ts.flattenDiagnosticMessageText(

                d.messageText,
                "\n")
                }`,

            severity: d.category,
            code: d.code
        };
    }).filter(Boolean);
}
setTimeout(() => {
    console.log(getSyntacticDiagnosticsfromts(`${toNormalisedWindowsId("D:\\newfoldernf\\main_p\\ts-features\\synatic-diagnosticstest.js")}`))
}, 10000) 
