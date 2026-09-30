//jai sri ram
let diagnostics = [];
let importantcachediagnostics = [];
importantcachediagnostics["constants"] = []
let mapofconsts = {}
function getnodeBytype(nodes, type) {
    let name;
    let out = {}
    nodes.forEach((e) => {
        if (e.type == type) {
            name = e
        }
    })
    out["out"] = name
    out["exists"] = name ? true : false
    return out;
}

function di(nodes) {

    nodes.forEach((node) => {
        if (node.type == "lexical_declaration") {
            if (getnodeBytype(node.children, "const").exists == true) {
                const n = getnodeBytype(node.children, "variable_declarator").out
                const n_name = n.name

                importantcachediagnostics.constants.push(n_name)
                const n_pos = {
                    stpos: n.startPosition,
                    epos: n.endPosition
                }
                mapofconsts[n_name] = n_pos


            }
        }
        if (node.type == "expression_statement") {
            const assignment = getnodeBytype(node.children, "assignment_expression");

            if (assignment.exists) {
                const identifierCheck = getnodeBytype(assignment.out.children, "identifier");

                if (identifierCheck.exists) {

                    const targetName = identifierCheck.out.text;
                    if (importantcachediagnostics.constants.includes(targetName)) {
                        diagnostics.push({
                            source: "Noferic-Intelligence",
                            message: `the constant ${targetName} has been re-assigned\nconstants can't be re-assigned`
                        })
                        console.log(`the constant ${targetName} has been re-assigned\nconstants can't be re-assigned`
                        )
                    }
                }
            }
        }
        if (node.children) {
            di(node.children)
        }
    })
}