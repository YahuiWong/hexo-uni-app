/**
 * 内容增强渲染工具
 * 在页面加载后渲染代码高亮、Mermaid 图表和 KaTeX 数学公式
 */

import Prism from 'prismjs';
import mermaid from 'mermaid';
import katex from 'katex';

// 导入 Prism 黑客风格主题
import 'prismjs/themes/prism-okaidia.css';

// 导入常用语言支持（避免使用包含 Unicode 正则的语言）
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-markup'; // HTML/XML
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-sql';

// 导入 KaTeX 样式
import 'katex/dist/katex.min.css';

/**
 * 初始化 Mermaid
 */
function initMermaid() {
  mermaid.initialize({
    startOnLoad: false,
    theme: 'dark', // 黑客风格主题
    securityLevel: 'loose',
    fontFamily: 'Consolas, Monaco, monospace',
  });
}

/**
 * 渲染代码高亮
 */
export function renderCodeHighlight() {
  // 查找所有代码块
  const codeBlocks = document.querySelectorAll('pre code[class*="language-"]');

  codeBlocks.forEach((block) => {
    const codeElement = block as HTMLElement;
    const langMatch = codeElement.className.match(/language-(\w+)/);

    if (!langMatch) return;

    const lang = langMatch[1];

    // 检查 Prism 是否支持该语言
    if (Prism.languages[lang]) {
      try {
        // 获取原始代码
        const code = codeElement.textContent || '';

        // 使用 Prism 高亮
        const highlighted = Prism.highlight(
          code,
          Prism.languages[lang],
          lang
        );

        // 更新内容
        codeElement.innerHTML = highlighted;

        // 添加 Prism 类名
        codeElement.classList.add(`language-${lang}`);
        if (codeElement.parentElement) {
          codeElement.parentElement.classList.add(`language-${lang}`);
        }
      } catch (e) {
        console.error(`代码高亮失败 (${lang}):`, e);
      }
    }
  });
}

/**
 * 渲染 Mermaid 图表
 */
export async function renderMermaid() {
  initMermaid();

  const mermaidElements = document.querySelectorAll('.mermaid');

  for (let i = 0; i < mermaidElements.length; i++) {
    const element = mermaidElements[i] as HTMLElement;

    try {
      const code = element.textContent || '';

      // 跳过空内容
      if (!code.trim()) continue;

      // 使用 Mermaid 渲染
      const { svg } = await mermaid.render(`mermaid-${i}-${Date.now()}`, code);

      // 替换内容
      element.innerHTML = svg;
      element.classList.add('mermaid-rendered');
    } catch (e) {
      console.error('Mermaid 渲染失败:', e);
      // 渲染失败时显示错误信息
      element.innerHTML = `<div style="color: red; padding: 20rpx;">
        Mermaid 渲染失败<br>
        <small>${e instanceof Error ? e.message : '未知错误'}</small>
      </div>`;
    }
  }
}

/**
 * 渲染 KaTeX 数学公式
 */
export function renderMath() {
  // 渲染块级数学公式
  const blockMathElements = document.querySelectorAll('.math-block');

  blockMathElements.forEach((element) => {
    try {
      const latex = (element.textContent || '').trim().replace(/^\$\$|\$\$$/g, '');

      if (!latex) return;

      katex.render(latex, element as HTMLElement, {
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

      katex.render(latex, element as HTMLElement, {
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
 */
export async function renderAll() {
  console.log('开始渲染增强内容...');

  try {
    // 1. 代码高亮（同步）
    renderCodeHighlight();
    console.log('✓ 代码高亮完成');

    // 2. 数学公式（同步）
    renderMath();
    console.log('✓ 数学公式渲染完成');

    // 3. Mermaid 图表（异步）
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
