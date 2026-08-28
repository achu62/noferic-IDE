// eslint.config.js
import js from "@eslint/js";
import fs from "node:fs"

export default [
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      ".code/**",
      ".noferic-ide/**",
      ".zed/**",
      ".idea/**",
      ".git/**",
    ],
  },

  js.configs.recommended,

  {
    files: ["**/*.js", "**/*.mjs", "**/*.cjs"],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
      },
    },

    rules: {
      // General
      "no-unused-vars": ["warn", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      }],
      "no-undef": "error",
      "no-unreachable": "error",
      "no-constant-condition": "warn",

      // Style
      "semi": ["error", "always"],
      "quotes": ["error", "double", {
        avoidEscape: true,
        allowTemplateLiterals: true,
      }],
      "comma-dangle": ["error", "always-multiline"],
      "object-curly-spacing": ["error", "always"],
      "array-bracket-spacing": ["error", "never"],

      // Modern JS
      "prefer-const": "error",
      "no-var": "error",
      "object-shorthand": "error",
      "prefer-template": "warn",

      // Safety
      "no-dupe-keys": "error",
      "no-duplicate-case": "error",
      "no-self-assign": "error",
      "no-self-compare": "error",
      "no-unmodified-loop-condition": "warn",

      // Promises / async
      "no-async-promise-executor": "error",
      "require-await": "warn",

      // Debugging
      "no-debugger": "warn",
    },
  },
];