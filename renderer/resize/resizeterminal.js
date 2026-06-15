//jai sri ram
export function resizeterminal(element, checkbox) {
    let isresizing = false;
    let startTop = 0;
    let startY = 0;
    let startheight = 0;
    element.addEventListener('mousedown',
        (e) => {
            if (e.clientY - element.getBoundingClientRect().top > 20){return}
            isresizing = true;
            startTop = element.offsetTop;
            startY = e.clientY;
            startheight = element.offsetHeight;
            document.body.style.cursor = 'ns-resize';
            e.preventDefault();
        }
    )
    document.addEventListener('mousemove', (e) => {
        if (isresizing !== true) return
        if (element.offsetHeight < 70) 
        {
            return;
        }
        let delta = startY - e.clientY;
        element.style.top = `${startTop - delta}px`
        element.style.height = `${startheight + delta}px`

    })
    document.addEventListener('mouseup', (e) => {
        isresizing = false;
        document.body.style.cursor = '';
    })

}