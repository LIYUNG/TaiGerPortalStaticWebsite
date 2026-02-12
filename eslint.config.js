import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist','node_modules']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  // Files that intentionally export both components and non-components (contexts, providers, utils)
  {
    files: [
      'src/utils/contants.tsx',
      'src/contexts/use-snack-bar.tsx',
      'src/components/AuthProvider/index.tsx',
      'src/components/SurveyProvider/index.tsx',
      'src/components/Tabs/index.tsx',
      'src/components/ThemeProvider/index.tsx',
      'src/test/test-utils.tsx',
    ],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
