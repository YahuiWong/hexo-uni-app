// @ts-check
import pluginVue from 'eslint-plugin-vue';
import vueTsEslintConfig from '@vue/eslint-config-typescript';
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting';

export default [
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },

  {
    name: 'app/files-to-ignore',
    ignores: [
      'dist/**',
      'node_modules/**',
      '**/*.d.ts',
      'tests/**',
      'src/__tests__/**',
      'scripts/**',
    ],
  },

  ...pluginVue.configs['flat/essential'],
  ...vueTsEslintConfig(),
  skipFormatting,

  {
    name: 'app/custom-rules',
    rules: {
      // uni-app 页面组件文件名即路由名（如 pages/post/list.vue），
      // 无法随意改成多词命名，故关闭该规则
      'vue/multi-word-component-names': 'off',
      // API 返回数据在类型层面难以精确建模，先放宽 any 限制，后续逐步收紧
      '@typescript-eslint/no-explicit-any': 'off',
      // 第三方库（mp-html、marked）类型定义不完善，允许使用 @ts-ignore
      '@typescript-eslint/ban-ts-comment': 'off',
      // 部分静态方法签名需保留参数以兼容调用方，但内部暂未使用，允许下划线前缀参数
      '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }]
    },
  },
];
