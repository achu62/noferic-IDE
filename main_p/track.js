import fs from "node:fs";
import path from "node:path";
import chokidar from "chokidar";
import { deleteNodeById, injectChildrenByPath } from "./utils.js";
import { scanafolder } from "./scanafolder.js";
import { NotifyGitIntegration, initialisereposcan, Updatestatus } from "./git/git.js"
import { UpdateorCreatefilelist } from "./getAllFilenames.js"

export function createTrack({ getState, consolelog }) {
	let watcher = null;

	return async function track(pathreal) {
		if (!pathreal) return;
		if (watcher) {
			watcher.close();
			watcher = null;
		}

		try {
			watcher = chokidar.watch(pathreal, {
				ignoreInitial: true,
			});



			watcher.on("add", async (filePath) => {
				const { win, addedpathbyide, globalfolderjson } = getState();
				const stats = await fs.promises.lstat(filePath);

				if (stats.isSymbolicLink()) {
					// Ignore it
					return;
				}
				Updatestatus(win)
				UpdateorCreatefilelist(pathreal)
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
			});

			watcher.on("change", async (filePath) => {
				const { win, changedpathsbyide } = getState();
				 const stats = await fs.promises.lstat(filePath);

				if (stats.isSymbolicLink()) {
					// Ignore it
					return;
				}
				Updatestatus(win)
				if (filePath.includes(".git")) {
					NotifyGitIntegration(win)
				}
				if (!changedpathsbyide.includes(filePath)) {
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
			});

			watcher.on("unlink", async(filePath) => {
				const { win, globalfolderjson } = getState();
				const stats = await fs.promises.lstat(filePath);

				if (stats.isSymbolicLink()) {
					// Ignore it
					return;
				}
				UpdateorCreatefilelist(pathreal)
				Updatestatus(win)
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
			});
			watcher.on("addDir", async (DirPath) => {
				const { win, globalfolderjson } = getState();
				UpdateorCreatefilelist(pathreal)

				Updatestatus(win)
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
			});
			watcher.on("unlinkDir", (DirPath) => {
				const { win, addedpathbyide, globalfolderjson } = getState();
				UpdateorCreatefilelist(pathreal)

				Updatestatus(win)
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
			consolelog(e);
		}
	};
}
