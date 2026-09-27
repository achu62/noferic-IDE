import { GetFilebaseName, showDiff } from "../renderer.js";
let json;
let staged = [];
//jai sri ram
async function rl(elementr, array, color, state) {
    array.forEach(async (element) => {
        const elementname = await GetFilebaseName(element);
        const newmfe = document.createElement("button");
        newmfe.classList.add("files");
        newmfe.id = `mf${element}`;
        newmfe.innerText = `${elementname}(${state})`;
        newmfe.style.paddingLeft = 20 + "px";
        newmfe.style.right = `${0}`;
        newmfe.style.left = `${0}`
        newmfe.style.color = color;
        newmfe.style.width = "100%";
        newmfe.style.boxSizing = "border-box";

        const stagebtn = document.createElement("button");
        stagebtn.style.all = "unset";
        stagebtn.id = `${element}stage`;
        stagebtn.style.position = "absolute"
        stagebtn.style.right = `${0}px`;
        stagebtn.style.bottom = `${0}`
        stagebtn.style.top = `${0}px`
        stagebtn.style.width = `${10}px`;
        stagebtn.style.color = "#ffffff";
        stagebtn.innerText = "+";
        stagebtn.style.backgroundColor = "#333333";
        const unstagebtn = document.createElement("button");
        unstagebtn.style.all = "unset";
        unstagebtn.id = `${element}stage`;
        unstagebtn.style.position = "absolute"
        unstagebtn.style.right = `${25}px`;
        unstagebtn.style.bottom = `${0}`
        unstagebtn.style.top = `${0}px`
        unstagebtn.style.width = `${10}px`;
        unstagebtn.style.color = "#ffffff";
        unstagebtn.innerText = "-";
        unstagebtn.style.backgroundColor = "#333333";
        stagebtn.addEventListener("click", (e) => {
            e.stopPropagation()
            if (staged.includes(element)) { return; }
            staged.push(element)
            newmfe.innerText += `(staged)`
            console.log(staged)
        })
        unstagebtn.addEventListener("click", (e) => {
            e.stopPropagation()
            staged = staged.filter(el => el !== element);
            newmfe.innerText = newmfe.innerText.replace("staged", "")
            console.log(staged)
        })
        newmfe.addEventListener("click", (e) => {
            e.stopPropagation();
            if (state === "M") {
                showDiff(element);
            }
        });

        newmfe.appendChild(stagebtn);
        newmfe.appendChild(unstagebtn)
        elementr.appendChild(newmfe);
    });
}
/**@param {HTMLDocument} document  */

export function setInVersionControl(document, eleme, jason) {
    console.log("chns");
    json = jason;
    eleme.innerText = "";
    /**@param {HTMLElement} element */
    const element = document.getElementById("changes");
    element.replaceChildren("changes >");
    rl(element, json.modified, "#3B82F6", "M");
    rl(element, json.deleted, "#ef4444", "D");
    rl(element, json.created, "#22C55E", "C");
    rl(element, json.notadded, "#9e9e9e", "N");
    rl(element, json.renamed, "#ffffff", "R");
}
