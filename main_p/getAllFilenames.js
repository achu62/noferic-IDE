//jai sri ram
import fs from "fs"
import path from "path"
                        import fuzzysort from "fuzzysort"

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
    ".json",
    
    ".html",
    
    
    ".htmx",
    ".css",

    ".scss",
    ".vue",
    ".svelte",
    ".xml",
    ".yaml",
    ".yml",
    ".md",
    ".astro"
];
let fileNames = [];

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
                fileNames.push({filename:file.name , FilePathInJSON:fullpath})

            }
        }
    }

}
export async function UpdateorCreatefilelist(Dirpath) {
    try {
        fileNames = [];
        await scanafolder(Dirpath)
        
    }
    catch (e) {
        console.log(e)
    }
}
export async function getSearchResults(input){
    console.log(fileNames)
    const result = fuzzysort.go(`${input}`, fileNames, {
        limit:1000,
        key: "FilePathInJSON"
    })
    console.log(result)
    
    return result;
}