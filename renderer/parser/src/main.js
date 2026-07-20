//jai sri ram
import {Parser , Language} from  "web-tree-sitter"
import fs from "node:fs"

await Parser.init()

const parser = new Parser()

const js = await Language.load("/tree-sitter-javascript.wasm")
parser.setLanguage(js);

const code = `
//jai sri ram
import {Parser , Language} from "web-tree-sitter"
await Parser.init()

const parser = new Parser()

const js = await Language.load("/tree-sitter-javascript.wasm")
parser.setLanguage(js);

const code = 

;


const tree:any = parser.parse(code);

console.log(tree.rootNode.toString());
`;

const app = parser.parse(code)


console.log(tree.rootNode.toString());
