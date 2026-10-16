//jai sri ram
import { FitAddon } from "../xterm-addon-fit/src/FitAddon.js";

import { createWindowinNoferic } from "../window_creator.js"
/**@param {HTMLElement} document */
export function newTerminalinsseperateWindow(document, id) {
    const win = document.createElement("div")
    createWindowinNoferic({
        "heading": "terminal_tab",
        "div": win
    })
    win.style.width = `${100}%`
    win.style.height = `${100}%`

    const terminal = new Terminal({
        fontSize: 12,
        fontWeight: 400,
        fontStyle: "normal",
        fontFamily: "JetBrains Mono",
        lineHeight: 1.25,
        letterSpacing: 0,
        cursorBlink: true,
        scrollback: 5000,
        theme: {
            background: "#1e1e1e",
            foreground: "#ffffff",
        },
    });
    const fitAddon = new FitAddon();

    terminal.loadAddon(fitAddon);
    terminal.open(win);
    fitAddon.fit();
    const ro = new ResizeObserver(() => {
        fitAddon.fit();
    });
    ro.observe(win);
    terminal.onData((data) =>
        window.ipc.send(
            "data",
            JSON.stringify({
                action: "tdata",
                id: id,
                data: data.toString(),
            }),
        ),
    ); window.ipc.onDataframeIPC((dataraw) => {
        const data = JSON.parse(dataraw);

        if (data.action !== "terminaldata" || data.id !== id) {
            return;
        }

        terminal.write(data.data);
    });
}