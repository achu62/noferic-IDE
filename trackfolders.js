//jai sri ram

 async function track(pathreal) {
     const {
         win,
         globalfolderjson,
         scanafolder,
         injectChildrenByPath,
         deleteNodeById,
         Updatestatus
     } = context;
    if (!pathreal) return;
    if (watcher) {
        watcher.close();
        watcher = null;
    }

    try {
        if (watcher) watcher.close();

        watcher = chokidar.watch(pathreal, {
            ignoreInitial: true,
        });

        watcher.on("add", (filePath) => {
            Updatestatus();
            if (addedpathbyide) {
                addedpathbyide = addedpathbyide.filter((item) => item !== filePath);
            }
            if (!addedpathbyide?.includes(filePath)) {
                const filepathonly = path.basename(filePath);
                const foldepath = path.dirname(filePath);
                injectChildrenByPath(globalfolderjson, foldepath, [
                    {
                        id: filePath,
                        name: filepathonly,
                        isdirectory: false,
                    },
                ]);
                
                win.webContents.send(
                    "data",
                    JSON.stringify({
                        action: "addelements",
                        newjson: globalfolderjson,
                        add: {
                            parentid: foldepath,
                            actualjson: [
                                {
                                    id: filePath,
                                    name: filepathonly,
                                    isdirectory: false,
                                },
                            ],
                        },
                    }),
                );
            }
        });

        watcher.on("change", (filePath) => {
            Updatestatus();

            changedpathsbyide = changedpathsbyide.filter((item) => item !== filePath);

            if (!changedpathsbyide.includes(filePath)) {
                consolelog("filechangedexternal:" + filePath);
            }
        });

        watcher.on("unlink", (filePath) => {
            Updatestatus();

            const filepathonly = path.basename(filePath);
            const foldepath = path.dirname(filePath);
            deleteNodeById(globalfolderjson, filePath);
            win.webContents.send(
                "data",
                JSON.stringify({
                    action: "removeelements",
                    newjson: globalfolderjson,
                    remove: filePath,
                }),
            );
        });
        watcher.on("addDir", async (DirPath) => {
            Updatestatus();

            const Dirnameonly = path.basename(DirPath);

            const foldepath = path.dirname(DirPath);

            const children = await scanafolder(DirPath);
            injectChildrenByPath(globalfolderjson, foldepath, [
                {
                    id: DirPath,
                    name: Dirnameonly,
                    isdirectory: true,
                    haschildren: children.length > 0,
                    children: [],
                },
            ]);

            win.webContents.send(
                "data",
                JSON.stringify({
                    action: "addelements",
                    newjson: globalfolderjson,
                    add: {
                        parentid: foldepath,
                        actualjson: [
                            {
                                id: DirPath,
                                name: Dirnameonly,
                                isdirectory: true,
                                haschildren: children.length > 0,
                                children: children,
                            },
                        ],
                    },
                }),
            );
        });
        watcher.on("unlinkDir", (DirPath) => {
            Updatestatus();

            const Dirnameonly = path.basename(DirPath);

            const foldepath = path.dirname(DirPath);
            deleteNodeById(globalfolderjson, DirPath);
            win.webContents.send(
                "data",
                JSON.stringify({
                    action: "removeelements",
                    newjson: globalfolderjson,
                    remove: DirPath,
                }),
            );
        });
    } catch (e) {
        consolelog(e);
    }
}
module.exports = {track}