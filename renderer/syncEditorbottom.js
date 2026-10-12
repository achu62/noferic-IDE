//jai sri ram
export function syncEditorBottom(editorEl, terminalEl , iframe) {
    const h = terminalEl.offsetHeight;
    editorEl.style.position = 'absolute';
    editorEl.style.setProperty('height', `${(document.getElementById('middleeditor').offsetHeight - terminalEl.offsetHeight)-30}px`);
    //editorEl.style.setProperty('top', `${30}px`);
    editorEl.style.setProperty('bottom', `${h+10}px`);
    editorEl.style.setProperty('width', `100%`);
    if(iframe) iframe.contentWindow.postMessage(
        {
            action: "layout"
        },
        "*",
    );
}