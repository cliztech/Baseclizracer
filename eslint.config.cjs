const js = require('@eslint/js');

module.exports = [
  js.configs.recommended,
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        HTMLElement: 'readonly',
        requestAnimationFrame: 'readonly',
        Stats: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        console: 'readonly',
        global: 'readonly',
        require: 'readonly',
        process: 'readonly',
        localStorage: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': ['warn', { varsIgnorePattern: '^(KEY|BACKGROUND|Stats)$' }],
      'no-redeclare': 'error',
      'no-undef': 'error'
    }
  },
  {
    files: ['images/*.js'],
    rules: {
      'no-unused-vars': 'off',
      'no-var': 'off'
    }
  }
];
