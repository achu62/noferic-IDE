const NOFERIC_UI_THEME = {
  base: "#1e1e2e",
  baseSoft: "#202236",
  panel: "#11131d",
  panelAlt: "#1b1d2a",
  accent: "#7da4ff",
  accentSoft: "rgba(125, 164, 255, 0.2)",
  border: "#363b4f",
  text: "#edf3ff",
  muted: "#b6c3d9",
  warn: "#ffca6e",
  danger: "#ff7d7d",
  shadow: "rgba(0, 0, 0, 0.5)",
};

/** @typedef {Object} OptionPickerItem
 * @property {string} [label] Preferred visible option text.
 * @property {string} [text] Alternate visible option text.
 * @property {string} [name] Fallback visible option text.
 * @property {(event: MouseEvent, option: OptionPickerItem) => void} [onSelect] Selection handler; takes precedence over `callback`.
 * @property {(event: MouseEvent, option: OptionPickerItem) => void} [callback] Alternate selection handler.
 */
/** @typedef {Object} DialogSelectOption
 * @property {string|number} [value] Submitted value; defaults to the option itself when omitted.
 * @property {string} [label] Preferred displayed label.
 * @property {string} [text] Alternate displayed label.
 * @property {boolean} [disabled] Whether this choice is disabled.
 * @property {boolean} [selected] Whether this choice is initially selected.
 */
/** @typedef {Object} DialogItem
 * @property {"text"|"check"|"select"|"textarea"} [type="text"] Control type.
 * @property {string} [name] Control name.
 * @property {string} [label] Visible label.
 * @property {string} [Label] Legacy alternative to `label`.
 * @property {string|number|boolean} [value] Initial control value.
 * @property {boolean} [checked] Initial checkbox state; takes precedence over `value`.
 * @property {string} [placeholder] Placeholder text for text and textarea controls.
 * @property {Array<string|DialogSelectOption>} [options] Choices for a select control.
 */
/** @typedef {Object} DialogAffirmativeOptions
 * @property {string} [name="OK"] Affirmative button label.
 * @property {(values: Array<string|boolean>) => void} [callback] Called with submitted values in item order; checkbox values are booleans.
 */
/** @typedef {Object} OptionPickerHandle
 * @property {HTMLElement} element Picker overlay element.
 * @property {() => void} close Removes the picker and calls its `onClose` callback.
 */
/** @typedef {Object} LoaderHandle
 * @property {HTMLElement} element Loader overlay element.
 * @property {(nextTitle: string) => string} setTitle Updates and returns the normalized title.
 * @property {(nextSubtitle: string) => string} setSubtitle Updates and returns the normalized subtitle.
 * @property {() => void} close Removes the loader overlay.
 */

let nextWindowElementId = 0;

function createWindowElement(tagName, idPrefix) {
  const element = document.createElement(tagName);
  element.id = `noferic-${idPrefix}-${++nextWindowElementId}`;
  return element;
}

function ensureUiStyles(id, css) {
  if (!document || document.getElementById(id)) return;
  const style = document.createElement("style");
  style.id = id;
  style.textContent = css;
  document.head.appendChild(style);
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
      border: 1px solid ${NOFERIC_UI_THEME.border};
      border-radius: 0;
      background: ${NOFERIC_UI_THEME.base};
      color: ${NOFERIC_UI_THEME.text};
      box-shadow: 0 18px 50px ${NOFERIC_UI_THEME.shadow};
      font: 13px/1.45 system-ui, sans-serif;
    }
    .noferic-window[hidden] { display: none; }
    .noferic-window__titlebar {
      flex: 0 0 28px;
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 0 8px;
      border-bottom: 1px solid ${NOFERIC_UI_THEME.border};
      background: ${NOFERIC_UI_THEME.panel};
      cursor: grab;
      touch-action: none;
      user-select: none;
    }
    .noferic-window__titlebar:active { cursor: grabbing; }
    .noferic-window__heading {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      color: ${NOFERIC_UI_THEME.text};
      font-weight: 600;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .noferic-window__control {
      width: 18px;
      height: 18px;
      padding: 0;
      border: 1px solid ${NOFERIC_UI_THEME.border};
      background: ${NOFERIC_UI_THEME.baseSoft};
      color: ${NOFERIC_UI_THEME.text};
      font: inherit;
      font-size: 12px;
      line-height: 1;
      cursor: pointer;
      border-radius: 0;
    }
    .noferic-window__control:hover { background: ${NOFERIC_UI_THEME.panelAlt}; }
    .noferic-window__content {
      flex: 1 1 auto;
      min-width: 0;
      min-height: 0;
      overflow: auto;
      padding: 6px;
      background: ${NOFERIC_UI_THEME.base};
    }
    .noferic-window-manager__item {
      text-align: left;
      border-radius: 0;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Creates a draggable, resizable window and adds a restore control to the window manager.
 * @param {Object} [options] Window configuration.
 * @param {string} [options.heading=""] Window title and accessible label.
 * @param {HTMLElement} options.div Element to place inside the window.
 * @param {Object} [options.defsize] Initial window dimensions.
 * @param {number|string} [options.defsize.width] Width in pixels or a CSS width value.
 * @param {number|string} [options.defsize.height] Height in pixels or a CSS height value.
 * @returns {HTMLElement} The created window element.
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

/**
 * Opens a modal list of selectable options.
 * @param {Object} [options] Picker configuration.
 * @param {string} [options.heading=""] Heading shown above the options.
 * @param {OptionPickerItem[]} [options.options=[]] Option entries. Each entry may define `label`, `text`, or `name` as its visible text.
 * @param {boolean} [options.closeOnSelect=true] Whether selecting an option closes the picker.
 * @param {Function} [options.onClose] Called when the picker closes by any supported close action.
 * @param {boolean} [options.showCloseButton=true] Whether to show the title-bar close button.
 * @param {boolean} [options.allowDismiss=true] Whether users may dismiss without choosing an option. When false, the close button, Escape key, and backdrop dismissal are disabled.
 * @param {number|string} [options.width=420] Width in pixels or a CSS width value.
 * @param {string} [options.maxHeight="76vh"] Maximum height as a CSS value.
 * @param {string} [options.closeButtonText="×"] Text shown in the close button.
 * @returns {OptionPickerHandle} The overlay element and a function to close the picker.
 */
export function createOptionPicker({
  heading = "",
  options = [],
  closeOnSelect = true,
  onClose,
  showCloseButton = true,
  allowDismiss = true,
  width = 420,
  maxHeight = "76vh",
  closeButtonText = "×",
} = {}) {
  const overlay = document.createElement("div");
  overlay.className = "noferic-option-picker__overlay";

  const menu = document.createElement("section");
  menu.className = "noferic-option-picker";
  menu.style.width = typeof width === "number" ? `min(${width}px, calc(100vw - 32px))` : width;
  menu.style.maxHeight = maxHeight;

  const title = document.createElement("div");
  title.className = "noferic-option-picker__title";
  title.textContent = heading || "Select an option";

  const body = document.createElement("div");
  body.className = "noferic-option-picker__body";

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "noferic-option-picker__close";
  closeButton.textContent = closeButtonText;

  function close() {
    overlay.remove();
    document.removeEventListener("keydown", handleKeydown);
    if (typeof onClose === "function") onClose();
  }

  function handleKeydown(event) {
    if (allowDismiss && event.key === "Escape") close();
  }

  if (allowDismiss && showCloseButton !== false) {
    closeButton.addEventListener("click", close);
    title.appendChild(closeButton);
  }
  document.addEventListener("keydown", handleKeydown);

  overlay.addEventListener("click", (event) => {
    if (allowDismiss && event.target === overlay) close();
  });

  const rows = Array.isArray(options) ? options : [];
  rows.forEach((option = {}) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "noferic-option-picker__item";
    item.textContent = option.label ?? option.text ?? option.name ?? "Option";
    item.addEventListener("click", (event) => {
      try {
        if (typeof option.onSelect === "function") option.onSelect(event, option);
        else if (typeof option.callback === "function") option.callback(event, option);
      } finally {
        if (closeOnSelect !== false) close();
      }
    });
    body.appendChild(item);
  });

  ensureUiStyles("noferic-option-picker-styles", `
    .noferic-option-picker__overlay {
      position: fixed;
      inset: 0;
      z-index: 1000000;
      display: grid;
      place-items: center;
      background: rgba(0, 0, 0, 0.64);
      padding: 20px;
    }
    .noferic-option-picker {
      display: flex;
      flex-direction: column;
      background: ${NOFERIC_UI_THEME.base};
      border: 1px solid ${NOFERIC_UI_THEME.border};
      border-radius: 0;
      box-shadow: 0 20px 50px ${NOFERIC_UI_THEME.shadow};
      color: ${NOFERIC_UI_THEME.text};
      font: 13px/1.4 system-ui, sans-serif;
      box-sizing: border-box;
      overflow: hidden;
    }
    .noferic-option-picker__title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 12px 14px 10px;
      border-bottom: 1px solid ${NOFERIC_UI_THEME.border};
      background: ${NOFERIC_UI_THEME.panel};
      font-weight: 600;
    }
    .noferic-option-picker__close {
      width: 28px;
      height: 28px;
      border: 1px solid ${NOFERIC_UI_THEME.border};
      background: ${NOFERIC_UI_THEME.baseSoft};
      color: ${NOFERIC_UI_THEME.text};
      cursor: pointer;
      border-radius: 0;
      flex: 0 0 auto;
    }
    .noferic-option-picker__body {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 10px;
      background: ${NOFERIC_UI_THEME.base};
      overflow: auto;
    }
    .noferic-option-picker__item {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid transparent;
      background: transparent;
      color: ${NOFERIC_UI_THEME.text};
      text-align: left;
      cursor: pointer;
      border-radius: 0;
      font: inherit;
    }
    .noferic-option-picker__item:hover,
    .noferic-option-picker__item:focus-visible {
      background: ${NOFERIC_UI_THEME.baseSoft};
      border-color: ${NOFERIC_UI_THEME.border};
      outline: none;
    }
  `);

  menu.append(title, body);
  overlay.append(menu);
  document.body.appendChild(overlay);

  return {
    element: overlay,
    close,
  };
}

/**
 * Opens an unskippable option picker and waits for the user to choose an option.
 * Option callbacks run before the returned promise resolves.
 * @param {Object} [options] Picker configuration; supports the same display options as {@link createOptionPicker}.
 * @param {OptionPickerItem[]} [options.options=[]] Choices that resolve the promise when selected.
 * @returns {Promise<OptionPickerItem>} Resolves with the selected option object, or rejects if its callback throws.
 */
export function blockingOptionPicker({ options = [], ...pickerOptions } = {}) {
  if (!Array.isArray(options) || options.length === 0) {
    return Promise.reject(new TypeError("blockingOptionPicker requires at least one option"));
  }

  return new Promise((resolve, reject) => {
    createOptionPicker({
      ...pickerOptions,
      options: options.map((option = {}) => ({
        ...option,
        async onSelect(event) {
          try {
            if (typeof option.onSelect === "function") await option.onSelect(event, option);
            else if (typeof option.callback === "function") await option.callback(event, option);
            resolve(option);
          } catch (error) {
            reject(error);
          }
        },
      })),
      closeOnSelect: true,
      showCloseButton: false,
      allowDismiss: false,
    });
  });
}

/**
 * Creates a blocking loading overlay.
 * @param {Object} [options] Loader configuration.
 * @param {string} [options.title="Loading"] Main loading message.
 * @param {string} [options.subtitle=""] Secondary loading message.
 * @param {HTMLElement} [options.parent=document.body] Element to which the overlay is appended.
 * @returns {LoaderHandle} Loader element and controls.
 */
export function createLoader({ title = "Loading", subtitle = "", parent = document.body } = {}) {
  const host = document.createElement("div");
  const panel = document.createElement("div");
  const label = document.createElement("div");
  const subLabel = document.createElement("div");
  const spinner = document.createElement("div");

  host.className = "noferic-loader";
  panel.className = "noferic-loader__panel";
  label.className = "noferic-loader__title";
  subLabel.className = "noferic-loader__subtitle";
  spinner.className = "noferic-loader__spinner";

  label.textContent = title;
  subLabel.textContent = subtitle;

  panel.append(spinner, label, subLabel);
  host.appendChild(panel);
  parent.appendChild(host);

  ensureUiStyles("noferic-loader-styles", `
    .noferic-loader {
      position: fixed;
      inset: 0;
      z-index: 99999;
      display: grid;
      place-items: center;
      background: rgba(0, 0, 0, 0.56);
    }
    .noferic-loader__panel {
      display: flex;
      align-items: center;
      gap: 14px;
      min-width: min(420px, calc(100vw - 32px));
      padding: 16px 20px;
      background: ${NOFERIC_UI_THEME.base};
      border: 1px solid ${NOFERIC_UI_THEME.border};
      border-radius: 0;
      box-shadow: 0 12px 40px ${NOFERIC_UI_THEME.shadow};
    }
    .noferic-loader__spinner {
      width: 18px;
      height: 18px;
      border: 2px solid ${NOFERIC_UI_THEME.border};
      border-top-color: ${NOFERIC_UI_THEME.accent};
      animation: noferic-loader-spin 0.7s linear infinite;
      border-radius: 0;
      flex: 0 0 auto;
    }
    .noferic-loader__title {
      color: ${NOFERIC_UI_THEME.text};
      font: 600 13px/1.4 system-ui, sans-serif;
    }
    .noferic-loader__subtitle {
      color: ${NOFERIC_UI_THEME.muted};
      font: 12px/1.4 system-ui, sans-serif;
    }
    @keyframes noferic-loader-spin {
      to { transform: rotate(360deg); }
    }
  `);

  return {
    element: host,
    setTitle(nextTitle) {
      const val = String(nextTitle ?? "");
      label.textContent = val || title;
      return val;
    },
    setSubtitle(nextSubtitle) {
      const val = String(nextSubtitle ?? "");
      subLabel.textContent = val || subtitle;
      return val;
    },
    close() {
      host.remove();
    },
  };
}

/**
 * Opens a form dialog and invokes its affirmative callback with submitted control values.
 * @param {Object} [options] Dialog configuration.
 * @param {string} [options.heading] Optional dialog heading.
 * @param {DialogItem[]|Object<string, DialogItem>} [options.items] Input definitions, either an array or an object whose values are input definitions.
 * @param {DialogAffirmativeOptions} [options.affirmative] Affirmative button configuration.
 * @returns {HTMLDialogElement} The opened native dialog element.
 */
export function createDialog(options = {}) {
  if (!options || typeof options !== "object") {
    throw new TypeError("Dialog options must be an object");
  }

  ensureUiStyles("noferic-dialog-styles", `
    .noferic-dialog-component {
      box-sizing: border-box !important;
      width: min(640px, 92vw) !important;
      min-height: 500px;
      padding: 22px 24px 18px !important;
      border: 1px solid ${NOFERIC_UI_THEME.border} !important;
      border-radius: 0 !important;
      background: ${NOFERIC_UI_THEME.base} !important;
      color: ${NOFERIC_UI_THEME.text} !important;
      box-shadow: 0 24px 70px ${NOFERIC_UI_THEME.shadow} !important;
    }
    .noferic-dialog-component::backdrop {
      background: rgba(0, 0, 0, 0.68);
      backdrop-filter: blur(2px);
    }
    .noferic-dialog-component form {
      display: flex;
      flex-direction: column;
      gap: 22px;
      margin: 0;
    }
    .noferic-dialog-component h2 {
      margin: 0;
      font: 600 15px/1.3 system-ui, sans-serif;
      color: ${NOFERIC_UI_THEME.text};
    }
    .noferic-dialog-component__content {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .noferic-dialog-component__item {
      display: grid;
      grid-template-columns: minmax(110px, 0.32fr) minmax(0, 1fr);
      align-items: center;
      gap: 18px;
      min-height: 38px;
      font: 13px/1.3 system-ui, sans-serif;
      color: ${NOFERIC_UI_THEME.muted};
      cursor: text;
    }
    .noferic-dialog-component__item input:not([type="checkbox"]),
    .noferic-dialog-component__item select,
    .noferic-dialog-component__item textarea {
      box-sizing: border-box;
      width: 100%;
      min-width: 0;
      padding: 9px 11px;
      border: 1px solid ${NOFERIC_UI_THEME.border};
      border-radius: 0;
      outline: none;
      background: ${NOFERIC_UI_THEME.baseSoft};
      color: ${NOFERIC_UI_THEME.text};
      font: 13px system-ui, sans-serif;
    }
    .noferic-dialog-component__item input:not([type="checkbox"]):focus,
    .noferic-dialog-component__item select:focus,
    .noferic-dialog-component__item textarea:focus {
      border-color: ${NOFERIC_UI_THEME.accent};
      box-shadow: 0 0 0 2px ${NOFERIC_UI_THEME.accentSoft};
    }
    .noferic-dialog-component__item input[type="checkbox"] {
      width: 17px;
      height: 17px;
      accent-color: ${NOFERIC_UI_THEME.accent};
      cursor: pointer;
    }
    .noferic-dialog-component__actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: auto;
    }
    .noferic-dialog-component__actions button {
      min-width: 92px;
      padding: 9px 16px;
      border: 1px solid ${NOFERIC_UI_THEME.border};
      border-radius: 0;
      font: 600 12px system-ui, sans-serif;
      cursor: pointer;
    }
    .noferic-dialog-component__actions button[type="button"] {
      background: transparent;
      color: ${NOFERIC_UI_THEME.muted};
    }
    .noferic-dialog-component__actions button[type="submit"] {
      border-color: ${NOFERIC_UI_THEME.accent};
      background: ${NOFERIC_UI_THEME.accent};
      color: ${NOFERIC_UI_THEME.base};
    }
    .noferic-dialog-component__actions button:hover {
      filter: brightness(1.12);
    }
    @media (max-width: 520px) {
      .noferic-dialog-component {
        width: calc(100vw - 24px) !important;
        padding: 20px 18px 16px !important;
      }
      .noferic-dialog-component__item {
        grid-template-columns: 1fr;
        gap: 6px;
      }
    }
  `);

  const dialog = document.createElement("dialog");
  const form = document.createElement("form");
  const content = document.createElement("div");
  const actions = document.createElement("div");
  const cancel = document.createElement("button");
  const affirmative = document.createElement("button");

  dialog.className = "dialog noferic-dialog-component";
  form.method = "dialog";
  content.className = "noferic-dialog-component__content";
  actions.className = "noferic-dialog-component__actions";

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
    const controlType = item.type === "check" ? "checkbox" : item.type === "select" ? "select" : item.type === "textarea" ? "textarea" : "text";
    const control = document.createElement(controlType === "textarea" ? "textarea" : controlType === "select" ? "select" : "input");

    row.className = "noferic-dialog-component__item";
    control.name = item.name || "dialog-item";

    if (controlType === "checkbox") {
      control.type = "checkbox";
      control.checked = item.checked === undefined ? Boolean(item.value) : Boolean(item.checked);
    } else if (controlType === "select") {
      const values = Array.isArray(item.options) ? item.options : [];
      values.forEach((option) => {
        const opt = document.createElement("option");
        opt.value = String(option.value ?? option);
        opt.textContent = String(option.label ?? option.text ?? option.value ?? option);
        if (option.disabled) opt.disabled = true;
        if (option.selected || (item.value !== undefined && String(option.value ?? option) === String(item.value))) {
          opt.selected = true;
        }
        control.appendChild(opt);
      });
      if (item.value !== undefined && !values.some((option) => String(option.value ?? option) === String(item.value))) {
        control.value = String(item.value);
      }
    } else if (controlType === "textarea") {
      control.value = item.value == null ? "" : String(item.value);
      if (item.placeholder) control.placeholder = item.placeholder;
    } else {
      control.type = "text";
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
    const values = controls.map((control) => {
      if (control.type === "checkbox") return control.checked;
      return control.value;
    });
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

/**
 * Shows a simple alert-style modal and resolves when it is dismissed.
 * @param {Object} [options] Alert configuration.
 * @param {string} [options.heading="Alert"] Dialog heading and accessible label.
 * @param {string} [options.message=""] Alert message; line breaks are preserved.
 * @param {string} [options.buttonText="OK"] Dismiss button label.
 * @returns {Promise<string>} Resolves to the dialog return value (`"ok"` for the button).
 */
export function showAlertDialog({ heading = "Alert", message = "", buttonText = "OK" } = {}) {
  ensureUiStyles("noferic-alert-dialog-styles", `
    .noferic-alert-dialog {
      box-sizing: border-box;
      width: min(440px, calc(100vw - 32px));
      max-height: min(80vh, 520px);
      padding: 0;
      border: 1px solid ${NOFERIC_UI_THEME.border};
      border-radius: 0;
      background: ${NOFERIC_UI_THEME.base};
      color: ${NOFERIC_UI_THEME.text};
      box-shadow: 0 20px 50px ${NOFERIC_UI_THEME.shadow};
      font: 13px/1.5 system-ui, sans-serif;
    }
    .noferic-alert-dialog::backdrop {
      background: rgba(0, 0, 0, 0.68);
    }
    .noferic-alert-dialog__form {
      display: flex;
      flex-direction: column;
      max-height: inherit;
    }
    .noferic-alert-dialog__heading {
      margin: 0;
      padding: 14px 16px;
      border-bottom: 1px solid ${NOFERIC_UI_THEME.border};
      background: ${NOFERIC_UI_THEME.panel};
      font-size: 14px;
      font-weight: 600;
    }
    .noferic-alert-dialog__message {
      overflow: auto;
      padding: 18px 16px;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }
    .noferic-alert-dialog__actions {
      display: flex;
      justify-content: flex-end;
      padding: 0 16px 16px;
    }
    .noferic-alert-dialog__button {
      min-width: 88px;
      padding: 8px 14px;
      border: 1px solid ${NOFERIC_UI_THEME.accent};
      border-radius: 0;
      background: ${NOFERIC_UI_THEME.accent};
      color: ${NOFERIC_UI_THEME.base};
      font: 600 12px system-ui, sans-serif;
      cursor: pointer;
    }
    .noferic-alert-dialog__button:focus-visible {
      outline: 2px solid ${NOFERIC_UI_THEME.text};
      outline-offset: 2px;
    }
  `);

  const dialog = document.createElement("dialog");
  const form = document.createElement("form");
  const title = document.createElement("h2");
  const messageElement = document.createElement("div");
  const actions = document.createElement("div");
  const button = document.createElement("button");

  dialog.className = "noferic-alert-dialog";
  dialog.setAttribute("aria-label", heading || "Alert");
  form.className = "noferic-alert-dialog__form";
  form.method = "dialog";
  title.className = "noferic-alert-dialog__heading";
  title.textContent = heading || "Alert";
  messageElement.className = "noferic-alert-dialog__message";
  messageElement.textContent = String(message ?? "");
  actions.className = "noferic-alert-dialog__actions";
  button.className = "noferic-alert-dialog__button";
  button.type = "submit";
  button.value = "ok";
  button.textContent = buttonText || "OK";

  actions.appendChild(button);
  form.append(title, messageElement, actions);
  dialog.appendChild(form);
  document.body.appendChild(dialog);

  return new Promise((resolve) => {
    dialog.addEventListener("cancel", (event) => event.preventDefault());
    dialog.addEventListener("close", () => {
      dialog.remove();
      resolve(dialog.returnValue || "ok");
    }, { once: true });
    dialog.showModal();
    button.focus();
  });
}

/**
 * Opens an alert dialog and waits until the user acknowledges it.
 * @param {Object} [options] Alert configuration; supports the same properties as {@link showAlertDialog}.
 * @returns {Promise<string>} Resolves with the dialog return value after the user presses the button.
 */
export function blockingAlertDialog(options = {}) {
  return showAlertDialog(options);
}

class IDEComponentApi {
  static notificationRootId = "ide-notification-root";

  static ensureNotificationRoot() {
    let root = document.getElementById(this.notificationRootId);

    if (!root) {
      root = document.createElement("div");
      root.id = this.notificationRootId;
      root.setAttribute("aria-live", "polite");
      root.setAttribute("aria-atomic", "true");
      document.body.appendChild(root);
    }

    return root;
  }

  /**
   * Returns inline SVG markup for a supported notification type.
   * @param {string} [type="normie"] Notification type: `success`, `error`, `warning`, `info`, or `normie`.
   * @returns {string} SVG markup, or an empty string when the type has no icon.
   */
  static getIconMarkup(type = "normie") {
    const normalizedType = String(type ?? "normie").toLowerCase();

    if (normalizedType === "success") {
      return `
        <svg viewBox="0 0 24 24" class="ide-notification__svg" aria-hidden="true">
          <circle cx="12" cy="12" r="9"></circle>
          <path d="M8.2 12.5l2.5 2.6 5.1-6"></path>
        </svg>
      `;
    }

    if (normalizedType === "error") {
      return `
        <svg viewBox="0 0 24 24" class="ide-notification__svg" aria-hidden="true">
          <circle cx="12" cy="12" r="9"></circle>
          <path d="M8.5 8.5l7 7M15.5 8.5l-7 7"></path>
        </svg>
      `;
    }

    if (normalizedType === "warning") {
      return `
        <svg viewBox="0 0 24 24" class="ide-notification__svg" aria-hidden="true">
          <path d="M12 4.5l8.5 15H3.5L12 4.5z"></path>
          <path d="M12 9.2v4.5"></path>
          <circle cx="12" cy="16.6" r="0.8" fill="currentColor" stroke="none"></circle>
        </svg>
      `;
    }

    if (normalizedType === "info") {
      return `
        <svg viewBox="0 0 24 24" class="ide-notification__svg" aria-hidden="true">
          <circle cx="12" cy="12" r="9"></circle>
          <path d="M12 11v5"></path>
          <circle cx="12" cy="7.8" r="0.8" fill="currentColor" stroke="none"></circle>
        </svg>
      `;
    }

    return "";
  }

  /**
   * Displays a dismissible notification toast.
   * @param {*} message Content displayed in the toast.
   * @param {Object} [options] Notification configuration.
   * @param {number} [options.duration=900] Auto-dismiss delay in milliseconds.
   * @param {string} [options.type="normie"] Notification type: `success`, `error`, `warning`, `info`, or `normie`.
   * @returns {{element: HTMLElement, close: Function}} Toast element and a function to dismiss it.
   */
  static ShowNotification(message, options = {}) {
    const text = String(message ?? "");
    const duration = Number.isFinite(options.duration) ? options.duration : 900;
    const type = String(options.type ?? "normie").toLowerCase();
    const root = this.ensureNotificationRoot();

    const toast = document.createElement("div");
    const normalizedType = type === "info" ? "normie" : type;
    toast.className = `ide-notification ide-notification--${normalizedType}`;

    const iconMarkup = this.getIconMarkup(type);
    const closeButton = `
      <button type="button" class="ide-notification__close" aria-label="Close notification">
        ×
      </button>
    `;

    toast.innerHTML = `
      <div class="ide-notification__body">
        ${iconMarkup ? `<div class="ide-notification__icon-wrap">${iconMarkup}</div>` : ""}
        <div class="ide-notification__content">${text}</div>
        ${closeButton}
      </div>
    `;

    ensureUiStyles("noferic-notification-styles", `
      #ide-notification-root {
        position: fixed;
        right: 18px;
        bottom: 18px;
        z-index: 200000;
        display: flex;
        flex-direction: column;
        gap: 10px;
        pointer-events: none;
      }
      .ide-notification {
        width: min(340px, calc(100vw - 28px));
        pointer-events: auto;
        background: ${NOFERIC_UI_THEME.base};
        border: 1px solid ${NOFERIC_UI_THEME.border};
        border-radius: 0;
        box-shadow: 0 12px 36px ${NOFERIC_UI_THEME.shadow};
        color: ${NOFERIC_UI_THEME.text};
        overflow: hidden;
        transform: translateY(10px);
        opacity: 0;
        transition: opacity 0.2s ease, transform 0.2s ease;
      }
      .ide-notification--visible {
        opacity: 1;
        transform: translateY(0);
      }
      .ide-notification--hidden {
        opacity: 0;
        transform: translateY(8px);
      }
      .ide-notification__body {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 14px;
      }
      .ide-notification__icon-wrap {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
        color: ${NOFERIC_UI_THEME.accent};
        flex: 0 0 auto;
      }
      .ide-notification__svg {
        width: 18px;
        height: 18px;
        stroke: currentColor;
        fill: none;
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
      .ide-notification__content {
        flex: 1;
        min-width: 0;
        white-space: normal;
        word-break: break-word;
      }
      .ide-notification__close {
        appearance: none;
        border: 1px solid ${NOFERIC_UI_THEME.border};
        background: ${NOFERIC_UI_THEME.baseSoft};
        color: ${NOFERIC_UI_THEME.text};
        width: 22px;
        height: 22px;
        padding: 0;
        cursor: pointer;
        border-radius: 0;
      }
    `);

    root.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add("ide-notification--visible");
    });

    const hide = () => {
      toast.classList.remove("ide-notification--visible");
      toast.classList.add("ide-notification--hidden");

      setTimeout(() => {
        toast.remove();
        if (!root.childElementCount) {
          root.remove();
        }
      }, 220);
    };

    const timer = setTimeout(hide, duration);

    const closeTrigger = toast.querySelector(".ide-notification__close");
    if (closeTrigger) {
      closeTrigger.addEventListener("click", (event) => {
        event.stopPropagation();
        clearTimeout(timer);
        hide();
      });
    }

    toast.addEventListener("click", () => {
      clearTimeout(timer);
      hide();
    });

    return {
      element: toast,
      close: () => {
        clearTimeout(timer);
        hide();
      },
    };
  }

  /**
   * Opens an alert-style modal.
   * @param {Object} [options] See {@link showAlertDialog} for supported properties.
   * @returns {Promise<string>} Resolves when the alert is dismissed.
   */
  static ShowAlert(options = {}) {
    return showAlertDialog(options);
  }

  /**
   * Opens an alert dialog and waits until the user acknowledges it.
   * @param {Object} [options] Alert configuration; supports the same properties as {@link showAlertDialog}.
   * @returns {Promise<string>} Resolves with the dialog return value after the user presses the button.
   */
  static BlockingAlert(options = {}) {
    return blockingAlertDialog(options);
  }
}

export { IDEComponentApi };
export default {
  createWindowinNoferic,
  createOptionPicker,
  blockingOptionPicker,
  createLoader,
  createDialog,
  showDialog,
  showAlertDialog,
  blockingAlertDialog,
  IDEComponentApi,
};
