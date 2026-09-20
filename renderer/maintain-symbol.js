//jai sri ram
/**@param {Array} codetree  */
/**@param {HTMLDocument} document  */
import { getfileiconbytype } from "./utils.js";
import {cursortomonaco} from "./renderer.js"
let allowedeclarations = ["function_declaration",
    "generator_function_declaration",
    "class_declaration",
    "lexical_declaration",
    "variable_declaration"]
async function rl(elementr, array) {
    array.forEach((element) => {
        if (!element.name && element.type !== "lexical_declaration") {
            rl(elementr, element.children)
            return;

        }
        if (allowedeclarations.includes(element.type) === false) {
            rl(elementr, element.children);
            return;
        }

        const newmfe = document.createElement('button')
        newmfe.classList.add('files')
        let name = element.name;

        if (element.type === "lexical_declaration") {
            element.children.forEach((e) => {
                if (e.type === "variable_declarator") {
                    name = e.name;
                }
            })
        }

        let logopath;




        logopath = getfileiconbytype[element.type];


        const icon = document.createElement("div")
        if (!logopath) {
            logopath = `images/unknown.svg`;
        }

        icon.id =`iconfor${name}`;
        icon.style.position = "absolute";
        icon.style.backgroundImage = `url(${logopath})`;
        icon.style.backgroundRepeat = "no-repeat";
        icon.style.backgroundSize = "cover";
        icon.style.top = "0.5px";
        icon.style.bottom = "0.5px";
        icon.style.height = "16px";
        icon.style.width = "16px";

        icon.style.left = `${5}px`;
        icon.style.borderLeftColor = "#ffffff"
        icon.style.borderLeftWidth = `${1}px`;

        icon.style.backgroundColor = "transparent !important"

        newmfe.id = `node${name || Date.now()}`
        newmfe.innerText = `${name || ""}`;
        newmfe.style.paddingLeft = 20 + "px";
        newmfe.appendChild(icon)
        let isfcl = false;
        newmfe.addEventListener("click", (e) => {
            e.stopPropagation()
            if (isfcl) { newmfe.replaceChildren(element.name || "" , icon) }
            if (element.children.length > 0) {
                rl(newmfe, element.children)
                cursortomonaco(element.startPosition.row, element.startPosition.column)
                isfcl = true;

            }
        })


        elementr.appendChild(newmfe)
    });
}
/**@param {HTMLDocument} document  */

export function symtree(document, codetree) {
    rl(document.getElementById("nf-0-o-list"), codetree)
}