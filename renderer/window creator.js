let nextWindowElementId = 0;

function createWindowElement(tagName, idPrefix) {
	const element = document.createElement(tagName);
	element.id = `noferic-${idPrefix}-${++nextWindowElementId}`;
	return element;
}

function installWindowStyles() {
	if (document.getElementById("noferic-window-styles")) return;

	const style = createWindowElement("style", "window-styles");
	style.id = "noferic-window-styles";
	style.textContent = `
		.noferic-window {
			position: fixed;
			left: 50%;
			top: 50%;
			z-index: 1000;
			display: flex;
			flex-direction: column;
			width: min(760px, calc(100vw - 32px));
			height: min(540px, calc(100vh - 32px));
			min-width: 240px;
			min-height: 140px;
			box-sizing: border-box;
			resize: both;
			overflow: auto;
			transform: translate(-50%, -50%);
			border: 1px solid #4c5963;
			background: #1e2329;
			color: #edf2f7;
			box-shadow: 0 18px 50px rgba(0, 0, 0, 0.42);
			font: 13px/1.45 system-ui, sans-serif;
		}
		.noferic-window[hidden] { display: none; }
		.noferic-window__titlebar {
			flex: 0 0 38px;
			display: flex;
			align-items: center;
			gap: 12px;
			padding: 0 10px 0 14px;
			border-bottom: 1px solid #353d45;
			background: #282f36;
			cursor: grab;
			touch-action: none;
			user-select: none;
		}
		.noferic-window__titlebar:active { cursor: grabbing; }
		.noferic-window__heading {
			flex: 1;
			min-width: 0;
			overflow: hidden;
			color: #f2f5f8;
			font-weight: 600;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
		.noferic-window__control {
			border: 1px solid #48535e;
			background: #303941;
			color: #e6edf3;
			font: inherit;
			cursor: pointer;
		}
		.noferic-window__control {
			width: 28px;
			height: 26px;
			padding: 0;
			font-size: 17px;
			line-height: 1;
		}
		.noferic-window__control:hover { background: #3a4650; }
		.noferic-window__content {
			flex: 1 1 auto;
			min-width: 0;
			min-height: 0;
			overflow: auto;
			padding: 12px;
		}
		.noferic-window-manager__item { text-align: left; }
	`;
	document.head.appendChild(style);
}

/**
 * Creates a draggable, resizable window and a manager-list entry for it.
 * @param {{heading?: string, div: HTMLElement, defsize?: {width?: number|string, height?: number|string}}} options
 * @returns {HTMLElement}
 */
export function createWindowinNoferic({ heading = "", div, defsize } = {}) {
	if (!(div instanceof HTMLElement)) {
		throw new TypeError("createWindowinNoferic expects div to be an HTML element");
	}

	const managerList = document.getElementById("window-manager-list");
	if (!managerList) {
		throw new Error('The "window-manager-list" element is missing');
	}

	installWindowStyles();

	const windowElement = createWindowElement("section", "window");
	windowElement.className = "noferic-window";
	if (defsize && typeof defsize === "object") {
		if (defsize.width !== undefined) {
			windowElement.style.width = typeof defsize.width === "number" ? `${defsize.width}px` : defsize.width;
		}
		if (defsize.height !== undefined) {
			windowElement.style.height = typeof defsize.height === "number" ? `${defsize.height}px` : defsize.height;
		}
	}
	windowElement.setAttribute("role", "dialog");
	windowElement.setAttribute("aria-label", heading || "Window");

	const titlebar = createWindowElement("header", "window-titlebar");
	titlebar.className = "noferic-window__titlebar";

	const headingElement = createWindowElement("div", "window-heading");
	headingElement.className = "noferic-window__heading";
	headingElement.textContent = heading;

	const minimizeButton = createWindowElement("button", "window-minimize");
	minimizeButton.className = "noferic-window__control";
	minimizeButton.type = "button";
	minimizeButton.textContent = "−";
	minimizeButton.title = "Minimize window";
	minimizeButton.setAttribute("aria-label", "Minimize window");

	const closeButton = createWindowElement("button", "window-close");
	closeButton.className = "noferic-window__control";
	closeButton.type = "button";
	closeButton.textContent = "×";
	closeButton.title = "Close window";
	closeButton.setAttribute("aria-label", "Close window");

	const content = createWindowElement("div", "window-content");
	content.className = "noferic-window__content";
	content.appendChild(div);
	titlebar.append(headingElement, minimizeButton, closeButton);
	windowElement.append(titlebar, content);

	const managerButton = createWindowElement("button", "window-manager-item");
	managerButton.className = "files noferic-window-manager__item";
	managerButton.type = "button";
	managerButton.textContent = heading || "Window";
	managerButton.title = heading || "Window";
	managerButton.setAttribute("aria-controls", windowElement.id);

	const bringToFront = () => {
		windowElement.style.zIndex = String(++nextWindowElementId + 1000);
	};
	windowElement.addEventListener("pointerdown", bringToFront);

	let dragOffsetX = 0;
	let dragOffsetY = 0;
	titlebar.addEventListener("pointerdown", (event) => {
		if (event.button !== 0 || event.target.closest("button")) return;
		const bounds = windowElement.getBoundingClientRect();
		dragOffsetX = event.clientX - bounds.left;
		dragOffsetY = event.clientY - bounds.top;
		windowElement.style.left = `${bounds.left}px`;
		windowElement.style.top = `${bounds.top}px`;
		windowElement.style.transform = "none";
		titlebar.setPointerCapture(event.pointerId);
		bringToFront();
	});
	titlebar.addEventListener("pointermove", (event) => {
		if (!titlebar.hasPointerCapture(event.pointerId)) return;
		const maxLeft = Math.max(0, window.innerWidth - windowElement.offsetWidth);
		const maxTop = Math.max(0, window.innerHeight - titlebar.offsetHeight);
		windowElement.style.left = `${Math.min(maxLeft, Math.max(0, event.clientX - dragOffsetX))}px`;
		windowElement.style.top = `${Math.min(maxTop, Math.max(0, event.clientY - dragOffsetY))}px`;
	});
	titlebar.addEventListener("pointerup", (event) => {
		if (titlebar.hasPointerCapture(event.pointerId)) titlebar.releasePointerCapture(event.pointerId);
	});
	titlebar.addEventListener("pointercancel", (event) => {
		if (titlebar.hasPointerCapture(event.pointerId)) titlebar.releasePointerCapture(event.pointerId);
	});

	minimizeButton.addEventListener("click", () => {
		windowElement.hidden = true;
		managerButton.setAttribute("aria-expanded", "false");
	});
	closeButton.addEventListener("click", () => {
		windowElement.remove();
		managerButton.remove();
	});
	managerButton.addEventListener("click", () => {
		windowElement.hidden = false;
		managerButton.setAttribute("aria-expanded", "true");
		bringToFront();
	});

	document.body.appendChild(windowElement);
	managerList.appendChild(managerButton);
	managerButton.setAttribute("aria-expanded", "true");
	bringToFront();
	return windowElement;
}