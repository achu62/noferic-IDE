//jai sri ram
//jai sri ram
//jai sri ram
//jai sri ram///
import {getLanguagebyExtension} from './utils.js'
window.onload = () => {
	require.config({ paths: { vs: "monaco-editor/package/min/vs" } });
	///
	let editor = null;
	require(["vs/editor/editor.main"], () => {
		editor = monaco.editor.create(document.getElementById("editor"), {
			value: "//open folder or\n \n  //open file or\n \n //write code now ",
			language: "javascript",
			theme: "vs-dark",
			automaticLayout: true,
			lineNumbers: "on",
			folding: true,
			minimap: { enabled: true },
			dragAndDrop: true,
			cursorBlinking: "blink",
			cursorStyle: "line",
			selectOnLineNumbers: true,
			quickSuggestions: true,
			snippetSuggestions: "inline",
			fontFamily: "JetBrains Mono",
			fontLigatures: true,
		});

		let URI = null;
		let ismodel = false;
		let extension = null;
		let cursorposition;
		let recentmodeluri;
		let autosavelistener;
		async function track(editor) {
			if (!editor) return;
			editor.onDidChangeCursorPosition((e) => {
				window.parent.document.getElementById("lineandcolumn").innerText =
					`LN:${e.position.lineNumber}  COL:${e.position.column}`;
			});
		}
		async function autosave(editor) {
			if(autosavelistener)
			{
				autosavelistener.dispose();
			}
			const model = editor.getModel()
			if (!editor) {
				console.log("no editor");
				return
			}
			if (!model) { console.log("nomodel"); return; }
			console.log(model.uri.toString())
			const currentPath = model.uri.toString().replace("id:", "");
			console.log("currentpath" + currentPath)
			if (currentPath.includes(`inmemory://`)) { return }

			console.log(`before:${model.uri.toString()}\nafter:${currentPath}`)

			autosavelistener=editor.onDidChangeModelContent(async () => {
				console.log("model conternt changed ")
				if (!URI) { return }
				const content = editor.getValue();
				window.parent.postMessage(
					{
						action: "autosave",
						code: content,
						path: currentPath
					},
					"*",
				);
			});

		}
		track(editor);
		window.addEventListener("message", (e) => {
			const message = e.data;
			const action = message.action;
			console.log(message)

			if (action === "set") {
				console.log('file is ' )
				const content = message.content;
				ismodel = message.isdir;
				URI = message.path;
				console.log(URI)
				extension = message.extension;
				window.parent.document.getElementById("language").innerText =
					`.${message.extension}`;
				const isexisting = monaco.editor.getModel(
					monaco.Uri.parse(`id://${URI}`),
				);
				recentmodeluri = `id://${URI}`;
				if (!isexisting) {
					
					if (ismodel == false) {
						
						console.log("content:"+content)
						const model = monaco.editor.createModel(
							content,
							getLanguagebyExtension(extension),
							monaco.Uri.parse(`id://${URI}`),
						);
						editor.setModel(model);
						ismodel = false;
					} else {
						const model = monaco.editor.createModel(
							content,
							getLanguagebyExtension(extension),
							monaco.Uri.parse(`id://${URI}`),
						);
						console.log(extension);
						editor.setModel(model);
					}
				} else {
					editor.setModel(isexisting);
				}
			
				autosave(editor)
				const topbarfor = window.parent.document.getElementById(`topbarelementfor${URI}`)
				if(!topbarfor)
				{
					return;
				}
				else
				{
					const parent = window.parent.document.getElementById('topbarforeditor')
					parent.querySelectorAll("*").forEach(el=>{el.style.backgroundColor = '#1e1e1e'})
					topbarfor.style.backgroundColor = '#404040'

				}

			} else if (action === "get") {
				if (!ismodel) {
					window.parent.postMessage(
						{
							content: editor.getValue(),
							isfolder: false,
						},
						"*",
					);
				} else {
					let contenttosave = monaco.editor.getModel(
						monaco.Uri.parse(`id://${URI}`),
					);
					contenttosave = contenttosave.getValue();
					window.parent.postMessage(
						{
							content: contenttosave,
							isfolder: true,
							path: `${URI}`,
						},
						"*",
					);
				}
			} else if (action === "layout") {
				editor.layout(); 
						} 
				else if (action === "formatget") {
				cursorposition = editor.getPosition();
				console.log(extension);
				
				window.parent.postMessage({
					code: editor.getValue(),
					extension: extension,
					language: getLanguagebyExtension(extension),
				});
				console.log(extension);
			} else if (action === "formatset") {
				const formattedcode = message.formattedcode;
				editor.setValue(formattedcode);
				editor.setPosition(cursorposition);
			}
			else if (action === "deletemodelonclose")
			{
				const pathofmodel = `id://${message.path}`;
				const modeltodelete = monaco.editor.getModel(
					monaco.Uri.parse(pathofmodel),
				);
				modeltodelete.dispose();
				console.log(monaco.editor.getModels())
				console.log("is deleteed" + monaco.editor.getModel(
					monaco.Uri.parse(pathofmodel),
				))
				let newmodel = monaco.editor.getModel(
					monaco.Uri.parse(recentmodeluri)
				)
				if(!newmodel){
					 newmodel = monaco.editor.getModels()[0];
					const topbarfor = window.parent.document.getElementById(`topbarelementfor${newmodel.uri.toString().replace('id://', '')}`);

					const parent = window.parent.document.getElementById('topbarforeditor')
					parent.querySelectorAll("*").forEach(el => { el.style.backgroundColor = '#1e1e1e' })
					topbarfor.style.backgroundColor = '#404040'
					editor.setModel(newmodel);

				}
				else
				{
					const topbarfor = window.parent.document.getElementById(`topbarelementfor${recentmodeluri.replace("id://" , '')}`)

					const parent = window.parent.document.getElementById('topbarforeditor')
					parent.querySelectorAll("*").forEach(el => { el.style.backgroundColor = '#1e1e1e' })
					topbarfor.style.backgroundColor = '#404040'


					editor.setModel(newmodel);

				}


			}
			else if(action ==  "deleteallmodels")
			{
				monaco.editor.getModels().forEach(model =>
				{
					model.dispose();
					console.log("model"+monaco.editor.getModels())

				}
				)
			}
		});

		
	});
	document.addEventListener("keypress", (e) => {
		if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "f") {
			e.preventDefault();
			window.parent.document.getElementById("format").click();
		}
	});

};
//jai sri ram
