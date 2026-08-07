//jai sri ram
import fs from "fs"
export async function readFilejs(filepath){

        if (!filepath) return null;
        try {
            const content = await fs.promises.readFile(filepath, "utf8");
            return content;
        } catch (err) {
            console.error("Failed to read file", err);
            throw err;
        }
    
}
