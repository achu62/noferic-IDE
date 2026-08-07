import { Parser, Language } from "web-tree-sitter";

const runtimeWasm: string = new URL(
  "./web-tree-sitter.wasm",
  import.meta.url
).href;

const languageWasm: string = new URL(
  "./tree-sitter-javascript.wasm",
  import.meta.url
).href;

export async function runparser(code: string , pointer:any) {
  await Parser.init({
    locateFile() {
      return runtimeWasm;
      
    },
  });

  const parser = new Parser();

  const jsLanguage = await Language.load(languageWasm);

  parser.setLanguage(jsLanguage);

  const tree:any = parser.parse(code);
   return tree.rootNode.namedDescendantForPosition(pointer)

}
