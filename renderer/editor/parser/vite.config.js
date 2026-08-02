//jai sri ram
import { defineConfig } from "vite";

export default defineConfig({
    build: {
        lib: {
            entry: "src/main.ts",   // Your entry file
            name: "MyLibrary",       // Global name for UMD/IIFE
            fileName: "my-library",
            formats: ["cjs", "umd" , "es"]   // or ["es"] if you only need ES modules
        }
    }
});