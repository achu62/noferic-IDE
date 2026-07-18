//jai sri ram
export async function provideAutoCompleteforts(connection , obj){

    const completions = await connection.sendRequest(
        "textDocument/completion",
        {
            textDocument: {
                uri: `file://${obj.path}`
            },
            position: {
                line: obj.position.line,
                character: obj.position.character
            }
        }
    );
    return completions;

}
