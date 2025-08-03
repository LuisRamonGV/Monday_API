import tseslint from '@typescript-eslint/eslint-plugin'
import parser from '@typescript-eslint/parser'

export default [
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
        sourceType: 'module'
      }
    },
    plugins: {
      '@typescript-eslint': tseslint
    },
    rules: {
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'prettier/prettier': 0,
      'arrow-spacing': ['error', { before: true, after: true }],
      'brace-style': ['error', '1tbs'],
      'comma-dangle': ['error', 'never'], // ✅ Usar la regla base de ESLint
      'comma-spacing': ['error', { before: false, after: true }],
      'eol-last': ['error', 'always'],
      'indent': ['error', 2, { ignoredNodes: ['PropertyDefinition'] }],
      'keyword-spacing': ['error', { before: true, after: true }],
      'no-mixed-spaces-and-tabs': 'error',
      'no-extra-parens': ['error', 'all'],
      'no-multi-spaces': ['error', { ignoreEOLComments: true }],
      'no-multiple-empty-lines': ['error', { max: 2 }],
      'no-trailing-spaces': 'error',
      'no-whitespace-before-property': 'error',
      'object-curly-spacing': ['error', 'always', { arraysInObjects: false }],
      quotes: ['error', 'single'],
      semi: ['error', 'never'],
      'space-before-blocks': ['error', 'always']
    }
  }
]
