//jai sri ram
import * as prettier from "./standalone.mjs";
import * as prettierPluginBabel from "./babel.mjs";
import * as prettierPluginEstree from "./estree.mjs";
export async function format(code){

    const formatted = await prettier.format(code, {
        parser: "babel",
        plugins: [prettierPluginBabel, prettierPluginEstree],
    });
    return formatted;
}



