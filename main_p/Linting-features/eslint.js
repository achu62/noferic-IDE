//jai sri ram
import path from "path"
import {ESLint} from "eslint"
let eslinter;
export function initialiseLinter(Dirpath){
    eslinter = new ESLint({
        cwd:Dirpath
    })
    console.log(eslinter)

}export async function lint(code , FILEPATH){
    try{
        return await eslinter.lintText(code , {filePath:FILEPATH})
    }
    catch(e){
        console.log(e)
    }
}
