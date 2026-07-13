//jai sri ram

import { FitAddon } from "../xterm-addon-fit/src/FitAddon.js";

export function initiateterminal(e, id, document) {
	const terminal = new Terminal({
		fontSize: 14,
		fontWeight: 400,
		fontStyle: "normal",
		fontFamily: "Courier New, Courier, monospace",
		lineHeight: 1.25,
		letterSpacing: 0,
		cursorBlink: true,
		scrollback: 5000,
		theme: {
			background: "#1e1e1e",
			foreground: "#ffffff",
		},
	});
	const element = document.createElement("div");
	element.classList.add("terminaltabparallels");

	e.appendChild(element);
	const fitAddon = new FitAddon();

	terminal.loadAddon(fitAddon);
	terminal.open(element);

	fitAddon.fit();
	const ro = new ResizeObserver(() => {
		fitAddon.fit();
	});
	ro.observe(element);
	const tab = document.createElement("button");
	tab.id = `ttabfor${id}`;
	tab.innerText = `tab ${id}`;
	tab.classList.add("cl_terminal_tab");
	document.querySelectorAll(".cl_terminal_tab").forEach((terminaltab) => {
		terminaltab.style.backgroundColor = "inherit";
	});
	tab.style.backgroundColor = " #333333";
	tab.addEventListener("click", (e) => {
		e.stopPropagation();
		document
			.querySelectorAll(".terminaltabparallels")
			.forEach((terminaltab) => {
				terminaltab.style.display = "none";
				terminaltab.style.pointerEvents = "none";
			});
		document.querySelectorAll(".cl_terminal_tab").forEach((terminaltab) => {
			terminaltab.style.backgroundColor = "inherit";
		});
		tab.style.backgroundColor = " #333333";
		element.style.display = "block";
		element.style.pointerEvents = "auto";
		terminal.focus();
		fitAddon.fit();

		requestAnimationFrame(() => {
			fitAddon.fit();
			terminal.refresh(0, terminal.rows - 1);
		});
		console.log("tab change!!!!" + element.id);
	});
	document.getElementById("terminaltabmanager").appendChild(tab);

	terminal.onData((data) =>
		window.ipc.send(
			"data",
			JSON.stringify({
				action: "tdata",
				id: id,
				data: data.toString(),
			}),
		),
	);
	async function runresizeevent() {
		setInterval(() => {
			window.ipc.send(
				"data",
				JSON.stringify({
					action: "tdata",
					a2: "resize",
					data: {
						cols: terminal.cols,
						rows: terminal.rows,
					},
				}),
			);
		}, 10000);
	}
	runresizeevent();
	window.ipc.onDataframeIPC((dataraw) => {
		const data = JSON.parse(dataraw);
		console.log(data.id);
		console.log(id + data.id !== id);
		if (data.action !== "terminaldata" || data.id !== id) {
			return;
		}

		terminal.write(data.data);
	});

}
