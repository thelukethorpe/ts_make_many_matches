import js from "@eslint/js";
import tseslint from "typescript-eslint";

const typeCheckedTsRules = tseslint.configs.recommendedTypeChecked.map((config) => ({
  ...config,
  files: ["**/*.ts"]
}));

export default tseslint.config(
  {
    ignores: ["**/dist/**", "**/*.d.ts"]
  },
  js.configs.recommended,
  ...typeCheckedTsRules,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.eslint.json"],
        tsconfigRootDir: import.meta.dirname
      }
    }
  }
);
