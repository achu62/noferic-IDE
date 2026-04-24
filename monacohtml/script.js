//jai sri ram
window.onload = () => {
	require.config({ paths: { vs: "monaco-editor/package/min/vs" } });

	let editor = null;
	require(["vs/editor/editor.main"], function () {
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
					

		window.addEventListener("message", (e) => {
			const message = e.data;
			const action = message.action;

			if (action === "set") {
				const content = message.content;
				ismodel = message.isdir;
				URI = message.path;
				language = message.language;
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
						URI = null;
						ismodel = false;
					} else {
						const model = monaco.editor.createModel(
							content,
							language,
							monaco.Uri.parse(`id://${URI}`),
						);
						console.log(language)
						editor.setModel(model);
					}
				} else {
					editor.setModel(isexisting);
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
				editor.layout(); // forces Monaco to recalculate and render immediately
			} else if (action === "formatget") {
								let extension = language;

				console.log(language)
				if(extension==="javascript")
				{
					extension= "js"
				}
				else if(extension==="typescript")
				{
					extension= "ts"
				}
				window.parent.postMessage({
					code: editor.getValue(),
					extension: extension,
				});
				console.log(extension)
			} else if (action === "formatset") {
				const formattedcode = message.formattedcode;
				editor.setValue(formattedcode);
			}
		});
	});
	 document.addEventListener("keypress" , (e)=>
  {
    if(e.ctrlKey && e.shiftKey && e.key.toLowerCase()==="f"){
      e.preventDefault();
	  window.parent.document.getElementById('format').click();
    }
  })

};
