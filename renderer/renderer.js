//jai sri ram
///////////
//jai sri ram
import { initiateterminal } from "./terminal/initialiseterminal.js";
import { resizeexplorer } from "./resize/resizeexplorer.js";
import { syncEditorBottom } from "./syncEditorbottom.js";
import { resizeterminal } from "./resize/resizeterminal.js";
import { setInVersionControl } from "./handlingversioncontrol/showinversion.js";
import {
  isValidJSON,

  getfileiconbytype,
  DeleteOldWorkspace,
  findFolderById,
} from "./utils.js";

import { createfolderdialogbox } from "./foldercontextmenu.js";
import { Styleicon } from "./styleicon.js";
import { handleShortCuts } from "./shortcuthandlers.js";
import { createfiledialogbox } from "./filecontextmenu.js";
import { StyleL } from "./stylel.js";
import { openFileFromExplorer } from "./handlefileopening.js";
let ischangesopen = false;
const save = document.getElementById("save");
const openfile = document.getElementById("open_file");
const file = document.getElementById(`file`);
const exit = document.getElementById("exit");
const iframe = document.querySelector("iframe#editor");
const saveas = document.getElementById("save_as");

let globalignoredfilesarray = [""];
let globalgitstatusjson;
let isopen = false;
let path;

let globalfolderjson;
let globalfileexplorerstatejson = {};
let globalleftmenustate = {
  isversioncontolopen: false,
  isexploreropen: true,
  isterminalopen: false,
  isleftpanelopen: true,
};
export async function showdialog(path) {
  if (document.readyState == "complete") {
    document.getElementById("createnewfiledialog").showModal();
  }
  document.getElementById("createfileindialoog").addEventListener(
    "click",
    async () => {
      const filejoin = document
        .getElementById("inputforopenfile")
        .value.replace("\n", "");

      if (!filejoin) {
        alert("filenames cannot be empty");
        return;
      }

      window.ipc.invoke(
        "append",
        `${await window.ipc.invoke("join-path", path, filejoin)}`,
      );
      if (globalfileexplorerstatejson[`${path}`] === false) {
        document.getElementById(path).click();
      }
      document.getElementById("inputforopenfile").value = "";
    },
    { once: true },
  );
}

export function showFolderDialog(path) {
  if (document.readyState == "complete") {
    document.getElementById("createnewfolderdialog").showModal();
  }
  document.getElementById("createfolderindialoog").addEventListener(
    "click",
    async () => {
      const filejoin = document
        .getElementById("inputforopenfolder")
        .value.replace("\n", "");

      if (!filejoin) {
        alert("Dirnames cannot be empty");
        return;
      }

      window.ipc.invoke(
        "mkdir",
        `${await window.ipc.invoke("join-path", path, filejoin)}`,
      );
      if (globalfileexplorerstatejson[`${path}`] === false) {
        document.getElementById(path).click();
      }
      document.getElementById("inputforopenfolder").value = "";
      document.getElementById("createnewfolderdialog").close();
    },
    { once: true },
  );
}
export function deleteFolder(path) {
  const isUserok = confirm(
    `Do you want to Move Directory ${path}  to trash \n\n The Directory can be recovered from trash`,
  );
  if (isUserok) {
    window.ipc.invoke("unlink", `${path}`);
  }
}
export function deleteFile(path) {
  const isUserok = confirm(
    `Do you want to Move file ${path}  to trash \n\n The File can be recovered from trash`,
  );
  if (isUserok) {
    window.ipc.invoke("unlink", `${path}`);
  }
}
export async function GetFilebaseName(pathr) {
  return await window.ipc.invoke("get-base-name", pathr);
}
export async function showDiff(element) {
  const diffText = await window.ipc.invoke("get-diff-texts", element);
}

window.onload = function () {

  window.ipc.invoke("request-settings")

  const editorEl = document.getElementById("editor");
  const terminalEl = document.getElementById("terminalelement");
  syncEditorBottom(editorEl, terminalEl);
  document.getElementById("settings").addEventListener("click", () => {
    document.getElementById("SettingsDialog").showModal();
  });
  document.getElementById("closeSettings").addEventListener("click", () => {
    document.getElementById("SettingsDialog").close();
  });
 

  let countforterminal = 1;
  document.getElementById("addtermbtn").addEventListener("click", (e) => {
    window.ipc.invoke("create_new_terminal", countforterminal);
    initiateterminal(
      document.getElementById("terminal"),
      countforterminal,
      document,
    );
    countforterminal++;
  });
  handleShortCuts(document);
  document.getElementById("versioncontrolelement").style.display = "none";
  function alert_s_1(string) {
    document.getElementById("alertdialog").showModal();
    document.getElementById("contentdiv").innerText = string;
  }

  document
    .getElementById("gitvercontmenu")
    .addEventListener("click", async () => {
      if (!globalleftmenustate.isversioncontolopen) {
        document.getElementById("versioncontrolelement").style.display = "flex";
        document.getElementById("explorerelement").style.display = "none";
        globalleftmenustate.isexploreropen = false;
        globalleftmenustate.isversioncontolopen = true;
        document.getElementById("explotop").innerText = "version contol";
      }
    });
  document.getElementById("expl").addEventListener("click", async () => {
    if (!globalleftmenustate.isexploreropen) {
      document.getElementById("explorerelement").style.display = "flex";
      document.getElementById("versioncontrolelement").style.display = "none";
      globalleftmenustate.isexploreropen = true;
      globalleftmenustate.isversioncontolopen = false;
      document.getElementById("explotop").innerText = "explorer";
    }
  });
  let workspacepath = null;
  const dialogforcreatefile = document.getElementById("createnewfiledialog");

  document.getElementById("file_on").style.display = "none";
  document.getElementById("viewon").style.display = "none";

  exit.onclick = () => {
    window.close();
  };

  terminalEl.style.display = "none";
  async function openfileoncilick(path, iframe) {
    //const extension = path.split(`/`).pop().split(`.`).pop()
    // ;
    const ext = await window.ipc.invoke("get-ext", path);
    const extension = ext.replace(".", "");

    if (!path) {
      return;
    } else {
      const filecontent = await window.ipc.invoke("read", path);
      iframe.contentWindow.postMessage(
        {
          action: "set",
          content: filecontent,
          isdir: false,
          path: path,
          extension: extension,
        },
        "*",
      );
      document.getElementById("file_on").style.display = "none";
    }
  }
  syncEditorBottom(editorEl, terminalEl, iframe);
  file.addEventListener("click", () => {
    if (isopen === false) {
      document.getElementById("file_on").style.display = "block";
      isopen = true;
    } else {
      document.getElementById("file_on").style.display = "none";
      isopen = false;
    }
  });

  const sendreqfromif = {
    SendRequesttomain: async (e) => {
      const action = e.action;
      const args = e.args;
      console.log(action)
      console.log(JSON.stringify(args))
      const permittedactions = ["autosave", "lint", "hover" , "get-auto-complete"];
      try {
        if (permittedactions.includes(action)) {
          const res = await window.ipc.invoke(action, args);
          return res;
        }
      } catch (e) {
        alert(e);
      }
    },
  };
  const iframer = document.querySelector("iframe#editor");

  setTimeout(() => {
    iframer.contentWindow.renderer = sendreqfromif;
  }, 10000);
  openfile.addEventListener(
    "click",
    async () => {
      path = await window.ipc.invoke("openfile");
      if (!path) {
        return;
      }
      DeleteOldWorkspace(
        document.getElementById("explorerelement"),
        document.getElementById("topbarforeditor"),
        iframe,
      );
      openfileoncilick(path, iframe);
    },
    { once: true },
  );
  save.addEventListener("click", async () => {
    iframe.contentWindow.postMessage(
      {
        action: "get",
      },
      "*",
    );
    window.addEventListener(
      "message",
      (e) => {
        const message = e.data;
        const isgettingfolderfile = message.isfolder;
        if (!isgettingfolderfile) {
          if (!path) {
            (async () => {
              path = await window.ipc.invoke("save");
              await window.ipc.invoke("append", path);
              await window.ipc.invoke("write", path, message.content);
            })();
          } else {
            (async () => {
              await window.ipc.invoke("write", path, message.content);
            })();
          }
        } else {
          (async () => {
            await window.ipc.invoke("write", message.path, message.content);
          })();
        }
        document.getElementById("file_on").style.display = "none";
      },
      { once: true },
    );
  });
  saveas.addEventListener("click", async () => {
    iframe.contentWindow.postMessage(
      {
        action: "get",
      },
      "*",
    );
    window.addEventListener(
      "message",
      async (e) => {
        const contenttosave = e.data.content;

        const pathtosaveas = await window.ipc.invoke("saveas");
        await window.ipc.invoke("append", pathtosaveas);
        await window.ipc.invoke("write", pathtosaveas, contenttosave);
        document.getElementById("file_on").style.display = "none";
      },
      { once: true },
    );
  });
  initiateterminal(document.getElementById("terminal"), "def", document);
  resizeterminal(
    document.getElementById("terminalelement"),
    document.getElementById("editor"),
  );
  resizeexplorer(document.getElementById("explorer"));
  const observerforterminal = new ResizeObserver(() => {
    syncEditorBottom(editorEl, terminalEl, iframe);
  });
  observerforterminal.observe(terminalEl);
  const observerforpreview = new ResizeObserver(() => {
    const editor = document.getElementById("middleeditor");
    const explorer = document.getElementById("explorer");
    const preview = document.getElementById("preview");
    editor.style.right = preview.offsetWidth + "px";
    editor.style.left = explorer.offsetWidth + "px";
    editor.style.width = `${document.getElementById("workspace").offsetWidth - (preview.offsetWidth + explorer.offsetWidth)}px`;
  });
  const observerforexplorer = new ResizeObserver(() => {
    const editor = document.getElementById("middleeditor");
    const explorer = document.getElementById("explorer");
    const preview = document.getElementById("preview");
    editor.style.right = preview.offsetWidth + "px";
    editor.style.left = explorer.offsetWidth + "px";
    editor.style.width = `${document.getElementById("workspace").offsetWidth - (preview.offsetWidth + explorer.offsetWidth)}px`;
    syncEditorBottom(editorEl, terminalEl, iframe);
  });
  observerforexplorer.observe(document.getElementById("explorer"));

  observerforpreview.observe(document.getElementById("preview"));

  const fileexplorerarea = document.getElementById("explorerelement");
  let previousselection;

  async function recursiveloop(filearray, space) {
    let depth = 10;

    depth = depth + 2;
    for (const file of filearray) {
      if (file.isdirectory) {
        //jai sri ram

        const filebutton = document.createElement("button");
        filebutton.id = `${decodeURIComponent(file.id)}`;

        filebutton.textContent = `${file.name}`;
        filebutton.classList.add("files");
        filebutton.classList.add("folder");
        filebutton.style.paddingLeft = depth + "px";
        filebutton.title = `${decodeURIComponent(file.id)}`;

        if (globalignoredfilesarray.includes(decodeURIComponent(file.id))) {
          filebutton.style.color = "#999290";
          filebutton.title += "Untracked";
        }

        const statebtn = document.createElement("div");
        statebtn.id = `statebuttonfor${decodeURIComponent(file.id)}`;
        statebtn.style.position = "absolute";
        statebtn.style.top = "0.5px";
        statebtn.style.right = "0.5px";
        statebtn.style.bottom = "0.5px";
        statebtn.style.height = "16px";
        statebtn.style.width = `16px`;
        statebtn.style.backgroundImage = "url(images/keyarrowdown.svg)";
        statebtn.style.backgroundRepeat = "no-repeat";
        statebtn.style.backgroundSize = "cover";
        const icon = document.createElement("div");
        const handle = document.createElement("div");
        StyleL(handle, file, depth, "folder");
        Styleicon(icon, file, depth, "folder");

        filebutton.appendChild(icon);
        filebutton.appendChild(handle);

        globalfileexplorerstatejson[`${decodeURIComponent(file.id)}`] = false;
        filebutton.appendChild(statebtn);
        let isopen = false;
        filebutton.addEventListener("click", (e) => {
          filebutton.style.backgroundColor = "rgba(30,41,59,0.50)"
          if(previousselection){
          document.getElementById(previousselection).style.backgroundColor =  "#333333"}
          previousselection = file.id;
          if (!isopen) {
            if (filebutton.classList.contains("folder")) {
              recursiveloop(
                findFolderById(globalfolderjson, decodeURIComponent(file.id))
                  .children,

                document.getElementById(`${decodeURIComponent(file.id)}`),
              );
              e.stopPropagation();
              e.stopImmediatePropagation();
              isopen = true;
              globalfileexplorerstatejson[`${decodeURIComponent(file.id)}`] =
                true;
            } else {
              return;
            }
          } else {
            filebutton.replaceChildren(`${file.name}`, statebtn, icon, handle);
            isopen = false;
            globalfileexplorerstatejson[`${decodeURIComponent(file.id)}`] =
              false;

            e.stopPropagation();
          }
        });
        space.appendChild(filebutton);
        createfolderdialogbox(
          document.body,
          decodeURIComponent(file.id),
          filebutton,
          dialogforcreatefile,
        );
      } else {
        const filebutton = document.createElement("button");
        filebutton.id = `${decodeURIComponent(file.id)}`;
        const extension = file.name.split(".").pop();

        filebutton.textContent = `${file.name}`;
        filebutton.classList.add("files");
        filebutton.style.paddingLeft = depth + "px";
        if (globalignoredfilesarray.includes(decodeURIComponent(file.id))) {
          filebutton.style.color = "#999290";
          filebutton.title += "Untracked ";
        }
        filebutton.title = `${decodeURIComponent(file.id)}`;

        space.appendChild(filebutton);
        createfiledialogbox(
          document.body,
          decodeURIComponent(file.id),
          filebutton,
        );
        filebutton.addEventListener("click", async (e) => {
          e.stopPropagation();
          e.stopImmediatePropagation();
          filebutton.style.backgroundColor = "rgba(30,41,59,0.50)"
          if(previousselection){
          document.getElementById(previousselection).style.backgroundColor =  "#333333"}
          previousselection = file.id;
          await openFileFromExplorer({ iframe, file });
        });

        const icon = document.createElement("div");

        Styleicon(icon, file, depth, extension);
        filebutton.appendChild(icon);
        const handle = document.createElement("div");
        StyleL(handle, file, depth, "folder");
        filebutton.appendChild(handle);
      }
    }
  }
  async function openfolderfunction(folderjsoninput) {
    recursiveloop(folderjsoninput, fileexplorerarea);
  }
  document.getElementById("open_folder").addEventListener("click", async () => {
    document.getElementById("file_on").style.display = "none";
    const folderjson = await window.ipc.invoke("openfolder");
    openfolderfunction(JSON.parse(JSON.stringify(folderjson)));
  });
  let isviewopen = false;
  document.getElementById("view").addEventListener("click", (e) => {
    e.stopPropagation();

    if (!isviewopen) {
      isviewopen = true;
      document.getElementById("viewon").style.display = "block";
    } else {
      document.getElementById("viewon").style.display = "none";
      isviewopen = false;
    }
  });

  document.getElementById("viewon").addEventListener("blur", (e) => {
    e.stopPropagation();
    e.preventDefault();

    document.getElementById("viewon").style.display = "none";
    isviewopen = false;
    alert(blur);
  });
  document.getElementById("file_on").addEventListener("blur", (e) => {
    e.stopPropagation();
    e.preventDefault();
    alert("blur");
    document.getElementById("file_on").style.display = "none";
    isopen = false;
  });

  const checkboxforterminal = document.getElementById("terminalcheck");
  const checkboxforexplorer = document.getElementById("explorercheck");
  checkboxforterminal.addEventListener("change", (e) => {
    if (checkboxforterminal.checked) {
      document.getElementById("terminalelement").style.display = "block";
      if (terminalEl.offsetHeight < 70) {
        terminalEl.style.height = 150 + "px";
      }
      globalleftmenustate.isterminalopen = true;
      syncEditorBottom(editorEl, terminalEl, iframe);
    } else {
      document.getElementById("terminalelement").style.display = "none";
      globalleftmenustate.isterminalopen = false;

      syncEditorBottom(editorEl, terminalEl, iframe);
    }
  });
  document.getElementById("term").addEventListener("click", (e) => {
    if (globalleftmenustate.isterminalopen) {
      document.getElementById("terminalelement").style.display = "none";
      globalleftmenustate.isterminalopen = false;
      syncEditorBottom(editorEl, terminalEl, iframe);
      checkboxforterminal.checked = false;
    } else {
      document.getElementById("terminalelement").style.display = "block";
      globalleftmenustate.isterminalopen = true;
      syncEditorBottom(editorEl, terminalEl, iframe);
      checkboxforterminal.checked = true;
    }
  });
  checkboxforexplorer.addEventListener("change", (e) => {
    if (checkboxforexplorer.checked) {
      document.getElementById("explorer").style.display = "block";
      globalleftmenustate.isleftpanelopen = true;
      syncEditorBottom(editorEl, terminalEl, iframe);
    } else {
      document.getElementById("explorer").style.display = "none";
      globalleftmenustate.isleftpanelopen = false;
      syncEditorBottom(editorEl, terminalEl, iframe);
    }
  });

  document.getElementById("format").addEventListener("click", async () => {
    iframe.contentWindow.postMessage(
      {
        action: "formatget",
      },
      "*",
    );
    window.addEventListener(
      "message",
      async (e) => {
        let object = e.data;

        const formattedcode = await window.ipc.invoke("format", object);
        iframe.contentWindow.postMessage(
          {
            action: "formatset",
            formattedcode: formattedcode,
          },
          "*",
        );
      },
      { once: true },
    );
  });

  window.addEventListener("message", async (e) => {
    const message = e.data;
    if (message.action === "autosave") {
      await window.ipc.invoke("autosave", message.code, message.path);
    }
  });
  window.ipc.onDataframeIPC(async (data) => {
    const message = JSON.parse(data);

    if (JSON.parse(data).action == "handlingargsopenfolder") {
      new Notification(`Opened Folder ${message.fjson[0].id}`);

      globalfolderjson = message.fjson;
      openfolderfunction(globalfolderjson);
    }

    else if (JSON.parse(data).action == "handlefileargs") {
      setTimeout(() => {
        openfileoncilick(message.path, iframe);
      }, 2000);
    } else if (JSON.parse(data).action == "errorhandle") {
      alert(
        `an error occured while ${JSON.stringify(message.errorlocation)} \n\n error message:${JSON.stringify(message.errormessage)}`,
      );
    } else if (message.action === "branch") {
      document.getElementById("currentBranch").innerText =
        `${message.branchname}`;
    } else if (message.action === "addelements") {
      globalfolderjson = message.newjson;
      console.log(message)
      if (!message.add) {
      }
      if (
        !globalfileexplorerstatejson[(message.add.parentid)]
      ) {
        return;
      }
      if (!document.getElementById(message.add.parentid)) {
        alert("foldernotfound");
      }

      recursiveloop(
        message.add.actualjson,
        document.getElementById(message.add.parentid),
      );
    } else if (message.action == "removeelements") {
      globalfolderjson = message.newjson;
      document.getElementById(decodeURIComponent(message.remove))?.remove();
      if (
        document.getElementById(
          `topbarelementfor${decodeURIComponent(message.remove)}`,
        )
      ) {
        document
          .getElementById(
            `topbarelementfor${decodeURIComponent(message.remove)}`,
          )
          .remove();
        alert(`${message.remove} is deleted`);
        iframe.contentWindow.postMessage({
          action: "deletemodelonclose",
          path: decodeURIComponent(message.remove),
        });
      }
    } else if (message.action === "ignoredfiles") {
      message.ignoredfiles.forEach((ignoredfile) => {
        if (
          !globalignoredfilesarray.includes(decodeURIComponent(ignoredfile))
        ) {
          globalignoredfilesarray.push(decodeURIComponent(ignoredfile));
        }
        if (document.getElementById(decodeURIComponent(ignoredfile))) {
          document.getElementById(decodeURIComponent(ignoredfile)).style.color =
            "#999290";
        }
      });
    } else if (message.action === "status") {
      globalgitstatusjson = message.status;
      if (ischangesopen) {
        setInVersionControl(
          document,
          document.getElementById("explorervc"),
          globalgitstatusjson,
        );
      }
    } else if (message.action === "handleachangeinfile") {
      if (
        document.getElementById(
          `topbarelementfor${decodeURIComponent(message.path)}`,
        )
      ) {
        const ext = await window.ipc.invoke("get-ext", message.path);
        const extension = ext.replace(".", "");
        iframe.contentWindow.postMessage(
          {
            action: "set",
            content: message.content,
            isdir: false,
            path: decodeURIComponent(message.path),
            extension: extension,
            isspecialchange: true,
          },
          "*",
        );
      }
    }
    else if (message.action == "appSettings") {
      console.log(JSON.parse(message.settings))
       document.getElementById('Theme').value = JSON.parse(message.settings).theme; 
      if (JSON.parse(message.settings).theme !== "dark") {
        document.getElementById("theme-blanket-overlay").style.display = "block"
      }
      else {
        document.getElementById("theme-blanket-overlay").style.display = "none"

      }
    }
    if (message.action === "getOpenTabs") {
      const parent = document.getElementById("topbarforeditor");

      const ids = Array.from(parent.children).map((child) => child.id);
      window.ipc.send(
        "data",
        JSON.stringify({
          action: "tabsopen",
          openTabs: ids,
        }),
      );
      setTimeout(() => {
        window.close();
      }, 5000);
    }
  });

  document
    .getElementById("cancelcreatefiledialog")
    .addEventListener("click", () => {
      dialogforcreatefile.close();
    });
  document
    .getElementById("cancelcreatefolderdialog")
    .addEventListener("click", () => {
      document.getElementById("createnewfolderdialog").close();
    });
  document
    .getElementById("cancelcreateliveserverdialog")
    .addEventListener("click", () => {
      document.getElementById("createliveserverdialog").close();
    });
  document.getElementById("cancelcommit").addEventListener("click", () => {
    document.getElementById("commitdialog").close();
  });
  window.addEventListener("message", (e) => {
    const message = e.data;
    if (message.action === "lint") {
      async function runLint() {
        const result = await window.ipc.invoke("lint", {
          code: message.code,
          extension: message.extension,
          language: message.language,
        });
        iframe.contentWindow.postMessage({
          action: "setMarkers",
          diagnostics: result,
        });
      }
      runLint();
    }
    if (message.action === "getAutoComplete") {
      async function run() {
        // Explicitly extract parameters from the 'data' child object
        const compl = await runts(
          decodeURIComponent(message.data.path),
          message.data.content,
          message.data.line,
          message.data.character,
        );

        iframe.contentWindow.postMessage({
          action: "tsac",
          data: compl,
        });
      }
      run();
    }
    if (message.action === "getGoTodefintion") {
      async function runDef() {
        const res = await window.ipc.invoke("GotoDef", message.position);
        iframe.contentWindow.postMessage({
          action: "tsgtd",
          data: res,
        });
      }
      runDef();
    }
    if (message.action === "getHover") {
      async function run() {
        const res = await window.ipc.invoke(
          "Hover",
          decodeURIComponent(message.path),
          message.position,
        );
        iframe.contentWindow.postMessage({
          action: "tshover",
          data: res,
        });
      }
      run();
    }
  });
  document.getElementById("liveserverbtn").addEventListener("click", (e) => {
    document.getElementById("createliveserverdialog").showModal();
  });
  document
    .getElementById("createliveserverbtn")
    .addEventListener("click", async (e) => {
      const relativepath = document.getElementById(
        "inputpathforliveserver",
      ).value;
      try {
        const dec = await window.ipc.invoke("validate-details-liveserver", {
          port: document.getElementById("inputforliveserver").value,
          relativepath: relativepath ? relativepath : "./",
          toOpen: document.getElementById("Browsercheck").checked,
        });
      } catch (e) {
        alert(e);
        return;
      }
      //@
      window.ipc.invoke("start_server", {
        port: document.getElementById("inputforliveserver").value,
        relativepath: relativepath ? relativepath : "./",
        toOpen: document.getElementById("Browsercheck").checked,
      });
      document.getElementById("link").innerText =
        `http://127.0.0.1:${document.getElementById("inputforliveserver").value}`;

      document.getElementById("inputforliveserver").value = "";

      document.getElementById("createliveserverdialog").close();
    });
  document.getElementById("link").addEventListener("click", (e) => {
    e.preventDefault();

    navigator.clipboard.writeText(document.getElementById("link").innerText);
    new Notification(`copied ${document.getElementById("link").innerText} to Clipboard
		`);
  });

  document.getElementById("commitbtn").addEventListener("click", (e) => {
    document.getElementById("commitdialog").showModal();
  });
  document.getElementById("commitreal").addEventListener("click", (e) => {
    if (!document.getElementById("inputforcommit").value) {
      alert("commit messages cannot be empty");
      return;
    }
    const isuserokforcommit = confirm(
      `Do you want to commit with commit Message ${document.getElementById("inputforcommit").value}`,
    );
    if (isuserokforcommit) {
      async function runn() {
        try {
          await window.ipc.invoke(
            "commit",
            document.getElementById("inputforcommit").value,
          );
          new Notification(`Comitted!`);
        } catch (e) {
          alert(e);
          return;
        }
      }
      runn();
    }
  });
  document
    .getElementById("inputforopenfolder")
    .addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        document.getElementById("createfolderindialoog").click();
      }
    });
  document
    .getElementById("inputforopenfile")
    .addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        document.getElementById("createfileindialoog").click();
      }
    });
  document.getElementById("inputforcommit").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      document.getElementById("commitreal").click();
    }
  });
  document
    .getElementById("inputforliveserver")
    .addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        document.getElementById("createliveserverbtn").click();
      }
    });
  document
    .getElementById("inputpathforliveserver")
    .addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        document.getElementById("createliveserverbtn").click();
      }
    });
  document.getElementById("push").addEventListener("click", async (e) => {
    const confirmation = confirm(
      `do you want  to push this repo to a remote brach`,
    );
    if (!confirmation) return;
    await window.ipc.invoke("push");
  });
  document.getElementById("pull").addEventListener("click", async (e) => {
    const confirmation = confirm(
      `do you want  to pull this repo from a remote brach`,
    );
    if (!confirmation) return;
    await window.ipc.invoke("pull");
  });
  document.getElementById("changes").addEventListener("click", (e) => {
    e.stopPropagation();
    if (!ischangesopen) {
      setInVersionControl(
        document,
        document.getElementById("explorervc"),
        globalgitstatusjson,
      );
      ischangesopen = true;
    } else {
      document.getElementById("changes").replaceChildren("changes >");
      ischangesopen = false;
    }
  });
  document
    .getElementById("explorersearch")
    .addEventListener("input", async (e) => {
      document.getElementById("searchresults").replaceChildren();
      const results = await window.ipc.invoke(
        "get-search-results",
        document.getElementById("explorersearch").value,
      );
      results.forEach((result) => {
        const filebutton = document.createElement("button");
        filebutton.id = `searchElementResultae${result.obj.FilePathInJSON}`;

        filebutton.textContent = `${result.obj.filename}`;
        filebutton.classList.add("files");
        filebutton.classList.add("folder");
        filebutton.style.right = `${1}px`;
        filebutton.style.left = `${1}px`;

        filebutton.title = `${result.obj.FilePathInJSON}`;
        filebutton.addEventListener("click", (e) => {
          e.stopPropagation();
          const faapath = result.obj.FilePathInJSON;
          const file = {
            id: faapath,
            name: result.obj.filename,
            isdirectory: false,
          };
          openFileFromExplorer({ iframe, file });
        });
        document.getElementById("searchresults").appendChild(filebutton);
      });
    });
  document.getElementById("explorersearch").addEventListener("blur", (e) => {
    setTimeout(() => {
      document.getElementById("searchresults").replaceChildren();
    }, 1000);
  });
const dropdownForTheme = document.getElementById('Theme');

dropdownForTheme.addEventListener('change', (event) => {
  const selectedValue = event.target.value;
  window.ipc.invoke("changesettings" , "theme" , selectedValue)
});

};
