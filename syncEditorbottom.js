//jai sri ram
export function syncEditorBottom(editorEl, terminalEl) {
    const h = terminalEl.offsetHeight;
    editorEl.style.setProperty('height', `${document.getElementById('middleeditor').offsetHeight - terminalEl.offsetHeight}px`);
    editorEl.style.setProperty('bottom', `${h}px`);
}