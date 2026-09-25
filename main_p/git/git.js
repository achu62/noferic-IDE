//jai sri ram
import { simpleGit } from "simple-git";
import { Notification } from "electron"
import which from "which"
import path from "path"
import fs from "fs"
let oldstatus;
async function CheckGit() {
    const IsGit = await which("git")
    //console.log(IsGit)
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
        if (status === oldstatus) return;
        oldstatus = status;
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
                const commit = await gitprocess.commit(message);
                //console.log(commit)
                re("tr");
            }
            runn();
        } catch (e) {
            rej(new Error(e));
        }
    });
    return commitPromise;
}

export async function SyncChanges() {
    try {
        // 1. Get current branch and check status
        const status = await gitprocess.status();
        const currentBranch = status.current;

        if (!currentBranch) {
            const notification = new Notification({
                 title: "noferic-IDE",
                body: "You are not on any branch!"
            });
            notification.show()

            return;
        }

        if (!status.isClean()) {
            const notification = new Notification({
                 title: "noferic-IDE",
                body: "Please commit your changes before syncing!"
            });
            notification.show()

            return;
        }

        console.log(`Pulling updates for ${currentBranch}...`);
        await gitprocess.pull('origin', currentBranch);

        console.log(`Pushing updates for ${currentBranch}...`);
        await gitprocess.push('origin', currentBranch);

        const notification = new Notification({
             title: "noferic-IDE",
            body: "Sync completed successfully!"
        });
        notification.show()


    } catch (error) {
        const not = new Notification({title:"sync-failed" , body:JSON.stringify(error)});

        if (error.message.includes('CONFLICT')) {
            const notification = new Notification({
                 title: "noferic-IDE",
                body: "Sync paused: Merge conflicts detected! Please resolve conflicts manually."
            });
            notification.show()

        } else if (error.message.includes('Authentication failed') || error.message.includes('Permission denied')) {
            const notification = new Notification({
                 title: "noferic-IDE",
                body: "Sync failed: Authentication or login issue with the remote repository."
            });
            notification.show()

        } else {
            const notification = new Notification({
                 title: "noferic-IDE",
                body: "Sync failed due to a network or repository error. Check your console."
            });
            notification.show()
        }
    }


}
export async function Updatestatus(win) {
    const status = await gitprocess.status();
    if (JSON.stringify(status) === JSON.stringify(oldstatus)) return;
    oldstatus = status;
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
}
export async function GetDifftextMain(Filepath) {
    try {
        //console.log(Filepath)
        const old = await gitprocess.raw(["show", `HEAD:${Filepath}`])
        //console.log(`ist the old:${old}`)
        const newFile = await fs.readFileSync(path.join(repositorypath, Filepath))
        //console.log(`ist the  new:${newFile}`)
        return [old, newFile]
    }
    catch (e) {
        //console.log(e)
    }
}