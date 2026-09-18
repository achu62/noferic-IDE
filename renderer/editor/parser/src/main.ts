import { Parser, Language } from "web-tree-sitter";
interface parsed_code {
    type: string,
    name: number,
    children: Array<any>
}
const runtimeWasm: string = new URL(
    "./web-tree-sitter.wasm",
    import.meta.url
).href;

const languageWasm: string = new URL(
    "./tree-sitter-javascript.wasm",
    import.meta.url
).href;
function getSymbolAtPosition(tree: any, row: any, column: any , isaldreadyrootnode :boolean) {
    let node;
    if (!isaldreadyrootnode) {
        node = tree.rootNode.descendantForPosition({
            row,
            column
        });
    }
    else{
        console.log(row, column)
        node = tree.descendantForPosition({
            row,
            column
        });
    
    }
    

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
/**
 * Finds the component/variable name at a specific start and end position.
 * @param {Object} rootNode - The root node of the Tree-sitter syntax tree.
 * @param {Object} startPosition - { row: X, column: Y } (0-indexed)
 * @param {Object} endPosition - { row: X, column: Y } (0-indexed)
 * @returns {string|null} - The name of the component, or null if not found.
 */
/**
 * Helper function to recursively find the first child node of a specific type.
 */

function nodeToJson(node: any) {
    return {
        type: node.type,
        text: node.text,
        name:getSymbolAtPosition(node ,node.startPosition.row , node.startPosition.column , true)?.name,///maybe....burden....
        startPosition: node.startPosition,//important
        endPosition: node.endPosition,//important  
        children: node.children.map(nodeToJson)
        //node.children.map() does execute the loog
    };
}

async function runparser(code: string) {
    await Parser.init({
        locateFile() {
            return runtimeWasm;


        },
    });

    const parser = new Parser();

    const jsLanguage = await Language.load(languageWasm);

    parser.setLanguage(jsLanguage);

    const tree: any = parser.parse(code);
    return tree;


}
function convert(tree: any) {
    const jsonTree = nodeToJson(tree.rootNode);
    return jsonTree;
}


// Generate the clean JSON tree

function getAtPosition(tree: any, pointer: any, code: string) {
    const node = tree.rootNode.descendantForPosition(pointer);

    return {
        type: node?.type ?? null,
        text: node ? code.slice(node.startIndex, node.endIndex) : null,
        name: getSymbolAtPosition(tree, pointer.row, pointer.column , false)?.name
    };
}


self.onmessage = (e) => {
    const mes
        = e.data;
    if (mes.type == "get-the-named-des") {
        (async () => {
            const res = await runparser(mes.code)
            const hid = getAtPosition(res, mes.pos, mes.code);
            self.postMessage({
                type: "get-the-named-des", response: JSON.stringify(hid), code: convert(res)
            })
        })();

    }


}
