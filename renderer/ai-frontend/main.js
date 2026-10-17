//jai sri ram
import { createWindowinNoferic } from "../window_creator.js"
/**@param {HTMLDocument} document  */
export function createAiAgent(document, id) {
    const div = document.createElement("div");
    const s = div.style;
    s.height = `${100}%`
    s.width = `${100}%`
    s.backgroundColor = "#1e1e1e"
    s.fontFamily = "JetBrains Mono"
    createWindowinNoferic({
        "heading": "ai_agent_session_1",
        "div": div
    })
}