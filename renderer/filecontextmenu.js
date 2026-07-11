//jai sri ram
import {deleteFile} from "./renderer.js"
let inactivityTimer;

export function createfiledialogbox(parent, elementid, filebtn) {
    const rightclickdiv = document.createElement('div')
    function startTimer() {

        inactivityTimer = setTimeout(() => {
            rightclickdiv.style.display = "none";


        }, 3000);
    }

    function resetTimer() {
        if (inactivityTimer) {
            clearTimeout(inactivityTimer); // Stop the current countdown
        }
        startTimer();                  // Start a fresh 60-second countdown
    } const filebtnoffsetWidth = filebtn.offsetWidth;
    const filebtnoffsetHeight = filebtn.offsetHeight;
    rightclickdiv.id = `rightdiv${elementid}`
    rightclickdiv.style.display = "none";
    rightclickdiv.style.position = "fixed";
    rightclickdiv.style.color = "white";
    rightclickdiv.style.backgroundColor = '#2d2d30';
    rightclickdiv.style.width = 'fit-content';
    rightclickdiv.style.borderRadius = 5 + "px"
    parent.appendChild(rightclickdiv)
    const deletefileelement = document.createElement('button')
    deletefileelement.id = `rightdivcreatefileelement${elementid}`
    deletefileelement.classList.add(`createfileelement`)
    deletefileelement.innerText = 'Delete';
    deletefileelement.addEventListener('click', (e) => {
        e.stopPropagation()
        deleteFile(elementid)
    })
    rightclickdiv.appendChild(deletefileelement)

    filebtn.addEventListener('contextmenu', (e) => {
        e.stopPropagation();

        e.preventDefault();
        rightclickdiv.style.left = `${filebtn.getBoundingClientRect().left + filebtn.offsetWidth - 10}px`
        rightclickdiv.style.top = `${filebtn.getBoundingClientRect().top + filebtnoffsetHeight - 3}px`
        rightclickdiv.style.display = "flex";
        resetTimer()


    })
}
