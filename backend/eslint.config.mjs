import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended';

export default tseslint.config(
    eslint.configs.recommended,
    eslintPluginPrettier,
    ...tseslint.configs.strict,
    {
        ignores: ['node_modules', 'dist', 'build'],
    },
);
