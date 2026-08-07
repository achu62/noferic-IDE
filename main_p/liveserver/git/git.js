//jai sri ram
import { simpleGit, gitP } from "simple-git";
import {Notification} from "electron"
import which from "which"
import  path from "path"
async function CheckGit(){
    const IsGit = await which("git")
    //console.log(IsGit)
    if(!IsGit){
        new Notification(`Git might not  be installed on this system`)
    }
}
CheckGit()
let gitprocess;
let prevbranch ;
async function GetCurrentBranch(win) {
    const bn = (await gitprocess.branch()).current;
    if(bn===prevbranch) return;
    prevbranch = bn;
    //console.log(bn)
    win.webContents.send(
        "data",
        JSON.stringify({
            action: "branch",
            branchname: bn
        }),
    );
}
export async function NotifyGitIntegration(win) {
    if(!gitprocess){return;}
    GetCurrentBranch(win)
  
}

export async function initialisereposcan(repopath , win) {
    
    try {
        const options = {
            baseDir: repopath,
            binary: "git",
            maxConcurrentProcesses: 100,
        };
        gitprocess = simpleGit(options);
        const status = await gitprocess.status();
        NotifyGitIntegration(win)
        //console.log("s" + JSON.stringify(status));

        win.webContents.send(
            "data",
            JSON.stringify({
                action: "status",
                status: {
                    created: status.created,
                    modified: status.modified,
                    renamed: status.renamed,
                    deleted: status.deleted,
                    notadded: status.not_added,
                },
            }),
        );
        const ignoredfiles = await gitprocess.raw([
            "ls-files",
            "--others",
            "--ignored",
            "--exclude-standard",
        ]);
        const ifr = ignoredfiles
            .split(/\r?\n/)
            .map((file) => file.trim())
            .filter(Boolean);
        let ifiles = [];
        ifr.forEach((e) => {
            ifiles.push(path.join(repopath, e));
        });
        if (ignoredfiles) {
            win.webContents.send(
                "data",
                JSON.stringify({
                    action: "ignoredfiles",
                    ignoredfiles: ifiles,
                }),
            );
        }
    } catch (e) {
       // consolelog(e);
    }
}
export async function handleCommit(message) {
    const commitPromise = new Promise((re, rej) => {
        try {
            async function runn() {
                const status = await gitprocess.status();
                //console.log("m" + status.files.length);
                if (status.files.length === 0) {
                    rej("no changes to commit");
                }
                await gitprocess.add(".");
               await  gitprocess.commit(message);
                re("tr");
            }
            runn();
        } catch (e) {
            rej(new Error(e));
        }
    });
    return commitPromise;
}

