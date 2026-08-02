//jai sri ram
let tags = [];
let checks = 
[
    "vite",
    "webpack" , 
    "react",
    "angular",
    "electron",
    "nextjs",
    "next",
    "astro",
    "nuxt"

]
import path from "path"
import fs from "fs"
export async function getTags(dirpath)
{
    
    
    const packagejson = path.join(dirpath , "package.json")
    if(fs.existsSync(packagejson))
    {
        const content = await fs.readFileSync(packagejson , "utf-8")
        console.log(content)
        checks.forEach((check)=>{
            if (content.includes(check)) {
                tags.push({
                    tag: check, reason: `${check} or related libraries found in dependencies(package.json)`
                })
            }
        })
        console.log(tags)
    }
    
}