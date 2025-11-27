const js = require('@eslint/js');

module.exports = [
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2015,
      globals: {
        window: 'readonly',
        document: 'readonly',
        HTMLElement: 'readonly',
        requestAnimationFrame: 'readonly',
        Stats: 'readonly',
        setInterval: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': ['warn', { varsIgnorePattern: '^(KEY|BACKGROUND|Stats)$' }]
    }
  }
];
