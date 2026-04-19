//jai sri ram
export const string = `
// 1. Formatting Mistake (Random spaces and tabs)
function uglyFunction(a, b) {
                               const x = 10;
    return a + b
}

// 2. Lint Warning (Using 'var' instead of 'let/const')
var oldSchool = "I should be a const";

// 3. Lint Warning (Unused variable)
const hiddenSecret = "No one ever uses me";

// 4. Lint Warning (Equality check)
if (oldSchool == "test") {
    console.log("Biome prefers === over ==");
}

// 5. Logic Mistake (Debugger statement left in)
debugger;

// 6. Syntax Error (Uncomment the line below to see Biome stop completely)
// const broken = [1, 2, ;
`