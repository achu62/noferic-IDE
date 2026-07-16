//jai sri ram
export function handleDir() {
	const filebutton = document.createElement("button");
	filebutton.id = `${file.id}`;
	filebutton.textContent = `${file.name}`;
	filebutton.classList.add("files");
	filebutton.classList.add("folder");
	filebutton.style.paddingLeft = depth + "px";
	filebutton.title = `${file.id}`;
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
				console.log(findFolderById(globalfolderjson, file.id).children);
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
			filebutton.replaceChildren(`|-${file.name}`, statebtn, icon);
			isopen = false;
			globalfileexplorerstatejson[`${file.id}`] = false;

			e.stopPropagation();
		}
		console.log(globalfileexplorerstatejson);
	});
	space.appendChild(filebutton);
	createfolderdialogbox(
		document.body,
		file.id,
		filebutton,
		dialogforcreatefile,
	);
}

