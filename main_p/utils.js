//jai sri ram
export function injectChildrenByPath(treeLayers, targetId, newChildren) {
    for (const node of treeLayers) {
        if (node.id === targetId) {
            node.children ??= [];

            node.children.push(...newChildren);
            node.haschildren = true;
            node.haschildren = node.children.length > 0;

            return true;
        }

        if (node.isdirectory && node.children) {
            if (injectChildrenByPath(node.children, targetId, newChildren)) {
                return true;
            }
        }
    }

    return false;
}
export function deleteNodeById(treeLayers, targetId) {
    for (let i = 0; i < treeLayers.length; i++) {
        const node = treeLayers[i];

        // Found it?
        if (node.id === targetId) {
            treeLayers.splice(i, 1);
            return true;
        }

        // Search children
        if (node.isdirectory && node.children) {
            if (deleteNodeById(node.children, targetId)) {
                node.haschildren = node.children.length > 0;
                return true;
            }
        }
    }

    return false;
}