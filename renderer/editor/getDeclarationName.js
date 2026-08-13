//jai sri ram

export function getDeclarationName(node) {
    let current = node;

    while (current) {
        switch (current.type) {
            case "function_declaration":
            case "generator_function_declaration":
            case "class_declaration":
            case "method_definition":
            case "function_expression":
            case "arrow_function": {
                const name = current.childForFieldName("name");
                return name ? name.text : "<anonymous>";
            }
        }

        current = current.parent;
    }

    return null;
}