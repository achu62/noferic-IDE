//jai sri ram
const { app, BrowserWindow, dialog, ipcMain } = require('electron');
let pathreal = null;
//jai sri ram
const path = require('path');
const fs = require('fs');
const { Worker } = require('worker_threads');
const pty = require('node-pty');
const { spawn, execFile } = require('child_process');
const os = require("os");
const { buffer, json } = require('stream/consumers');
  const rpc = require(`vscode-jsonrpc`)
  const {InitializeRequest} = require("vscode-languageserver-protocol");  
const chokidar = require('chokidar');

let watcher = null;

function track(pathreal) {
  
  if (!pathreal) return;
  if (watcher) {
    watcher.close();
    watcher = null;
  }

 try{
  // stop previous watcher if exists
  if (watcher) watcher.close();

  watcher = chokidar.watch(pathreal, {
    ignoreInitial: true,
  });

  watcher.on('add', (filePath) => {
    console.log(`File added: ${filePath}`);
  });

  watcher.on('change', (filePath) => {
    console.log(`File changed: ${filePath}`);
  });

  watcher.on('unlink', (filePath) => {
    console.log(`File removed: ${filePath}`);
  });}
  catch(e)
  {
    console.log(e)
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
    }
  });
  win.loadFile('index.html');
  win.removeMenu();
}

app.whenReady().then(() => {
  createWindow();
  spawn('./binarypreinstall/dist/preinstall/preinstall')
  let shell = null;
  if (process.platform === 'win32') {
    shell = process.env.COMSPEC || "cmd.exe"
  }
  else {
    shell = process.env.SHELL || "bash"
  }
  const ptyProcess = pty.spawn(shell, [], {
    cwd: `${os.homedir()}`,
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
  pathreal = result.filePaths[0];
  track(pathreal)
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
 const absolutepath = path.resolve(`./`)

 const biomeprocess = spawn(
  './node_modules/@biomejs/biome/bin/biome',
    [`lsp-proxy`]
  )
 const connection = rpc.createMessageConnection(
  new
  rpc.StreamMessageReader(biomeprocess.stdout),
  new
  rpc.StreamMessageWriter(biomeprocess.stdin)
 )
 connection.listen()
 async function start(){
  try{
 const result = await
 connection.sendRequest(
  "initialize",
  {
    processId:process.pid,
    rootUri:null,
    capabilities:{}
  }
 )
 console.log(`result:\n\n${JSON.stringify(result)}`)
connection.sendNotification("initialized", {});
}
 
 catch(e)
 {
  console.log(`error:\n\n\n\n${e}`)
 }
 }
start()

ipcMain.handle('format', async (event  , object) => {
  const extension = object.extension;
  const language = object.language;
  const myCode = object.code;

  try{
    const myUri = `file:///test.${extension}`;

await connection.sendNotification("textDocument/didOpen", {
    textDocument: {
        uri: myUri,
        languageId: language,
        version: 1,
        text: myCode
    }
})
const edits = await connection.sendRequest("textDocument/formatting", {
            textDocument: { uri:myUri },
            options: { 
                tabSize: 2, 
                insertSpaces: true 
            }});
            const formattedcode = edits[0].newText;

            return formattedcode;            
  }

  catch(e)
  {
    console.log(e)
  }

})

ipcMain.handle('openfolder', async (e) => {
  const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });
  if (result.canceled || !result.filePaths || result.filePaths.length === 0) return null;

  const folderpath = result.filePaths[0];
    pathreal = folderpath;
     track(folderpath)

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
    return json; // FIX: was missing — scanafolder never returned anything, so folderjson was always undefined
  }

  const folderjson = scanafolder(folderpath);
  return folderjson;
});

ipcMain.handle("autosave" , async(e , code , path)=>
{
  fs.writeFileSync(path , code , 'utf-8')
})