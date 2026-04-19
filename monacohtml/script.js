//jai sri ram
window.onload = () => {
  require.config({ paths: { 'vs': 'monaco-editor/package/min/vs' } });

  let editor = null;
  require(['vs/editor/editor.main'], function () {
    editor = monaco.editor.create(document.getElementById('editor'), {
      value: "//open folder \n \n or //open file or\n \n //write code mow ",
      language: 'javascript',
      theme: 'vs-dark',
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
      fontFamily: 'JetBrains Mono',
      fontLigatures: true
    });


    let URI = null;
    let ismodel = false;
    window.addEventListener('message', (e) => {
      const message = e.data;
      const action = message.action;

      if (action === 'set') {
        const content = message.content;
        ismodel = message.isdir;
        let language = message.language;
        URI = message.path;
        const isexisting = monaco.editor.getModel(monaco.Uri.parse(`id://${URI}`))
        if (!isexisting) {
          if (language === "js") {
            language = "javascript"
          }
          else if (language === "ts") {
            language = "typescript";
          }
          else {
            language = language;
          }
          if (ismodel == false) {
            // editor.setValue("");
            //editor.setValue(content);
            const model = monaco.editor.createModel(
              content,
              language,
              monaco.Uri.parse(`id://${URI}`)
            );
            editor.setModel(model)
            URI = null;
            ismodel = false;
          }
          else {
            const model = monaco.editor.createModel(
              content,
              language,
              monaco.Uri.parse(`id://${URI}`)
            );
            editor.setModel(model)
          }
        }
        else {
          editor.setModel(isexisting)
        }

      } else if (action === 'get') {
        if (!ismodel) {
          window.parent.postMessage({
            content: editor.getValue(),
            isfolder: false
          }, '*');
        }
        else {
          let contenttosave = monaco.editor.getModel(monaco.Uri.parse(`id://${URI}`));
          contenttosave = contenttosave.getValue();
          window.parent.postMessage({
            content: contenttosave,
            isfolder: true,
            path: `${URI}`,
          }, '*')

        }
      }
      else if (action === 'layout') {
        editor.layout(); // forces Monaco to recalculate and render immediately
      }
    });
  });
}
