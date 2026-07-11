//jai sri ram
//jai sri ram
//jai sri ram
//jai sri ram
import { getLanguagebyExtension } from "./utils.js";
window.onload = () => {
	require.config({ paths: { vs: "monaco-editor/package/min/vs" } });
	///
	let editor = null;
	let lintlistener;


	require(["vs/editor/editor.main"], () => {
		monaco.languages.json.jsonDefaults.setDiagnosticsOptions(
			{
				validate:true,
				enableSchemaRequest:true,
				schemas:[]
			}
		)
		monaco.editor.defineTheme("NofericIDETheme", {
			base: "vs-dark",

			inherit: true,
			rules: [
				{ token: "comment", foreground: "7A7A7A" },
				{ token: "keyword", foreground: "FF6B6B" },
				{ token: "string", foreground: "95D5B2" },
				{ token: "number", foreground: "74C0FC" },
				{ token: "type", foreground: "C77DFF" },
				{ token: "class", foreground: "C77DFF" },
				{ token: "function", foreground: "FFD166" },
				{ token: "constant", foreground: "4DABF7" },
				{ token: "operator", foreground: "FF922B" },
				{ token: "keyword", foreground:"FF922B"}
			],
			colors: {
				"editor.background": "#1e1e1e",
				"editor.foreground": "#E8E8E8",
				"editorLineNumber.foreground": "#777777",
				"editorCursor.foreground": "#FFFFFF",
				"editor.selectionBackground": "#505050",
				"editor.lineHighlightBackground": "#404040",
				"editorInfo.foreground":"#1edf1e"
			},
		});

		editor = monaco.editor.create(document.getElementById("editor"), {
			value: "//open folder or\n \n  //open file or\n \n //write code now ",
			language: "javascript",
			automaticLayout: true,
			lineNumbers: "on",
			folding: true,
			minimap: { enabled: true },
			breadcrumbs: {
				enabled: true,
			},
			codeLens: true, // Fixed casing
			dragAndDrop: true,
			cursorBlinking: "blink",
			cursorStyle: "line",
			selectOnLineNumbers: true,
			quickSuggestions: true,
			snippetSuggestions: "inline",
			fontFamily: "JetBrains Mono",
			fontLigatures: true,
			fontWeight: 200,
			
			theme: "NofericIDETheme",
			// Add these inside your main configuration object
			wordWrap: "off",                 // Ensures text doesn't wrap down, forcing horizontal expansion
			scrollBeyondLastColumn: 5,       // Forces extra horizontal scrolling space at the end of lines
			alwaysConsumeMouseWheel: false,
		}
);

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
			if (autosavelistener) {
				autosavelistener.dispose();
			}
			const model = editor.getModel();
			if (!editor) {
				console.log("no editor");
				return;
			}
			if (!model) {
				console.log("nomodel");
				return;
			}
			console.log(model.uri.toString());
			const currentPath = model.uri.toString().replace("id:", "");
			console.log("currentpath" + currentPath);
			if (currentPath.includes(`inmemory://`)) {
				return;
			}

			console.log(`before:${model.uri.toString()}\nafter:${currentPath}`);

			autosavelistener = editor.onDidChangeModelContent(async () => {
				console.log("model conternt changed ");
				if (!URI) {
					return;
				}
				const content = editor.getValue();
				window.parent.postMessage(
					{
						action: "autosave",
						code: content,
						path: currentPath,
					},
					"*",
				);
			});
		}
		track(editor);
		window.addEventListener("message", (e) => {
			const message = e.data;
			const action = message.action;
			console.log(message);

			if (action === "set") {
				console.log("file is ");
				console.log(`message${message}`)
				const content = message.content;
				ismodel = message.isdir;
				URI = message.path;
				console.log(URI);
				extension = message.extension;
				window.parent.document.getElementById("language").innerText =
					`.${message.extension}`;
				const isexisting = monaco.editor.getModel(
					monaco.Uri.parse(`id://${URI}`),
				);
				recentmodeluri = `id://${URI}`;
				if (!isexisting) {
					if (ismodel == false) {
						console.log('tying')
						console.log("content:" + content);
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
					if (message.isspecialchange){
						isexisting.setValue(message.content)
					}
					else{
						editor.setModel(isexisting);

					}
				}

				autosave(editor);
				const topbarfor = window.parent.document.getElementById(
					`topbarelementfor${URI}`,
				);
				if (!topbarfor) {
					return;
				} else {
					const parent =
						window.parent.document.getElementById("topbarforeditor");
					parent.querySelectorAll("*").forEach((el) => {
						el.style.backgroundColor = "#1e1e1e";
					});
					topbarfor.style.backgroundColor = "#404040";
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
			} else if (action === "formatget") {
				cursorposition = editor.getPosition();
				console.log(extension);

				window.parent.postMessage({
					code: editor.getValue(),
					extension: extension,
					language: getLanguagebyExtension(extension),
				});
				console.log(extension);
			} else if (action === "formatset") {
				const edits = message.formattedcode;
				console.log(edits);

				const monacomarkers = [];

				edits.forEach((edit) => {
					monacomarkers.push({
						range: {
							startLineNumber: edit.range.start.line + 1,
							startColumn: edit.range.start.character + 1,
							endLineNumber: edit.range.end.line + 1,
							endColumn: edit.range.end.character + 1,
						},
						text: edit.newText,
					});
				});
				editor.executeEdits("my-programmatic-edits", monacomarkers);
			} else if (action === "deletemodelonclose") {
				const pathofmodel = `id://${message.path}`;
				const modeltodelete = monaco.editor.getModel(
					monaco.Uri.parse(pathofmodel),
				);
				modeltodelete.dispose();
				console.log(monaco.editor.getModels());
				console.log(
					"is deleteed" + monaco.editor.getModel(monaco.Uri.parse(pathofmodel)),
				);
				let newmodel = monaco.editor.getModel(monaco.Uri.parse(recentmodeluri));
				if (!newmodel) {
					newmodel = monaco.editor.getModels()[0];
					const topbarfor = window.parent.document.getElementById(
						`topbarelementfor${newmodel.uri.toString().replace("id://", "")}`,
					);

					const parent =
						window.parent.document.getElementById("topbarforeditor");
					parent.querySelectorAll("*").forEach((el) => {
						el.style.backgroundColor = "#1e1e1e";

						el.querySelectorAll("*").forEach((e)=>{
							e.style.backgroundColor = "#1e1e1e";

						})
					});
					topbarfor.style.backgroundColor = "#404040";
					editor.setModel(newmodel);
				} else {
					const topbarfor = window.parent.document.getElementById(
						`topbarelementfor${recentmodeluri.replace("id://", "")}`,
					);

					const parent =
						window.parent.document.getElementById("topbarforeditor");
					parent.querySelectorAll("*").forEach((el) => {
						el.style.backgroundColor = "#1e1e1e";
					});
					topbarfor.style.backgroundColor = "#404040";

					editor.setModel(newmodel);
				}
			} else if (action == "deleteallmodels") {
				monaco.editor.getModels().forEach((model) => {
					model.dispose();
					console.log("model" + monaco.editor.getModels());
				});
			} else if (action === "setMarkers") {
				console.log(message.diagnostics.diagnostics);
				let markers = [];
				message.diagnostics.diagnostics.forEach((d) => {
					markers.push({
						startLineNumber: d.range.start.line + 1,

						startColumn: d.range.start.character + 1,

						endLineNumber: d.range.end.line + 1,

						endColumn: d.range.end.character + 1,

						message: `biome:${d.message}`,

						severity:
							d.severity === 1
								? monaco.MarkerSeverity.Error
								: d.severity === 2
									? monaco.MarkerSeverity.Warning
									: d.severity === 3
										? monaco.MarkerSeverity.Info
										: onaco.MarkerSeverity.Hint,
					});
				});
				monaco.editor.setModelMarkers(editor.getModel(), "biome", markers);
			}
		});
		async function lint() {
			if (lintlistener) {
				lintlistener.dispose();
			}
			lintlistener = editor.onDidChangeModelContent(() => {
				console.log(
					`sending:${{
						action: "lint",
						code: editor.getValue(),
						extension: extension,
						language: getLanguagebyExtension(extension),
					}}`,
				);
				window.parent.postMessage({
					action: "lint",
					code: editor.getValue(),
					extension: extension,
					language: getLanguagebyExtension(extension),
				});
			});
		}
		lint();
	});
};

//jai sri ram
