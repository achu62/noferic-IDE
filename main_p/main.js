//jai sri ram
//yes this is working
//jai sri ram
//the main.js is changed
import envPaths from "env-paths";

import { lint, initialiseLinter } from "./Linting-features/eslint.js"
import {
  app,
  BrowserWindow,
  dialog,

  ipcMain,
  shell,

  Notification,

} from "electron";
import { detectPort } from "detect-port";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { initialisereposcan } from "./git/git.js";
import fs from "node:fs";
import { Worker } from "node:worker_threads";

import { spawn, execFile, exec } from "child_process";
import os from "os";
import { buffer } from "stream/consumers";

import chokidar from "chokidar";
import { watchFile } from "node:original-fs";
import { simpleGit, gitP } from "simple-git";
import liveServer from "live-server";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { deleteNodeById, injectChildrenByPath } from "./utils.js";
import { start_server } from "./liveserver/startServer.js";
import { validate_details_liveserver } from "./liveserver/validateDetailsLiveserver.js";
import { readFilejs } from "./readfile.js";
import { initialiseterminalmain } from "./terminal/terminal.js";
import {
  handleCommit,
  handlePush,
  handlePull,
  GetDifftextMain,
} from "./git/git.js";
import { scanafolder } from "./scanafolder.js";
import { initialisetds, getSyntacticDiagnosticsfromts, GetHover } from "./ts-features/main.js"

import { getTags } from "./tagger.js";
import { getSearchResults, UpdateorCreatefilelist } from "./getAllFilenames.js";
async function handleConfigurations() {
  if (!fs.existsSync(toNormalisedWindowsId(path.join(pathsforappdatas.config))) && toNormalisedWindowsId(path.join(pathsforappdatas.config, "noferic-config.json"))) {
    fs.mkdirSync(toNormalisedWindowsId(path.join(pathsforappdatas.config)), { recursive: true })
    fs.mkdirSync(toNormalisedWindowsId(path.join(pathsforappdatas.config, "appsettings")), { recursive: true })
    fs.promises.appendFile(toNormalisedWindowsId(path.join(pathsforappdatas.config, "appsettings", "noferic-config.json")))
    fs.writeFileSync(toNormalisedWindowsId(path.join(pathsforappdatas.config, "appsettings", "noferic-config.json")),
      JSON.stringify(
        {
          "theme": "dark"
        }
      )
    )
  }

  win.webContents.send("data", JSON.stringify({
    action: "appSettings",
    settings:
      fs.readFileSync(toNormalisedWindowsId(path.join(pathsforappdatas.config, "appsettings", "noferic-config.json")), "utf8")
  }))
  const settingWatcher = chokidar.watch(toNormalisedWindowsId(path.join(pathsforappdatas.config, "appsettings", "noferic-config.json"))
  )
  settingWatcher.on("change", (filepath) => {
    win.webContents.send("data", JSON.stringify({
      action: "appSettings",
      settings:
        fs.readFileSync(toNormalisedWindowsId(path.join(pathsforappdatas.config, "appsettings", "noferic-config.json")), "utf8")
    }))
  })
}
const pathsforappdatas = envPaths("Noferic IDE");
console.log(toNormalisedWindowsId(pathsforappdatas.config))
let pathreal = null;
const isproduction = app.isPackaged;
function toNormalisedWindowsId(inputPath) {
  return path.win32.normalize(inputPath).replace(/\\/g, "/");

}
function toNormalizedWindospath(inputPath) {
  return path.win32.normalize(inputPath).replace(/\\/g, "/");
}
function toPathKey(inputPath) {
  return toNormalizedWindospath(inputPath).toLowerCase();
}
let addedpathbyide;
let globalfolderjson;
function consolelog(args) {
  if (!isproduction) {
    //console.log(`\n${args}`);
  }
}
let win;

let changedpathsbyide = [];

export function getEssentials() {
  return {
    appispackaged: app.isPackaged,
    processplatform: process.platform,
    path: app.isPackaged ? process.resourcesPath : app.getAppPath(),
    appPath: app.getAppPath(),
    appRoot: app.getAppPath(),
  };
}
export function Nullify() {
  changedpathsbyide = [];
}

let gitprocess;
let count = 1;
//jai sri ram

export function getState() {
  return {
    addedpathbyide,
    globalfolderjson,
    changedpathsbyide,
  }
}
//console.log("starting...live..server");

const isWindows = process.platform === "win32";
consolelog(app.getPath("userData"));
const cfpath = app.getPath("userData");

//console.log(fs.readFileSync(path.join(cfpath, "biome", "biome.json"), "utf8"));

consolelog(process.resourcesPath);
consolelog(isWindows);
process.on("uncaughtException", (err) => {
  console.error(err)
})

const apppath = process.execPath;
consolelog("apppath" + apppath);
let watcher;
/**@param {string} pathreal */
async function track(pathreal) {
  if (!pathreal) return;
  pathreal = toNormalizedWindospath(pathreal);
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
      filePath = toNormalizedWindospath(filePath);
      if (addedpathbyide) {
        addedpathbyide = addedpathbyide.filter((item) => toNormalizedWindospath(item) !== filePath);
      }
      if (!addedpathbyide?.map(toNormalizedWindospath).includes(filePath)) {
        const filepathonly = path.basename(toNormalizedWindospath(filePath));
        const foldepath = path.dirname(toNormalizedWindospath(filePath));
        injectChildrenByPath(globalfolderjson, toNormalizedWindospath(foldepath), [
          {
            id: toNormalizedWindospath(filePath),
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
              parentid: toNormalizedWindospath(foldepath),
              actualjson: [
                {
                  id: toNormalizedWindospath(filePath),
                  name: filepathonly,
                  isdirectory: false,
                },
              ],
            },
          }),
        );
      }
    });

    watcher.on("change", async (filePath) => {
      filePath = toNormalizedWindospath(filePath);
      if (!changedpathsbyide.map(toPathKey).includes(toPathKey(filePath))) {
        win.webContents.send(
          "data",
          JSON.stringify({
            action: "handleachangeinfile",
            path: toNormalizedWindospath(filePath),
            content: await fs.readFileSync(toNormalizedWindospath(filePath), "utf-8"),
          }),
        );
      }

      changedpathsbyide = changedpathsbyide.filter((item) => toPathKey(item) !== toPathKey(filePath));
    });

    watcher.on("unlink", (filePath) => {
      filePath = toNormalizedWindospath(filePath);
      const filepathonly = path.basename(toNormalizedWindospath(filePath));
      const foldepath = path.dirname(toNormalizedWindospath(filePath));
      console.log(toNormalizedWindospath(filePath))
      deleteNodeById(globalfolderjson, toNormalizedWindospath(filePath));
      win.webContents.send(
        "data",
        JSON.stringify({
          action: "removeelements",
          newjson: globalfolderjson,
          remove: toNormalizedWindospath(filePath),
        }),
      );
    });
    watcher.on("addDir", async (DirPath) => {
      DirPath = toNormalizedWindospath(DirPath);

      const Dirnameonly = path.basename(toNormalizedWindospath(DirPath));

      const foldepath = path.dirname(toNormalizedWindospath(DirPath));

      const children = await scanafolder(toNormalizedWindospath(DirPath));
      injectChildrenByPath(globalfolderjson, toNormalizedWindospath(foldepath), [
        {
          id: toNormalizedWindospath(DirPath),
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
            parentid: toNormalizedWindospath(foldepath),
            actualjson: [
              {
                id: toNormalizedWindospath(DirPath),
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
      DirPath = toNormalizedWindospath(DirPath);

      const Dirnameonly = path.basename(toNormalizedWindospath(DirPath));

      const foldepath = path.dirname(toNormalizedWindospath(DirPath));
      deleteNodeById(globalfolderjson, toNormalizedWindospath(DirPath));
      win.webContents.send(
        "data",
        JSON.stringify({
          action: "removeelements",
          newjson: globalfolderjson,
          remove: toNormalizedWindospath(DirPath),
        }),
      );
    });
  } catch (e) {
    consolelog(e);
  }
}



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
      devTools: true,
    },
  });

  win.loadFile(path.join(__dirname, "..", "renderer", "index.html"));
  if (isproduction) {
    win.removeMenu();
  }
  win.webContents.on('did-finish-load', () => {
    win.webContents.insertCSS(`
      [fill="#1e1e1e" i] { fill: #FFFFFF !important; }
      [stroke="#1e1e1e" i] { stroke: #FFFFFF !important; }
      [style*="#1e1e1e" i] { color: #FFFFFF !important; }
    `);
  });
  win.on("close", (event) => {
    event.preventDefault();
    win.webContents.send(
      "data",
      JSON.stringify({
        action: "getOpenTabs",
      }),
    );

    ipcMain.once("data", (e, d) => {
      //console.log("CLOSING")
      const data = JSON.parse(d);
      if (data.action === "tabsopen") {
        fs.writeFileSync(
          path.join(pathreal, ".noferic-ide", "noferic-config.json"),
          JSON.stringify({ openTabs: data.openTabs }),
        );
        win.removeAllListeners("close");
      }
    });
  });
}
let ptyProcess = {};

async function handleappargs(args) {
  if (!args) {
    return;
  }
  if (!fs.existsSync(args)) {
    return;
  } else {
    if (fs.statSync(path.resolve(args)).isDirectory()) {
      try {
        initialisetds(toNormalisedWindowsId(path.resolve(args)))

      }
      catch (e) { }
      try {
        initialiseterminalmain(ptyProcess, path.resolve(args), "def", win);

      }
      catch (e) {
      }
      try {
        getTags(toNormalisedWindowsId(path.resolve(args)));

      }
      catch (e) { }
      try {
        track(path.resolve(args));
      }
      catch (e) {
      }
      try { initialisereposcan(path.resolve(args), win) }
      catch (e) { }
      try {
        UpdateorCreatefilelist(path.resolve(args));
      }
      catch (e) { }
      try {
        initialiseLinter(path.resolve(args))
      }
      catch (e) { }
      async function confirm(win) {
        const result = await dialog.showMessageBox(win, {
          type: "question",
          buttons: ["Yes, I trust the workspace", "Quit"],
          defaultId: 1,
          cancelId: 1,
          title: "Trust Workspace",
          message: `Do you fully trust the workspace?\n\n${path.resolve(args)}`,
        });

        if (result.response === 1) {
          app.quit();
        }
      }
      confirm(win);
      pathreal = path.resolve(args);


      if (!fs.existsSync(path.join(path.resolve(args), ".noferic-ide"))) {
        fs.mkdirSync(path.join(path.resolve(args), ".noferic-ide"));
      }
      const json = await scanafolder(path.resolve(args));
      globalfolderjson = [
        {
          id: toNormalisedWindowsId(path.resolve(args)),
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
              id: toNormalisedWindowsId(path.resolve(args)),
              name: path.basename(path.resolve(args)),
              isdirectory: true,
              haschildren: fs.readdirSync(path.resolve(args)).length > 0,
              children: json,
            },
          ],
        }),
      );

    } else {
      track(path.resolve(args));
      initialiseterminalmain(
        ptyProcess,
        path.dirname(path.resolve(args)),
        "def",
        win,
      );
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
  win.webContents.once("did-finish-load", async () => {
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
  } catch (e) {
    consolelog(e);
  }
});

ipcMain.handle("read", async (event, filepath) => {
  return await readFilejs(filepath);
});
ipcMain.handle("write", (event, path, contenttosave) => {
  const normalizedPath = toNormalizedWindospath(path);
  fs.writeFileSync(normalizedPath, contenttosave);
  changedpathsbyide.push(normalizedPath);
});
ipcMain.handle("save", async (e) => {
  const result = await dialog.showSaveDialog({
    title: "save file",
    defaultPath: "untitled.txt",
  });
  return result.filePath;
});
ipcMain.handle("append", async (e, fpath) => {
  
  if (fs.existsSync(fpath)) {
    win.webContents.send(
      "data",
      JSON.stringify({
        action: "errorhandle",
        errorlocation: "creating file",
        errormessage: "fileexists",
      }),
    );
  }
  await fs.promises.appendFile(toNormalisedWindowsId(fpath) , "");
});
ipcMain.handle("saveas", async (e) => {
  const result = await dialog.showSaveDialog({
    title: "save_As",
    defaultPath: "",
  });
  return result.filePath;
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
  } catch (e) {
    consolelog(e);
  }
});

ipcMain.handle("autosave", async (e, { code, path }) => {
  const normalizedPath = toNormalizedWindospath(decodeURIComponent(path));
  fs.writeFileSync(normalizedPath, code, "utf-8");
  changedpathsbyide.push(normalizedPath);
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
ipcMain.handle("unlink", async (e, Dirpath) => {

  await fs.promises.unlink(toNormalisedWindowsId(Dirpath))
});
ipcMain.handle("validate-details-liveserver", async (e, d) => {
  return validate_details_liveserver(e, d, pathreal, consolelog);
});
ipcMain.handle("commit", async (e, message) => {
  const commitPromise = await handleCommit(message);
  return commitPromise;
});
ipcMain.handle("create_new_terminal", async (e, id) => {
  //console.log("r r /t n");
  initialiseterminalmain(ptyProcess, pathreal, id, win);
});
ipcMain.handle("join-path", async (e, arg1, arg2) => {
  console.log(arg1, arg2)
  return toNormalisedWindowsId(path.join(arg1, arg2));
});
ipcMain.handle("get-ext", async (e, fpath) => {
  return path.extname(fpath);
});

ipcMain.handle("push", async () => {
  try {
    const message = await handlePush();
    new Notification({
      title: "git responded",
      body: ` git responded with ${message}`,
    }).show();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

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
    const message = error instanceof Error ? error.message : String(error);

    new Notification({
      title: "Pull failed",
      body: message,
    }).show();
  }
});

ipcMain.handle("get-base-name", async (e, fpath) => {
  return path.basename(fpath);
});
ipcMain.handle("get-diff-texts", async (e, element) => {
  return await GetDifftextMain(element);
});
ipcMain.handle("get-search-results", async (e, input) => {
  try {
    return await getSearchResults(input);
  } catch (e) {
    //console.log(e)
  }
});
ipcMain.handle("lint", async (e, { code, filePath }) => {

  try {
    let esd = await lint(code, filePath);
    let syd = await getSyntacticDiagnosticsfromts(toNormalisedWindowsId(filePath))
    syd.forEach((ydx) => {
      esd[0].messages.push(ydx)

    })
    console.log(esd)
    return esd;
  }
  catch (e) {
    console.log(e)
  }
})
ipcMain.handle("hover", async (e, { filepath, Offset }) => {
  return await GetHover(filepath, Offset)
})

ipcMain.handle("request-settings", async (e) => {
  handleConfigurations()
})
ipcMain.handle("changesettings", async (e, property, value) => {
  let set = JSON.parse(fs.readFileSync(toNormalisedWindowsId(path.join(pathsforappdatas.config, "appsettings", "noferic-config.json")), "utf8"))
  set[property] = value;
    fs.writeFileSync(toNormalisedWindowsId(path.join(pathsforappdatas.config, "appsettings", "noferic-config.json")),
      JSON.stringify(
       set
      )
    )

})