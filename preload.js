//jai sri ram
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld("ipc",
    {
        invoke: async function (channel, ...args) {
            const answer = await
                ipcRenderer.invoke(channel, ...args);
            return answer;

        },
        onDataframeIPC: function (callback) {
            ipcRenderer.on("data", (event, data) => {
                callback(data);
            });
        },
        send:
            async function (channel, ...args) {
                ipcRenderer.send(channel, ...args);
            }
    });
    //done
