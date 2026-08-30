//jai sri ram
import { Notification } from "electron"
import { ESLint } from "eslint"
let eslinter;
export function initialiseLinter(Dirpath) {
    eslinter = new ESLint({
        cwd: Dirpath
    })

}
let eshown = false;
export async function lint(code, FILEPATH) {
    try {
        return await eslinter.lintText(code, { filePath: FILEPATH })
    }
    catch (e) {
        if (!eshown) {
            new Notification({
                title: "ESLINT",
                body: ` eslint responded with ${JSON.stringify(e)}`,
            }).show();
            eshown = true;
        }
        return [{messages:[]}]
    }
}
