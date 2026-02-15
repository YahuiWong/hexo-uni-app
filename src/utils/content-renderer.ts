/**
 * 内容增强渲染工具
 * 在页面加载后渲染代码高亮、Mermaid 图表和 KaTeX 数学公式
 *
 * 注意：此文件仅在 H5 平台使用，通过动态导入避免构建错误
 */

/**
 * 初始化 Mermaid（动态导入）
 */
async function initMermaid() {
  const mermaid = await import('mermaid');
  mermaid.default.initialize({
    startOnLoad: false,
    theme: 'dark', // 黑客风格主题
    securityLevel: 'loose',
    fontFamily: 'Consolas, Monaco, monospace',
  });
  return mermaid.default;
}

/**
 * 渲染代码高亮
 * 注意：此功能已在 md2html-safe.ts 中使用 Prism.js 实现
 * 此函数保留用于后期可能的客户端二次高亮
 */
export function renderCodeHighlight() {
  console.log('代码高亮已在 Markdown 转换时完成');
}

/**
 * 渲染 Mermaid 图表（动态导入）
 */
export async function renderMermaid() {
  const mermaidLib = await initMermaid();

  const mermaidElements = document.querySelectorAll('.mermaid');

  for (let i = 0; i < mermaidElements.length; i++) {
    const element = mermaidElements[i] as HTMLElement;

    try {
      const code = element.textContent || '';

      // 跳过空内容
      if (!code.trim()) continue;

      // 使用 Mermaid 渲染
      const { svg } = await mermaidLib.render(`mermaid-${i}-${Date.now()}`, code);

      // 替换内容
      element.innerHTML = svg;
      element.classList.add('mermaid-rendered');
    } catch (e) {
      console.error('Mermaid 渲染失败:', e);
      // 渲染失败时显示错误信息
      element.innerHTML = `<div style="color: red; padding: 10px;">
        Mermaid 渲染失败<br>
        <small>${e instanceof Error ? e.message : '未知错误'}</small>
      </div>`;
    }
  }
}

/**
 * 渲染 KaTeX 数学公式（动态导入）
 */
export async function renderMath() {
  const katex = await import('katex');

  // 动态导入 KaTeX 样式
  await import('katex/dist/katex.min.css');

  // 渲染块级数学公式
  const blockMathElements = document.querySelectorAll('.math-block');

  blockMathElements.forEach((element) => {
    try {
      const latex = (element.textContent || '').trim().replace(/^\$\$|\$\$$/g, '');

      if (!latex) return;

      katex.default.render(latex, element as HTMLElement, {
        throwOnError: false,
        displayMode: true,
        output: 'html',
      });

      element.classList.add('math-rendered');
    } catch (e) {
      console.error('KaTeX 块级公式渲染失败:', e);
    }
  });

  // 渲染行内数学公式
  const inlineMathElements = document.querySelectorAll('.math-inline');

  inlineMathElements.forEach((element) => {
    try {
      const latex = (element.textContent || '').trim().replace(/^\$|\$$/g, '');

      if (!latex) return;

      katex.default.render(latex, element as HTMLElement, {
        throwOnError: false,
        displayMode: false,
        output: 'html',
      });

      element.classList.add('math-rendered');
    } catch (e) {
      console.error('KaTeX 行内公式渲染失败:', e);
    }
  });
}

/**
 * 渲染所有增强内容
 * 在页面 onMounted 时调用
 * 注意：所有依赖都通过动态导入，避免构建时错误
 */
export async function renderAll() {
  console.log('开始渲染增强内容...');

  try {
    // 1. 代码高亮（已在 md2html-safe.ts 中完成）
    renderCodeHighlight();
    console.log('✓ 代码高亮完成');

    // 2. 数学公式（异步，动态导入）
    await renderMath();
    console.log('✓ 数学公式渲染完成');

    // 3. Mermaid 图表（异步，动态导入）
    await renderMermaid();
    console.log('✓ Mermaid 图表渲染完成');

    console.log('✓ 所有增强内容渲染完成');
  } catch (e) {
    console.error('渲染增强内容时出错:', e);
  }
}

/**
 * 在 Vue 组件中使用示例：
 *
 * ```typescript
 * import { onMounted, nextTick } from 'vue';
 * import { renderAll } from '@/utils/content-renderer';
 *
 * onMounted(() => {
 *   nextTick(() => {
 *     renderAll();
 *   });
 * });
 * ```
 */
