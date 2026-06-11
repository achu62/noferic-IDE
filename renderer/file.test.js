//jai sri ram
const { app, BrowserWindow, dialog, ipcMain } = require("electron");
let pathreal = null;
const isproduction = app.isPackaged;
let addedpathbyide;
let globalfolderjson;
//jai sri ram
//jai sri ram
const path = require("path");
const fs = require("fs");
const { Worker } = require("worker_threads");
const pty = require("node-pty");
const { spawn, execFile } = require("child_process");
const os = require("os");
const { buffer } = require("stream/consumers");
const rpc = require(`vscode-jsonrpc`);
const { InitializeRequest } = require("vscode-languageserver-protocol");
const chokidar = require("chokidar");
const { watchFile } = require("node:original-fs");
const isWindows = process.platform === "win32";

console.log(isWindows);
async function scanafolder(folderpath) {
	let json = [];
	const files = fs.readdirSync(folderpath, { withFileTypes: true });
	for (const file of files) {
		const fullpath = path.join(folderpath, file.name);
		if (file.isDirectory()) {
			const children = await scanafolder(fullpath);
			json.push({
				id: fullpath,
				name: file.name,
				isdirectory: true,
				haschildren: children.length > 0,
				children: children,
			});
		} else {
			json.push({
				id: fullpath,
				name: file.name,
				isdirectory: false,
			});
		}
	}
	return json;
}
function injectChildrenByPath(treeLayers, targetId, newChildren) {
	for (const node of treeLayers) {
		if (node.id === targetId) {
			node.children ??= [];

			node.children.push(...newChildren);

			node.haschildren = node.children.length > 0;

			return true;
		}

		if (node.isdirectory && node.children) {
			if (injectChildrenByPath(node.children, targetId, newChildren)) {
				return true;
			}
		}
	}

	return false;
}
function deleteNodeById(treeLayers, targetId) {
	for (let i = 0; i < treeLayers.length; i++) {
		const node = treeLayers[i];

		// Found it?
		if (node.id === targetId) {
			treeLayers.splice(i, 1);
			return true;
		}

		// Search children
		if (node.isdirectory && node.children) {
			if (deleteNodeById(node.children, targetId)) {
				node.haschildren = node.children.length > 0;
				return true;
			}
		}
	}

	return false;
}
let watcher = null;
let changedpathsbyide = [];
const apppath = process.execPath;
console.log("apppath" + apppath);

async function track(pathreal) {
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
			console.log(`File added: ${filePath}`);
			if (addedpathbyide) {
				addedpathbyide = addedpathbyide.filter((item) => item !== filePath);
			}
			if (!addedpathbyide?.includes(filePath)) {
				console.log("filechangedexternal:" + filePath);
				const filepathonly = path.basename(filePath);
				const foldepath = path.dirname(filePath);
				injectChildrenByPath(globalfolderjson, foldepath, [
					{
						id: filePath,
						name: filepathonly,
						isdirectory: false,
					},
				]);
				fs.writeFileSync(
					"/home/charan/noferic-IDE/me.json",
					JSON.stringify(globalfolderjson),
				);
				console.log(foldepath, filepathonly);
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
			console.log(`File changed: ${filePath}`);
			console.log(`changedpathsbyide:${changedpathsbyide}`);
			changedpathsbyide = changedpathsbyide.filter((item) => item !== filePath);

			if (!changedpathsbyide.includes(filePath)) {
				console.log("filechangedexternal:" + filePath);
			}
		});

		watcher.on("unlink", (filePath) => {
			console.log(`File removed: ${filePath}`);
			const filepathonly = path.basename(filePath);
			const foldepath = path.dirname(filePath);
			deleteNodeById(globalfolderjson, filePath);
			console.log(filepathonly);
			console.log(JSON.stringify(globalfolderjson));
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
		console.log(e);
	}
}

let win;
function createWindow() {
	win = new BrowserWindow({
		width: 1200,
		height: 800,
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
			nodeIntegration: false,
			contextIsolation: true,
			sandbox: true,
			allowRunningInsecureContent: false,
			webSecurity: true,
			spellcheck: false,
		},
	});
	win.loadFile("./renderer/index.html");
	if (isproduction) {
		console.log("");
		win.removeMenu();
	}
}
let ptyProcess;
let shell = null;
let pathforterminal;
async function initialiseterminalmain(pathforterminal) {
	if (process.platform === "win32") {
		shell = process.env.COMSPEC || "cmd.exe";
	} else {
		shell = process.env.SHELL || "bash";
	}
	if (ptyProcess) {
		ptyProcess.kill();
	}
	ptyProcess = pty.spawn(shell, [], {
		cwd: pathforterminal || os.homedir(),
		env: process.env,
	});
	ptyProcess.onData((data) => {
		win.webContents.send(
			"data",
			JSON.stringify({ action: "terminaldata", data: data.toString() }),
		);
	});
	ipcMain.on("data", (event, data) => {
		ptyProcess.write(data);
	});
}
async function handleappargs(args) {
	console.log(`args tarted func  ${args} `);

	if (!args) {
		console.log("no args");
		return;
	}
	if (!fs.existsSync(args)) {
		console.log("file doesent exist");
		return;
	} else {
		if (fs.statSync(path.resolve(args)).isDirectory()) {
			track(path.resolve(args));
			const json = await scanafolder(path.resolve(args));
			globalfolderjson = [
				{
					id: path.resolve(args),
					name: path.basename(path.resolve(args)),
					isdirectory: true,
					haschildren: fs.readdirSync(path.resolve(args)).length > 0,
					children: json,
				},
			];
			win.webContents.send(
				"data",
				JSON.stringify({
					action: "handlingargsopenfolder",
					fjson: [
						{
							id: path.resolve(args),
							name: path.basename(path.resolve(args)),
							isdirectory: true,
							haschildren: fs.readdirSync(path.resolve(args)).length > 0,
							children: json,
						},
					],
				}),
			);
			initialiseterminalmain(path.resolve(args));
		} else {
			track(path.resolve(args));
			win.webContents.send(
				"data",

				JSON.stringify({
					action: "handlefileargs",
					path: path.resolve(args),
				}),
			);
		}
	}
}
let args;
app.whenReady().then(() => {
	createWindow();
	if (isproduction) {
		args = process.argv[1];
	} else {
		args = process.argv[2];
	}
	win.webContents.once("did-finish-load", () => {
		handleappargs(args);
	});
});

ipcMain.handle("openfile", async () => {
	const result = await dialog.showOpenDialog({ properties: ["openFile"] });
	if (result.canceled || !result.filePaths || result.filePaths.length === 0)
		return null;
	pathreal = result.filePaths[0];
	track(pathreal);
	return result.filePaths[0];
});

ipcMain.handle("read", async (event, filepath) => {
	if (!filepath) return null;
	try {
		const content = await fs.promises.readFile(filepath, "utf8");
		return content;
	} catch (err) {
		console.error("Failed to read file", err);
		throw err;
	}
});
ipcMain.handle("write", (event, path, contenttosave) => {
	fs.writeFileSync(path, contenttosave);
	changedpathsbyide.push(path);
});
ipcMain.handle("save", async (e) => {
	const result = await dialog.showSaveDialog({
		title: "save file",
		defaultPath: "untitled.txt",
	});
	return result.filePath;
});
ipcMain.handle("append", async (e, path) => {
	if (fs.existsSync(path)) {
		win.webContents.send(
			"data",
			JSON.stringify({
				action: "errorhandle",
				errorlocation: "creating file",
				errormessage: "fileexists",
			}),
		);
	}
	await fs.promises.appendFile(path, "");
});
ipcMain.handle("saveas", async (e) => {
	const result = await dialog.showSaveDialog({
		title: "save_As",
		defaultPath: "",
	});
	return result.filePath;
});

const biomeprocess = spawn(
	isWindows
		? isproduction
			? path.join(
					process.resourcesPath,
					"/node_modules/@biomejs/cli-win-x64/biome.exe",
				)
			: "./node_modules/@biomejs/cli-win-x64/biome.exe"
		: isproduction
			? path.join(
					process.resourcesPath,
					"./node_modules/@biomejs/biome/bin/biome",
				)
			: "./node_modules/@biomejs/biome/bin/biome",
	[`lsp-proxy`],
);
const connection = rpc.createMessageConnection(
	new rpc.StreamMessageReader(biomeprocess.stdout),
	new rpc.StreamMessageWriter(biomeprocess.stdin),
);
connection.listen();
const root = `file://${path.join(__dirname, ".")}`;
async function start() {
	try {
		const result = await connection.sendRequest("initialize", {
			processId: process.pid,
			rootUri: root,
			capabilities: {
				textDocument: {
					publishDiagnostics: {},
				},
			},
		});
		console.log(`result:\n\n${JSON.stringify(result)}`);
		connection.sendNotification("initialized", {});
	} catch (e) {
		console.log(`error:\n\n\n\n${e}`);
	}
}
start();
try {
	const fileToLint = {
		uri: "file:///example.js",
		languageId: "javascript",
		version: 1,
		text: `if (working === false) {
   fix();
}`,
	};
	connection.sendNotification("textDocument/didOpen", {
		textDocument: fileToLint,
	});
} catch (error) {
	console.log(error);
}
connection.onNotification("textDocument/publishDiagnostics", (params) => {
	console.log(params);
	params.diagnostics.forEach((d) => {
		console.log(
			`[${d.severity}] ${d.message} at line ${d.range.start.line + 1}`,
		);
	});
});

ipcMain.handle("format", async (event, object) => {
	const extension = object.extension;
	const language = object.language;
	const myCode = object.code;

	try {
		const myUri = `file:///test.${extension}`;

		await connection.sendNotification("textDocument/didOpen", {
			textDocument: {
				uri: myUri,
				languageId: language,
				version: 1,
				text: myCode,
			},
		});
		const edits = await connection.sendRequest("textDocument/formatting", {
			textDocument: { uri: myUri },
			options: {
				tabSize: 2,
				insertSpaces: true,
			},
		});
		console.log(edits);
		return edits;
	} catch (e) {
		win.webContents.send(
			"data",
			JSON.stringify({
				action: "errorhandle",
				errorlocation: "formatting",
				errormessage: JSON.stringify(e),
			}),
		);
	}
});

ipcMain.handle("openfolder", async (e) => {
	const result = await dialog.showOpenDialog({ properties: ["openDirectory"] });
	if (result.canceled || !result.filePaths || result.filePaths.length === 0)
		return null;

	const folderpath = result.filePaths[0];
	try {
		if (isproduction) {
			spawn(process.execPath, [folderpath], {
				detached: true,
				stdio: "ignore",
			}).unref();
		} else {
			spawn(process.execPath, [app.getAppPath(), folderpath], {
				detached: true,
				stdio: "ignore",
			}).unref();
		}

		win.close();
		biomeprocess.kill();
	} catch (e) {
		console.log(e);
	}
});

ipcMain.handle("autosave", async (e, code, path) => {
	fs.writeFileSync(path, code, "utf-8");
	changedpathsbyide.push(path);
});
console.log(globalfolderjson);
