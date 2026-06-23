//jai sri ram
import { showdialog , showFolderDialog} from './renderer.js'
let inactivityTimer;

export function createfolderdialogbox(parent, elementid, folderbtn, dialogforcreatefile) {
    const rightclickdiv = document.createElement('div')
    function startTimer() {

        inactivityTimer = setTimeout(() => {
            rightclickdiv.style.display = "none";


        }, 10000);
    }

    function resetTimer() {
        if (inactivityTimer) {
            clearTimeout(inactivityTimer); // Stop the current countdown
        }
        startTimer();                  // Start a fresh 60-second countdown
    }
    rightclickdiv.id = `rightdiv${elementid}`
    rightclickdiv.style.display = "none";
    rightclickdiv.style.position = "fixed";
    rightclickdiv.style.color = "white";
    rightclickdiv.style.backgroundColor = '#333333';
    rightclickdiv.style.width = 'fit-content';
    const folderbtnoffsetWidth = folderbtn.offsetWidth;
    const folderbtnoffsetHeight = folderbtn.offsetHeight;
    rightclickdiv.style.height = 'fit-content';
    rightclickdiv.style.borderRadius = 5 + "px"
    rightclickdiv.style.left = `${folderbtn.getBoundingClientRect().left + folderbtnoffsetWidth - 10}px`
    
    rightclickdiv.style.top = `${folderbtn.getBoundingClientRect().top + folderbtnoffsetHeight - 3}px`
    rightclickdiv.style.flexDirection  = "column"
    rightclickdiv.style.gap = 0 +"px";
    parent.appendChild(rightclickdiv)
    const createfileelement = document.createElement('button')
    const createfolderelement = document.createElement('button')
    const deletefolderelement = document.createElement('button')


    folderbtn.addEventListener('contextmenu', (e) => {
        e.stopPropagation();

        e.preventDefault();
        rightclickdiv.style.left = `${folderbtn.getBoundingClientRect().left + folderbtn.offsetWidth - 10}px`
        rightclickdiv.style.top = `${folderbtn.getBoundingClientRect().top + folderbtnoffsetHeight - 3}px`
        rightclickdiv.style.display = "flex";
        resetTimer()


    })

    createfileelement.id = `rightdivcreatefileelement${elementid}`
    createfileelement.classList.add(`createfileelement`)
    createfileelement.innerText = 'Create New File';
    createfolderelement.id = `rightdivcreatefolderelement${elementid}`
    createfolderelement.classList.add(`createfolderelement`)
    createfolderelement.innerText = 'Create New Folder';
    deletefolderelement.id = `rightdivcreatefolderelement${elementid}`
    deletefolderelement.classList.add(`createfolderelement`)
    deletefolderelement.innerText = 'Create New Folder';
    createfileelement.addEventListener('click', (e) => {
        e.stopPropagation()
        showdialog(elementid)

    })
    createfolderelement.addEventListener('click', (e) => {
        e.stopPropagation()
        showFolderDialog(elementid)

    })
    rightclickdiv.appendChild(createfileelement)
    rightclickdiv.appendChild(createfolderelement)
    folderbtn.addEventListener("blur", (e) => {
        e.preventDefault(
        )
        e.stopPropagation()
        setTimeout(() => {
            rightclickdiv.style.display = "none";

        }, 2000)


    })

}