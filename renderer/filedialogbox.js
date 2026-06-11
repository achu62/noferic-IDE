//jai sri ram
import {showdialog} from './renderer.js'
let inactivityTimer;

    export function createfolderdialogbox(parent, elementid, folderbtn, dialogforcreatefile){
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
    rightclickdiv.id=`rightdiv${elementid}`
    rightclickdiv.style.display = "none";
    rightclickdiv.style.position = "fixed";
    rightclickdiv.style.color = "white";
    rightclickdiv.style.backgroundColor = '#333333';
    rightclickdiv.style.width = 'fit-content';
    const folderbtnoffsetWidth = folderbtn.offsetWidth;
    const folderbtnoffsetHeight = folderbtn.offsetHeight;
    rightclickdiv.style.height = 'fit-content';
    rightclickdiv.style.borderRadius = 5+"px"
    rightclickdiv.style.left = `${folderbtn.getBoundingClientRect().left + folderbtnoffsetWidth - 10}px`
    rightclickdiv.style.top = `${folderbtn.getBoundingClientRect().top + folderbtnoffsetHeight - 3}px`
    parent.appendChild(rightclickdiv)
    const createfileelement = document.createElement('button')
    folderbtn.addEventListener('contextmenu' , (e)=>
    {
        e.stopPropagation();

        e.preventDefault();
        rightclickdiv.style.left = `${folderbtn.getBoundingClientRect().left + folderbtn.offsetWidth - 10}px`
        rightclickdiv.style.top = `${folderbtn.getBoundingClientRect().top + folderbtnoffsetHeight - 3}px`
        rightclickdiv.style.display = "block";
        resetTimer()


    })
    
    createfileelement.id = `rightdivcreatefileelement${ elementid }`
    createfileelement.classList.add(`createfileelement`)
    createfileelement.innerText= 'Create New File';
    createfileelement.addEventListener('click' , (e)=>
    {
        e.stopPropagation()
        showdialog(elementid)

    })
    rightclickdiv.appendChild(createfileelement)
    folderbtn.addEventListener("blur", (e) => {
        e.preventDefault(
        )
        e.stopPropagation()
        setTimeout(()=>
        {
            rightclickdiv.style.display = "none";

        } , 2000)


    })

}