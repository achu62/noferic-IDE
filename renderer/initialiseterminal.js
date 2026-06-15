
//jai sri ram
//
/*import {FitAddon} from "./xterm-addon-fit/src/FitAddon.js" 
const Fitaddon = new FitAddon()
export function initiateterminal(element) {
	const terminal = new Terminal({
		fontSize:14,
		convertEol: true,
		theme: {
			background: "#1e1e1e",
			scrollbarOpacity:1
		},
	});
	terminal.loadAddon(Fitaddon)
	Fitaddon.fit()
	terminal.open(element);
	terminal.onData((data) => window.ipc.send("data", data.toString()));
	window.ipc.onDataframeIPC((dataraw) => {
		const data = JSON.parse(dataraw);
		if (data.action !== "terminaldata") {
			return;
		}
		terminal.write(data.data);
	});
}*/
import { FitAddon } from "./xterm-addon-fit/src/FitAddon.js";

export function initiateterminal(element) {
	const terminal = new Terminal({
		fontFamily: "JetBrains Mono",
		fontSize: 14,
		fontWeight:400,
		fontStyle:"normal",
		lineHeight: 1.25,
		letterSpacing: 0,
		cursorBlink: true,
		scrollback: 1000,
		theme: {
			background: "#1e1e1e",
			foreground:"#ffffff"
		}
	});

	const fitAddon = new FitAddon();

	terminal.loadAddon(fitAddon);
	terminal.open(element);
	
	fitAddon.fit();
	const ro = new ResizeObserver(() => {
		fitAddon.fit();

	})
	ro.observe(element)
	terminal.onData((data) => window.ipc.send("data", data.toString()));

	window.ipc.onDataframeIPC((dataraw) => {
		const data = JSON.parse(dataraw);
		if (data.action !== "terminaldata") {
			return;
		}
		terminal.write(data.data);
	});
}
