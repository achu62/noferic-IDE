//jai sri ram
/**@param {HTMLDocument} document  */

export function handleShortCuts(document) {
    
    /**@param {HTMLIFrameElement} iframe */
    const iframe = document.querySelector("iframe#editor");


    document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "f") {
            e.preventDefault();
            document.getElementById("format").click();
        } else if (e.ctrlKey && e.key.toLowerCase() === "s") {
            e.preventDefault();
            document.getElementById("save").click();
        } else if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "t") {
            e.preventDefault();
            document.getElementById("term").click();
        }
        else if (e.ctrlKey && e.key.toLowerCase() === "w") {
            e.preventDefault();
            document.getElementById("exit").click()
        }
        else if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "e") {
            e.preventDefault();
            document.getElementById("expl").click()

        }
        else if (e.ctrlKey && e.key.toLowerCase() === "g") {
            e.preventDefault();
            document.getElementById("gitvercontmenu").click()

        }
        else if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "l") {
            e.preventDefault();
            document.getElementById("liveserverbtn").click()

        }
        else if(e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "p"){
                        e.preventDefault();
                        document.getElementById("explorersearch").focus()
        }
    });
    iframe.contentWindow.addEventListener("keypress", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "f") {
            e.preventDefault();
            document.getElementById("format").click();
        } else if (e.ctrlKey && e.key.toLowerCase() === "s") {
            e.preventDefault();
            document.getElementById("save").click();
        } else if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "t") {
            e.preventDefault();
            document.getElementById("term").click();
        }
        else if (e.ctrlKey && e.key.toLowerCase() === "w") {
            e.preventDefault();
            document.getElementById("exit").click()
        }
        else if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "e") {
            e.preventDefault();
            document.getElementById("expl").click()

        }
        else if (e.ctrlKey && e.key.toLowerCase() === "g") {
            e.preventDefault();
            document.getElementById("gitvercontmenu").click()

        }
        else if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "l") {
            e.preventDefault();
            document.getElementById("liveserverbtn").click()

        }
        else if(e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "p"){
                        e.preventDefault();
                        document.getElementById("explorersearch").focus()
        }
    });
}


