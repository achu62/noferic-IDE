//jai sri ram
///////////
//jai sri ram

console.log(["udn", "cnf", "adding thins"]);

let countforterminal = 1;
import { createAiAgent } from "./ai-frontend/main.js"
import { giveOptionMenu } from "./option_d.js"
import { newTerminalinsseperateWindow } from "./terminal/open-in-win.js"
import { symtree } from "./maintain-symbol.js";
import { initiateterminal } from "./terminal/initialiseterminal.js";
import { resizeexplorer } from "./resize/resizeexplorer.js";
import { syncEditorBottom } from "./syncEditorbottom.js";
import { resizeterminal } from "./resize/resizeterminal.js";
import { getstaged, setInVersionControl } from "./handlingversioncontrol/showinversion.js";
import {
  isValidJSON,
  getfileiconbytype,
  DeleteOldWorkspace,

  findFolderById,
} from "./utils.js";
import { createDialog } from "./Editor_Dialog_Components.js";
import { createfolderdialogbox } from "./foldercontextmenu.js";
import { Styleicon } from "./styleicon.js";
import { handleShortCuts } from "./shortcuthandlers.js";
import { createfiledialogbox } from "./filecontextmenu.js";
import { StyleL } from "./stylel.js";
import { openFileFromExplorer } from "./handlefileopening.js";
import { IDEComponentApi } from "./editor UI components.js";
import { createWindowinNoferic } from "./window_creator.js";
let ischangesopen = false;
const save = document.getElementById("save");
const openfile = document.getElementById("open_file");
const file = document.getElementById(`file`);
const exit = document.getElementById("exit");
const iframe = document.querySelector("iframe#editor");
const saveas = document.getElementById("save_as");
export function cursortomonaco(line, column) {
  iframe.contentWindow.postMessage({
    action: "set-to-pos",
    line: line,
    column: column,
  });
}
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
  isnfdpopen: false,
  isstopen: false,
  iswmopen: false
};
let previousselection;

function handlekeyoardmovementsinexplorer() {
  const explorer = document.getElementById("explorerelement");

  explorer.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;

    const items = Array.from(explorer.querySelectorAll(".files")).filter(
      (item) => item.getClientRects().length > 0 && !item.disabled,
    );

    if (items.length === 0) return;

    let selectedElement = null;
    if (previousselection?.path) {
      let selectedPath = previousselection.path;
      try {
        selectedPath = decodeURIComponent(selectedPath);
      } catch {
        // Keep the original path if it is not URI-encoded.
      }
      selectedElement = document.getElementById(selectedPath);
    }

    if (!items.includes(selectedElement)) {
      selectedElement = items.includes(document.activeElement)
        ? document.activeElement
        : null;
    }

    const currentIndex = items.indexOf(selectedElement);
    const nextIndex =
      currentIndex === -1
        ? e.key === "ArrowDown"
          ? 0
          : items.length - 1
        : Math.max(
          0,
          Math.min(
            currentIndex + (e.key === "ArrowDown" ? 1 : -1),
            items.length - 1,
          ),
        );

    e.preventDefault();

    const nextElement = items[nextIndex];

    if (selectedElement && selectedElement !== nextElement) {
      selectedElement.style.backgroundColor = "#2e333d";
    }

    nextElement.style.backgroundColor = "#373d46";
    nextElement.focus();

    previousselection = {
      path: nextElement.id,
      type: nextElement.classList.contains("folder") ? "Directory" : "file",
    };
  });
}

handlekeyoardmovementsinexplorer()
export function ctil(pathcwd) {
  window.ipc.invoke("create_new_terminal", countforterminal, pathcwd);
  initiateterminal(
    document.getElementById("terminal"),
    countforterminal,
    document,
  );
  if (!globalleftmenustate.isterminalopen) {
    document.getElementById("term").click();
    globalleftmenustate.isterminalopen = true;
  }
  countforterminal++;
}

export function getSelectionoffile() {
  return previousselection;
}

export async function showdialog(path) {
  createDialog({
    heading: `create File in ${path}`,
    items: [{ type: "input", label: "File name" }],
    affirmative: {
      name: "create File",
      callback: async (values) => {
        const filejoin = values[0];

        if (!filejoin) {
          IDEComponentApi.ShowNotification("filenames cannot be empty", {
            duration: 40000,
            type: "warning",
          });
          return;
        }

        window.ipc.invoke(
          "append",
          `${await window.ipc.invoke("join-path", path, filejoin)}`,
        );
        if (globalfileexplorerstatejson[`${path}`] === false) {
          document.getElementById(path).click();
        }
      },
    },
  });
}
export function rendererrename(path, fn) {
  createDialog({
    heading: `rename ${path}`,
    items: [
      {
        type: "input",
        label: "Rename to:",
      },
    ],
    affirmative: {
      name: "Rename",
      callback: async (values) => {
        window.ipc.invoke("rename", path, path.replace(fn, values[0]));
      },
    },
  });
}
export function showFolderDialog(path, fn) {
  createDialog({
    heading: `create Folder in ${path}`,
    items: [{ type: "input", label: "Directory" }],
    affirmative: {
      name: "create File",
      callback: async (values) => {
        const filejoin = values[0];

        if (!filejoin) {
          IDEComponentApi.ShowNotification("directory names cannot be empty", {
            duration: 40000,
            type: "warning",
          });

          return;
        }

        window.ipc.invoke(
          "mkdir",
          `${await window.ipc.invoke("join-path", path, filejoin)}`,
        );
        if (globalfileexplorerstatejson[`${path}`] === false) {
          document.getElementById(path).click();
        }
      },
    },
  });
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
  window.ipc.invoke("request-settings");



  const editorEl = document.getElementById("editor");
  const terminalEl = document.getElementById("terminalelement");
  syncEditorBottom(editorEl, terminalEl);
  document.getElementById("settings").addEventListener("click", () => {
    document.getElementById("SettingsDialog").showModal();
  });
  document.getElementById("closeSettings").addEventListener("click", () => {
    document.getElementById("SettingsDialog").close();
  });
  const results = document.querySelector("#searchresults").children;
  let selected = -1;

  document.getElementById("searchresults").addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();

      selected = Math.min(selected + 1, results.length - 1);
      console.log(results)

      results[selected]?.focus();
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();

      selected = Math.max(selected - 1, 0);
      console.log(results)
      results[selected]?.focus();
    }

  });

  document.getElementById("addtermbtn").addEventListener("click", (e) => {
    giveOptionMenu({
      "heading": "choose where", options: [
        {
          "text": "in the existing terminal",
          "type": "text",
          "close": true,
          callback: () => {
            window.ipc.invoke("create_new_terminal", countforterminal);
            initiateterminal(
              document.getElementById("terminal"),
              countforterminal,
              document,
            );
            countforterminal++;
          },

        },
        {
          "text": "in a new dialog",
          "close": true,
          "type": "text",
          callback: () => {
            window.ipc.invoke("create_new_terminal", countforterminal);
            newTerminalinsseperateWindow(document, countforterminal)
            countforterminal++;
          }
        }
      ]
    })

  });
  handleShortCuts(document);
  const helpMenuButton = document.getElementById("help-menu-button");
  const helpMenu = document.getElementById("help-menu");
  const learnShortcutsButton = document.getElementById("learn-shortcuts");
  const shortcutsDialog = document.getElementById("shortcuts-dialog");
  const shortcutsList = document.getElementById("shortcuts-list");
  const shortcuts = [
    ["Toggle terminal", "Ctrl + Shift + T"],
    ["Exit", "Ctrl + W"],
    ["Toggle explorer", "Ctrl + Shift + E"],
    ["Git features", "Ctrl + G"],
    ["Start live server", "Ctrl + Shift + L"],
    ["Focus file search", "Ctrl + Shift + P"],
    ["Open settings", "Ctrl + Shift + J"],
    ["Open folder", "Ctrl + Shift + O"],
    ["Open file", "Ctrl + O"],
    ["Create file in selected folder", "Ctrl + N"],
    ["Create folder in selected folder", "Ctrl + Shift + N"],
  ];

  for (const [command, shortcut] of shortcuts) {
    const row = document.createElement("tr");
    const commandCell = document.createElement("td");
    const shortcutCell = document.createElement("td");
    const key = document.createElement("kbd");
    commandCell.textContent = command;
    key.textContent = shortcut;
    shortcutCell.appendChild(key);
    row.append(commandCell, shortcutCell);
    shortcutsList.appendChild(row);
  }

  helpMenuButton.addEventListener("click", () => {
    const isExpanded = helpMenuButton.getAttribute("aria-expanded") === "true";
    helpMenu.hidden = isExpanded;
    helpMenuButton.setAttribute("aria-expanded", String(!isExpanded));
  });

  learnShortcutsButton.addEventListener("click", () => {
    helpMenu.hidden = true;
    helpMenuButton.setAttribute("aria-expanded", "false");
    shortcutsDialog.showModal();
  });

  document.getElementById("close-shortcuts").addEventListener("click", () => {
    shortcutsDialog.close();
  });

  shortcutsDialog.addEventListener("click", (event) => {
    if (event.target === shortcutsDialog) shortcutsDialog.close();
  });

  document.addEventListener("click", (event) => {
    if (!helpMenu.contains(event.target) && event.target !== helpMenuButton) {
      helpMenu.hidden = true;
      helpMenuButton.setAttribute("aria-expanded", "false");
    }
  });

  document.getElementById("versioncontrolelement").style.display = "none";
  document.getElementById("nf-debug").style.display = "none";
  document.getElementById("window-manager").style.display = "none"

  function resettheuiandstate() {
    document.getElementById("versioncontrolelement").style.display = "none";
    document.getElementById("explorerelement").style.display = "none";
    document.getElementById("nf-debug").style.display = "none";
    document.getElementById("nf-0-o-list").style.display = "none";
    document.getElementById("window-manager").style.display = "none"

    globalleftmenustate.isnfdpopen = false;
    globalleftmenustate.isexploreropen = false;
    globalleftmenustate.isversioncontolopen = false;
    globalleftmenustate.isstopen = false;
    globalleftmenustate.iswmopen = false;
  }

  document
    .getElementById("gitvercontmenu")
    .addEventListener("click", async () => {
      if (!globalleftmenustate.isversioncontolopen) {
        resettheuiandstate();
        document.getElementById("versioncontrolelement").style.display = "flex";
        globalleftmenustate.isversioncontolopen = true;
        document.getElementById("explotop").innerText = "version-control";
      }
    });
  document.getElementById("window-manager-menu").addEventListener("click", async () => {
    if (!globalleftmenustate.isnfdpopen) {
      resettheuiandstate();
      document.getElementById("window-manager").style.display = "flex";

      globalleftmenustate.iswmopen = true;

      document.getElementById("explotop").innerText = "window manager";
    }
  });
  document.getElementById("nf-d").addEventListener("click", async () => {
    if (!globalleftmenustate.isnfdpopen) {
      resettheuiandstate();
      document.getElementById("nf-debug").style.display = "flex";

      globalleftmenustate.isnfdpopen = true;

      document.getElementById("explotop").innerText = "noferic-debugging-tools";
    }
  });
  document.getElementById("expl").addEventListener("click", async () => {
    if (!globalleftmenustate.isexploreropen) {
      resettheuiandstate();
      document.getElementById("explorerelement").style.display = "flex";
      globalleftmenustate.isexploreropen = true;
      document.getElementById("explotop").innerText = "explorer";
    }
  });
  document.getElementById("nf-o").addEventListener("click", async () => {
    if (!globalleftmenustate.isstopen) {
      resettheuiandstate();
      document.getElementById("nf-0-o-list").style.display = "flex";
      globalleftmenustate.isstopen = true;
      document.getElementById("explotop").innerText = "outline";
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

      const permittedactions = [
        "autosave",
        "lint",
        "hover",
        "get-auto-complete",
      ];
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

  async function recursiveloop(filearray, space) {
    let depth = 10;

    depth = depth + 2;
    for (const file of filearray) {
      setTimeout(() => {

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
            filebutton.style.backgroundColor = "#373d46";
            if (
              previousselection &&
              document.getElementById(previousselection.path)
            ) {
              document.getElementById(
                previousselection.path,
              ).style.backgroundColor = "#2e333d";
            }
            previousselection = { path: file.id, type: "Directory" };
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
            file,
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
            file,
          );
          filebutton.addEventListener("click", async (e) => {
            e.stopPropagation();
            e.stopImmediatePropagation();
            filebutton.style.backgroundColor = "rgba(30,41,59,0.50)";
            if (
              previousselection &&
              document.getElementById(previousselection.path)
            ) {
              document.getElementById(
                previousselection.path,
              ).style.backgroundColor = "#2e333d";
            }
            previousselection = { path: file.id, type: "file" };
            await openFileFromExplorer({ iframe, file });
          });

          const icon = document.createElement("div");

          Styleicon(icon, file, depth, extension);
          filebutton.appendChild(icon);
          const handle = document.createElement("div");
          StyleL(handle, file, depth, "folder");
          filebutton.appendChild(handle);
        }

      }, 10)
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
  });
  document.getElementById("file_on").addEventListener("blur", (e) => {
    e.stopPropagation();
    e.preventDefault();
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
    if(message.action=="create-workspace"){
      console.log("pd")
    }
    if (JSON.parse(data).action == "lint") {
      console.log(message)
      iframe.contentWindow.postMessage(message)
    }
    if (JSON.parse(data).action == "handlingargsopenfolder") {
      IDEComponentApi.ShowNotification(`Opened Folder ${message.fjson[0].id}`, {
        duration: 9000,
        type: "success",
      });

      globalfolderjson = message.fjson;
      openfolderfunction(globalfolderjson);
    } else if (message.action === "data-debug") {
      const realdata = JSON.parse(message.data);
      console.log(realdata);
      if (
        realdata.message[0] === "noferic-reset-secret-code=0990930393494494449"
      ) {
        document.getElementById("nf-list").replaceChildren("");
        return;
      }

      const pe = document.createElement("button");
      pe.classList.add("bubbles-for");
      pe.innerText = JSON.parse(message.data).message;
      pe.style.backgroundColor =
        realdata.type == "error" || realdata.type == "exception"
          ? "#ee4435"
          : realdata.type == "warn"
            ? "#eec038"
            : "#33333";
      document.getElementById("nf-list").appendChild(pe);
    } else if (JSON.parse(data).action == "handlefileargs") {
      setTimeout(() => {
        openfileoncilick(message.path, iframe);
      }, 2000);
    } else if (JSON.parse(data).action == "errorhandle") {
      IDEComponentApi.ShowNotification(
        `an error occured while ${JSON.stringify(message.errorlocation)} \n\n error message:${JSON.stringify(message.errormessage)}`,
        {
          duration: 30000,
          type: "error",
        },
      );
    } else if (message.action === "branch") {
      document.getElementById("currentBranch").innerText =
        `${message.branchname}`;
    } else if (message.action === "addelements") {
      globalfolderjson = message.newjson;
      console.log(message);
      if (!message.add) {
      }
      if (!globalfileexplorerstatejson[message.add.parentid]) {
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
        IDEComponentApi.ShowNotification(`${message.remove} is deleted`, {
          duration: 40000,
          type: "warning",
        });
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
    } else if (message.action == "appSettings") {
      console.log(JSON.parse(message.settings));
      document.getElementById("Theme").value = JSON.parse(
        message.settings,
      ).theme;
      if (JSON.parse(message.settings).theme !== "dark") {
        document.getElementById("theme-blanket-overlay").style.display =
          "block";
      } else {
        document.getElementById("theme-blanket-overlay").style.display = "none";
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

  window.addEventListener("message", (e) => {
    const message = e.data;
    if (message.action == "parsed-code") {
      document.getElementById("nf-0-o-list").replaceChildren();
      symtree(document, e.data.code?.children);
    }
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
    createDialog({
      items: [
        {
          type: "input",
          label: "port",
          value: 5000,
        },

        {
          type: "input",
          label: "relpath",
        },
        {
          type: "check",
          label: "Open in default browser",
        },
      ],
      heading: "Start Live Server",
      affirmative: {
        name: "Start Live Server",
        callback: async (values) => {
          try {
            const dec = await window.ipc.invoke("validate-details-liveserver", {
              port: values[0],
              relativepath: values[1] || "./",
              toOpen: values[2],
            });
          } catch (e) {
            alert(e);
            return;
          }
          //@
          window.ipc.invoke("start_server", {
            port: values[0],
            relativepath: values[1] || "./",
            toOpen: values[2],
          });
        },
      },
    });
  });

  document.getElementById("commitbtn").addEventListener("click", (e) => {
    createDialog({
      heading: "commit on current branch",
      items: [
        {
          type: "input",
          label: "commit message",
        },
      ],
      affirmative: {
        name: "commit",
        callback: (values) => {
          if (!values[0]) {
            alert("commit messages cannot be empty");
            return;
          }
          const isuserokforcommit = confirm(
            `Do you want to commit with commit Message ${values[0]}`,
          );
          if (isuserokforcommit) {
            async function runn() {
              try {
                const s = getstaged()
                if (!s) {
                  IDEComponentApi.ShowNotification("no changes to commit,not commited", {
                    "duration": 1000,
                    type: "warn"
                  })
                }
                await window.ipc.invoke("commit", values[0], s);
                IDEComponentApi.ShowNotification("Comitted!", {
                  duration: 900,
                  type: "success",
                });
              } catch (e) {
                alert(e);
                return;
              }
            }
            runn();
          }
        },
      },
    });
  });

  document.getElementById("inputforcommit").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      document.getElementById("commitreal").click();
    }
  });
  document.getElementById("sync-changes").addEventListener("click", (e) => {
    window.ipc.invoke("sync-changes");
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
    }, 10000);
  });
  const dropdownForTheme = document.getElementById("Theme");

  dropdownForTheme.addEventListener("change", (event) => {
    const selectedValue = event.target.value;
    window.ipc.invoke("changesettings", "theme", selectedValue);
  });
};

const minBtn = document.getElementById("minimize-btn");
const maxBtn = document.getElementById("maximize-btn");
const closeBtn = document.getElementById("close-btn");

minBtn.addEventListener("click", () => {
  window.ipc.minimizeWindow();
});

maxBtn.addEventListener("click", () => {
  window.ipc.maximizeWindow();
});

closeBtn.addEventListener("click", () => {
  window.ipc.closeWindow();
});
document.getElementById("showgraph").addEventListener("click", async (e) => {
  const g = await window.ipc.invoke("give-graph", iframe.contentWindow.getCurrentFileURI())

  async function createDependencyGraph(graph) {

    const paletteColor = index =>
      `hsl(${(index * 137.508) % 360}, 70%, 68%)`;

    const normalize = file => file.replace(/\\/g, "/");

    const getFileName = file =>
      normalize(file).split("/").pop();

    const getRelativePath = file => normalize(file);

    const files = graph.map(module => normalize(module.file));
    const fileIndex = new Map(
      files.map((file, index) => [file, index])
    );

    const colors = new Map(
      files.map((file, index) => [file, paletteColor(index)])
    );

    const elements = [
      ...graph.map(module => ({
        data: {
          id: normalize(module.file),
          label: getFileName(module.file),
          path: getRelativePath(module.file)
        }
      })),

      ...graph.flatMap(module =>
        module.dependencies.map(dependency => ({
          data: {
            id: `${normalize(module.file)}->${normalize(dependency)}`,
            source: normalize(module.file),
            target: normalize(dependency),
            color: colors.get(normalize(module.file))
          }
        }))
      )
    ];

    // Wrapper for the graph and its controls.
    const wrapper = document.createElement("div");
    Object.assign(wrapper.style, {
      width: "100%",
      height: "100%",
      minHeight: "300px",
      position: "relative",
      overflow: "hidden",
      background: "#0b0d12"
    });

    const canvas = document.createElement("div");
    Object.assign(canvas.style, {
      position: "absolute",
      inset: "0"
    });

    const toolbar = document.createElement("div");
    Object.assign(toolbar.style, {
      position: "absolute",
      top: "10px",
      right: "10px",
      zIndex: "10",
      display: "flex",
      gap: "5px",
      padding: "5px",
      background: "#111722",
      border: "1px solid #303b4b",
      borderRadius: "6px"
    });

    wrapper.append(canvas, toolbar);

    createWindowinNoferic({
      heading: "Dependencies",
      div: wrapper
    });

    const makeButton = (label, title, action) => {
      const button = document.createElement("button");
      button.textContent = label;
      button.title = title;

      Object.assign(button.style, {
        minWidth: "30px",
        height: "28px",
        padding: "0 8px",
        color: "#dbeafe",
        background: "#1b2432",
        border: "1px solid #39465a",
        borderRadius: "4px",
        cursor: "pointer",
        fontSize: "14px"
      });

      button.addEventListener("click", action);
      toolbar.appendChild(button);
      return button;
    };

    // Wait until the window manager attaches the graph.
    requestAnimationFrame(() => {
      const cy = cytoscape({
        container: canvas,
        elements,

        style: [
          {
            selector: "node",
            style: {
              shape: "round-rectangle",
              width: "label",
              height: 32,
              padding: "9px",
              label: "data(label)",
              color: "#e2e8f0",
              "font-family": "monospace",
              "font-size": 13,
              "text-valign": "center",
              "text-halign": "center",
              "background-color": "#141a24",
              "border-width": 1.5,
              "border-color": ele =>
                colors.get(ele.id()) || "#64748b"
            }
          },
          {
            selector: "edge",
            style: {
              width: 1.5,
              "line-color": "data(color)",
              "target-arrow-shape": "triangle",
              "target-arrow-color": "data(color)",
              "arrow-scale": 0.8,
              "curve-style": "bezier",
              opacity: 0.8
            }
          },
          {
            selector: "node:selected",
            style: {
              "border-width": 3,
              color: "#ffffff"
            }
          }
        ],

        layout: {
          name: "cose",
          animate: true,
          animationDuration: 500,
          animationEasing: "ease-out",
          nodeRepulsion: 5000,
          idealEdgeLength: 85,
          gravity: 0.3,
          padding: 35
        },

        minZoom: 0.15,
        maxZoom: 4,
        userZoomingEnabled: true,
        userPanningEnabled: true
      });

      let fontSize = 13;

      makeButton("+", "Zoom in", () => {
        cy.zoom({
          level: Math.min(cy.zoom() * 1.25, cy.maxZoom()),
          renderedPosition: {
            x: canvas.clientWidth / 2,
            y: canvas.clientHeight / 2
          }
        });
      });

      makeButton("−", "Zoom out", () => {
        cy.zoom({
          level: Math.max(cy.zoom() / 1.25, cy.minZoom()),
          renderedPosition: {
            x: canvas.clientWidth / 2,
            y: canvas.clientHeight / 2
          }
        });
      });

      makeButton("Fit", "Fit graph to window", () => {
        cy.animate({
          fit: {
            eles: cy.elements(),
            padding: 45
          },
          duration: 250
        });
      });

      makeButton("A+", "Increase text size", () => {
        fontSize = Math.min(fontSize + 2, 28);
        cy.nodes().style("font-size", fontSize);
      });

      makeButton("A−", "Decrease text size", () => {
        fontSize = Math.max(fontSize - 2, 8);
        cy.nodes().style("font-size", fontSize);
      });

      // Resize without resetting the user's zoom and pan.
      const observer = new ResizeObserver(() => {
        cy.resize();
      });

      observer.observe(wrapper);

      // Double-click a file to inspect its path.
      cy.on("dbltap", "node", event => {
        console.log("Selected file:", event.target.data("path"));
      });
    });
  }

  await createDependencyGraph(g)
})
//createAiAgent(document , "1")


