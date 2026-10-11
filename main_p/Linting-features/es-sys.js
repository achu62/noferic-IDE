//jai sri ram
//jai sri ram
import { Notification } from "electron"
import { ESLint, Linter } from "eslint"
const linter = new Linter()
const systemConfig = {
  languageOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  rules: {
    // Errors: clear invalid operations
    "no-invalid-regexp": "error",
    "no-loss-of-precision": "error",
    "constructor-super": "error",
    "no-this-before-super": "error",

    // Warnings: potentially problematic code
    "no-unreachable": "warn",
    "no-dupe-keys": "warn",
    "no-duplicate-case": "warn",
    "no-obj-calls": "warn",
    "no-func-assign": "warn",
    "no-ex-assign": "warn",
    "valid-typeof": "warn",
    "use-isnan": "warn",
    "no-constant-condition": "warn",
    "no-async-promise-executor": "warn",
    "no-unsafe-optional-chaining": "warn",
    "no-fallthrough": "warn",
    "require-await": "warn",
    "no-sparse-arrays": "warn",
    "no-prototype-builtins": "warn"
  }
};
export async function lint_sys(code) {
  try {
    const results = linter.verify(code, systemConfig)
    return results;
  }
  catch (e) {
    console.log(e)
  }
}
