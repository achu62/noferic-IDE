//jai sri ram
//jai sri ram
//jai sri ram
//jai sri ram
import { getLanguagebyExtension } from "./utils.js";
//jai sri ram
// lspToMonaco.js

function lspKindToMonaco(monaco, kind) {
	const K = monaco.languages.CompletionItemKind;

	switch (kind) {
		case 1: return K.Text;
		case 2: return K.Method;
		case 3: return K.Function;
		case 4: return K.Constructor;
		case 5: return K.Field;
		case 6: return K.Variable;
		case 7: return K.Class;
		case 8: return K.Interface;
		case 9: return K.Module;
		case 10: return K.Property;
		case 11: return K.Unit;
		case 12: return K.Value;
		case 13: return K.Enum;
		case 14: return K.Keyword;
		case 15: return K.Snippet;
		case 16: return K.Color;
		case 17: return K.File;
		case 18: return K.Reference;
		case 19: return K.Folder;
		case 20: return K.EnumMember;
		case 21: return K.Constant;
		case 22: return K.Struct;
		case 23: return K.Event;
		case 24: return K.Operator;
		case 25: return K.TypeParameter;
		default: return K.Text;
	}
}

function lspCompletionToMonaco(monaco, item) {
	return {
		label: item.label,
		kind: lspKindToMonaco(monaco, item.kind),
		detail: item.detail ?? "",
		documentation:
			typeof item.documentation === "string"
				? item.documentation
				: item.documentation?.value ?? "",

		insertText: item.insertText ?? item.label,

		sortText: item.sortText,
		filterText: item.filterText,
		preselect: item.preselect,
		commitCharacters: item.commitCharacters,

		range: undefined
	};
}

export function convertCompletionList(monaco, completionList) {
	const items = Array.isArray(completionList)
		? completionList
		: completionList.items;

	return items.map(item => lspCompletionToMonaco(monaco, item));
}

window.onload = () => {
	require.config({ paths: { vs: "monaco-editor/package/min/vs" } });
	///
	let editor = null;
	let lintlistener;


	require(["vs/editor/editor.main"], () => {

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
				{ token: "keyword", foreground: "FF922B" }
			],
			colors: {
				"editor.background": "#1e1e1e",
				"editor.foreground": "#E8E8E8",
				"editorLineNumber.foreground": "#777777",
				"editorCursor.foreground": "#FFFFFF",
				"editor.selectionBackground": "#505050",
				"editor.lineHighlightBackground": "#404040",
				"editorInfo.foreground": "#1edf1e"
			},
		});

		editor = monaco.editor.create(document.getElementById("editor"), {
			value: "//open folder or\n \n  //open file or\n \n //write code now ",
			language: "javascript",
			lineNumbers: "on",
			folding: true,
			minimap: { enabled: true },

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
			scrollbar: {
				horizontal: "visible",
				horizontalScrollbarSize: 12,
				alwaysConsumeMouseWheel: false,
				vertical: "visible"
			},
			theme: "NofericIDETheme",
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
		async function sendReqAutocomplete() {
			const model = editor.getModel();

			const path = model.uri.toString().replace("id:", "");
			alert(path)
			const localcont = model.getValue()

			const pos = editor.getPosition()
			const char = pos.column - 1;
			const lin = pos.lineNumber - 1;
			console.log(lin, char, pos, localcont, path)
			window.parent.postMessage(
				{
					action: "getAutoComplete",
					params: {
						line: lin,
						path: path,
						character: char,
						content: localcont
					}
				},
				"*",
			);
			const promise = new Promise((re, rej) => {
				window.addEventListener("message", (e) => {
					const message = e.data;
					if (message.action == "tsac") {
						re(message.data)
					}
				})

			})
			return promise;

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
				editor.trigger(
					"keyboard",
					"editor.action.triggerSuggest",
					{}
				);
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

		let latestCompletion;
		monaco.languages.registerCompletionItemProvider("javascript", {
			async provideCompletionItems(model, position) {
				if(!URI) {return}
				const res = await sendReqAutocomplete();
				latestCompletion = res;
				return {
					suggestions: convertCompletionList(monaco, res)
				};
			},
			provideCompletionItems() {
				return {
					suggestions: convertCompletionList(monaco, latestCompletion)
				};
			}
		});
		monaco.languages.registerCompletionItemProvider("typescript", {
			async provideCompletionItems(model, position) {
				if (!URI) { return }
				const res = await sendReqAutocomplete();
				return {
					suggestions: convertCompletionList(monaco, res)
				};
			},
			provideCompletionItems() {
				return {
					suggestions: convertCompletionList(monaco, latestCompletion)
				};
			}
		});
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
					if (message.isspecialchange) {
						isexisting.setValue(message.content)
					}
					else {
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

						el.querySelectorAll("*").forEach((e) => {
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

		monaco.languages.json.jsonDefaults.setDiagnosticsOptions(
			{
				validate: true,
				enableSchemaRequest: true,
				schemas: []
			}
		)
	});
};

//jai sri ram
