//jai sri ram
import path from "path"
import fs from "fs"
import ts from "typescript"
/**@param  {string} DirPath */
/**@param {Array} list*/
/**@param {Array} details*/

let details = []
let round_one_file_paths = [];
let round_two_file_paths = [];
let round_three_file_paths = [];



const excludedDirectories =
    ["node_modules", "dist", ".code", ".noferic-ide", ".zed", ".idea", ".git"]
const IncludedExtensions = [
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".cjs",
    ".mjs",
    ".cts",
];



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

export async function PlanTheMap(DirPath) {
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
        
    }
}
PlanTheMap("D:/newfoldernf")






















