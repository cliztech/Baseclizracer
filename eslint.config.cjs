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
        setTimeout: 'readonly',
        console: 'readonly',
        global: 'readonly',
        require: 'readonly',
        process: 'readonly',
        Dom: 'readonly',
        Util: 'readonly',
        Game: 'readonly',
        Render: 'readonly',
        KEY: 'readonly',
        COLORS: 'readonly',
        BACKGROUND: 'readonly',
        SPRITES: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': ['warn', { varsIgnorePattern: '^(KEY|BACKGROUND|Stats)$' }],
      'no-redeclare': 'error',
      'no-undef': 'error'
    }
  }
];
