/**
 * Lightweight, zero-dependency JavaScript/TypeScript syntax highlighter.
 * Generates semantic HTML tokens with high-contrast GitBook/VS Code styling.
 */
export function highlightJS(code: string): string {
  if (!code) return '';

  const tokenRegex = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(`(?:\\.|[^`])*`|"(?:\\.|[^"\\])*"|\x27(?:\\.|[^\x27\\])*\x27)|(\b(?:const|let|var|function|return|if|else|switch|case|break|for|while|class|constructor|this|import|export|from|require|async|await|try|catch|throw|new|typeof|interface|type|extends|implements|yield|default|super)\b)|(\b(?:true|false|null|undefined|NaN|Promise|Map|Set|Buffer|Array|Object|JSON|console|process|Error|Math)\b)|(\b\d+(?:\.\d+)?\b)|(\b[a-zA-Z_$][a-zA-Z0-9_$]*(?=\s*\())|([&<>])/g;

  return code.replace(tokenRegex, (match, comment, str, kw, builtin, num, fn, escapeChar) => {
    if (escapeChar) {
      if (escapeChar === '&') return '&amp;';
      if (escapeChar === '<') return '&lt;';
      if (escapeChar === '>') return '&gt;';
    }
    if (comment) {
      const escaped = comment.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return `<span class="tok-comment">${escaped}</span>`;
    }
    if (str) {
      const escaped = str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return `<span class="tok-string">${escaped}</span>`;
    }
    if (kw) return `<span class="tok-keyword">${kw}</span>`;
    if (builtin) return `<span class="tok-builtin">${builtin}</span>`;
    if (num) return `<span class="tok-number">${num}</span>`;
    if (fn) return `<span class="tok-func">${fn}</span>`;
    return match;
  });
}
