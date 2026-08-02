//jai sri ram
//yes this is working
//jai sri ram
//the main.js is changed
import { app, BrowserWindow, dialog, ipcMain, shell  , Notification} from "electron";
import { detectPort } from "detect-port";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { initialisereposcan } from "./git/git.js";
import fs from "node:fs";
import { Worker } from "node:worker_threads";
import pty from "node-pty";
import { spawn, execFile, exec } from "child_process";
import os from "os";
import { buffer } from "stream/consumers";
import * as rpc from "vscode-jsonrpc";
import { InitializeRequest } from "vscode-languageserver-protocol";
import chokidar from "chokidar";
import { watchFile } from "node:original-fs";
import { simpleGit, gitP } from "simple-git";
import liveServer from "live-server";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import {deleteNodeById , injectChildrenByPath} from "./utils.js"
import { startBiomeProcess, lintWithBiome } from "./biome/biomeHandler.js";
import { start_server } from "./liveserver/startServer.js";
import { validate_details_liveserver } from "./liveserver/validateDetailsLiveserver.js";
import { readFilejs } from "./readfile.js";
import { formatHandler } from "./biome/formatrequesthandler.js";
import { defaultconfigbiome } from "./defaultconfig.js";
import { initialiseterminalmain } from "./terminal/terminal.js";
import { handleCommit , handlePush , handlePull , GetDifftextMain} from "./git/git.js";
import { scanafolder } from "./scanafolder.js";
import { provideautocomplete, starttsserver , ProvideDiagnostics} from "./type-script-intelligence/Main.js";
import { getTags } from "./tagger.js";
import { provideAutoCompleteforts } from "./type-script-intelligence/autocomplete.js";
import { createTrack } from "./track.js";
let pathreal = null;
const isproduction = app.isPackaged;

let addedpathbyide;
let globalfolderjson;
function consolelog(args) {
	if (!isproduction) {
		console.log(`\n${args}`);
	}
}
export  function getEssentials()
{
	return {
		appispackaged:app.isPackaged,
		processplatform:process.platform,
		path:process.resourcesPath,
		
	}
}

let gitprocess;
let biomeprocess;
let connection;

let tsserverprocess;

let tsserverconnection;
let count = 1;
//jai sri ram

console.log("starting...live..server");

const isWindows = process.platform === "win32";
consolelog(app.getPath("userData"));
const cfpath = app.getPath("userData");
if (!fs.existsSync(path.join(cfpath, "biome"))) {
	fs.mkdirSync(path.join(cfpath, "biome"), { recursive: true });
}
if (!fs.existsSync(path.join(cfpath, "biome", "biome.json"))) {
	fs.writeFileSync(
		path.join(cfpath, "biome", "biome.json"),
		defaultconfigbiome,
		"utf8",
	);
}

console.log(fs.readFileSync(path.join(cfpath, "biome", "biome.json"), "utf8"));

consolelog(process.resourcesPath);
consolelog(isWindows);



let changedpathsbyide = [];
const apppath = process.execPath;
consolelog("apppath" + apppath);

const track = createTrack({
	getState: () => ({
		win,
		addedpathbyide,
		globalfolderjson,
		changedpathsbyide,
	}),
	consolelog,
});

let win;
function createWindow() {
	win = new BrowserWindow({
		width: 1200,
		height: 800,
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
			nodeIntegration: false,
			contextIsolation: true,
			allowRunningInsecureContent: true,
			webSecurity: true,
			spellcheck: false,
			devTools:true,
			
		},
	});
	win.loadFile(path.join(__dirname , ".." , "renderer" , "index.html"));
	if (isproduction) {
		win.removeMenu();
	}
	win.on("close", (event) => {
	
			event.preventDefault();
			win.webContents.send(
				"data",
				JSON.stringify({
					action: "getOpenTabs",
				}),
			);
			

		ipcMain.once("data", (e, d) => {
			console.log("CLOSING")
			const data = JSON.parse(d);
			if (data.action === "tabsopen") {
				fs.writeFileSync(path.join(pathreal , ".noferic-ide" , "noferic-config.json") , JSON.stringify({"openTabs" : data.openTabs}))
				win.removeAllListeners('close');
			}} );		
	});
}
let ptyProcess = {};
let terminal = null;
let pathforterminal;


async function handleappargs(args) {
	if (!args) {
		return;
	}
	if (!fs.existsSync(args)) {
		return;
	} else {
		if (fs.statSync(path.resolve(args)).isDirectory()) {
			pathreal = path.resolve(args);
			getTags(pathreal)
			track(path.resolve(args));
			initialisereposcan(path.resolve(args), win);
			await starttsserver(path.resolve(args))

			const biomeResult = await startBiomeProcess(args, {
				isWindows,
				isproduction,
				cfpath,
				consolelog,
			});
			biomeprocess = biomeResult.biomeprocess;
			connection = biomeResult.connection;
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
							fs.readFileSync(path.join(cfpath, "biome", "biome.json"), "utf8"),
							"utf-8",
						);
					}
					run();
				}
			} catch (e) {
				consolelog(e);
			}
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
			initialiseterminalmain(ptyProcess ,  path.resolve(args), "def" , win);
		} else {
			track(path.resolve(args));
			initialiseterminalmain(ptyProcess , path.dirname(path.resolve(args)), "def" , win);
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
	win.webContents.once("did-finish-load", async() => {
		await handleappargs(args);
	});
});

ipcMain.handle("openfile", async () => {
	const result = await dialog.showOpenDialog({ properties: ["openFile"] });
	if (result.canceled || !result.filePaths || result.filePaths.length === 0)
		return null;
	pathreal = result.filePaths[0];
	
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

		
		biomeprocess.kill();
	} catch (e) {
		consolelog(e);
	}
});

ipcMain.handle("read", async (event, filepath) => {
	return await readFilejs(filepath)
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
	return formatHandler(event, object, {
		connection,
		pathreal,
		win,
		consolelog,
	});
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
		biomeprocess.kill();
	} catch (e) {
		consolelog(e);
	}
});

ipcMain.handle("autosave", async (e, code, path) => {
	fs.writeFileSync(decodeURIComponent(path), code, "utf-8");
	changedpathsbyide.push(path);
});
let oldreqcomleted = true;
ipcMain.handle("lint", async (e, message) => {
	consolelog(`recieved:${JSON.stringify(message)}`);
	if (!oldreqcomleted) {
		return;
	}
	oldreqcomleted = false;

	try {
		
		return await lintWithBiome(connection, pathreal, message, consolelog);

	} catch (error) {
		consolelog(error);
		throw error;
	} finally {
		oldreqcomleted = true;
	}
});
ipcMain.handle("mkdir", async (e, path) => {
	try {
		await fs.promises.mkdir(path);
	} catch (e) {
		win.webContents.send(
			"data",
			JSON.stringify({
				action: "errorhandle",
				errorlocation: "creating folder",
				errormessage: e,
			}),
		);
	}
});
ipcMain.handle("start_server", async (e, obj) => {
	return start_server(e, obj, pathreal);
});
ipcMain.handle("unlink", async (e, path) => {
	console.log(path);
	await shell.trashItem(path);
});
ipcMain.handle("validate-details-liveserver", async (e, d) => {
	return validate_details_liveserver(e, d, pathreal, consolelog);
});
ipcMain.handle("commit", async (e, message) => {
	
		const commitPromise = await handleCommit(message)
		return commitPromise;
});
ipcMain.handle("create_new_terminal", async (e, id) => {
	console.log("r r /t n");
	initialiseterminalmain(ptyProcess , 
		pathreal, id , win);
});
ipcMain.handle("join-path" , async(e , arg1 , arg2)=>{
	console.log(path.join(arg1, arg2))
	return path.join(arg1 , arg2)
})
ipcMain.handle("get-ext" , async(e,fpath)=>{
	return path.extname(fpath);
})
ipcMain.handle("providetsautocomplete" , async(e , path , content , line , char )=>{
	console.log(line , char , content , path)

		const completions = await provideautocomplete(path , content , line , char)
		console.log("hell i send the req")
		console.log(completions)
		return completions ;
	
})
ipcMain.handle("log" , async(e,...args)=>{
	console.log("ren" + args)
})
ipcMain.handle("push", async () => {
	try {
		const message =await handlePush();
		new Notification({
			title: "git responded",
			body:` git responded with ${ message }`
		}).show();
	} catch (error) {
		const message =
			error instanceof Error ? error.message : String(error);

		new Notification({
			title: "Push failed",
			body: message,
		}).show();
	}
});
ipcMain.handle("pull", async () => {
	try {
		const message = await handlePull();
		new Notification({
			title: `git responded:`,
			body: `git responded with ${message}`,
		}).show();
	} catch (error) {
		const message =
			error instanceof Error ? error.message : String(error);

		new Notification({
			title: "Pull failed",
			body: message,
		}).show();
	}
});

ipcMain.handle("get-base-name" , async(e,fpath)=>{
	return path.basename(fpath)
})
ipcMain.handle("get-diff-texts" , async(e , element)=>{
	return await GetDifftextMain(element)
})