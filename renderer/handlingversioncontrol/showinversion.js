//jai sri ram
let isFirst= true;
let isFirstDEl = true;
let isFirstcr = true;
let isFirstna = true;
let isFirstRn = true;
function rl(elementr , array){
    array.forEach(element => {
        const newmfe = document.createElement('button')
        newmfe.classList.add('files')
        newmfe.id = `mf${element}`
        newmfe.innerText = element;
        newmfe.style.paddingLeft = 20 + "px";
        newmfe.style.color="inherit"
        newmfe.addEventListener("click" , (e)=>{
            e.stopPropagation()
        })
        elementr.appendChild(newmfe)
    });
}
export  function setInVersionControl(document, element, json){
    const modifiedElement = document.createElement('button')
    modifiedElement.classList.add('files')
    modifiedElement.id = "modifiedElements"
    modifiedElement.innerText= "modified"
    modifiedElement.style.paddingLeft= 10 + "px";
    modifiedElement.style.color = "#3B82F6"
    modifiedElement.addEventListener("click", (e) => {
        if(isFirst){
            rl(modifiedElement, json.modified)
            isFirst = false;
        }
        else
        {
           modifiedElement.replaceChildren("modified")
           isFirst = true;
        }
    })
    const deleted = document.createElement('button')
    deleted.classList.add('files')
    deleted.id = "deletedElements"
    deleted.innerText = "Deleted"
    deleted.style.paddingLeft = 10 + "px";
    deleted.style.color="#ef4444"

    deleted.addEventListener("click", (e) => {
        if (isFirstDEl) {
            rl(deleted, json.deleted)
            isFirstDEl = false;
        }
        else {
            deleted.replaceChildren("Deleted")
            isFirstDEl = true;
        }
    })
    const created = document.createElement('button')
    created.classList.add('files')
    created.id = "CreatedElements"
    created.innerText = "Created"
    created.style.paddingLeft = 10 + "px";
    created.style.color = "#22C55E"
    created.addEventListener("click", (e) => {
        if (isFirstcr) {
        
            rl(created, json.created)
            isFirstcr = false;
        }
        else {
            created.replaceChildren("Created")
            isFirstcr = true;
        }
    })
    const notadded = document.createElement('button')
    notadded.classList.add('files')
    notadded.id = "NAElements"
    notadded.innerText = "Not_added"
    notadded.style.paddingLeft = 10 + "px";
    notadded.style.color="#9e9e9e"
    notadded.addEventListener("click", (e) => {
        if (isFirstna) {
            rl(notadded, json.notadded)
            isFirstna = false;
        }
        else {
            notadded.replaceChildren("Not_added")
            isFirstna = true;
        }
    })
    const renamed = document.createElement('button')
    renamed.classList.add('files')
    renamed.id = "RNElements"
    renamed.innerText = "Renamed"
    renamed.style.paddingLeft = 10 + "px";

    renamed.addEventListener("click", (e) => {
        if (isFirstRn) {
            rl(renamed, json.renamed)
            isFirstRn = false;
        }
        else {
            renamed.replaceChildren("Renamed")
            isFirstRn = true;
        }
    })
    element.appendChild(renamed)

    element.appendChild(modifiedElement)
    element.appendChild(deleted)
    element.appendChild(created)

    element.appendChild(notadded)

}
