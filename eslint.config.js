import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";


/** @type {import('eslint').Linter.Config[]} */
export default [
  {files: ["**/*.{js,mjs,cjs,ts}"]},
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "no-undef": "off",
      "no-unused-vars": "off",
      "no-redeclare": "off",
      "no-shadow": "off",
      "no-dupe-class-members": "off",
      "no-use-before-define": "off",
      indent: ["error", 2, { SwitchCase: 1 }],
      "@typescript-eslint/no-explicit-any": "off",
    }
  }
];