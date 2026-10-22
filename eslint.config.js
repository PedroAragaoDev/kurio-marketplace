import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import hooks from 'eslint-plugin-react-hooks'

export default tseslint.config(
  { ignores: ['dist/**', 'public/**', 'playwright-report/**', 'test-results/**', 'reports/**', 'audit-results/**', 'Frontend Challenge/**', '.verification/**'] },
  js.configs.recommended, ...tseslint.configs.recommended,
  { files: ['src/**/*.{ts,tsx}'], plugins: { 'react-hooks': hooks }, rules: { ...hooks.configs.recommended.rules, complexity: ['error', 9], 'max-lines-per-function': ['error', { max: 50, skipBlankLines: true, skipComments: true }] } },
  { files: ['scripts/*.mjs'], languageOptions: { globals: { process: 'readonly', console: 'readonly', URL: 'readonly' } } },
)
