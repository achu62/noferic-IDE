import { Parser, Language } from "web-tree-sitter";
interface parsed_code{
    type:string,
    name:number,
    children:Array<any>
}
const runtimeWasm: string = new URL(
  "./web-tree-sitter.wasm",
  import.meta.url
).href;

const languageWasm: string = new URL(
  "./tree-sitter-javascript.wasm",
  import.meta.url
).href;
function getSymbolAtPosition(tree:any, row:any, column:any) {
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
 async function runparser(code: string) {
  await Parser.init({
    locateFile() {
      return runtimeWasm;

      
    },
  });

  const parser = new Parser();

  const jsLanguage = await Language.load(languageWasm);

  parser.setLanguage(jsLanguage);

  const tree:any = parser.parse(code);
  return tree;


}

function getAtPosition(tree: any, pointer: any, code: string) {
    const node = tree.rootNode.descendantForPosition(pointer);

    return {
        type: node?.type ?? null,
        text: node ? code.slice(node.startIndex, node.endIndex) : null,
        name: getSymbolAtPosition(tree , pointer.row , pointer.column)?.name
    };
}


self.onmessage=(e)=>{
  const mes
   = e.data;
  if(mes.type == "get-the-named-des"){
    (async()=>{
    const res = await runparser(mes.code)  

    const hid = getAtPosition(res , mes.pos , mes.code);
    console.log(hid)
  self.postMessage({type:"get-the-named-des", response: JSON.stringify(hid)})  })();

  }
 

}
