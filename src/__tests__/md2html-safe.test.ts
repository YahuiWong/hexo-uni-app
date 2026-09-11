import { describe, it, expect } from 'vitest';
import { md2html } from '@/utils/md2html-safe';

describe('md2html-safe - Markdown 安全转换', () => {
  describe('基础 Markdown 元素', () => {
    it('应该正确转换标题', () => {
      const markdown = '# H1 标题\n## H2 标题\n### H3 标题';
      const html = md2html(markdown);

      expect(html).toContain('<h1');
      expect(html).toContain('H1 标题');
      expect(html).toContain('<h2');
      expect(html).toContain('H2 标题');
      expect(html).toContain('<h3');
      expect(html).toContain('H3 标题');
    });

    it('应该正确转换段落', () => {
      const markdown = '这是第一段\n\n这是第二段';
      const html = md2html(markdown);

      expect(html).toContain('<p>');
      expect(html).toContain('这是第一段');
      expect(html).toContain('这是第二段');
    });

    it('应该正确转换粗体和斜体', () => {
      const markdown = '**粗体文字** *斜体文字*';
      const html = md2html(markdown);

      expect(html).toContain('<strong>');
      expect(html).toContain('粗体文字');
      expect(html).toContain('<em>');
      expect(html).toContain('斜体文字');
    });

    it('应该正确转换链接', () => {
      const markdown = '[链接文字](https://example.com)';
      const html = md2html(markdown);

      expect(html).toContain('<a');
      expect(html).toContain('https://example.com');
      expect(html).toContain('链接文字');
    });

    it('应该正确转换图片', () => {
      const markdown = '![图片描述](https://example.com/image.jpg)';
      const html = md2html(markdown);

      expect(html).toContain('<img');
      expect(html).toContain('https://example.com/image.jpg');
      expect(html).toContain('图片描述');
    });

    it('应该正确转换列表', () => {
      const markdown = '- 项目 1\n- 项目 2\n- 项目 3';
      const html = md2html(markdown);

      expect(html).toContain('<ul>');
      expect(html).toContain('<li>');
      expect(html).toContain('项目 1');
      expect(html).toContain('项目 2');
    });

    it('应该正确转换有序列表', () => {
      const markdown = '1. 第一项\n2. 第二项\n3. 第三项';
      const html = md2html(markdown);

      expect(html).toContain('<ol>');
      expect(html).toContain('<li>');
      expect(html).toContain('第一项');
    });

    it('应该正确转换引用块', () => {
      const markdown = '> 这是一段引用';
      const html = md2html(markdown);

      expect(html).toContain('<blockquote>');
      expect(html).toContain('这是一段引用');
    });

    it('应该正确转换水平线', () => {
      const markdown = '---';
      const html = md2html(markdown);

      expect(html).toContain('<hr');
    });
  });

  describe('代码块处理', () => {
    it('应该正确转换行内代码', () => {
      const markdown = '这是 `行内代码` 示例';
      const html = md2html(markdown);

      expect(html).toContain('class="inline-code"');
      expect(html).toContain('行内代码');
    });

    it('应该正确转换代码块（无语言标识）', () => {
      const markdown = '```\nconst a = 1;\nconst b = 2;\n```';
      const html = md2html(markdown);

      console.log('代码块HTML:', html);

      expect(html).toContain('class="code-block'); // 允许有额外的类名
      expect(html).toContain('const a = 1;');
      expect(html).toContain('const b = 2;');
    });

    it('应该正确转换代码块（带语言标识 - JavaScript）', () => {
      const markdown = '```javascript\nfunction hello() {\n  console.log("Hello");\n}\n```';
      const html = md2html(markdown);

      console.log('JavaScript代码块HTML:', html);

      expect(html).toContain('class="code-block');
      expect(html).toContain('language-javascript');
      expect(html).toContain('function');
      expect(html).toContain('console');

      // 验证 Prism.js 语法高亮（应该包含 token 类名）
      expect(html).toContain('token'); // Prism 会添加 .token.* 类名
    });

    it('应该正确转换代码块（带语言标识 - Python）', () => {
      const markdown = '```python\ndef hello():\n    print("Hello")\n```';
      const html = md2html(markdown);

      console.log('Python代码块HTML:', html);

      expect(html).toContain('class="code-block"');
      expect(html).toContain('language-python');
      expect(html).toContain('def hello()');
      // 双引号会被转义为 &quot; (防止 XSS)
      expect(html).toContain('print(&quot;Hello&quot;)');
    });

    it('应该正确转换代码块（带语言标识 - HTML）', () => {
      const markdown = '```html\n<div class="container">\n  <p>Hello</p>\n</div>\n```';
      const html = md2html(markdown);

      console.log('HTML代码块HTML:', html);

      expect(html).toContain('class="code-block');
      expect(html).toContain('language-html');
      // 注意：Prism.js 会将 HTML 标签转换为 token spans
      // 验证内容存在即可
      expect(html).toContain('div');
      expect(html).toContain('container');
      expect(html).toContain('Hello');
    });

    it('应该转义代码块中的特殊字符', () => {
      const markdown = '```\n<script>alert("XSS")</script>\n```';
      const html = md2html(markdown);

      console.log('特殊字符转义HTML:', html);

      // 确保 HTML 标签被转义或被 Prism token化，防止 XSS
      // 重要：不应该有原始的 <script> 标签
      expect(html).not.toContain('<script>alert');
      expect(html).not.toContain('</script>');

      // 验证 script 文本存在（即使是token化的）
      expect(html).toContain('script');
      expect(html).toContain('alert');
    });
  });

  describe('数学公式处理', () => {
    it('应该正确处理行内数学公式', () => {
      const markdown = '这是一个公式 $E = mc^2$ 示例';
      const html = md2html(markdown);

      console.log('行内数学公式HTML:', html);

      // 注意：由于 walkTokens 的限制，数学公式可能需要后处理
      // 当前简化实现：保留原始 $ 符号，让 mp-html 插件处理
      expect(html).toContain('E = mc^2');
    });

    it('应该正确处理块级数学公式（双美元符）', () => {
      const markdown = '$$\nE = mc^2\n$$';
      const html = md2html(markdown);

      console.log('块级数学公式HTML:', html);

      // 注意：$$...$ 在 Markdown 中会被当作段落处理
      // 应该使用代码块形式：```math
      expect(html).toContain('E = mc^2');
    });

    it('应该正确处理代码块中的数学公式语言标识', () => {
      const markdown = '```math\nE = mc^2\n```';
      const html = md2html(markdown);

      console.log('数学公式代码块HTML:', html);

      expect(html).toContain('class="math-block"');
      expect(html).toContain('$$E = mc^2$$');
    });

    it('应该正确处理 LaTeX 语言标识', () => {
      const markdown = '```latex\n\\frac{1}{2}\n```';
      const html = md2html(markdown);

      expect(html).toContain('class="math-block"');
      expect(html).toContain('$$\\frac{1}{2}$$');
    });

    it('应该正确处理 KaTeX 语言标识', () => {
      const markdown = '```katex\n\\sum_{i=1}^{n} i\n```';
      const html = md2html(markdown);

      expect(html).toContain('class="math-block"');
      expect(html).toContain('$$\\sum_{i=1}^{n} i$$');
    });
  });

  describe('Mermaid 图表处理', () => {
    it('应该正确处理 Mermaid 图表', () => {
      const markdown = '```mermaid\ngraph TD\n  A-->B\n```';
      const html = md2html(markdown);

      console.log('Mermaid图表HTML:', html);

      expect(html).toContain('class="mermaid"');
      expect(html).toContain('graph TD');
      expect(html).toContain('A--&gt;B');
    });
  });

  describe('表格处理', () => {
    it('应该正确转换表格', () => {
      const markdown = `| 列1 | 列2 | 列3 |
|-----|-----|-----|
| A1  | A2  | A3  |
| B1  | B2  | B3  |`;
      const html = md2html(markdown);

      console.log('表格HTML:', html);

      expect(html).toContain('<table>');
      expect(html).toContain('<thead>');
      expect(html).toContain('<tbody>');
      expect(html).toContain('<th>');
      expect(html).toContain('<td>');
      expect(html).toContain('列1');
      expect(html).toContain('A1');
    });
  });

  describe('复杂场景测试', () => {
    it('应该正确处理混合内容', () => {
      const markdown = `# 标题

这是一段**粗体**和*斜体*混合的文字。

## 代码示例

\`\`\`javascript
function test() {
  console.log("Hello");
}
\`\`\`

## 列表

- 项目 1
- 项目 2

## 链接

[访问链接](https://example.com)
`;
      const html = md2html(markdown);

      console.log('混合内容HTML:', html);

      expect(html).toContain('<h1');
      expect(html).toContain('<h2');
      expect(html).toContain('<strong>');
      expect(html).toContain('<em>');
      expect(html).toContain('class="code-block'); // 允许有额外的类名
      expect(html).toContain('<ul>');
      expect(html).toContain('<a');
    });

    it('应该正确处理多个代码块', () => {
      const markdown = `\`\`\`javascript
const a = 1;
\`\`\`

一些文字

\`\`\`python
def hello():
    pass
\`\`\``;
      const html = md2html(markdown);

      console.log('多个代码块HTML:', html);

      const codeBlocks = html.match(/class="code-block/g);
      expect(codeBlocks).toBeTruthy();
      expect(codeBlocks?.length).toBe(2);
      expect(html).toContain('language-javascript');
      expect(html).toContain('language-python');
    });

    it('应该正确处理嵌套结构', () => {
      const markdown = `> 引用块中包含 \`行内代码\` 和 **粗体**`;
      const html = md2html(markdown);

      expect(html).toContain('<blockquote>');
      expect(html).toContain('class="inline-code"');
      expect(html).toContain('<strong>');
    });
  });

  describe('边界情况测试', () => {
    it('应该处理空字符串', () => {
      const html = md2html('');
      expect(html).toBe('');
    });

    it('应该处理仅包含空格的字符串', () => {
      const html = md2html('   ');
      // marked 会将纯空格转换为空字符串，这是预期行为
      expect(html).toBe('');
    });

    it('应该处理特殊字符', () => {
      const markdown = '< > & " \'';
      const html = md2html(markdown);

      // 这些字符在 Markdown 中应该被正常处理
      expect(html).toBeTruthy();
    });

    it('应该处理中文内容', () => {
      const markdown = '这是中文内容，包含**加粗**和`代码`';
      const html = md2html(markdown);

      expect(html).toContain('这是中文内容');
      expect(html).toContain('<strong>');
      expect(html).toContain('class="inline-code"');
    });

    it('应该处理没有代码的代码块', () => {
      const markdown = '```\n```';
      const html = md2html(markdown);

      expect(html).toContain('class="code-block');
    });

    it('应该处理带有特殊语言标识的代码块', () => {
      const markdown = '```unknown-language\nsome code\n```';
      const html = md2html(markdown);

      expect(html).toContain('class="code-block"');
      expect(html).toContain('language-unknown-language');
      expect(html).toContain('some code');
    });
  });

  describe('安全性测试', () => {
    it('应该防止 XSS 攻击（代码块）', () => {
      const markdown = '```\n<script>alert("XSS")</script>\n```';
      const html = md2html(markdown);

      // script 标签不应该以可执行形式存在
      expect(html).not.toContain('<script>alert');
      // 验证内容存在（可能是转义的或token化的）
      expect(html).toContain('script');
      expect(html).toContain('alert');
    });

    it('应该防止 XSS 攻击（行内代码）', () => {
      const markdown = '`<img src=x onerror=alert(1)>`';
      const html = md2html(markdown);

      // HTML 标签应该被转义
      expect(html).not.toContain('<img');
      expect(html).toContain('&lt;img');
    });

    it('应该正确转义 Mermaid 内容', () => {
      const markdown = '```mermaid\n<script>alert(1)</script>\n```';
      const html = md2html(markdown);

      expect(html).not.toContain('<script>');
      expect(html).toContain('&lt;script&gt;');
    });
  });

  describe('GFM 特性测试', () => {
    it('应该支持删除线', () => {
      const markdown = '~~删除的文字~~';
      const html = md2html(markdown);

      expect(html).toContain('<del>');
      expect(html).toContain('删除的文字');
    });

    it('应该支持任务列表', () => {
      const markdown = `- [x] 已完成任务
- [ ] 未完成任务`;
      const html = md2html(markdown);

      expect(html).toContain('<input');
      expect(html).toContain('type="checkbox"');
      expect(html).toContain('checked');
    });

    it('应该支持单行换行（breaks: true）', () => {
      const markdown = '第一行\n第二行';
      const html = md2html(markdown);

      // 由于 breaks: true，单个换行应该产生 <br>
      expect(html).toContain('<br>');
    });
  });

  describe('性能测试', () => {
    it('应该能够处理较长的文档', () => {
      const longMarkdown = Array(100)
        .fill('# 标题\n\n段落内容\n\n```javascript\nconst a = 1;\n```\n')
        .join('\n');

      const startTime = performance.now();
      const html = md2html(longMarkdown);
      const endTime = performance.now();

      const duration = endTime - startTime;

      console.log(`处理 ${longMarkdown.length} 字符的文档耗时: ${duration.toFixed(2)}ms`);

      expect(html).toBeTruthy();
      expect(duration).toBeLessThan(1000); // 应该在 1 秒内完成
    });
  });
});
