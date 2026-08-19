//jai sri ram
import ts from "typescript"
import path from "path"
export async function getDiagonostics(filePath) {
    const program = ts.createProgram([filePath], {
        allowJs: true,
        checkJs: false
    })
    console.log(program)
    const tree = program.getSourceFile(filePath)
    console.log(tree)
    const syntax_diagnostics = program.getSyntacticDiagnostics(tree);
    console.log(syntax_diagnostics);
}
