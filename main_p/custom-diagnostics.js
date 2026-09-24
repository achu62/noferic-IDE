//jai sri ram
let diagnostics = [];
let importantcachediagnostics = [];
importantcachediagnostics["unassignedvariables"] = []

function getnode(nodes , type){
    let name;
    let out ={}
    nodes.forEach((e)=>{
        if(e.type == type){
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
            if(getnode(node.children , "const").exists == true){
            importantcachediagnostics.unassignedvariables.push(getnode(node.children , "variable_declarator").out.name)

            }
        }
        
    })
}
export function getDiagonostics() {

}