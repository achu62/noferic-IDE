const TOPBAR_CONTAINER_ID = "topbarforeditor";

function createTopbarTab({
	iframe,	
	filePath,
	fileName,
	content,
	extension,
}) {
	const existingTab = document.getElementById(`topbarelementfor${decodeURIComponent(filePath)}`);
	if (existingTab) {
		existingTab.click();
		return;

	}

	const topbarElement = document.createElement("button");
	topbarElement.classList.add("class__topelements");
	topbarElement.id = `topbarelementfor${decodeURIComponent(filePath)}`;
	topbarElement.style.paddingLeft = "3px";
	topbarElement.textContent = fileName;
	topbarElement.title = filePath;

	topbarElement.addEventListener("click", (event) => {
		event.stopPropagation();
		iframe.contentWindow.postMessage(
			{
				action: "set",
				content,
				isdir: false,
				extension,
				path: decodeURIComponent(filePath),
			},
			"*",
		);
		iframe.contentWindow.postMessage(["layout"], "*");
	});

	const topbarContainer = document.getElementById(TOPBAR_CONTAINER_ID);
	topbarContainer?.appendChild(topbarElement);

	const topbarCloseBtn = document.createElement("button");
	topbarCloseBtn.classList.add("topbarclose_class");
	topbarCloseBtn.id = `topbarelementclosefor${decodeURIComponent(filePath)}`;
	topbarCloseBtn.addEventListener("click", (event) => {
		event.stopPropagation();
		topbarElement?.remove();
		iframe.contentWindow.postMessage({
			action: "deletemodelonclose",
			path: decodeURIComponent(filePath),
		});
	});

	topbarElement.appendChild(topbarCloseBtn);
	topbarElement.click();
}

export async function openFileFromExplorer({ iframe, file }) {
	console.log(file)
	const filePath = file.id;
	const content = await window.ipc.invoke("read", filePath);
	const extension = (await window.ipc.invoke("get-ext", filePath)).replace(
		".",
		"",
	);
	if(extension === "exe" || extension === "png" || extension === "bin" || extension === "deb" || 
		extension === "ico" || extension === "jpg" || extension === "jpeg" || extension === "rpm" || 
		extension === "msi" || extension === "pak" || extension === "dll" || extension === "ttf" 
	){
		const confirmation = confirm("this file might not be opened correctly with the editor , \nDo  you still want to open it")
		if(!confirmation) {return}
	}
	createTopbarTab({
		iframe,
		filePath,
		fileName: file.name,
		content,
		extension,
	});
}
