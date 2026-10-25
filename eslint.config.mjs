import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import hooks from 'eslint-plugin-react-hooks';
import a11y from 'eslint-plugin-jsx-a11y';
export default tseslint.config(
  { ignores: ['node_modules/**','.next/**','artifacts/**','test-results/**','playwright-report/**','next-env.d.ts','reference/**','backend/**'] },
  { files: ['**/*.ts','**/*.tsx'], extends: [js.configs.recommended,...tseslint.configs.recommended], plugins: { 'react-hooks': hooks, 'jsx-a11y': a11y }, rules: { ...hooks.configs.recommended.rules, ...a11y.configs.recommended.rules } },
);
