//jai sri ram
import { cruise } from 'dependency-cruiser';
import path from 'path';
import { fileURLToPath } from 'url';
import { getEssentials } from "../main.js"
export async function runIdeAudit(absoluteTargetPath) {




    try {
        console.log("running")
        const result = await cruise([absoluteTargetPath], {
            output: "json",
            doNotFollow: "(^|/)(node_modules|dist|\\.git|\\.noferic-IDE)(/|$)",
            baseDir: ""
        });


        return result;
    } catch (error) {
        console.error(error);
        throw error;
    }
}



