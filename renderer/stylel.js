//jai sri ram
import { getfileiconbytype } from "./utils.js"

export function StyleL(icon, file, depth, extension , id , ratio

) {
    console.log(icon)
    console.log(id)
   // let logopath = getfileiconbytype[extension];
    
    let logopath = "images/newfile.svg"
   if (!logopath) {
        logopath = `images/unknown.svg`;
    }

    icon.id = id?`${id}`:`iconfor${file.id}`;
    icon.style.position = "absolute";
    icon.style.backgroundImage = `url(${logopath})`;
    icon.style.backgroundRepeat = "no-repeat";
    icon.style.backgroundSize = "cover";
    icon.style.top = "0.5px";
    icon.style.bottom = "0.5px";
    icon.style.height = ratio ? ratio.height :"16px";
    icon.style.width = ratio ? ratio.width : "16px";
    icon.style.left = `${depth - 19}px`;
    icon.style.borderLeftColor="#ffffff"
    icon.style.borderLeftWidth = `${1}px`
    icon.style.backgroundColor = "transparent !important"
}