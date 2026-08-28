//jai sri ram
import pty from  "@lydell/node-pty";
import os from "os";
let terminal;
import { ipcMain } from "electron";
export async function initialiseterminalmain(ptyProcess ,pathforterminal, id , win) {
    if (process.platform === "win32") {
        terminal = process.env.COMSPEC || "cmd.exe";
    } else {
        terminal = process.env.SHELL || "bash";
    }

    ptyProcess[id] = pty.spawn(terminal, [], {
        cwd: pathforterminal || os.homedir(),
        env: process.env,
    });
    ptyProcess[id].onData((data) => {
        win.webContents.send(
            "data",
            JSON.stringify({ action: "terminaldata", data: data.toString(), id: id }),
        );
    });
    ipcMain.on("data", (event, d) => {
        const data = JSON.parse(d);
        if (data.action === "tdata" && data.id === id ) {
            if(data.a2 === "resize"){
                ptyProcess[id].resize(data.data.cols , data.data.rows)
                return;
            }
            ptyProcess[id].write(data.data);
        }
    });
}