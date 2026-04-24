//jai sri ram
//jai sri ram
export function recursiveid(count, item) {
    for (const file of item) {
        file.id = count;
        count++;
        if (file.haschildren && file.children) {
            const newCount = recursiveid(count, file.children);
            count = newCount;
        }
    }
    return count;
}