//jai sri ram
import * as rpc from "vscode-jsonrpc";
import {getpath} from "./findpath.js"
import { spawn } from "child_process";
import * as nodepath from "path"
import fs from "fs"
import { provideAutoCompleteforts } from "./autocomplete.js";
let prevpath ={
    path:"",
    version:1,
}
let isCompleted =true;
let connection;
export async function starttsserver()
{
    const tsprocess = spawn(getpath() , ["--stdio"])
   connection = rpc.createMessageConnection(
        new rpc.StreamMessageReader(tsprocess.stdout),
        new rpc.StreamMessageWriter(tsprocess.stdin),
    );
    connection.listen()
   const inres = await connection.sendRequest("initialize",  {
        
            processId:process.pid,
            rootUri:"file:///home/charan/noferic-IDE/main_p",
            capabilities:{}
        }
    )
    connection.sendNotification("initialized" , {}

    )
  

}
export async function provideautocomplete(path, content , char , line) {
  console.log("yes\n\n\n\n\n\n\n\n\n\n\n\n\n\\n\n\n")
    if(!isCompleted){return}
    isCompleted = false;
    if (path !== prevpath.path) {
        let ext;
        if (nodepath.extname(path) === ".js" || nodepath.extname(path) === ".jsx") {
            ext = "javascript";
        }
        else if (nodepath.extname(path) === ".ts" || nodepath.extname(path) === ".tsx") {
            ext = "typescript"
        }
        else {
            return null;
        }
        connection.sendNotification("textDocument/didClose", {
            textDocument: {
                uri: `file://${prevpath.path}`,
            }
        });
        prevpath.path = path;
        prevpath.version = 1;
        connection.sendNotification("textDocument/didOpen", {
            textDocument: {
                uri: `file://${path}`,
                languageId: `${ext}`,
                version: 1,
                text: `${content}`
            }
        });
    }
    else {


        prevpath.path = path;
        prevpath.version = prevpath.version + 1;
        connection.sendNotification("textDocument/didChange", {
            textDocument: {
                uri: `file://${path}`,
                version: prevpath.version,
            }, "contentChanges": {
                text: `${content}`
            }
        });

    }


    const returncode = await provideAutoCompleteforts(connection, {
        path:
            path,
        position: {
            line: line,
            character: char
        }

    })
    
    fs.writeFileSync(`ts${Date.now()}` , `${path , JSON.stringify(prevpath)},${JSON.stringify(returncode , null , 2)}`)
    isCompleted = true;
    return returncode;
}
