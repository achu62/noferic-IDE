//jai sri ram
import { createWindowinNoferic } from "../window_creator.js"
/**@param {HTMLDocument} document  */
export function createAiAgent(document, id) {
    const div = document.createElement("div");
    const s = div.style;
    s.height = `${100}%`
    s.width = `${100}%`
    s.position = "relative"
    s.boxSizing = "border-box"
    s.overflow = "hidden"
    s.backgroundColor = "#1e1e1e"
    s.fontFamily = "JetBrains Mono"

    createWindowinNoferic({
        "heading": `ai_agent_session_${id}`,
        "div": div
    })
    const composer = document.createElement("div")
    const sc = composer.style
    sc.position = "absolute"
    sc.left = `${18}px`
    sc.right = `${18}px`
    sc.bottom = `${18}px`
    sc.display = "flex"
    sc.alignItems = "flex-end"
    sc.gap = `${8}px`
    sc.padding = `${8}px`
    sc.boxSizing = "border-box"
    sc.border = "1px solid #454545"
    sc.borderRadius = "0"
    sc.backgroundColor = "#252525"

    const addButton = document.createElement("button")
    addButton.type = "button"
    addButton.textContent = "+"
    addButton.title = "Add context"
    addButton.setAttribute("aria-label", "Add context")

    const inputbutton = document.createElement("textarea")
    inputbutton.setAttribute("aria-label", "Message the AI")
    inputbutton.placeholder = "Ask anything or describe a task..."
    const si = inputbutton.style
    si.all = "unset"
    si.display = "block"
    si.flex = "1 1 auto"
    si.minWidth = "0"
    si.boxSizing = "border-box"
    si.fontFamily = "JetBrains Mono, monospace"
    si.fontSize = `${14}px`
    si.lineHeight = "1.5"
    si.padding = `${10}px ${8}px`
    si.height = "calc(3lh + 20px)"
    si.maxHeight = "calc(10lh + 20px)"
    si.resize = "none"
    si.overflowX = "hidden"
    si.whiteSpace = "pre-wrap"
    si.overflowWrap = "anywhere"
    si.overflowY = "auto"
    si.color = "#e8edf2"
    si.caretColor = "#d0d0d0"

    const sendButton = document.createElement("button")
    sendButton.type = "button"
    sendButton.textContent = "Send"
    sendButton.title = "Send message"
    sendButton.setAttribute("aria-label", "Send message")

    for (const button of [addButton, sendButton]) {
        const sb = button.style
        sb.flex = "0 0 auto"
        sb.height = `${38}px`
        sb.minWidth = `${38}px`
        sb.padding = `0 ${12}px`
        sb.border = "1px solid #555555"
        sb.borderRadius = "0"
        sb.backgroundColor = "#333333"
        sb.color = "#e0e0e0"
        sb.font = "600 13px JetBrains Mono, monospace"
        sb.cursor = "pointer"
    }

    addButton.style.fontSize = `${22}px`
    sendButton.style.backgroundColor = "#3a3a3a"
    sendButton.style.borderColor = "#666666"
    inputbutton.addEventListener("input", () => {
        const computedStyle = document.defaultView.getComputedStyle(inputbutton)
        const lineHeight = Number.parseFloat(computedStyle.lineHeight)
        const verticalPadding = Number.parseFloat(computedStyle.paddingTop) + Number.parseFloat(computedStyle.paddingBottom)
        const maxHeight = lineHeight * 10 + verticalPadding
        inputbutton.style.height = "auto"
        inputbutton.style.height = `${Math.min(inputbutton.scrollHeight, maxHeight)}px`
    })
    const sendMessage = () => {
        const prompt = inputbutton.value.trim()
        if (!prompt) return
        div.dispatchEvent(new CustomEvent("ai-prompt-submit", { detail: { prompt } }))
        inputbutton.value = ""
        inputbutton.style.height = "calc(3lh + 20px)"
        inputbutton.focus()
    }
    inputbutton.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault()
            sendMessage()
        }
    })
    sendButton.addEventListener("click", sendMessage)
    addButton.addEventListener("click", () => {
        div.dispatchEvent(new CustomEvent("ai-attach-request"))
        inputbutton.focus()
    })

    composer.append(addButton, inputbutton, sendButton)
    div.appendChild(composer)
    inputbutton.focus()
}