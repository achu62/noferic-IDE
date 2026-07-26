//jai sri ram
import { Parser, Language } from "web-tree-sitter";

async function run(code:any) {
  // 1. MUST initialize the WebAssembly runtime FIRST
  await Parser.init({
    locateFile(scriptName: string) {
      return `/${scriptName}`; // points to public/tree-sitter.wasm
    },
  });

  // 2. Instantiate the parser AFTER Parser.init()
  const parser = new Parser();

  // 3. Load the language WASM file (note capital 'L' in Language, lowercase 'l' in load)
  const JavaScript = await Language.load("/tree-sitter-javascript.wasm");

  // 4. Set the language on your parser instance
  parser.setLanguage(JavaScript);

  // 5. Parse source code into a syntax tree
  const sourceCode:any = code;
  const tree:any|null = parser.parse(sourceCode);

  // 6. Inspect the results
  console.log("Root Node Type:", tree.rootNode.type);
  console.log("S-Expression Tree:\n", tree.rootNode.toString());
  return tree.rootNode.toString();
}

const pscode = await run(`//jai sri ram\n
let me = "any"\n function app(){}`);
function parseSExpression(input) {
  let i = 0;

  function skipWhitespace() {
    while (i < input.length && /\s/.test(input[i])) i++;
  }

  function readWord() {
    skipWhitespace();

    let start = i;

    while (
        i < input.length &&
        !/\s|\(|\)|:/.test(input[i])
        ) {
      i++;
    }

    return input.slice(start, i);
  }

  function parseNode() {
    skipWhitespace();

    if (input[i] !== "(") {
      throw new Error(`Expected "(" at ${i}`);
    }

    i++; // (

    const type = readWord();

    const node = {
      type,
      fields: {},
      children: []
    };

    while (true) {
      skipWhitespace();

      if (i >= input.length) {
        throw new Error("Unexpected EOF");
      }

      if (input[i] === ")") {
        i++;
        break;
      }

      // Field?
      let start = i;
      const word = readWord();

      skipWhitespace();

      if (input[i] === ":") {
        i++; // :

        skipWhitespace();

        const value = parseNode();

        node.fields[word] = value;
      } else {
        i = start;

        const child = parseNode();

        node.children.push(child);
      }
    }

    if (!Object.keys(node.fields).length)
      delete node.fields;

    if (!node.children.length)
      delete node.children;

    return node;
  }

  return parseNode();
}
const jsps = await parseSExpression(pscode)
console.log(jsps)
function walk(node, visitor) {
  visitor(node);

  if (node.fields)
    Object.values(node.fields).forEach(n => walk(n, visitor));

  if (node.children)
    node.children.forEach(n => walk(n, visitor));

}
function getVariables(ast) {
  const out = [];

  walk(ast, node => {
    if (node.type === "variable_declarator") {
      out.push(node.fields?.name);
    }
  });

  return out;
}
function getClasses(ast) {
  const out = [];

  walk(ast, node => {
    if (node.type === "class_declaration") {
      out.push(node.fields?.name);
    }
  });

  return out;
}
function getFunctions(ast) {
  const out = [];

  walk(ast, node => {
    if (node.type === "function_declaration") {
      out.push(node.fields?.name);
    }
  });

  return out;
}
function getFunctionName(node) {
  if (node.type !== "function_declaration") return null;
  return node.fields?.name?.text ?? null;
}

function getClassName(node) {
  if (node.type !== "class_declaration") return null;
  return node.fields?.name?.text ?? null;
}

function getVariableName(node) {
  if (node.type !== "variable_declarator") return null;
  return node.fields?.name?.text ?? null;
}
console.log(getFunctionName(getFunctions(jsps)))