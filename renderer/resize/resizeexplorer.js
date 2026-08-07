//jai sri ram
export function resizeexplorer(element) {
    const workspace =
        document.getElementById('workspace');
    let isresizing = false;
    let startX = 0;
    let startwidth = 0;
    let startright = 0;
    const editor = document.getElementById('middleeditor');
    const preview = document.getElementById('preview');

    element.addEventListener('mousedown', (e) => {
        isresizing = true;
        startX = e.clientX;
        startwidth = element.offsetWidth;
        startright = workspace.offsetWidth - (preview.offsetWidth + editor.offsetWidth);
        document.body.style.cursor = 'ew-resize';
    })
    element.addEventListener('mousemove', (e) => {
        if (!isresizing) { return };
        const delta = e.clientX - startX;
        element.style.right = (startright - delta) + 'px';
        element.style.width = (startwidth + delta) + 'px';
    })
    element.addEventListener('mouseup', (e) => {
        isresizing = false;
        document.body.style.cursor = '';
    })
}