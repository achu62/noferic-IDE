/////////////////////jai sri ram
//jai sri ram
//jai sri ram
//jai sri ram


import { getLanguagebyExtension } from "./utils.js";
import { runparser } from "./parser/dist/my-library.js";
import {NofericTheme} from "./MyTheme.js"
import {EditorConfig}  from "./EditorConfig.js"
import {getDeclarationName} from "./getDeclarationName.js"
import { lspKindToMonaco } from "./lspToMonaco.js";
import { format } from "./formatter/formatter.js";
function lspCompletionToMonaco(monaco, item) {
  return {
    label: item.label,
    kind: lspKindToMonaco(monaco, item.kind),
    detail: item.detail ?? "",
    documentation:
      typeof item.documentation === "string"
        ? item.documentation
        : (item.documentation?.value ?? ""),

    insertText: item.insertText ?? item.label,

    sortText: item.sortText,
    filterText: item.filterText,
    preselect: item.preselect,
    commitCharacters: item.commitCharacters,

    range: undefined,
  };
}


export function convertCompletionList(monaco, completionList) {
  const items = Array.isArray(completionList)
    ? completionList
    : completionList.items;

  return items.map((item) => lspCompletionToMonaco(monaco, item));
}

window.onload = () => {
  require.config({ paths: { vs: "monaco-editor/package/min/vs" } });
  ///
  let editor = null;
  let lintlistener;

  require(["vs/editor/editor.main"], () => {
    monaco.editor.defineTheme("NofericIDETheme", NofericTheme);

    editor = monaco.editor.create(document.getElementById("editor"),EditorConfig );
    let URI = null;
    let ismodel = false;
    let extension = null;
    let recentmodeluri;
    let autosavelistener;

    async function track(editor) {
      if (!editor) return;
      editor.onDidChangeCursorPosition(async (e) => {
        window.parent.document.getElementById("lineandcolumn").innerText =

          `LN:${e.position.lineNumber}  COL:${e.position.column}`;

        const tree = await runparser(editor.getValue(), {
          row: e.position.lineNumber - 1,
          column: e.position.column - 1,
        })
        const name = getDeclarationName(tree);
        window.parent.document.getElementById("breadcrupsfunc").innerText = `${name || ""}`


      });




    }
    async function sendReqAutocomplete() {
      const model = editor.getModel();

      const path = decodeURIComponent(model.uri.toString().replace("id:", ""));
      const localcont = model.getValue();

      const pos = editor.getPosition();
      const char = pos.column - 1;
      const lin = pos.lineNumber - 1;

      window.parent.postMessage(
        {
          action: "getAutoComplete",
          data: {
            line: lin,
            path: path,
            character: char,
            content: localcont,
          },
        },
        "*",
      );

      const promise = new Promise((re, rej) => {
        window.addEventListener("message", (e) => {
          const message = e.data;
          if (message.action === "tsac") {
            re(message.data);
          }
        });
      });
      return promise;
    }
    async function sendReqForGTD() {
      const pos = editor.getPosition();
      window.parent.postMessage({
        action: "getGoTodefintion",
        position: pos,
      });

      return new Promise((resolve) => {
        const handleMessage = (e) => {
          const message = e.data;
          if (message.action === "tsgtd") {
            window.removeEventListener("message", handleMessage); // Clean up event listener

            if (!message.data) return resolve([]);

            // Ensure data is an array (LSP can send a single object or an array)
            const rawItems = Array.isArray(message.data) ? message.data : [message.data];

            const definitions = rawItems.map((loc) => {
              // 1. Support both Location (uri/range) and LocationLink (targetUri/targetRange)
              const rawUri = loc.targetUri || loc.uri || "";
              const targetRange = loc.targetSelectionRange || loc.targetRange || loc.range;

              // 2. Convert 'file://' URI to 'id://' URI scheme used by your Monaco models
              const formattedUriString = decodeURIComponent(rawUri.replace(/^file:\/\//, "id://"));

              return {
                uri: monaco.Uri.parse(formattedUriString),
                range: new monaco.Range(
                  targetRange.start.line + 1,
                  targetRange.start.character + 1,
                  targetRange.end.line + 1,
                  targetRange.end.character + 1
                ),
              };
            });

            resolve(definitions);
          }
        };

        window.addEventListener("message", handleMessage);
      });
    }
    async function sendReqForHover(model, position) {
      const currentPath = model.uri.toString().replace("id:", "");

      window.parent.postMessage({
        action: "getHover",
        path: currentPath,
        position: {
          line: position.lineNumber - 1,
          character: position.column - 1,
        },
      });

      return new Promise((resolve) => {
        const handleMessage = (e) => {
          const message = e.data;
          if (message.action === "tshover") {
            window.removeEventListener("message", handleMessage);

            const hoverData = message.data;
            if (!hoverData || !hoverData.contents) {
              return resolve(null);
            }

            let contents = [];

            if (Array.isArray(hoverData.contents)) {
              contents = hoverData.contents.map((item) => ({
                value: typeof item === "string" ? item : item.value,
              }));
            } else if (typeof hoverData.contents === "string") {
              contents = [{ value: hoverData.contents }];
            } else if (hoverData.contents.value) {
              contents = [{ value: hoverData.contents.value }];
            }

            let range = undefined;
            if (hoverData.range) {
              range = new monaco.Range(
                hoverData.range.start.line + 1,
                hoverData.range.start.character + 1,
                hoverData.range.end.line + 1,
                hoverData.range.end.character + 1
              );
            }

            resolve({
              contents: contents,
              range: range,
            });
          }
        };

        window.addEventListener("message", handleMessage);
      });
    }
    async function autosave(editor) {
      if (autosavelistener) {
        autosavelistener.dispose();
      }
      const model = editor.getModel();
      if (!editor) {
        return;
      }
      if (!model) {
        return;
      }
      
      const currentPath =
    navigator.platform === "Win32"
        ? decodeURIComponent(model.uri.toString().replace("id://", ""))
        : decodeURIComponent(model.uri.toString().replace("id:", ""));
      if (currentPath.includes(`inmemory://`)) {
        return;
      }

      autosavelistener = editor.onDidChangeModelContent(async () => {
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
    monaco.editor.onDidChangeMarkers(([resource]) => {
      const modelae = editor.getModel();

      // Ensure the markers changed for the current model
      if (modelae && resource.toString() === modelae.uri.toString()) {
        const markers = monaco.editor.getModelMarkers({
          resource: modelae.uri,
        });

        const errors = markers.filter(
          (m) => m.severity === monaco.MarkerSeverity.Error,
        ).length;
        const info = markers.filter(
          (m) => m.severity === monaco.MarkerSeverity.Info,
        ).length;
        const warning = markers.filter(
          (m) => m.severity === monaco.MarkerSeverity.Warning,
        ).length;

        window.parent.document.getElementById("errors").innerText =
          `❌:${errors} , ⚠️:${warning} ℹ️:${info}`;
      }
    });
    monaco.languages.registerDocumentFormattingEditProvider("javascript" ,
        {
          async  provideDocumentFormattingEdits(model , options , token){
        const formattedCode = await format(model.getValue())
          console.log(formattedCode)
          return [{
            range: model.getFullModelRange(),
            text: formattedCode
          }]}})


    monaco.languages.registerDocumentFormattingEditProvider("typescript" ,
        {
          async  provideDocumentFormattingEdits(model , options , token){
            const formattedCode = await format(model.getValue())
            console.log(formattedCode)
            return [{
              range: model.getFullModelRange(),
              text: formattedCode
            }]}})
    monaco.languages.registerDocumentFormattingEditProvider("json" ,
        {
          async  provideDocumentFormattingEdits(model , options , token){
            const formattedCode = await format(model.getValue())
            console.log(formattedCode)
            return [{
              range: model.getFullModelRange(),
              text: formattedCode
            }]}})
    monaco.languages.registerDocumentFormattingEditProvider("html" ,
        {
          async  provideDocumentFormattingEdits(model , options , token){
            const formattedCode = await format(model.getValue())
            console.log(formattedCode)
            return [{
              range: model.getFullModelRange(),
              text: formattedCode
            }]}})
    monaco.languages.registerDocumentFormattingEditProvider("css" ,
        {
          async  provideDocumentFormattingEdits(model , options , token){
            const formattedCode = await format(model.getValue())
            console.log(formattedCode)
            return [{
              range: model.getFullModelRange(),
              text: formattedCode
            }]}})

    monaco.languages.registerCompletionItemProvider("javascript", {
      // Trigger completions on every letter, number, and common token characters
      triggerCharacters:
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789._-".split(
          "",
        ),

      async provideCompletionItems(model, position) {
        if (!URI) {
          return;
        }
        const res = await sendReqAutocomplete();
        return {
          suggestions: convertCompletionList(monaco, res),
        };
      },
    });
    ["javascript", "typescript"].forEach((lang) => {
      monaco.languages.registerHoverProvider(lang, {
        async provideHover(model, position) {
          if (!URI) return null;
          return await sendReqForHover(model, position);
        },
      });
    });
    monaco.languages.registerCompletionItemProvider("typescript", {
      // Trigger completions on every letter, number, and common token characters
      triggerCharacters:
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789._-".split(
          "",
        ),

      async provideCompletionItems(model, position) {
        if (!URI) {
          return;
        }
        const res = await sendReqAutocomplete();
        return {
          suggestions: convertCompletionList(monaco, res),
        };
      },
    });
    let resolveGTD;

    monaco.languages.registerDefinitionProvider("javascript", {
      async provideDefinition() {
        return await sendReqForGTD();
      }
    });
    //iam asking u
    window.addEventListener("message", (e) => {
      const message = e.data;

      const action = message.action;

      if (action === "set") {
        editor.layout();
        const content = message.content;
        ismodel = message.isdir;
        URI = message.path;
        extension = message.extension;
        window.parent.document.getElementById("language").innerText =
          `.${message.extension}`;
        const isexisting = monaco.editor.getModel(
          monaco.Uri.parse(`id://${URI}`),
        );
        recentmodeluri = `id://${URI}`;
        if (!isexisting) {
          if (ismodel === false) {
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
            editor.setModel(model);
          }
        } else {
          if (message.isspecialchange) {
            isexisting.setValue(message.content);
          } else {
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

        window.parent.postMessage({
          code: editor.getValue(),
          extension: extension,
          language: getLanguagebyExtension(extension),
        });
      } else if (action === "formatset") {
        const edits = message.formattedcode;

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
            });
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
      } else if (action === "deleteallmodels") {
        monaco.editor.getModels().forEach((model) => {
          model.dispose();
        });
      } else if (action === "setMarkers") {
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
        window.parent.postMessage({
          action: "lint",
          code: editor.getValue(),
          extension: extension,
          language: getLanguagebyExtension(extension),
        });
      });
    }
    lint();

    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      enableSchemaRequest: true,
      schemas: [],
    });
  });
};

//jai sri ram
