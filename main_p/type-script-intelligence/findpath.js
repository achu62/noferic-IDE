//jai sri ram
import path from "node:path"
import { getEssentials } from "../main.js"
export function getpath(){
    let sp;
    const items =getEssentials()
    if (items.appispackaged)
    {
        console.log("packaged")
        sp = path.join(items.path , "app" ,"node_modules" ,   "typescript-language-server" , "lib" , "cli.mjs");

        
    }
   else{
    sp="./node_modules/.bin/typescript-language-server"
   }
    return sp;
    
}




