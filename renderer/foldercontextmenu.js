//jai sri ram
import { ctil, deleteFolder, showdialog, showFolderDialog , rendererrename} from './renderer.js'
let inactivityTimer;


export function createfolderdialogbox(parent, elementid, folderbtn, file) {
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
    }
    rightclickdiv.id = `rightdiv${elementid}`
    rightclickdiv.style.display = "none";
    rightclickdiv.style.position = "fixed";
    rightclickdiv.style.color = "white";
    rightclickdiv.style.backgroundColor = '#2d2d30';
    rightclickdiv.style.width = 'fit-content';
    const folderbtnoffsetWidth = folderbtn.offsetWidth;
    const folderbtnoffsetHeight = folderbtn.offsetHeight;
    rightclickdiv.style.height = 'fit-content';
    rightclickdiv.style.borderRadius = 5 + "px"
    rightclickdiv.style.left = `${folderbtn.getBoundingClientRect().left + folderbtnoffsetWidth - 10}px`

    rightclickdiv.style.top = `${folderbtn.getBoundingClientRect().top + folderbtnoffsetHeight - 3}px`
    rightclickdiv.style.flexDirection = "column"
    rightclickdiv.style.gap = 0 + "px";
    parent.appendChild(rightclickdiv)
    const createfileelement = document.createElement('button')
    const createfolderelement = document.createElement('button')
    const deletefolderelement = document.createElement('button')
    const openterminalincurrentdir = document.createElement('button')
    const copypath = document.createElement('button')
    const copyname = document.createElement('button')
    const renamefolderelement = document.createElement("button")

    folderbtn.addEventListener('contextmenu', (e) => {
        e.stopPropagation();

        e.preventDefault();
        rightclickdiv.style.left = `${folderbtn.getBoundingClientRect().left + folderbtn.offsetWidth - 10}px`
        rightclickdiv.style.top = `${folderbtn.getBoundingClientRect().top + folderbtnoffsetHeight - 3}px`
        rightclickdiv.style.display = "flex";
        resetTimer()


    })


    createfileelement.id =
        `rightdivcreatefileelement${elementid}`
    createfileelement.classList.add(`createfileelement`)
    createfileelement.innerText = ' Create New File';







    copypath.id = `rightdivcp${elementid}`
    copypath.classList.add(`createfileelement`)
    copypath.innerText = 'Copy Folder Path';





    copyname.id = `rightdivcfn${elementid}`

    copyname.classList.add(`createfileelement`)
    copyname.innerText = ' Create Folder Name';
    copyname.addEventListener("click" , (e)=>{
        e.preventDefault()
        navigator.clipboard.writeText(file.name)
        console.log(file)
         IDEComponentApi.ShowNotification("copied" , {
            duration:9000,
            type:"success"
        })
    })
      copypath.addEventListener("click" , (e)=>{
        e.preventDefault()
        console.log(file)
        navigator.clipboard.writeText(file.id)
         IDEComponentApi.ShowNotification("copied" , {
            duration:9000,
            type:"success"
        })
    })


    createfolderelement.id = `rightdivcreatefolderelement${elementid}`
    createfolderelement.classList.add(`createfolderelement`)
    createfolderelement.innerText = ' Create New Folder';
    openterminalincurrentdir.id = `rightdivcreatethelement${elementid}`
    openterminalincurrentdir.classList.add(`createfolderelement`)
    openterminalincurrentdir.innerText = "open Terminal Here";
    deletefolderelement.id = `rightdivcreatefolderelement${elementid}`
    deletefolderelement.classList.add(`createfolderelement`)
    deletefolderelement.innerText = ' Delete';
      renamefolderelement.id = `rightdivrn${elementid}`
    renamefolderelement.classList.add(`createfolderelement`)
    renamefolderelement.innerText = 'rename';
    createfileelement.addEventListener('click', (e) => {
        e.stopPropagation()
        showdialog(elementid)

    })
    createfolderelement.addEventListener('click', (e) => {
        e.stopPropagation()
        showFolderDialog(elementid)

    })
    deletefolderelement.addEventListener('click', (e) => {
        e.stopPropagation()
        deleteFolder(elementid)
    })
    openterminalincurrentdir.addEventListener("click", (e) => {
        e.stopPropagation()
        ctil(elementid)
    })
    renamefolderelement.addEventListener("click" , (e)=>{
                e.stopPropagation()
                rendererrename(elementid , file.name)

    })
    rightclickdiv.appendChild(createfileelement)
    rightclickdiv.appendChild(createfolderelement)
    rightclickdiv.appendChild(deletefolderelement)
    rightclickdiv.appendChild(openterminalincurrentdir)
    rightclickdiv.appendChild(copyname)
    rightclickdiv.appendChild(copypath)
    rightclickdiv.appendChild(renamefolderelement)
    folderbtn.addEventListener("blur", (e) => {
        e.preventDefault(
        )
        e.stopPropagation()
        setTimeout(() => {
            rightclickdiv.style.display = "none";

        }, 2000)


    })

}