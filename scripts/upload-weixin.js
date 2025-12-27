#!/usr/bin/env node

/**
 * 微信小程序自动上传脚本
 *
 * 使用方法：
 * node scripts/upload-weixin.js
 *
 * 环境变量：
 * - APPID: 微信小程序 AppID
 * - VERSION: 版本号
 * - DESCRIPTION: 版本描述
 */

const ci = require('miniprogram-ci');
const path = require('path');
const fs = require('fs');

// 从环境变量获取配置
const APPID = process.env.APPID;
const VERSION = process.env.VERSION || '1.0.0';
const DESCRIPTION = process.env.DESCRIPTION || '自动构建版本';

// 项目路径
const projectPath = path.join(__dirname, './dist/build/mp-weixin');
const privateKeyPath = path.join(__dirname, './CI/private.wx4cb194f334bcdb16.key');

// 验证配置
if (!APPID) {
  console.error('❌ 错误: 缺少 APPID 环境变量');
  process.exit(1);
}

if (!fs.existsSync(privateKeyPath)) {
  console.error('❌ 错误: 找不到私钥文件 private.key');
  console.error('请确保在 GitHub Secrets 中配置了 WEIXIN_PRIVATE_KEY');
  process.exit(1);
}

if (!fs.existsSync(projectPath)) {
  console.error('❌ 错误: 找不到构建产物目录:', projectPath);
  console.error('请先运行 pnpm run build:mp-weixin 构建项目');
  process.exit(1);
}

// 创建项目对象
const project = new ci.Project({
  appid: APPID,
  type: 'miniProgram',
  projectPath: projectPath,
  privateKeyPath: privateKeyPath,
  ignores: ['node_modules/**/*'],
});

console.log('📦 开始上传微信小程序...');
console.log('─'.repeat(50));
console.log(`AppID: ${APPID}`);
console.log(`版本号: ${VERSION}`);
console.log(`版本描述: ${DESCRIPTION}`);
console.log(`项目路径: ${projectPath}`);
console.log('─'.repeat(50));

// 上传代码
ci.upload({
  project,
  version: VERSION,
  desc: DESCRIPTION,
  setting: {
    // 编译设置
    es6: true,                      // 是否启用 ES6 转 ES5
    es7: true,                      // 是否启用增强编译
    minify: true,                   // 是否压缩代码
    minifyJS: true,                 // 是否压缩 JS
    minifyWXML: true,              // 是否压缩 WXML
    minifyWXSS: true,              // 是否压缩 WXSS
    codeProtect: false,            // 是否开启代码保护
    autoPrefixWXSS: true,          // 是否自动补全 WXSS
  },
  onProgressUpdate: (info) => {
    // 上传进度回调
    console.log(`📤 上传进度: ${info.percent}%`);
    if (info._msg) {
      console.log(`   消息: ${info._msg}`);
    }
  },
})
  .then((result) => {
    console.log('─'.repeat(50));
    console.log('✅ 上传成功！');
    console.log('─'.repeat(50));
    console.log('上传结果:', JSON.stringify(result, null, 2));
    console.log('─'.repeat(50));
    console.log('');
    console.log('📱 下一步操作:');
    console.log('1. 登录微信小程序后台: https://mp.weixin.qq.com');
    console.log('2. 进入「版本管理」页面');
    console.log('3. 找到开发版本，提交审核');
    console.log('');
    process.exit(0);
  })
  .catch((error) => {
    console.error('─'.repeat(50));
    console.error('❌ 上传失败！');
    console.error('─'.repeat(50));
    console.error('错误信息:', error);
    console.error('─'.repeat(50));

    // 常见错误提示
    if (error.message?.includes('privatekey')) {
      console.error('');
      console.error('💡 提示: 私钥错误，请检查：');
      console.error('1. 是否在微信小程序后台下载了上传密钥？');
      console.error('2. 是否正确配置了 WEIXIN_PRIVATE_KEY？');
      console.error('');
    } else if (error.message?.includes('appid')) {
      console.error('');
      console.error('💡 提示: AppID 错误，请检查：');
      console.error('1. WEIXIN_APPID 是否配置正确？');
      console.error('2. 项目 manifest.json 中的 AppID 是否匹配？');
      console.error('');
    }

    process.exit(1);
  });
