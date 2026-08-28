//jai sri ram
export async function formatHandler(
	event,
	object,
	{ connection, pathreal, win, consolelog },
) {
	const extension = object.extension;
	const language = object.language;
	const myCode = object.code;

	try {
		const myUri = `file://${decodeURIComponent(pathreal)}/.noferic-ide/test${Date.now()}.${extension}`;

		await connection.sendNotification("textDocument/didOpen", {
			textDocument: {
				uri: myUri,
				languageId: language,
				version: 1,
				text: myCode,
			},
		});
		const edits = await connection.sendRequest("textDocument/formatting", {
			textDocument: { uri: myUri },
			options: {
				tabSize: 2,
				insertSpaces: true,
			},
		});
		consolelog(edits);
		return edits;
	} catch (e) {
		//console.log(JSON.stringify(e));
		win.webContents.send(
			"data",
			JSON.stringify({
				action: "errorhandle",
				errorlocation: "formatting",
				errormessage: JSON.stringify(e),
			}),
		);
	}
}
