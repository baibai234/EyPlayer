module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    parser: '@typescript-eslint/parser',
    sourceType: 'module'
  },
  rules: {
    // 代码质量
    'no-console': 'warn',
    'no-debugger': 'warn',
    'no-unused-vars': 'warn',

    // 风格规范
    'indent': ['error', 2],
    'quotes': ['error', 'single'],
    'semi': ['error', 'never'],

    // Vue 规范
    'vue/multi-word-component-names': 'off',
    'vue/no-v-html': 'warn',

    // TypeScript 规范
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn'
  }
}
