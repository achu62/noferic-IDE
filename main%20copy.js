//jai sri ram
const { app, BrowserWindow, dialog, ipcMain, shell } = require("electron");
let pathreal = null;
const isproduction = app.isPackaged;

let addedpathbyide;
let globalfolderjson;
function consolelog(args) {
	if (!isproduction) {
		console.log(`\n${args}`);
	}

}




let gitprocess;
let biomeprocess;
let connection;


let tsserverprocess;
let tsserverconnection;
let count = 1;
//jai sri ram

//jai sri ram
const { detectPort } = require("detect-port")
const path = require("node:path");

const fs = require("node:fs");
const { Worker } = require("node:worker_threads");
const pty = require("node-pty");
const { spawn, execFile, exec } = require("child_process");
const os = require("os");
const { buffer } = require("stream/consumers");
const rpc = require(`vscode-jsonrpc`);

const { InitializeRequest } = require("vscode-languageserver-protocol");
const chokidar = require("chokidar");
const { watchFile } = require("node:original-fs");
const { simpleGit, gitP } = require("simple-git");
const liveServer = require('live-server')
console.log("starting...live..server")

const isWindows = process.platform === "win32";
consolelog(app.getPath("userData"));
const cfpath = app.getPath("userData");
if (!fs.existsSync(path.join(cfpath, "biome"))) {
	fs.mkdirSync(path.join(cfpath, "biome"), { recursive: true });
}
if (!fs.existsSync(path.join(cfpath, "biome", "biome.json"))) {
	fs.writeFileSync(
		path.join(cfpath, "biome", "biome.json"),
		`

`,
		"utf8",
	);
}

console.log(fs.readFileSync(path.join(cfpath, "biome", "biome.json"), "utf8"));
async function initialisereposcan(repopath) {
	try {
		const options = {
			baseDir: repopath,
			binary: "git",
			maxConcurrentProcesses: 100,
		};
		gitprocess = simpleGit(options);
		const status = await gitprocess.status();
		consolelog(status)
		console.log("s" + JSON.stringify(status))

		win.webContents.send("data", JSON.stringify({
			action: "status",
			status: {
				created: status.created,
				modified: status.modified,
				renamed: status.renamed,
				deleted: status.deleted,
				notadded: status.not_added
			}
		}))
		const ignoredfiles = await gitprocess.raw([
			"ls-files",
			"--others",
			"--ignored",
			"--exclude-standard",
		]);
		const ifr = ignoredfiles
			.split(/\r?\n/)
			.map((file) => file.trim())
			.filter(Boolean)
		let ifiles = [];
		ifr.forEach((e) => {
			ifiles.push(path.join(repopath, e))
		})
		if (ignoredfiles) {
			win.webContents.send(
				"data",
				JSON.stringify({
					action: "ignoredfiles",
					ignoredfiles: ifiles
				}),
			);
		}
	} catch (e) {
		consolelog(e);
	}
}
async function Updatestatus() { }
consolelog(process.resourcesPath);
consolelog(isWindows);
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
			node.haschildren = true;
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
consolelog("apppath" + apppath);

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
		win.removeMenu();
	}
}
let ptyProcess;
let terminal = null;
let pathforterminal;
async function initialiseterminalmain(pathforterminal) {
	if (process.platform === "win32") {
		terminal = process.env.COMSPEC || "cmd.exe";
	} else {
		terminal = process.env.SHELL || "bash";
	}
	if (ptyProcess) {
		ptyProcess.kill();
	}
	ptyProcess = pty.spawn(terminal, [], {
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
	if (!args) {
		return;
	}
	if (!fs.existsSync(args)) {
		return;
	} else {
		if (fs.statSync(path.resolve(args)).isDirectory()) {
			pathreal = path.resolve(args);
			track(path.resolve(args));
			initialisereposcan(path.resolve(args));
			biomeprocess = spawn(
				isWindows
					? isproduction
						? path.join(
							process.resourcesPath,
							"app",
							"node_modules",
							"@biomejs",
							"cli-win-x64",
							"biome.exe",
						)
						: "./node_modules/@biomejs/cli-win-x64/biome.exe"
					: isproduction
						? path.join(
							process.resourcesPath,
							"app",
							"node_modules",
							"@biomejs",
							"biome",
							"bin",
							"biome",
						)
						: "./node_modules/@biomejs/biome/bin/biome",
				[`lsp-proxy`],
			);

			connection = rpc.createMessageConnection(
				new rpc.StreamMessageReader(biomeprocess.stdout),
				new rpc.StreamMessageWriter(biomeprocess.stdin),
			);
			connection.listen();
			connection.onRequest("workspace/configuration", (params) => {
				console.log("Biome asked for configuration params:", params);

				// 3. Return the settings array directly.
				// The library automatically wraps this in a JSON-RPC response frame with matching ID!
				return [
					{
						configurationPath: path.join(
							path.resolve(args),
							".noferic-ide",
							"biome.json"
						),
						requireConfiguration: true
					}
				];
			});
			const root = `file://${path.resolve(args)}/.noferic-ide`;
			async function start() {
				try {
					/*const result = await connection.sendRequest("initialize", {
						processId: process.pid,
						rootUri: root,
						capabilities: {
							textDocument: {
								publishDiagnostics: {},
							},
						},
					});
					consolelog(`result:\n\n${JSON.stringify(result)}`);*/
					connection.sendRequest("initialize", {
						processId: process.pid,
						rootUri: root,
						workspaceFolders: [
							{
								uri: root,
								name: path.basename(path.resolve(args)),
							},
						],
						capabilities: {
							workspace: {
								configuration: true,
								workspaceFolders: true,
								didChangeWatchedFiles: {
									dynamicRegistration: true
								}
							},
							textDocument: {
								synchronization: {
									didSave: true,
									dynamicRegistration: true,
								},
							},
						},
					});
					console.log(`file://${path.join(path.resolve(args), '.noferic-ide', 'biome.json')}`)

					connection.sendNotification("initialized", {});
					connection.sendNotification("workspace/didChangeWatchedFiles", {
						"changes": [
							{
								// Point directly to the physical biome.json file URI
								"uri": `file://${path.join(path.resolve(args), '.noferic-ide', 'biome.json')}`,
								"type": 2 // 2 means "Changed" in the LSP Specification
							}
						]
					});
					connection.sendNotification("workspace/didChangeConfiguration", {
						"settings": {
							"biome": {
								"requireConfiguration": true,
							}
						}
					});
				} catch (e) {
					consolelog(`error:\n\n\n\n${e}`);
				}
			}
			start();
			if (!fs.existsSync(path.join(path.resolve(args), ".noferic-ide"))) {
				fs.mkdirSync(path.join(path.resolve(args), ".noferic-ide"));
			}
			try {
				if (
					!fs.existsSync(
						path.join(path.resolve(args), ".noferic-ide/biome.json"),
					)
				) {
					async function run() {
						consolelog("it dont");
						await fs.writeFileSync(
							path.join(path.resolve(args), ".noferic-ide", "biome.json"),
							"",
							"utf-8",
						);
					}
					run();
				}
			} catch (e) {
				consolelog(e);
			}
			console.log(`file://${pathreal}/test${Date.now()}`, `file://${pathreal}/.noferic-ide/test${Date.now()}`)
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
			initialiseterminalmain(path.dirname(path.resolve(args)))
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
	//track(pathreal);

	//return result.filePaths[0];
	try {
		if (isproduction) {
			spawn(process.execPath, [pathreal], {
				detached: true,
				stdio: "ignore",
			}).unref();
		} else {
			spawn(process.execPath, [app.getAppPath(), pathreal], {
				detached: true,
				stdio: "ignore",
			}).unref();
		}

		//win.close();
		biomeprocess.kill();
	} catch (e) {
		consolelog(e);
	}
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

ipcMain.handle("format", async (event, object) => {
	const extension = object.extension;
	const language = object.language;
	const myCode = object.code;

	try {
		const myUri = `file://${pathreal}/.noferic-ide/test${Date.now()}.${extension}`;

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
		consolelog(edits);
		return edits;
	} catch (e) {
		console.log(JSON.stringify(e))
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

		//win.close();
		biomeprocess.kill();
	} catch (e) {
		consolelog(e);
	}
});

ipcMain.handle("autosave", async (e, code, path) => {
	fs.writeFileSync(path, code, "utf-8");
	changedpathsbyide.push(path);
});
let oldreqcomleted = true;
ipcMain.handle("lint", async (e, message) => {
	consolelog(`recieved:${JSON.stringify(message)}`);
	if (!oldreqcomleted) {
		return;
	}

	try {
		consolelog(`recieved:${JSON.stringify(message)}`);

		const fileToLint = {
			uri: `file://${pathreal}/.noferic-ide/test${Date.now()}.${message.extension}`,
			languageId: message.language,
			version: 1,
			text: message.code,
		};
		connection.sendNotification("textDocument/didOpen", {
			textDocument: fileToLint,
		});
	} catch (error) {
		consolelog(error);
	}
	let params;
	const promise = new Promise((re, rej) => {
		const listener = connection.onNotification(
			"textDocument/publishDiagnostics",
			(params) => {
				consolelog(`\n\n${JSON.stringify(params)}`);
				oldreqcomleted = true;
				count++;
				re(params);
				listener.dispose();
			},
		);
	});
	return promise;
});
ipcMain.handle("mkdir", async (e, path) => {
	try {
		await fs.promises.mkdir(path);

	}
	catch (e) {
		win.webContents.send(
			"data",
			JSON.stringify({
				action: "errorhandle",
				errorlocation: "creating folder",
				errormessage: e,
			}),
		);
	}
})
ipcMain.handle("start_server", async (e, obj) => {
	console.log(obj)

	const serverParams = {
		port: obj.port,
		host: "127.0.0.1",
		root: path.join(pathreal, obj.relativepath),
		open: obj.toOpen,                      // CRITICAL: Stop it from opening a default browser window
		wait: 100                         // Delay before reloading (in ms)
	};

	liveServer.start(serverParams);


})
ipcMain.handle('unlink', async (e, path) => {
	console.log(path)
	await shell.trashItem(path)
})
ipcMain.handle("validate-details-liveserver", async (e, d) => {
	const aport = await detectPort(d.port);
	console.log(aport)
	console.log(d.port)
	const npromise = new Promise((re, rej) => {

		console.log(path.join(pathreal, d.relativepath))

		if (!fs.existsSync(path.join(pathreal, d.relativepath))) {
			rej(new Error(`${path.join(pathreal, d.relativepath)} does not exist`))
		}


		if (aport !== parseInt(d.port)) {
			consolelog("nnooo")
			rej(new Error(`Port ${d.port} seems to be not availible \nit is recommended to try out another availible port\nit has been detected  that port ${aport} might be free`))
		}
		else {
			re(true)
		}
	})
	return npromise;
})
ipcMain.handle('commit', async (e, message) => {
	const commitPromise = new Promise((re, rej) => {
		try {
			async function runn() {
				const status = await gitprocess.status()
				console.log("m" + status.files.length)
				if (status.files.length === 0) { rej("no changes to commit") }
				gitprocess.add(".")
				const commit = gitprocess.commit(message)
				re(commit.summary, commit.commit)
			}
			runn()
		}

		catch (e) {
			rej(new Error(e))
		}
	})
	return commitPromise;
})

app.on('before-quit', () => {
	//biomeprocess.kill()
})
