//jai sri ram
//jai sri ram
//jai sri ram
//jai sri ram///

window.onload = () => {
	require.config({ paths: { vs: "monaco-editor/package/min/vs" } });
	///
	let editor = null;
	require(["vs/editor/editor.main"], () => {
		editor = monaco.editor.create(document.getElementById("editor"), {
			value: "//open folder \n \n or //open file or\n \n //write code mow ",
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
		let language = null;
		let cursorposition;

		async function track(editor) {
			if (!editor) return;
			editor.onDidChangeCursorPosition((e) => {
				window.parent.document.getElementById("lineandcolumn").innerText =
					`LN:${e.position.lineNumber}  COL:${e.position.column}`;
			});
		}
		async function autosave(editor) {

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

			editor.onDidChangeModelContent(async () => {
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

			if (action === "set") {
				const content = message.content;
				ismodel = message.isdir;
				URI = message.path;
				console.log(URI)
				language = message.language;
				window.parent.document.getElementById("language").innerText =
					`.${message.language}`;
				const isexisting = monaco.editor.getModel(
					monaco.Uri.parse(`id://${URI}`),
				);
				if (!isexisting) {
					if (language === "js") {
						language = "javascript";
					} else if (language === "ts") {
						language = "typescript";
					} else {
						language = language;
					}
					if (ismodel == false) {
						// editor.setValue("");
						//editor.setValue(content);
						const model = monaco.editor.createModel(
							content,
							language,
							monaco.Uri.parse(`id://${URI}`),
						);
						editor.setModel(model);
						ismodel = false;
					} else {
						const model = monaco.editor.createModel(
							content,
							language,
							monaco.Uri.parse(`id://${URI}`),
						);
						console.log(language);
						editor.setModel(model);
					}
				} else {
					editor.setModel(isexisting);
				}
			
				autosave(editor)
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
				editor.layout(); // forces Monaco to recalculate and render immediately
			} else if (action === "formatget") {
				let extension = language;
				cursorposition = editor.getPosition();
				console.log(language);
				if (extension === "javascript") {
					extension = "js";
				} else if (extension === "typescript") {
					extension = "ts";
				}
				window.parent.postMessage({
					code: editor.getValue(),
					extension: extension,
					language: language,
				});
				console.log(extension);
			} else if (action === "formatset") {
				const formattedcode = message.formattedcode;
				editor.setValue(formattedcode);
				editor.setPosition(cursorposition);
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
