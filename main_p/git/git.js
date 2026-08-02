//jai sri ram
import { simpleGit } from "simple-git";
import { Notification } from "electron"
import which from "which"
import path from "path"
import fs from "fs"
let oldstatus;
async function CheckGit() {
    const IsGit = await which("git")
    console.log(IsGit)
    if (!IsGit) {
        new Notification(`Git might not  be installed on this system`)
    }
}
CheckGit()

let gitprocess;
let prevbranch;
async function GetCurrentBranch(win) {
    const bn = (await gitprocess.branch()).current;
    if (bn === prevbranch) return;
    prevbranch = bn;
    console.log(bn)
    win.webContents.send(
        "data",
        JSON.stringify({
            action: "branch",
            branchname: bn
        }),
    );
}
export async function NotifyGitIntegration(win) {
    if (!gitprocess) { return; }
    GetCurrentBranch(win)

}
let repositorypath;
export async function initialisereposcan(repopath, win) {
    repositorypath = repopath
    try {
        const options = {
            baseDir: repopath,
            binary: "git",
            maxConcurrentProcesses: 100,
        };
        gitprocess = simpleGit(options);
        const status = await gitprocess.status();
        if(status  === oldstatus) return;
        oldstatus = status;
        NotifyGitIntegration(win)
        console.log("s" + JSON.stringify(status));

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
                console.log("m" + status.files.length);
                if (status.files.length === 0) {
                    rej("no changes to commit");
                }
                await gitprocess.add(".");
                const commit = await gitprocess.commit(message);
                console.log(commit)
                re("tr");
            }
            runn();
        } catch (e) {
            rej(new Error(e));
        }
    });
    return commitPromise;
}

export async function handlePush(){
    const promise = new Promise(async(res , rej)=>{
        try{
            const mess =await gitprocess.push()
            res(JSON.stringify(mess))
        }
        catch(e){
            rej(new Error(e))
        }
    })
    return promise;
}
export async function handlePull() {
    const promise = new Promise(async (res, rej) => {
        try {
            const mess = await gitprocess.pull()
            res(JSON.stringify(mess))
        }
        catch (e) {
            rej(new Error(e))
        }
    })
    return promise;
}
export async function Updatestatus(win)
{
    const status = await gitprocess.status();
    if (JSON.stringify(status) === JSON.stringify(oldstatus)) return;
    oldstatus = status;
    NotifyGitIntegration(win)
    console.log("s" + JSON.stringify(status));

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
}
export async function GetDifftextMain(Filepath){
    try {
        console.log(Filepath)
        const old = await gitprocess.raw(["show" , `HEAD:${Filepath}`])
        console.log(`ist the old:${old}`)
        const newFile =  await fs.readFileSync(path.join(repositorypath , Filepath))
        console.log(`ist the  new:${newFile}`)
        return  [old , newFile]
    }
   catch(e){
    console.log(e)
   }
}