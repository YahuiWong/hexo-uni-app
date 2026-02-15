import { describe, it, expect } from 'vitest';
import { marked } from 'marked';

describe('Marked 行为调试', () => {
  it('测试 marked 的默认行为', () => {
    const markdown = '```javascript\nconst a = 1;\n```';
    const html = marked.parse(markdown) as string;

    console.log('默认 HTML:', html);
    expect(html).toBeTruthy();
  });

  it('测试自定义 renderer.code', () => {
    const renderer = new marked.Renderer();

    // 记录被调用的参数
    renderer.code = function(code, lang) {
      console.log('renderer.code 被调用');
      console.log('  code:', code);
      console.log('  code type:', typeof code);
      console.log('  code length:', code?.length);
      console.log('  lang:', lang);

      return `<pre><code>${code}</code></pre>`;
    };

    const markdown = '```javascript\nconst a = 1;\nconst b = 2;\n```';
    const html = marked.parse(markdown, { renderer }) as string;

    console.log('最终 HTML:', html);
  });

  it('测试行内代码', () => {
    const renderer = new marked.Renderer();

    renderer.codespan = function(code) {
      console.log('renderer.codespan 被调用');
      console.log('  code:', code);
      console.log('  code type:', typeof code);

      return `<code>${code}</code>`;
    };

    const markdown = '这是 `行内代码` 示例';
    const html = marked.parse(markdown, { renderer }) as string;

    console.log('最终 HTML:', html);
  });
});