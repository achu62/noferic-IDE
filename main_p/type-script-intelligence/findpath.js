//jai sri ram
import path from "node:path";
import fs from "node:fs"
import { getEssentials } from "../main.js";

export function getpath() {
    const items = getEssentials();
    const appRoot = items.appispackaged
        ? path.join(items.path, "app")
        : items.appRoot || path.resolve(items.appPath, "..");

    return path.join(
        appRoot,
        "node_modules",
        "typescript-language-server",
        "lib",
        "cli.mjs"
    );
}



