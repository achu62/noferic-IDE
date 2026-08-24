import fs from "node:fs";
import path from "node:path";
import chokidar from "chokidar";
import { deleteNodeById, injectChildrenByPath } from "./utils.js";
import { scanafolder } from "./scanafolder.js";
import { NotifyGitIntegration, initialisereposcan, Updatestatus } from "./git/git.js"
import { UpdateorCreatefilelist } from "./getAllFilenames.js"
import { getState, Nullify } from "./main.js";
import { encode } from "node:punycode";

export function createTrack() {
	let watcher = null;

	return async function track(pathreal) {
		if (!pathreal) return;
		if (watcher) {
			watcher.close();
			watcher = null;
		}

		try {

			watcher = chokidar.watch(projectRoot, {
				ignoreInitial: true,
				ignored: "**/.git/index.lock"
			});

			watcher.on("add", async (filePath) => {
				const { win, addedpathbyide, globalfolderjson } = getState();



				if (filePath.includes(".git")) {
					NotifyGitIntegration(win)
				}
				if (Array.isArray(addedpathbyide)) {
					const addedIndex = addedpathbyide.indexOf(filePath);
					if (addedIndex >= 0) {
						addedpathbyide.splice(addedIndex, 1);
					}
				}
				if (!addedpathbyide?.includes(filePath)) {
					const filepathonly = path.basename(filePath);
					const foldepath = path.dirname(filePath);
					injectChildrenByPath(globalfolderjson, foldepath, [
						{
							id: filePath,
							name: filepathonly,
							isdirectory: false,
						},
					]);

					win.webContents.send(
						"data",
						JSON.stringify({
							action: "addelements",
							newjson: globalfolderjson,
							add: {
								parentid: foldepath,
								actualjson: [
									{
										id: filePath,
										name: filepathonly,
										isdirectory: false,
									},
								],
							},
						}),
					);
				}
				Updatestatus(win)
				UpdateorCreatefilelist(pathreal)
			});

			watcher.on("change", async (filepath) => {
				const { win, changedpathsbyide } = getState();
				const toNormalizedWindowsId = (inputPath) =>
					path.win32.normalize(inputPath).replace(/\\/g, "/");
				const filePath = toNormalizedWindowsId(filepath).toLowerCase()

				console.log(changedpathsbyide, filePath)

				if (filePath.includes("git")) {
					NotifyGitIntegration(win)
				}
				if (!changedpathsbyide.includes((filePath.toLowerCase()))) {
					win.webContents.send(
						"data",
						JSON.stringify({
							action: "handleachangeinfile",
							path: filePath,
							content: await fs.readFileSync(filePath, "utf-8"),
						}),
					);
				}

				const changedIndex = changedpathsbyide.indexOf(filePath);
				if (changedIndex >= 0) {
					changedpathsbyide.splice(changedIndex, 1);
				}
				Updatestatus(win)
				Nullify()
			});

			watcher.on("unlink", async (filePath) => {
				const { win, globalfolderjson } = getState();



				if (filePath.includes(".git")) {
					NotifyGitIntegration(win)
				}
				deleteNodeById(globalfolderjson, filePath);
				win.webContents.send(
					"data",
					JSON.stringify({
						action: "removeelements",
						newjson: globalfolderjson,
						remove: filePath,
					}),
				);
				UpdateorCreatefilelist(pathreal)
				Updatestatus(win)
			});
			watcher.on("addDir", async (DirPath) => {
				const { win, globalfolderjson } = getState();

				if (DirPath.includes(".git")) {
					NotifyGitIntegration(win)
				}
				const Dirnameonly = path.basename(DirPath);
				const foldepath = path.dirname(DirPath);
				const children = await scanafolder(DirPath);
				injectChildrenByPath(globalfolderjson, foldepath, [
					{
						id: DirPath,
						name: Dirnameonly,
						isdirectory: true,
						haschildren: children.length > 0,
						children: [],
					},
				]);

				win.webContents.send(
					"data",
					JSON.stringify({
						action: "addelements",
						newjson: globalfolderjson,
						add: {
							parentid: foldepath,
							actualjson: [
								{
									id: DirPath,
									name: Dirnameonly,
									isdirectory: true,
									haschildren: children.length > 0,
									children: children,
								},
							],
						},
					}),
				);
				UpdateorCreatefilelist(pathreal)

				Updatestatus(win)
			});
			watcher.on("unlinkDir", (DirPath) => {
				const { win, addedpathbyide, globalfolderjson } = getState();

				if (DirPath.includes(".git")) {
					NotifyGitIntegration(win)
				}
				deleteNodeById(globalfolderjson, DirPath);
				win.webContents.send(
					"data",
					JSON.stringify({
						action: "removeelements",
						newjson: globalfolderjson,
						remove: DirPath,
					}),
				);
			});
		} catch (e) {
		}
		UpdateorCreatefilelist(pathreal)

		Updatestatus(win)
	};
}
