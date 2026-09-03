//jai sri ram
import {deleteFile} from "./renderer.js"
import {IDEComponentApi} from "./editor UI components.js"
let inactivityTimer;

export function createfiledialogbox(parent, elementid, filebtn , file) {
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
    };
    rightclickdiv.id = `rightdiv${elementid}`
   rightclickdiv.style.display = "none";
    rightclickdiv.style.position = "fixed";
    rightclickdiv.style.color = "white";
    rightclickdiv.style.backgroundColor = '#2d2d30';
    rightclickdiv.style.width = 'fit-content';
    const filebtnoffsetWidth = filebtn.offsetWidth;
    const filebtnoffsetHeight = filebtn.offsetHeight;
    rightclickdiv.style.height = 'fit-content';
    rightclickdiv.style.borderRadius = 5 + "px"
    rightclickdiv.style.left = `${filebtn.getBoundingClientRect().left + filebtnoffsetWidth - 10}px`

    rightclickdiv.style.top = `${filebtn.getBoundingClientRect().top + filebtnoffsetHeight - 3}px`
    rightclickdiv.style.flexDirection = "column"
    rightclickdiv.style.gap = 0 + "px";
    
    parent.appendChild(rightclickdiv)
    const deletefileelement = document.createElement('button')
      const copypath = document.createElement('button')
    const copyname = document.createElement('button')

 copypath.id = `rightdivcpf${elementid}`
    copypath.classList.add(`createfileelement`)
    copypath.innerText = 'Copy File Path';





    copyname.id = `rightdivcfnf${elementid}`

    copyname.classList.add(`createfileelement`)
    copyname.innerText = ' Create File Name';
    copyname.addEventListener("click" , (e)=>{
        e.preventDefault()
        navigator.clipboard.writeText(file.name)
        console.log(file)
     IDEComponentApi.ShowNotification("copied" , {
            duration:9000,
            type:"success"
        })    })
      copypath.addEventListener("click" , (e)=>{
        e.preventDefault()
        console.log(file)
        navigator.clipboard.writeText(file.id)
        IDEComponentApi.ShowNotification("copied" , {
            duration:9000,
            type:"success"
        })
    })

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
    rightclickdiv.appendChild(copyname)
    rightclickdiv.appendChild(copypath)
}
