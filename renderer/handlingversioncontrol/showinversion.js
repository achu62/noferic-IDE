import { GetFilebaseName , showDiff } from "../renderer.js";

//jai sri ram
async function rl(elementr, array, color , state) {
    array.forEach(async(element) => {
        const elementname =await GetFilebaseName(element)
        const newmfe = document.createElement('button')
        newmfe.classList.add('files')
        newmfe.id = `mf${element}`
        newmfe.innerText = `${elementname}(${state})`;
        newmfe.style.paddingLeft = 20 + "px";
        newmfe.style.color = color
        newmfe.addEventListener("click", (e) => {
            e.stopPropagation()

            if(state ==="M"){
                showDiff(element)
            }
           
        })


        elementr.appendChild(newmfe)
    });
}
export function setInVersionControl(document, eleme, json) {

    eleme.innerText = "";
    /**@param {HTMLElement} element */
    const element = document.getElementById("changes")
    element.replaceChildren("changes >")
    rl(element, json.modified, "#3B82F6" , "M")
    rl(element, json.deleted, "#ef4444" , "D")
    rl(element, json.created, "#22C55E" , "C" )
    rl(element, json.notadded, "#9e9e9e" , "N")
    rl(element, json.renamed , "#ffffff" , "R")

    
}
