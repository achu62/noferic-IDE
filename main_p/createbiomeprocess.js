//jai sri ram
import { spawn, execFile, exec } from "child_process";
import path from "node:path"
export function createbiomeprocess (isWindows , isproduction){
    const biomeprocess = spawn(
                    isWindows
                        ? isproduction
                            ? path.join(
                                    process.resourcesPath,
                                    "app",
                                    "node_modules",
                                    "@biomejs",
                                    "cli-win-x64",
                                    "biome.exe",
                                )
                            : "./node_modules/@biomejs/cli-win-x64/biome.exe"
                        : isproduction
                            ? path.join(
                                    process.resourcesPath,
                                    "app",
                                    "node_modules",
                                    "@biomejs",
                                    "cli-linux-x64",
                                    "biome",
                                )
                            : "./node_modules/@biomejs/cli-linux-x64/biome",
                    [`lsp-proxy`],
                );
    return biomeprocess;
}