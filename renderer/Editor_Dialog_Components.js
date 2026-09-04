//jai sri ram

/**
 * Creates and opens a temporary dialog from a small declarative definition.
 * The affirmative callback receives the item values in their displayed order.
 *
 * @param {object} options
 * @param {string} [options.heading]
 * @param {{name?: string, callback?: function}} options.affirmative
 * @param {Array<object>|object} [options.items]
 * @returns {HTMLDialogElement}
 */
export function createDialog(options = {}) {
	if (!options || typeof options !== "object") {
		throw new TypeError("Dialog options must be an object");
	}

	if (!document.querySelector("style[data-editor-dialog-styles]")) {
		const style = document.createElement("style");
		style.dataset.editorDialogStyles = "";
		style.textContent = `
			.editor-dialog-component {
				box-sizing: border-box !important;
				width: min(640px, 92vw) !important;
				min-height: 500px;
				padding: 28px 32px 24px !important;
				border: 1px solid rgba(255, 255, 255, 0.18) !important;
				border-radius: 10px !important;
				background: #202124 !important;
				color: #f1f3f4 !important;
				box-shadow: 0 24px 70px rgba(0, 0, 0, 0.48) !important;
			}
			.editor-dialog-component::backdrop {
				background: rgba(0, 0, 0, 0.62);
				backdrop-filter: blur(2px);
			}
			.editor-dialog-component form {
				display: flex;
				flex-direction: column;
				gap: 24px;
				margin: 0;
			}
			.editor-dialog-component h2 {
				margin: 0;
				font: 600 15px/1.3 system-ui, sans-serif;
				color: #ffffff;
			}
			.editor-dialog-component__content {
				display: flex;
				flex-direction: column;
				gap: 14px;
			}
			.editor-dialog-component__item {
				display: grid;
				grid-template-columns: minmax(110px, 0.32fr) minmax(0, 1fr);
				align-items: center;
				gap: 18px;
				min-height: 38px;
				font: 13px/1.3 system-ui, sans-serif;
				color: #c9cdd1;
				cursor: text;
			}
			.editor-dialog-component__item input:not([type="checkbox"]) {
				box-sizing: border-box;
				width: 100%;
				min-width: 0;
				padding: 9px 11px;
				border: 1px solid #5f6368;
				border-radius: 5px;
				outline: none;
				background: #303134;
				color: #f1f3f4;
				font: 13px system-ui, sans-serif;
			}
			.editor-dialog-component__item input:not([type="checkbox"]):focus {
				border-color: #8ab4f8;
				box-shadow: 0 0 0 2px rgba(138, 180, 248, 0.2);
			}
			.editor-dialog-component__item input[type="checkbox"] {
				width: 17px;
				height: 17px;
				accent-color: #8ab4f8;
				cursor: pointer;
			}
			.editor-dialog-component__actions {
				display: flex;
				justify-content: flex-end;
				gap: 10px;
				margin-top: auto;
			}
			.editor-dialog-component__actions button {
				min-width: 92px;
				padding: 9px 16px;
				border: 1px solid #5f6368;
				border-radius: 5px;
				font: 600 12px system-ui, sans-serif;
				cursor: pointer;
			}
			.editor-dialog-component__actions button[type="button"] {
				background: transparent;
				color: #c9cdd1;
			}
			.editor-dialog-component__actions button[type="submit"] {
				border-color: #8ab4f8;
				background: #8ab4f8;
				color: #202124;
			}
			.editor-dialog-component__actions button:hover {
				filter: brightness(1.12);
			}
			@media (max-width: 520px) {
				.editor-dialog-component {
					width: calc(100vw - 24px) !important;
					padding: 22px 20px 20px !important;
				}
				.editor-dialog-component__item {
					grid-template-columns: 1fr;
					gap: 6px;
				}
			}
		`;
		document.head.appendChild(style);
	}

	const dialog = document.createElement("dialog");
	const form = document.createElement("form");
	const content = document.createElement("div");
	const actions = document.createElement("div");
	const cancel = document.createElement("button");
	const affirmative = document.createElement("button");

	dialog.className = "dialog editor-dialog-component";
	form.method = "dialog";
	content.className = "editor-dialog-component__content";
	actions.className = "editor-dialog-component__actions";

	if (options.heading) {
		const heading = document.createElement("h2");
		heading.textContent = options.heading;
		form.appendChild(heading);
	}

	const items = Array.isArray(options.items)
		? options.items
		: Object.values(options.items || {});
	const controls = [];

	items.forEach((item = {}) => {
		const row = document.createElement("label");
		const type = item.type === "check" ? "checkbox" : "text";
		const control = document.createElement("input");

		row.className = "editor-dialog-component__item";
		control.type = type;
		control.name = item.name || "dialog-item";

		if (type === "checkbox") {
			control.checked = item.checked === undefined
				? Boolean(item.value)
				: Boolean(item.checked);
		} else {
			control.value = item.value == null ? "" : String(item.value);
			if (item.placeholder) control.placeholder = item.placeholder;
		}

		const label = document.createElement("span");
		label.textContent = item.label || item.Label || item.name || "";
		row.append(label, control);
		content.appendChild(row);
		controls.push(control);
	});

	cancel.type = "button";
	cancel.textContent = "Cancel";
	affirmative.type = "submit";
	affirmative.textContent = options.affirmative?.name || "OK";
	actions.append(cancel, affirmative);
	form.append(content, actions);
	dialog.appendChild(form);
	document.body.appendChild(dialog);

	const removeDialog = () => {
		if (dialog.isConnected) dialog.remove();
	};

	cancel.addEventListener("click", () => {
		dialog.close("cancel");
	});
	dialog.addEventListener("close", removeDialog, { once: true });
	form.addEventListener("submit", () => {
		const values = controls.map((control) =>
			control.type === "checkbox" ? control.checked : control.value,
		);
		dialog.close("affirmative");
		if (typeof options.affirmative?.callback === "function") {
			options.affirmative.callback(values);
		}
	});

	dialog.showModal();
	controls[0]?.focus();
	return dialog;
}

export const showDialog = createDialog;
