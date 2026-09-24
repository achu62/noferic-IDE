//jai sri ram
import Parser from "tree-sitter";
import JavaScript from "tree-sitter-javascript";
import TypeScript from "tree-sitter-typescript";
import { parentPort } from "worker_threads";
import nodepath from "node:path"
const parser = new Parser();
function getSymbolAtPosition(tree, row, column, isaldreadyrootnode) {
    let node;
    if (!isaldreadyrootnode) {
        node = tree.rootNode.descendantForPosition({
            row,
            column
        });
    }
    else {
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

function nodeToJson(node) {
    return {
        type: node.type,
        text: node.text,
        name: getSymbolAtPosition(node, node.startPosition.row, node.startPosition.column, true)?.name,///maybe....burden....
        startPosition: node.startPosition,//important
        endPosition: node.endPosition,//important  
        children: node.children.map(nodeToJson)
    };
}
function parseJavaScript(source) {
    parser.setLanguage(JavaScript);
    return parser.parse(source);
}

function parseTypeScript(source) {
    parser.setLanguage(TypeScript.typescript);
    return parser.parse(source);
}
parentPort.on("message" , (mes)=>{
    if(mes.type ==  "parse-code"){
        if(nodepath.extname(mes.path) == ".ts"){
            parentPort.postMessage({
                type:mes.type,
                ast:JSON.stringify(nodeToJson(parseTypeScript(mes.code).rootNode))
            })
        }
        if(nodepath.extname(mes.path) == ".js"){
            parentPort.postMessage({
                type:mes.type,
                ast:JSON.stringify(nodeToJson(parseJavaScript(mes.code).rootNode))
            })
        }
    }
})