import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default {
  extends: ["next/core-web-vitals"], // Ensure this is an array instead of function output
  parserOptions: {
    ecmaVersion: "latest", // Ensure latest ECMAScript version
    sourceType: "module",
  },
};
