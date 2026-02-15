/**
 * 安全的 Markdown 转 HTML 工具
 * 避免使用包含 Unicode 正则表达式的库（如 highlight.js 的某些语言定义）
 * 适用于 Android 平台兼容性
 */

import { marked } from 'marked';

/**
 * 将 Markdown 字符串转换为 HTML
 * 支持：
 *   - GFM（表格、任务列表等）
 *   - 代码块（不使用 highlight.js，使用简单样式）
 *   - 数学公式占位符（需要配合 mp-html 的 KaTeX 插件）
 *   - Mermaid 图表占位符
 */
export function md2html(markdown: string): string {
  // 创建自定义 renderer
  const renderer = new marked.Renderer();

  // 代码块渲染 - 不使用 highlight.js
  // 注意：marked 的 renderer 方法接收 token 对象，不是字符串
  renderer.code = function (token: any): string {
    const code = token.text || '';  // 代码内容在 token.text 中
    const lang = (token.lang || '').trim().toLowerCase() || 'plaintext';

    // 1. Mermaid 图表
    if (lang === 'mermaid') {
      return `<div class="mermaid">${escapeHtml(code)}</div>`;
    }

    // 2. 数学公式块（KaTeX）
    if (['math', 'latex', 'katex'].includes(lang)) {
      return `<div class="math-block">$$${escapeHtml(code)}$$</div>`;
    }

    // 3. 普通代码块 - 使用简单的 pre/code 标签，不进行语法高亮
    return `<pre class="code-block"><code class="language-${escapeHtml(lang)}">${escapeHtml(code)}</code></pre>\n`;
  };

  // 行内代码渲染
  renderer.codespan = function (token: any): string {
    const code = token.text || '';  // 代码内容在 token.text 中
    return `<code class="inline-code">${escapeHtml(code)}</code>`;
  };

  // 处理行内数学公式（$...$）和块级数学公式（$$...$$）
  const walkTokens = (token: any) => {
    if (token.type === 'text' || token.type === 'paragraph' || token.type === 'heading') {
      if (typeof token.text === 'string') {
        token.text = renderMathInText(token.text);
      }
    }

    if (token.tokens && Array.isArray(token.tokens)) {
      token.tokens.forEach(walkTokens);
    }

    if (token.type === 'table' && token.cells) {
      token.cells.forEach((row: any[]) => {
        row.forEach((cell: any) => {
          if (cell.tokens) cell.tokens.forEach(walkTokens);
        });
      });
    }
  };

  function renderMathInText(text: string): string {
    // 先处理块级公式 $$...$$
    text = text.replace(/\$\$([\s\S]+?)\$\$/g, (_, expr) => {
      return `<span class="math-display">$$${escapeHtml(expr.trim())}$$</span>`;
    });

    // 再处理行内公式 $...$
    text = text.replace(/\$([\s\S]+?)\$/g, (_, expr) => {
      // 避免误匹配（如果包含 $ 则可能是误匹配）
      if (expr.includes('$')) return `$${escapeHtml(expr)}$`;
      return `<span class="math-inline">$${escapeHtml(expr.trim())}$</span>`;
    });

    return text;
  }

  // 使用 marked.parse 一次性完成转换，传入 renderer 配置
  const html = marked.parse(markdown, {
    renderer,
    gfm: true,
    breaks: true,
    pedantic: false,
    walkTokens,
  }) as string;

  return html;
}

/**
 * HTML 转义函数
 */
function escapeHtml(text: unknown): string {
  if (typeof text !== 'string') {
    return '';
  }

  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
