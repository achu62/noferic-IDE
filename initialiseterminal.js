//jai sri ram
export function initiateterminal(element) {

    const terminal = new Terminal(
        {
            convertEol: true,
            theme:
            {
                background: '#1e1e1e'
            }
        }
    );
    terminal.open(element);
    terminal.onData((data) => window.ipc.send("data", data.toString()));
    window.ipc.onDataframeIPC((data) => {
        terminal.write(data)
    })
}
