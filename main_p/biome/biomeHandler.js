import fs from "node:fs";
import path from "node:path";
import * as rpc from "vscode-jsonrpc";
import { createbiomeprocess } from "../createbiomeprocess.js";


export async function startBiomeProcess(args, opts) {
	const { isWindows, isproduction, cfpath, consolelog } = opts;
	const resolvedArgs = path.resolve(args);
	const biomeprocess = createbiomeprocess(isWindows, isproduction);

	const connection = rpc.createMessageConnection(
		new rpc.StreamMessageReader(biomeprocess.stdout),
		new rpc.StreamMessageWriter(biomeprocess.stdin),
	);
	connection.listen();

	connection.onRequest("workspace/configuration", (params) => {
		console.log("Biome asked for configuration params:", params);
		return [
			{
				configurationPath: path.join(
					resolvedArgs,
					".noferic-ide",
					"biome.json",
				),
				requireConfiguration: true,
			},
		];
	});

	const root = `file://${resolvedArgs}/.noferic-ide`;

	async function start() {
		try {
			connection.sendRequest("initialize", {
				processId: process.pid,
				rootUri: root,
				workspaceFolders: [
					{
						uri: root,
						name: path.basename(resolvedArgs),
					},
				],
				capabilities: {
					workspace: {
						configuration: true,
						workspaceFolders: true,
						didChangeWatchedFiles: {
							dynamicRegistration: true,
						},
					},
					textDocument: {
						synchronization: {
							didSave: true,
							dynamicRegistration: true,
						},
					},
				},
			});
			console.log(
				`file://${path.join(resolvedArgs, ".noferic-ide", "biome.json")}`,
			);

			connection.sendNotification("initialized", {});
			connection.sendNotification("workspace/didChangeWatchedFiles", {
				changes: [
					{
						uri: `file://${path.join(resolvedArgs, ".noferic-ide", "biome.json")}`,
						type: 2,
					},
				],
			});
			connection.sendNotification("workspace/didChangeConfiguration", {
				settings: {
					biome: {
						requireConfiguration: true,
					},
				},
			});
		} catch (e) {
			consolelog(`error:\n\n\n\n${e}`);
		}
	}

	await start();

	const nofericDir = path.join(resolvedArgs, ".noferic-ide");
	if (!fs.existsSync(nofericDir)) {
		fs.mkdirSync(nofericDir, { recursive: true });
	}

	const biomeConfigPath = path.join(nofericDir, "biome.json");
	if (!fs.existsSync(biomeConfigPath)) {
		fs.writeFileSync(
			biomeConfigPath,
			fs.readFileSync(path.join(cfpath, "biome", "biome.json"), "utf8"),
			"utf-8",
		);
	}

	return { biomeprocess, connection };
}

export async function lintWithBiome(connection, pathreal, message, consolelog) {
	const fileToLint = {
		uri: `file://${pathreal}/.noferic-ide/test${Date.now()}.${message.extension}`,
		languageId: message.language,
		version: 1,
		text: message.code,
	};

	connection.sendNotification("textDocument/didOpen", {
		textDocument: fileToLint,
	});

	return new Promise((resolve) => {
		const listener = connection.onNotification(
			"textDocument/publishDiagnostics",
			(params) => {
				consolelog(`\n\n${JSON.stringify(params)}`);
				resolve(params);
				listener.dispose();
			},
		);
	});
}
