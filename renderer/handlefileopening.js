const TOPBAR_CONTAINER_ID = "topbarforeditor";

function createTopbarTab({
	iframe,
	
	filePath,
	fileName,
	content,
	extension,
}) {
	const existingTab = document.getElementById(`topbarelementfor${filePath}`);
	if (existingTab) {
		existingTab.click();
		return;

	}

	const topbarElement = document.createElement("button");
	topbarElement.classList.add("class__topelements");
	topbarElement.id = `topbarelementfor${filePath}`;
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
				path: filePath,
			},
			"*",
		);
		iframe.contentWindow.postMessage(["layout"], "*");
	});

	const topbarContainer = document.getElementById(TOPBAR_CONTAINER_ID);
	topbarContainer?.appendChild(topbarElement);

	const topbarCloseBtn = document.createElement("button");
	topbarCloseBtn.classList.add("topbarclose_class");
	topbarCloseBtn.id = `topbarelementclosefor${filePath}`;
	topbarCloseBtn.addEventListener("click", (event) => {
		event.stopPropagation();
		topbarElement?.remove();
		iframe.contentWindow.postMessage({
			action: "deletemodelonclose",
			path: filePath,
		});
	});

	topbarElement.appendChild(topbarCloseBtn);
	topbarElement.click();
}

export async function openFileFromExplorer({ iframe, file }) {
	const filePath = file.id;
	const content = await window.ipc.invoke("read", filePath);
	const extension = (await window.ipc.invoke("get-ext", filePath)).replace(
		".",
		"",
	);

	createTopbarTab({
		iframe,
		filePath,
		fileName: file.name,
		content,
		extension,
	});
}
