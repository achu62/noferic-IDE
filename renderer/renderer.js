//jai sri ram
///////////
//jai sri ram
import { initiateterminal } from "./initialiseterminal.js";
import { resizeexplorer } from "./resize/resizeexplorer.js";
import { syncEditorBottom } from "./syncEditorbottom.js";
import { resizeterminal } from "./resize/resizeterminal.js";
import {
	isValidJSON,
	getfileiconbytype,
	DeleteOldWorkspace,
	findFolderById,
} from "./utils.js";
import { createfolderdialogbox } from "./filedialogbox.js";
const save = document.getElementById("save");
const openfile = document.getElementById("open_file");
const file = document.getElementById(`file`);
const exit = document.getElementById("exit");

const iframe = document.querySelector("iframe#editor");
const saveas = document.getElementById("save_as");
let globalignoredfilesarray = [""];
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

export function showdialog(path) {
	if (document.readyState == "complete") {
		document.getElementById("createnewfiledialog").showModal();
		console.log(path);
	}
	document
		.getElementById("createfileindialoog")
		.addEventListener("click", () => {
			const filejoin = document
				.getElementById("inputforopenfile")
				.value.replace("\n", "");
			console.log(`firing creeation eve ${path}/${filejoin} `);

			if (!filejoin) {
				alert("filenames cannot be empty");
				return;
			}

			console.log(`${path}/${filejoin}`);

			window.ipc.invoke("append", `${path}/${filejoin}`);
			if (globalfileexplorerstatejson[`${path}` === false]) {
				document.getElementById(path).click();
			}
			document.getElementById("inputforopenfile").value = "";
		});
}
export function showFolderDialog(path)
{
	if (document.readyState == "complete") {
		document.getElementById("createnewfolderdialog").showModal();
		console.log(path);
	}
	document
		.getElementById("createfolderindialoog")
		.addEventListener("click", () => {
			const filejoin = document
				.getElementById("inputforopenfolder")
				.value.replace("\n", "");

			if (!filejoin) {
				alert("Dirnames cannot be empty");
				return;
			}

			console.log(`${path}/${filejoin}`);

			window.ipc.invoke("mkdir", `${path}/${filejoin}`);
			if (globalfileexplorerstatejson[`${path}` === false]) {
				document.getElementById(path).click();
			}
			document.getElementById("inputforopenfolder").value = "";
			document.getElementById('createnewfolderdialog').close();

		});
}
window.onload = function () {
	document.getElementById('alertdialog').close()


	document.getElementById("versioncontrolelement").style.display = "none";
	function alert_s_1(string) {
		document.getElementById('alertdialog').showModal()	
	document.getElementById('contentdiv').innerText = string;}

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
	////////////////
	exit.onclick = () => {
		window.close();
	};
	const editorEl = document.getElementById("editor");
	const terminalEl = document.getElementById("terminalelement");
	terminalEl.style.display = "none";
	async function openfileoncilick(path, iframe) {
		const extension = path.split(`/`).pop().split(`.`).pop();
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
	syncEditorBottom(editorEl, terminalEl);
	file.addEventListener("click", () => {
		if (isopen === false) {
			document.getElementById("file_on").style.display = "block";
			isopen = true;
		} else {
			document.getElementById("file_on").style.display = "none";
			isopen = false;
		}
	});

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
	initiateterminal(document.getElementById("terminal"));
	resizeterminal(
		document.getElementById("terminalelement"),
		document.getElementById("editor"),
	);
	resizeexplorer(document.getElementById("explorer"));
	const observerforterminal = new ResizeObserver(() => {
		syncEditorBottom(editorEl, terminalEl);
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
	});
	observerforexplorer.observe(document.getElementById("explorer"));

	observerforpreview.observe(document.getElementById("preview"));

	const fileexplorerarea = document.getElementById("explorerelement");
	async function recursiveloop(filearray, space) {
		let depth = 17;

		depth = depth + 5;
		for (const file of filearray) {
			if (file.isdirectory) {
				//jai sri ram

				const filebutton = document.createElement("button");
				filebutton.id = `${file.id}`;

				filebutton.textContent = `${file.name}`;
				filebutton.classList.add("files");
				filebutton.classList.add("folder");
				filebutton.style.paddingLeft = depth + "px";
				filebutton.title = `${file.id}`;
				if (globalignoredfilesarray.includes(file.id)) {
					filebutton.style.color = "#dc360c";
				}
				const statebtn = document.createElement("div");
				statebtn.id = `statebuttonfor${file.id}`;
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
				icon.id = `iconfor${file.id}`;
				icon.style.position = "absolute";
				icon.style.backgroundImage = "url(images/folder.svg)";
				icon.style.backgroundRepeat = "no-repeat";
				icon.style.backgroundSize = "cover";
				icon.style.top = "0.5px";
				icon.style.bottom = "0.5px";
				icon.style.height = "16px";
				icon.style.width = `16px`;
				icon.style.left = `${depth - 19}px`;
				filebutton.appendChild(icon);
				globalfileexplorerstatejson[`${file.id}`] = false;
				filebutton.appendChild(statebtn);
				let isopen = false;
				filebutton.addEventListener("click", (e) => {
					if (!isopen) {
						if (filebutton.classList.contains("folder")) {
							console.log(findFolderById(globalfolderjson, file.id).children);
							recursiveloop(
								findFolderById(globalfolderjson, file.id).children,

								document.getElementById(`${file.id}`),
							);
							e.stopPropagation();
							e.stopImmediatePropagation();
							isopen = true;
							globalfileexplorerstatejson[`${file.id}`] = true;
						} else {
							return;
						}
					} else {
						filebutton.replaceChildren(file.name, statebtn, icon);
						isopen = false;
						globalfileexplorerstatejson[`${file.id}`] = false;

						e.stopPropagation();
					}
					console.log(globalfileexplorerstatejson);
				});
				space.appendChild(filebutton);
				createfolderdialogbox(
					document.body,
					file.id,
					filebutton,
					dialogforcreatefile,
				);
			} else {
				const filebutton = document.createElement("button");
				filebutton.id = `${file.id}`;

				filebutton.textContent = `${file.name}`;
				filebutton.classList.add("files");
				filebutton.style.paddingLeft = depth + "px";
				if (globalignoredfilesarray.includes(file.id)) {
					filebutton.style.color = "#dc360c";
				}
				filebutton.title = `${file.id}`;
				space.appendChild(filebutton);
				filebutton.addEventListener("click", async (e) => {
					e.stopPropagation();
					e.stopImmediatePropagation();
					const filepathonclick = file.id;
					const content = await window.ipc.invoke("read", filepathonclick);

					const isexisting = document.getElementById(
						`topbarelementfor${file.id}`,
					);

					if (!isexisting) {
						const topbarelement = document.createElement("button");
						topbarelement.classList.add("class__topelements");
						topbarelement.id = `topbarelementfor${file.id}`;
						topbarelement.textContent = `${file.name}`;
						topbarelement.title = `${file.id}`;
						const extension = filepathonclick.split("/").pop().split(".").pop();
						topbarelement.addEventListener("click", (e) => {
							e.stopPropagation();
							iframe.contentWindow.postMessage(
								{
									action: "set",
									content: content,
									isdir: true,
									extension: extension,
									path: filepathonclick,
								},
								"*",
							);
							iframe.contentWindow.postMessage(["layout"], "*");
						});
						document
							.getElementById("topbarforeditor")
							.appendChild(topbarelement);
						const topbarclosebtn = document.createElement("button");
						topbarclosebtn.classList.add("topbarclose_class");
						topbarclosebtn.id = `topbarelementclosefor${file.id}`;
						topbarclosebtn.addEventListener("click", (e) => {
							e.stopPropagation();
							topbarelement?.remove();
							iframe.contentWindow.postMessage({
								action: "deletemodelonclose",
								path: file.id,
							});
						});

						topbarelement.appendChild(topbarclosebtn);
						topbarelement.click();
					} else {
						isexisting.click();
					}
				});
				const extension = file.name.split(".").pop();

				let logopath = getfileiconbytype[extension];
				if (!logopath) {
					logopath = `images/unknown.svg`;
				}
				const icon = document.createElement("div");
				icon.id = `iconfor${file.id}`;
				icon.style.position = "absolute";
				icon.style.backgroundImage = `url(${logopath})`;
				icon.style.backgroundRepeat = "no-repeat";
				icon.style.backgroundSize = "cover";
				icon.style.top = "0.5px";
				icon.style.bottom = "0.5px";
				icon.style.height = "16px";
				icon.style.width = `16px`;
				icon.style.left = `${depth - 19}px`;
				filebutton.appendChild(icon);
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
			syncEditorBottom(editorEl, terminalEl);
		} else {
			document.getElementById("terminalelement").style.display = "none";
			globalleftmenustate.isterminalopen = false;

			syncEditorBottom(editorEl, terminalEl);
		}
	});
	document.getElementById("term").addEventListener("click", (e) => {
		if (globalleftmenustate.isterminalopen) {
			document.getElementById("terminalelement").style.display = "none";
			globalleftmenustate.isterminalopen = false;
			syncEditorBottom(editorEl, terminalEl);
			checkboxforterminal.checked = false;
		} else {
			document.getElementById("terminalelement").style.display = "block";
			globalleftmenustate.isterminalopen = true;
			syncEditorBottom(editorEl, terminalEl);
			checkboxforterminal.checked = true;
		}
	});
	checkboxforexplorer.addEventListener("change", (e) => {
		if (checkboxforexplorer.checked) {
			document.getElementById("explorer").style.display = "block";
			globalleftmenustate.isleftpanelopen = true;
			syncEditorBottom(editorEl, terminalEl);
		} else {
			document.getElementById("explorer").style.display = "none";
			globalleftmenustate.isleftpanelopen = false;
			syncEditorBottom(editorEl, terminalEl);
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
				console.log(object.code, object);

				const formattedcode = await window.ipc.invoke("format", object);
				console.log(formattedcode);
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
	document.addEventListener("keypress", (e) => {
		if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "f") {
			e.preventDefault();
			document.getElementById("format").click();
		} else if (e.ctrlKey && e.key.toLowerCase() === "s") {
			e.preventDefault();
			document.getElementById("save").click();
		} else if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "t") {
			e.preventDefault();
			document.getElementById("term").click();
		}
	});
	iframe.contentWindow.addEventListener("keypress", (e) => {
		if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "f") {
			e.preventDefault();
			document.getElementById("format").click();
		} else if (e.ctrlKey && e.key.toLowerCase() === "s") {
			e.preventDefault();
			document.getElementById("save").click();
		} else if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "t") {
			e.preventDefault();
			document.getElementById("term").click();
		}
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
			console.log(message);
			console.log(message.action);
			console.log(message.fjson);
			globalfolderjson = message.fjson;
			openfolderfunction(globalfolderjson);
		} else if (JSON.parse(data).action == "handlefileargs") {
			console.log(data);
			console.log(message.path);

			setTimeout(() => {
				openfileoncilick(message.path, iframe);
				console.log("sending");
			}, 2000);
		} else if (JSON.parse(data).action == "errorhandle") {
			alert(
				`an error occured while ${JSON.stringify(message.errorlocation)} \n\n error message:${JSON.stringify(message.errormessage)}`,
			);
		} else if (message.action === "addelements") {
			globalfolderjson = message.newjson;
			if (!message.add) {
				console.log("no adds");
			}
			console.log(!globalfileexplorerstatejson[message.add.parentid]);
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
			document.getElementById(message.remove)?.remove();
		} else if (message.action === "ignoredfiles") {
			console.log(message.ignoredfiles);
			message.ignoredfiles.forEach((ignoredfile) => {
				if (!globalignoredfilesarray.includes(ignoredfile)) {
					globalignoredfilesarray.push(ignoredfile);
				}
				if (document.getElementById(ignoredfile)) {
					document.getElementById(ignoredfile).style.color = "#dc360c";
				}
			});
		}
	});

	document
		.getElementById("cancelcreatefiledialog")
		.addEventListener("click", () => {
			dialogforcreatefile.close();
			console.log(document.getElementById("inputforopenfile").value);
		});
	document
		.getElementById("cancelcreatefolderdialog")
		.addEventListener("click", () => {
			document.getElementById('createnewfolderdialog').close();
			console.log(document.getElementById("inputforopenfolder").value);
		});
	document
		.getElementById("cancelcreateliveserverdialog")
		.addEventListener("click", () => {
			
			document.getElementById('createliveserverdialog').close();
			console.log(document.getElementById("inputforliveserver").value);
		});
	window.addEventListener("message", (e) => {
		const message = e.data;
		console.log(message);
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
	});
	document.getElementById('liveserverbtn').addEventListener('click', (e)=>{
		document.getElementById('createliveserverdialog').showModal()
	})
	document.getElementById('createliveserverbtn').addEventListener('click' , (e)=>{
		console.log(JSON.stringify({
			port: `${document.getElementById('inputforliveserver').value}`
		}))
		const relativepath = document.getElementById('inputpathforliveserver').value
	
		window.ipc.invoke("start_server", { port: document.getElementById('inputforliveserver').value, relativepath: relativepath ? relativepath : './', toOpen: document.getElementById("Browsercheck").checked})
		document.getElementById('link').innerText = `http://127.0.0.1:${document.getElementById('inputforliveserver').value}`
		
		document.getElementById('inputforliveserver').value = "";

		document.getElementById('createliveserverdialog').close();


	})
	document.getElementById('link').addEventListener('click' , (e)=>{
		e.preventDefault()
		navigator.clipboard.writeText(document.getElementById('link').innerText)
	})
	//alert_s_1(`(node:47168) [DEP0180] DeprecationWarning: fs.Stats constructor is deprecated.
		//(Use electron --trace-deprecation ... to show where the warning was created)
//terminate called after throwing an instance of 'Napi::Error'
  //what():
		
  ///home/charan / noferic - IDE / node_modules / electron / dist / electron exited with signal SIGABRT
//(node:47168) [DEP0180] DeprecationWarning: fs.Stats constructor is deprecated.
//		(Use electron --trace-deprecation ... to show where the warning was created)
//terminate called after throwing an instance of 'Napi::Error'
  //`)

};
