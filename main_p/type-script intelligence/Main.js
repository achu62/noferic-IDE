//jai sri ram
import * as rpc from "vscode-jsonrpc";
import {getpath} from "./findpath.js"
import { spawn } from "child_process";
export async function starttsserver()
{
    const tsprocess = spawn(getpath() , ["--stdio"])
   const connection = rpc.createMessageConnection(
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
    connection.sendNotification("textDocument/didOpen", {
        textDocument: {
            uri: "file:///home/charan/noferic-IDE/main_p/main.js",
            languageId: "javascript",
            version: 1,
            text: "//jai sri ram \n import fs from `node:fs` \n  fs."
        }
    });

   
    const completions = await connection.sendRequest(
        "textDocument/completion",
        {
            textDocument: {
                uri: "file:///home/charan/noferic-IDE/main_p/main.js"
            },
            position: {
                line: 2,
                character: 4
            }
        }
    );


}