import { FlatCompat } from "@eslint/eslintrc";
import path from "path";
import { fileURLToPath } from "url";

// mimic CommonJS variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
    resolvePluginsRelativeTo: __dirname,
});

export default [
    ...compat.extends(
        "@remix-run/eslint-config",
        "@remix-run/eslint-config/node",
        "@remix-run/eslint-config/jest-testing-library",
        "prettier"
    ),
    {
        languageOptions: {
            globals: {
                shopify: "readonly"
            }
        }
    }
];
