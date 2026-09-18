//jai sri ram
/**@param {Array} codetree  */
/**@param {HTMLDocument} document  */
let allowedeclarations = ["function_declaration",
    "generator_function_declaration",
    "class_declaration",
    "lexical_declaration",
    "variable_declaration"]
async function rl(elementr, array) {
    array.forEach(async (element) => {
        if (!element.name) {
            rl(elementr, element.children)
            return;

        }
        if (allowedeclarations.includes(element.type) == false) {
            rl(elementr, element.children);
            return;
        }

        const newmfe = document.createElement('button')
        newmfe.classList.add('files')
        newmfe.id = `node${element.name}`
        newmfe.innerText = `${element.name || ""}`;
        newmfe.style.paddingLeft = 20 + "px";
        let isfcl = false;
        newmfe.addEventListener("click", (e) => {
            e.stopPropagation()
            if(isfcl){newmfe.replaceChildren(element.name || "")}
            if (element.children.length > 0 ) {
                rl(newmfe, element.children)
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