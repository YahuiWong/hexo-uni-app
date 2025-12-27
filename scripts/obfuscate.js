#!/usr/bin/env node

/**
 * 代码混淆脚本
 *
 * 对微信小程序构建产物进行高级混淆，增强代码保护
 *
 * 使用方法：
 * node scripts/obfuscate.js
 *
 * 或通过 npm script：
 * pnpm run build:mp-weixin:secure
 */

const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// 配置
const distPath = path.join(__dirname, '../dist/build/mp-weixin');
const excludePatterns = [
  '**/node_modules/**',
  '**/vendor.js',  // vendor 文件已经过压缩，跳过以加快速度
];

// 混淆配置
const obfuscatorOptions = {
  // 基础设置
  compact: true,                        // 压缩代码为一行
  controlFlowFlattening: true,         // 控制流扁平化（打乱代码逻辑）
  controlFlowFlatteningThreshold: 0.75, // 75% 的代码应用控制流扁平化

  // 变量名混淆
  identifierNamesGenerator: 'hexadecimal', // 使用十六进制命名（_0x1a2b）
  renameGlobals: false,                 // 不重命名全局变量（避免破坏 wx API）

  // 字符串保护 - 关键修改：保留模块路径
  stringArray: true,                    // 将字符串提取到数组中
  stringArrayThreshold: 0.5,            // 降低到 50%（避免混淆模块路径）
  stringArrayEncoding: ['base64'],      // 字符串使用 base64 编码
  stringArrayWrappersCount: 2,          // 字符串数组包装器数量
  stringArrayWrappersChainedCalls: true, // 链式调用包装器

  // 保留字符串 - 保护模块路径和 wx API
  reservedStrings: [
    // 保留所有相对路径和绝对路径
    '\\.\\.\\/.*',        // ../xxx
    '\\.\\/.*',           // ./xxx
    '\\/.*\\.js',         // /xxx.js
    '\\/.*\\.json',       // /xxx.json
    '.*\\.vue',           // xxx.vue
    // 保留微信 API
    '^wx\\.',             // wx.xxx
    // 保留 uni API
    '^uni\\.',            // uni.xxx
    // 保留 Vue API
    '^ref$',
    '^reactive$',
    '^computed$',
    '^watch$',
  ],

  // 死代码注入
  deadCodeInjection: true,              // 注入死代码（干扰逆向）
  deadCodeInjectionThreshold: 0.4,      // 40% 的代码块注入死代码

  // 其他转换
  transformObjectKeys: true,            // 转换对象键名
  unicodeEscapeSequence: false,         // 不使用 unicode 转义（避免文件过大）

  // 调试保护
  debugProtection: false,               // 不启用调试保护（会影响性能）

  // 性能优化
  splitStrings: false,                  // 关闭字符串分割（避免破坏路径）
  splitStringsChunkLength: 10,          // 每 10 个字符分割

  // 保留注释
  sourceMap: false,                     // 不生成 source map

  // 目标环境
  target: 'browser',                    // 浏览器环境
};

console.log('🔒 开始代码混淆...');
console.log('─'.repeat(50));
console.log(`构建目录: ${distPath}`);
console.log('─'.repeat(50));

// 检查构建目录是否存在
if (!fs.existsSync(distPath)) {
  console.error('❌ 错误: 找不到构建目录');
  console.error('请先运行: pnpm run build:mp-weixin');
  process.exit(1);
}

// 查找所有 JS 文件
const jsFiles = glob.sync(`${distPath}/**/*.js`, {
  ignore: excludePatterns,
  absolute: true,
});

console.log(`\n📂 找到 ${jsFiles.length} 个 JS 文件需要混淆\n`);

let processedCount = 0;
let skippedCount = 0;
let errorCount = 0;

// 处理每个文件
jsFiles.forEach((filePath, index) => {
  const relativePath = path.relative(distPath, filePath);

  try {
    // 读取文件
    const code = fs.readFileSync(filePath, 'utf-8');
    const fileSizeBefore = Buffer.byteLength(code, 'utf-8');

    // 跳过过小的文件（可能是配置文件）
    if (fileSizeBefore < 100) {
      console.log(`⏭️  跳过 [${index + 1}/${jsFiles.length}]: ${relativePath} (文件太小)`);
      skippedCount++;
      return;
    }

    // 跳过已经高度压缩的文件（通过检测是否单行）
    const lineCount = code.split('\n').length;
    if (lineCount === 1 && fileSizeBefore > 50000) {
      console.log(`⏭️  跳过 [${index + 1}/${jsFiles.length}]: ${relativePath} (已压缩)`);
      skippedCount++;
      return;
    }

    console.log(`🔄 处理 [${index + 1}/${jsFiles.length}]: ${relativePath}`);

    // 执行混淆
    const startTime = Date.now();
    const obfuscated = JavaScriptObfuscator.obfuscate(code, obfuscatorOptions);
    const obfuscatedCode = obfuscated.getObfuscatedCode();
    const duration = Date.now() - startTime;

    // 写回文件
    fs.writeFileSync(filePath, obfuscatedCode, 'utf-8');

    // 统计信息
    const fileSizeAfter = Buffer.byteLength(obfuscatedCode, 'utf-8');
    const sizeChange = ((fileSizeAfter - fileSizeBefore) / fileSizeBefore * 100).toFixed(1);
    const sizeChangeStr = sizeChange > 0 ? `+${sizeChange}` : sizeChange;

    console.log(`   ✅ 完成 (${duration}ms, 大小变化: ${sizeChangeStr}%)`);
    processedCount++;

  } catch (error) {
    console.error(`   ❌ 失败: ${error.message}`);
    errorCount++;
  }
});

// 输出统计信息
console.log('\n' + '─'.repeat(50));
console.log('📊 混淆完成统计:');
console.log('─'.repeat(50));
console.log(`✅ 成功: ${processedCount} 个文件`);
console.log(`⏭️  跳过: ${skippedCount} 个文件`);
console.log(`❌ 失败: ${errorCount} 个文件`);
console.log('─'.repeat(50));

if (errorCount > 0) {
  console.log('\n⚠️  部分文件混淆失败，但不影响整体使用');
}

console.log('\n✨ 代码混淆流程完成！');
console.log('\n💡 提示:');
console.log('   - 混淆后的代码体积可能增大 20-50%');
console.log('   - 可以使用微信开发者工具测试混淆后的代码');
console.log('   - 混淆会增加一定的运行时开销（通常 < 5%）');
console.log('');

process.exit(errorCount > 0 ? 1 : 0);
