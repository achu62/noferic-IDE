//jai sri ram
export function giveOptionMenu({ heading = "", options = [] } = {}) {
    const overlay = document.createElement("div");
    Object.assign(overlay.style, {
        position: "fixed",
        inset: "0",
        zIndex: "1000000",
        display: "grid",
        placeItems: "center",
        background: "rgba(0, 0, 0, 0.55)"
    });

    const menu = document.createElement("section");
    Object.assign(menu.style, {
        boxSizing: "border-box",
        width: "min(360px, calc(100vw - 32px))",
        maxHeight: "80vh",
        overflow: "auto",
        padding: "12px",
        color: "#f2f2f2",
        backgroundColor: "#1e1e2e",
        border: "1px solid #454556",
        borderRadius: "0",
        font: "13px sans-serif"
    });

    const header = document.createElement("header");
    Object.assign(header.style, {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        marginBottom: "10px"
    });

    const title = document.createElement("strong");
    title.textContent = heading;
    header.append(title);

    const content = document.createElement("div");
    Object.assign(content.style, {
        display: "flex",
        flexDirection: "column",
        gap: "2px"
    });

    const movedElements = [];
    let closed = false;

    function close() {
        if (closed) return;
        closed = true;

        for (const item of movedElements) {
            if (item.parent) {
                item.parent.insertBefore(item.element, item.nextSibling);
            } else {
                item.element.remove();
            }
            item.element.hidden = item.wasHidden;
        }

        overlay.remove();
        document.removeEventListener("keydown", onKeydown);
    }

    function makeCloseButton(label) {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = label;
        Object.assign(button.style, {
            padding: "5px 8px",
            color: "inherit",
            background: "transparent",
            border: "1px solid #454556",
            borderRadius: "0",
            cursor: "pointer",
            font: "inherit"
        });
        button.addEventListener("click", close);
        return button;
    }

    header.append(makeCloseButton("×"));
    menu.append(header, content);

    for (const option of options) {
        if ((option.type || "").trim() === "text") {
            const button = document.createElement("button");
            button.type = "button";
            button.textContent = option.text ?? "";
            Object.assign(button.style, {
                padding: "7px 8px",
                color: "inherit",
                background: "transparent",
                border: "0",
                borderRadius: "0",
                textAlign: "left",
                cursor: "pointer",
                font: "inherit"
            });
            button.addEventListener("click", (event) => {
                try {
                    (option.onChoose ?? option.callback)?.(event);
                } finally {
                    if (option.close === true) close();
                }
            });
            button.addEventListener("mouseenter", () => {
                button.style.backgroundColor = "#303044";
            });
            button.addEventListener("mouseleave", () => {
                button.style.backgroundColor = "transparent";
            });
            content.append(button);
            continue;
        }

        if ((option.type || "").startsWith("element")) {
            const element = typeof option.element === "string"
                ? document.getElementById(option.element.replace(/^#/, ""))
                : option.element;

            if (element instanceof HTMLElement) {
                movedElements.push({
                    element,
                    parent: element.parentNode,
                    nextSibling: element.nextSibling,
                    wasHidden: element.hidden
                });
                element.hidden = false;
                content.append(element);
            }
        }
    }

    const footer = document.createElement("footer");
    footer.style.marginTop = "10px";
    footer.append(makeCloseButton("Close"));
    menu.append(footer);

    function onKeydown(event) {
        if (event.key === "Escape") close();
    }

    overlay.addEventListener("click", (event) => {
        if (event.target === overlay) close();
    });
    document.addEventListener("keydown", onKeydown);

    overlay.append(menu);
    document.body.append(overlay);

    return { element: overlay, close };
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = { giveOptionMenu };
} else if (typeof window !== "undefined") {
    window.giveOptionMenu = giveOptionMenu;
}