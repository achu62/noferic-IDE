//jai sri ram
export async function handleCommit(gitprocess , message){
    const commitPromise = new Promise((re, rej) => {
        try {
            async function runn() {
                const status = await gitprocess.status();
                console.log("m" + status.files.length);
                if (status.files.length === 0) {
                    rej("no changes to commit");
                }
                gitprocess.add(".");
                const commit = gitprocess.commit(message);
                re("tr")
            }
            runn();
        } catch (e) {
            rej(new Error(e));
        }
    });
    return commitPromise;
}