//jai sri ram
export function handleShortCuts(document){
    const iframe = document.querySelector("iframe#editor");

   
        document.addEventListener("keypress", (e) => {
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
            else if(e.ctrlKey && e.key.toLowerCase()==="w")
            {
                e.preventDefault();
                document.getElementById("exit").click()
            }
        });
    }


