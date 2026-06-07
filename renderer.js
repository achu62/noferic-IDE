//jai sri ram
///////////
//jai sri ram
import { initiateterminal } from "./initialiseterminal.js";
import { resizeexplorer } from "./resizeexplorer.js";
import { syncEditorBottom } from "./syncEditorbottom.js";
import { resizeterminal } from "./resizeterminal.js";
import { isValidJSON, getfileiconbytype, DeleteOldWorkspace, findFolderById } from "./utils.js";
import { createfolderdialogbox } from './filedialogbox.js'
const save = document.getElementById("save");
const openfile = document.getElementById("open_file");
const file = document.getElementById(`file`);
const exit = document.getElementById("exit");
const iframe = document.querySelector("iframe#editor");
const saveas = document.getElementById("save_as");


let isopen = false;
let path;
let globalfolderjson;
let globalfileexplorerstatejson = {};

export function showdialog(path) {
	if (document.readyState == "complete") {
		document.getElementById('createnewfiledialog').showModal()
		console.log(path)
	}
	document.getElementById('createfileindialoog').addEventListener('click', () => {


		const filejoin = document.getElementById("inputforopenfile").value.replace('\n', "")
		console.log(`firing creeation eve ${path}/${filejoin} `)

		if (!filejoin) {
			alert("filenames cannot be empty");
			return;
		}

		console.log(`${path}/${filejoin}`)


		window.ipc.invoke("append", `${path}/${filejoin}`)
		if (globalfileexplorerstatejson[`${path}` === false]) {
			document.getElementById(path).click()

		}

	})


}

window.onload = function () {


	let workspacepath = null;
	const dialogforcreatefile = this.document.getElementById('createnewfiledialog')

	document.getElementById("file_on").style.display = "none";
	document.getElementById("viewon").style.display = "none";
	////////////////
	exit.onclick = () => {
		window.close();
	};
	const editorEl = this.document.getElementById("editor");
	const terminalEl = this.document.getElementById("terminalelement");
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
	file.addEventListener('click', () => {
		if (isopen === false) {
			document.getElementById("file_on").style.display = "block";
			isopen = true;
		} else {
			document.getElementById("file_on").style.display = "none";
			isopen = false;
		}
	})


	openfile.addEventListener(
		"click",
		async () => {
			path = await window.ipc.invoke("openfile");
			if (!path) { return; }
			DeleteOldWorkspace(this.document.getElementById('explorerelement'), this.document.getElementById('topbarforeditor'), iframe)
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
	resizeexplorer(this.document.getElementById("explorer"));
	const observerforterminal = new ResizeObserver(() => {
		syncEditorBottom(editorEl, terminalEl);
	});
	observerforterminal.observe(terminalEl);
	const observerforpreview = new ResizeObserver(() => {
		const editor = this.document.getElementById("middleeditor");
		const explorer = this.document.getElementById("explorer");
		const preview = this.document.getElementById("preview");
		editor.style.right = preview.offsetWidth + "px";
		editor.style.left = explorer.offsetWidth + "px";
		editor.style.width = `${this.document.getElementById("workspace").offsetWidth - (preview.offsetWidth + explorer.offsetWidth)}px`;
	});
	const observerforexplorer = new ResizeObserver(() => {
		const editor = this.document.getElementById("middleeditor");
		const explorer = this.document.getElementById("explorer");
		const preview = this.document.getElementById("preview");
		editor.style.right = preview.offsetWidth + "px";
		editor.style.left = explorer.offsetWidth + "px";
		editor.style.width = `${this.document.getElementById("workspace").offsetWidth - (preview.offsetWidth + explorer.offsetWidth)}px`;
	});
	observerforexplorer.observe(this.document.getElementById("explorer"));

	observerforpreview.observe(this.document.getElementById("preview"));

	const fileexplorerarea = document.getElementById("explorerelement");
	async function recursiveloop(filearray, space) {
		let depth = 17;

		depth = depth + 5;
		for (const file of filearray) {
			if (file.isdirectory //&& file.haschildren
				) {
				const filebutton = document.createElement("button");
				filebutton.id = `${file.id}`;
				filebutton.textContent = `${file.name}`;
				filebutton.classList.add("files");
				filebutton.classList.add("folder");
				filebutton.style.paddingLeft = depth + "px";
				filebutton.title = `${file.id}`
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
							console.log(findFolderById(globalfolderjson, file.id).children,
)
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
					console.log(globalfileexplorerstatejson)
				});
				space.appendChild(filebutton);
				createfolderdialogbox(document.body, file.id, filebutton, dialogforcreatefile)
			} /*else if (!file.haschildren && file.isdirectory) {
				const filebutton = document.createElement("button");

				filebutton.id = `${file.id}`;
				filebutton.textContent = `${file.name}`;
				filebutton.classList.add("files");
				filebutton.style.paddingLeft = depth + "px";
				filebutton.title = `${file.id}`
				const icon = document.createElement("div");
				icon.id = `iconfor${file.id}`;
				icon.style.position = "absolute";
				icon.style.backgroundImage = `url(images/folder.svg)`;
				icon.style.backgroundRepeat = "no-repeat";
				icon.style.backgroundSize = "cover";
				icon.style.top = "0.5px";
				icon.style.bottom = "0.5px";
				icon.style.height = "16px";
				icon.style.width = `16px`;
				icon.style.left = `${depth - 19}px`;
				filebutton.addEventListener('click' , (e)=>{
					e.preventDefault()
				})
				createfolderdialogbox(document.body, file.id, filebutton, dialogforcreatefile)

				space.appendChild(filebutton);
				filebutton.appendChild(icon);
				
			}*/ else {
				const filebutton = document.createElement("button");
				filebutton.id = `${file.id}`;
				filebutton.textContent = `${file.name}`;
				filebutton.classList.add("files");
				filebutton.style.paddingLeft = depth + "px";
				filebutton.title = `${file.id}`
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
						topbarelement.title = `${file.id}`
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
	this.document
		.getElementById("open_folder")
		.addEventListener("click", async () => {
			document.getElementById("file_on").style.display = "none";
			const folderjson = await window.ipc.invoke("openfolder");
			openfolderfunction(JSON.parse(JSON.stringify(folderjson)));
		});
	let isviewopen = false;
	this.document.getElementById("view").addEventListener("click", (e) => {
		e.stopPropagation();

		if (!isviewopen) {
			isviewopen = true;
			this.document.getElementById("viewon").style.display = "block";
		} else {
			this.document.getElementById("viewon").style.display = "none";
			isviewopen = false;
		}
	});

	this.document.getElementById('viewon').addEventListener("blur", (e) => {
		e.stopPropagation()
		e.preventDefault()

		this.document.getElementById("viewon").style.display = "none";
		isviewopen = false;
		this.alert(blur)


	})
	document.getElementById("file_on").addEventListener("blur", (e) => {
		e.stopPropagation()
		e.preventDefault()
		alert("blur")
		document.getElementById("file_on").style.display = "none";
		isopen = false;
	}
	)


	let isterminalopen = true;
	let isexploreropen = true;
	const checkboxforterminal = document.getElementById("terminalcheck");
	const checkboxforexplorer = this.document.getElementById("explorercheck");
	checkboxforterminal.addEventListener("change", (e) => {
		if (checkboxforterminal.checked) {
			document.getElementById("terminalelement").style.display = "block";
			isterminalopen = true;
			syncEditorBottom(editorEl, terminalEl);
		} else {
			document.getElementById("terminalelement").style.display = "none";
			isterminalopen = false;
			syncEditorBottom(editorEl, terminalEl);
		}
	});
	document.getElementById("term").addEventListener("click", (e) => {
		if (isexploreropen) {
			document.getElementById("terminalelement").style.display = "none";
			isterminalopen = false;
			syncEditorBottom(editorEl, terminalEl);
			checkboxforterminal.checked = false;
		} else {
			document.getElementById("terminalelement").style.display = "block";
			isterminalopen = true;
			syncEditorBottom(editorEl, terminalEl);
			checkboxforterminal.checked = true;
		}
	});
	checkboxforexplorer.addEventListener("change", (e) => {
		if (checkboxforexplorer.checked) {
			document.getElementById("explorer").style.display = "block";
			isexploreropen = true;
			syncEditorBottom(editorEl, terminalEl);
		} else {
			document.getElementById("explorer").style.display = "none";
			isexploreropen = false;
			syncEditorBottom(editorEl, terminalEl);
		}
	});
	document.getElementById("expl").addEventListener("click", (e) => {
		if (isexploreropen) {
			document.getElementById("explorer").style.display = "none";
			isexploreropen = false;
			checkboxforexplorer.checked = false;
		} else {
			document.getElementById("explorer").style.display = "block";
			isexploreropen = true;
			checkboxforexplorer.checked = true;
		}
	});
	this.document.getElementById("format").addEventListener("click", async () => {
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
		}
		else if (JSON.parse(data).action == "errorhandle") {
			alert(`an error occured while ${message.errorlocation} \n\n error message:${message.errormessage}`)
		}
		else if (message.action === "addelements") {
			globalfolderjson = message.newjson;
			if (!message.add) { console.log('no adds') }
			console.log(!globalfileexplorerstatejson[message.add.parentid])
			if (!globalfileexplorerstatejson[message.add.parentid]) {
				return;
			}
			if (!document.getElementById(message.add.parentid))
			{
				this.alert("foldernotfound")
			}
			
			recursiveloop(message.add.actualjson, this.document.getElementById(message.add.parentid))


		}
		else if (message.action == "removeelements") {
			globalfolderjson = message.newjson;
			this.document.getElementById(message.remove)?.remove();
			
			
		}

	});


	this.document.getElementById('cancelcreatefiledialog').addEventListener('click', () => {
		dialogforcreatefile.close();
		console.log(document.getElementById("inputforopenfile").value)


	})

};
