//jai sri ram
// lspToMonaco.js

export function lspKindToMonaco(monaco, kind) {
    const K = monaco.languages.CompletionItemKind;

    switch (kind) {
        case 1: return K.Text;
        case 2: return K.Method;
        case 3: return K.Function;
        case 4: return K.Constructor;
        case 5: return K.Field;
        case 6: return K.Variable;
        case 7: return K.Class;
        case 8: return K.Interface;
        case 9: return K.Module;
        case 10: return K.Property;
        case 11: return K.Unit;
        case 12: return K.Value;
        case 13: return K.Enum;
        case 14: return K.Keyword;
        case 15: return K.Snippet;
        case 16: return K.Color;
        case 17: return K.File;
        case 18: return K.Reference;
        case 19: return K.Folder;
        case 20: return K.EnumMember;
        case 21: return K.Constant;
        case 22: return K.Struct;
        case 23: return K.Event;
        case 24: return K.Operator;
        case 25: return K.TypeParameter;
        default: return K.Text;
    }
}

export function lspCompletionToMonaco(monaco, item) {
    return {
        label: item.label,
        kind: lspKindToMonaco(monaco, item.kind),
        detail: item.detail ?? "",
        documentation:
            typeof item.documentation === "string"
                ? item.documentation
                : item.documentation?.value ?? "",

        insertText: item.insertText ?? item.label,

        sortText: item.sortText,
        filterText: item.filterText,
        preselect: item.preselect,
        commitCharacters: item.commitCharacters,

        range: undefined
    };
}

export function convertCompletionList(monaco, completionList) {
    const items = Array.isArray(completionList)
        ? completionList
        : completionList.items;

    return items.map(item => lspCompletionToMonaco(monaco, item));
}