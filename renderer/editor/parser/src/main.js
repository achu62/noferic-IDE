import { Parser, Language } from "web-tree-sitter";
const runtimeWasm = new URL("./web-tree-sitter.wasm", import.meta.url).href;
const languageWasm = new URL("./tree-sitter-javascript.wasm", import.meta.url).href;
function nodeToJson(node) {
    return {
        type: node.type,
        text: node.text, ///maybe....burden....
        startPosition: node.startPosition, //important
        endPosition: node.endPosition, //important  
        children: node.children.map(nodeToJson)
        //node.children.map() does execute the loog
    };
}
function getSymbolAtPosition(tree, row, column) {
    let node = tree.rootNode.descendantForPosition({
        row,
        column
    });
    while (node) {
        switch (node.type) {
            case "function_declaration": {
                const name = node.childForFieldName("name");
                return {
                    name: name?.text,
                };
            }
            case "class_declaration": {
                const name = node.childForFieldName("name");
                return {
                    type: "class",
                    name: name?.text,
                    node
                };
            }
            case "variable_declarator": {
                const declaration = node.parent;
                if (declaration?.type === "lexical_declaration") {
                    const keyword = declaration.firstChild;
                    const name = node.childForFieldName("name");
                    return {
                        type: keyword?.text === "const"
                            ? "constant"
                            : "variable",
                        name: name?.text,
                        node
                    };
                }
            }
        }
        node = node.parent;
    }
    return null;
}
async function runparser(code) {
    await Parser.init({
        locateFile() {
            return runtimeWasm;
        },
    });
    const parser = new Parser();
    const jsLanguage = await Language.load(languageWasm);
    parser.setLanguage(jsLanguage);
    const tree = parser.parse(code);
    return tree;
}
function convert(tree) {
    const jsonTree = nodeToJson(tree.rootNode);
    return jsonTree;
}
// Generate the clean JSON tree
function getAtPosition(tree, pointer, code) {
    const node = tree.rootNode.descendantForPosition(pointer);
    return {
        type: node?.type ?? null,
        text: node ? code.slice(node.startIndex, node.endIndex) : null,
        name: getSymbolAtPosition(tree, pointer.row, pointer.column)?.name
    };
}
self.onmessage = (e) => {
    const mes = e.data;
    if (mes.type == "get-the-named-des") {
        (async () => {
            const res = await runparser(mes.code);
            const hid = getAtPosition(res, mes.pos, mes.code);
            self.postMessage({
                type: "get-the-named-des", response: JSON.stringify(hid), code: convert(res)
            });
        })();
    }
};
