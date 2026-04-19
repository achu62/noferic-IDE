//jai sri ram
const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { Worker } = require('worker_threads');
const pty = require('@lydell/node-pty');
const { spawn } = require('child_process')

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
      webSecurity:true,
      devTools: true
    }
  });
  win.loadFile('index.html');
  win.removeMenu();
}

app.whenReady().then(() => {
  createWindow();
  let shell = null;
  if(process.platform==='win32')
  {
    shell = process.env.COMSPEC ||  "cmd.exe"
  }
  else
  {
    shell = process.env.SHELL || "bash"
  }
  const ptyProcess = pty.spawn(shell, [], {
    cwd: "/home/charan/noferic/src",
    env: process.env
  });
  ptyProcess.onData((data) => {
    win.webContents.send("data", data.toString())
  });
  ipcMain.on("data", (event, data) => {
    ptyProcess.write(data);
  })
})


ipcMain.handle('openfile', async () => {
  const result = await dialog.showOpenDialog({ properties: ['openFile'] });
  if (result.canceled || !result.filePaths || result.filePaths.length === 0) return null;
  return result.filePaths[0];
});

ipcMain.handle('read', async (event, filepath) => {
  if (!filepath) return null;
  try {
    const content = await fs.promises.readFile(filepath, 'utf8');
    return content;
  } catch (err) {
    console.error('Failed to read file', err);
    throw err;
  }
});
ipcMain.handle('write', (event, path, contenttosave) => {
  fs.writeFileSync(path, contenttosave);
}
);
ipcMain.handle('save', async (e) => {
  const result = await dialog.showSaveDialog({
    title: 'save file',
    defaultPath: 'untitled.txt'
  });
  return result.filePath;
});
ipcMain.handle(
  'append', async (e, path) => {
    await fs.promises.appendFile(path, '');
  });
ipcMain.handle('saveas', async (e) => {
  const result = await dialog.showSaveDialog({
    title: 'save_As',
    defaultPath: ''
  });
  return result.filePath;
});
ipcMain.handle('openfolder', async (e) => {
  const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });
  if (result.canceled || !result.filePaths || result.filePaths.length === 0) return null;

  const folderpath = result.filePaths[0];

  function scanafolder(folderpath) {
    let json = [];
    const files = fs.readdirSync(folderpath, { withFileTypes: true });
    for (const file of files) {
      const fullpath = `${folderpath}/${file.name}`;
      if (file.isDirectory()) { // FIX: isDirectory is a method, not a property — must call it with ()
        const children = scanafolder(fullpath);
        json.push({
          path: fullpath,
          name: file.name,
          isdirectory: true,
          haschildren: children.length > 0, // FIX: file.children doesn't exist — use children.length
          children: children
        });
      } else {
        json.push({
          path: fullpath,
          name: file.name,
          isdirectory: false
        });
      }
    }
    console.log(json.path)
    return json; // FIX: was missing — scanafolder never returned anything, so folderjson was always undefined
  }

  const folderjson = scanafolder(folderpath);
  return folderjson;

});
