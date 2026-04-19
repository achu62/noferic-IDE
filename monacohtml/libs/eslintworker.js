// jai sri ram
importScripts("./lint.js");

self.onmessage = (message) => {
    console.log('Worker received message:', message.data);

    try {
        const code = message.data;

        // CORRECT: Use self.eslint.Linter (capital L)
        const linter = new self.eslint.Linter();

        const messages = linter.verify(code, {
            parserOptions: {
                ecmaVersion: 2023,
                sourceType: 'module'
            },
            rules: {
                "semi": ["error", "always"],
                "no-unused-vars": "error"
            }
        }, { filename: "foo.js" });

        console.log("Lint Results:", messages);
        postMessage(messages);

    } catch (error) {
        console.log('Worker error:', error.message);
        postMessage({ error: error.message });
    }
};