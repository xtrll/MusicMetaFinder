import globals from "globals";

import path from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import pluginJs from "@eslint/js";

// mimic CommonJS variables -- not needed if using CommonJS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({baseDirectory: __dirname, recommendedConfig: pluginJs.configs.recommended});

// Add additional language options and rules here
const additionalConfig = {
  rules: {
    'no-console': 'off', // This disables the 'no-console' rule
    'import/no-named-as-default-member': 'off', // Disables the named as default member rule
    'max-len': ['error', { code: 100, ignoreComments: true }], // Allow code lines of up to 100 characters, ignoring comments
  },
};

export default [
  { languageOptions: { globals: globals.browser }},
  ...compat.extends("airbnb-base"),
  additionalConfig,
];