
const js = require("@eslint/js");

module.exports = [
    {
    ignores: ["node_modules/**"]
    },
    {
    files: ["src/**/*.js", "scripts/**/*.js"],
    languageOptions: {
        ecmaVersion: "latest",
        sourceType: "commonjs",
        globals: {
        require: "readonly",
        module: "readonly",
        process: "readonly",
        console: "readonly",
        __dirname: "readonly",
        Date: "readonly",
        Number: "readonly",
        String: "readonly"
    }
    },
    rules: {
    ...js.configs.recommended.rules
    }
}
];