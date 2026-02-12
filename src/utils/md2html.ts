// src/utils/md2html.ts
import { marked } from 'marked';
import hljs from 'highlight.js';
import katex from 'katex';

// 推荐在项目全局引入样式（例如在 App.vue 或 uni.scss 中）
// @import 'highlight.js/styles/github.css';
// @import 'katex/dist/katex.min.css';

/**
 * 将 Markdown 字符串转换为适合 mp-html 的 HTML 字符串
 * 支持：
 *   - GFM（表格、任务列表等）
 *   - 代码高亮（highlight.js）
 *   - KaTeX 数学公式（$$   ...   $$ 和 $$    ...    $$）
 *   - Mermaid 图表（```mermaid
 */
export function md2html(markdown: string): string {
  // 创建自定义 renderer
  const renderer = new marked.Renderer();

 // 在 renderer.code 里面最开头加防护
renderer.code = function (code: string | undefined, infostring?: string): string {
  // 强制转成字符串 + 兜底空字符串
  const safeCode = typeof code === 'string' ? code : '';

  // infostring 处理（保持原样）
  const langPart = (infostring || '').trim().split(/\s+/)[0].toLowerCase();
  const lang = langPart || 'plaintext';

  // 1. Mermaid
  if (lang === 'mermaid') {
    return `<div class="mermaid">${escapeHtml(safeCode)}</div>`;
  }

  // 2. math/latex/katex 块
  if (['math', 'latex', 'katex'].includes(lang)) {
    try {
      const html = katex.renderToString(safeCode, {
        throwOnError: false,
        displayMode: true,
      });
      return `<div class="katex-block">${html}</div>`;
    } catch (err) {
      console.warn('KaTeX block error:', err);
      return `<pre class="language-text">${escapeHtml(safeCode)}</pre>`;
    }
  }

  // 3. 普通代码高亮
  const useLang = hljs.getLanguage(lang) ? lang : 'plaintext';

  try {
    const result = hljs.highlight(safeCode, {
      language: useLang,
      ignoreIllegals: true,
    });
    return `<pre><code class="hljs language-${result.language || 'plaintext'}">${result.value}</code></pre>\n`;
  } catch (err) {
    console.warn(`Highlight failed for "${useLang}":`, err);
    return `<pre><code class="language-${useLang}">${escapeHtml(safeCode)}</code></pre>\n`;
  }
};

  // 配置 marked
  marked.use({
    renderer,
    gfm: true,
    breaks: true, // 单个换行也转 <br>
    pedantic: false,
  });

  // 4. 自定义 walkTokens 来处理行内 $...$ 和独立 $$...$$
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
      try {
        return katex.renderToString(expr.trim(), { throwOnError: false, displayMode: true });
      } catch (e) {
        return `<span class="math-error">$$${escapeHtml(expr)}$$</span>`;
      }
    });

    // 再处理行内公式 $...$ （非贪婪匹配，避免误匹配 $$）
    text = text.replace(/\$([\s\S]+?)\$/g, (_, expr) => {
      // 简单过滤：如果包含 $ 则可能是误匹配
      if (expr.includes('$')) return `$${escapeHtml(expr)}$`;
      try {
        return katex.renderToString(expr.trim(), { throwOnError: false, displayMode: false });
      } catch (e) {
        return `<span class="math-error">$${escapeHtml(expr)}$</span>`;
      }
    });

    return text;
  }

  // 5. 执行解析
  const tokens = marked.lexer(markdown);
  tokens.forEach(walkTokens);
  const html = marked.parser(tokens);

  return html;
}

// 简单 HTML 转义函数（用于 mermaid 代码块等）
function escapeHtml(text: unknown): string {
  // 如果不是字符串 → 转成字符串或返回空
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