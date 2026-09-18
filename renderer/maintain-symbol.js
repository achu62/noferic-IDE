//jai sri ram
/**@param {Array} codetree  */
/**@param {HTMLDocument} document  */
async function rl(elementr, array) {
    array.forEach(async(element) => {
        const newmfe = document.createElement('button')
        newmfe.classList.add('files')
        newmfe.id = `node${element.name}`
        newmfe.innerText = `(${element.name || ""})${element.type}`;
        newmfe.style.paddingLeft = 20 + "px";
        newmfe.addEventListener("click", (e) => {
            e.stopPropagation()
            if(element.children.length > 0){
                rl(newmfe ,element.children)

            }
        })


        elementr.appendChild(newmfe)
    });
}
/**@param {HTMLDocument} document  */

export function symtree(document , codetree){
rl(document.getElementById("nf-0-o-list") , codetree)
}