/**
 * High-performance, zero-dependency syntax highlighter for JavaScript/TypeScript,
 * Rust, TOML, and Shell. Generates semantic HTML tokens with high-contrast
 * GitBook and VS Code dark colors.
 */

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function unescapeHtml(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

const jsPatterns = [
  ['comment', /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/.source],
  ['string', /(`(?:\\.|[^`])*`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/.source],
  ['decorator', /(@[a-zA-Z_$][a-zA-Z0-9_$]*)/.source],
  ['keyword', /\b(?:const|let|var|function|return|if|else|switch|case|break|continue|for|while|do|class|constructor|this|super|import|export|from|as|default|async|await|yield|try|catch|finally|throw|new|typeof|instanceof|in|of|extends|implements|interface|type|enum|declare|abstract|private|protected|public|readonly|static|override|keyof|satisfies|asserts|is|get|set)\b/.source],
  ['literal', /\b(?:true|false|null|undefined|NaN|Infinity)\b/.source],
  ['type', /\b(?:string|number|boolean|symbol|bigint|void|any|never|unknown|object|Record|Partial|Required|Readonly|Pick|Omit|Exclude|Extract|NonNullable|Parameters|ReturnType|Promise|Map|Set|WeakMap|WeakSet|Array|Object|Buffer|Uint8Array|Int32Array|Float64Array|ArrayBuffer|DataView|Error|TypeError|RangeError|RegExp|Date|JSON|Math|Reflect|Atomics)\b/.source],
  ['builtin', /\b(?:console|process|window|document|globalThis|fetch|setTimeout|clearTimeout|setInterval|clearInterval|setImmediate|clearImmediate|AbortController|EventEmitter|Response|Request|Headers|URL|URLSearchParams)\b/.source],
  ['number', /\b(?:0x[0-9a-fA-F_]+|0b[01_]+|0o[0-7_]+|\d[\d_]*(?:\.[\d_]+)?(?:[eE][+-]?\d+)?n?)\b/.source],
  ['prop', /\b[a-zA-Z_$][a-zA-Z0-9_$]*(?=\s*:)/.source],
  ['func', /\b[a-zA-Z_$][a-zA-Z0-9_$]*(?=\s*\()/.source],
  ['type_ident', /\b[A-Z][a-zA-Z0-9_$]*\b/.source],
  ['operator', /(?:===|!==|==|!=|<=|>=|=>|&&|\|\||\?\?|\?\.(?!\d)|\.\.\.|\+=|-=|\*=|\/=|%=|&=|\|=|\^=|<<=|>>=|>>>=|\+|-|\*|\/|%|&|\||\^|~|!|=|<|>|\?)/.source],
  ['punct', /[{}()\[\];,.:]/.source],
  ['escape', /[&<>]/.source]
] as const;

const rustPatterns = [
  ['comment', /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/.source],
  ['attribute', /(#!?\[(?:[^\]"']|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')*\])/.source],
  ['string', /(r#*"(?:[\s\S]*?)"#*|b?"(?:\\.|[^"\\])*"|b?'(?:\\.|[^'\\])')/.source],
  ['lifetime', /('[a-zA-Z_][a-zA-Z0-9_]*\b)/.source],
  ['macro', /\b([a-zA-Z_][a-zA-Z0-9_]*!(?=\s*[({\[]))/.source],
  ['keyword', /\b(?:fn|let|mut|const|static|struct|enum|impl|trait|type|pub|use|mod|crate|super|self|Self|where|for|in|loop|while|if|else|match|return|break|continue|move|ref|unsafe|async|await|dyn|as|extern|default)\b/.source],
  ['literal', /\b(?:true|false|Some|None|Ok|Err)\b/.source],
  ['type', /\b(?:i8|i16|i32|i64|i128|isize|u8|u16|u32|u64|u128|usize|f32|f64|bool|char|str|String|Option|Result|Vec|Box|Rc|Arc|Mutex|RwLock|RefCell|Cell|HashMap|HashSet|BTreeMap|BTreeSet|Pin|Future|Send|Sync|Drop|Clone|Copy|Debug|Default|Display|Error|From|Into|AsRef|AsMut|Stream|Sink|Poll|Path|PathBuf|File|Duration|Instant|Thread|AtomicBool|AtomicUsize|AtomicI32)\b/.source],
  ['number', /\b(?:0x[0-9a-fA-F_]+|0b[01_]+|0o[0-7_]+|\d[\d_]*(?:\.[\d_]+)?(?:[eE][+-]?\d+)?(?:[iu](?:8|16|32|64|128|size)|f32|f64)?)\b/.source],
  ['func', /\b[a-zA-Z_][a-zA-Z0-9_]*(?=\s*\()/.source],
  ['type_ident', /\b[A-Z][a-zA-Z0-9_]*\b/.source],
  ['operator', /(?:->|=>|::|\.\.=?|&mut|&&|\|\||==|!=|<=|>=|\+=|-=|\*=|\/=|%=|&=|\|=|\^=|<<=|>>=|[+\-*\/%&|^~!=<>]|\?)/.source],
  ['punct', /[{}()\[\];,.:]/.source],
  ['escape', /[&<>]/.source]
] as const;

const tomlPatterns = [
  ['comment', /(#[^\n]*)/.source],
  ['attribute', /(\[[^\]]+\])/.source],
  ['prop', /([a-zA-Z0-9_-]+(?=\s*=))/.source],
  ['string', /("(?:\\.|[^"\\])*")/.source],
  ['literal', /\b(?:true|false)\b/.source],
  ['number', /\b\d+(?:\.\d+)?\b/.source],
  ['operator', /([=])/.source],
  ['escape', /[&<>]/.source]
] as const;

const bashPatterns = [
  ['comment', /(#[^\n]*)/.source],
  ['string', /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/.source],
  ['keyword', /\b(?:cargo|rustup|valgrind|docker|npm|pnpm|node|npx|git|curl|FROM|AS|RUN|COPY|WORKDIR|CMD|ENTRYPOINT|ENV|EXPOSE|RUSTFLAGS)\b/.source],
  ['builtin', /(--[a-zA-Z0-9_-]+|-[a-zA-Z0-9])/.source],
  ['number', /\b\d+\b/.source],
  ['escape', /[&<>]/.source]
] as const;

const jsRegex = new RegExp(jsPatterns.map(([name, src]) => `(?<${name}>${src})`).join('|'), 'g');
const rustRegex = new RegExp(rustPatterns.map(([name, src]) => `(?<${name}>${src})`).join('|'), 'g');
const tomlRegex = new RegExp(tomlPatterns.map(([name, src]) => `(?<${name}>${src})`).join('|'), 'g');
const bashRegex = new RegExp(bashPatterns.map(([name, src]) => `(?<${name}>${src})`).join('|'), 'g');

export function highlightJS(code: string): string {
  if (!code) return '';
  return code.replace(jsRegex, (match, ...args) => {
    const g = args[args.length - 1] as Record<string, string | undefined>;
    if (g.escape) return escapeHtml(g.escape);
    if (g.comment) return `<span class="tok-comment">${escapeHtml(match)}</span>`;
    if (g.string) return `<span class="tok-string">${escapeHtml(match)}</span>`;
    if (g.decorator) return `<span class="tok-decorator">${escapeHtml(match)}</span>`;
    if (g.keyword) return `<span class="tok-keyword">${escapeHtml(match)}</span>`;
    if (g.literal) return `<span class="tok-literal">${escapeHtml(match)}</span>`;
    if (g.type || g.type_ident) return `<span class="tok-type">${escapeHtml(match)}</span>`;
    if (g.builtin) return `<span class="tok-builtin">${escapeHtml(match)}</span>`;
    if (g.number) return `<span class="tok-number">${escapeHtml(match)}</span>`;
    if (g.prop) return `<span class="tok-prop">${escapeHtml(match)}</span>`;
    if (g.func) return `<span class="tok-func">${escapeHtml(match)}</span>`;
    if (g.operator) return `<span class="tok-operator">${escapeHtml(match)}</span>`;
    if (g.punct) return `<span class="tok-punct">${escapeHtml(match)}</span>`;
    return escapeHtml(match);
  });
}

export function highlightRust(code: string): string {
  if (!code) return '';
  return code.replace(rustRegex, (match, ...args) => {
    const g = args[args.length - 1] as Record<string, string | undefined>;
    if (g.escape) return escapeHtml(g.escape);
    if (g.comment) return `<span class="tok-comment">${escapeHtml(match)}</span>`;
    if (g.attribute) return `<span class="tok-attr">${escapeHtml(match)}</span>`;
    if (g.string) return `<span class="tok-string">${escapeHtml(match)}</span>`;
    if (g.lifetime) return `<span class="tok-lifetime">${escapeHtml(match)}</span>`;
    if (g.macro) return `<span class="tok-macro">${escapeHtml(match)}</span>`;
    if (g.keyword) return `<span class="tok-keyword">${escapeHtml(match)}</span>`;
    if (g.literal) return `<span class="tok-literal">${escapeHtml(match)}</span>`;
    if (g.type || g.type_ident) return `<span class="tok-type">${escapeHtml(match)}</span>`;
    if (g.number) return `<span class="tok-number">${escapeHtml(match)}</span>`;
    if (g.func) return `<span class="tok-func">${escapeHtml(match)}</span>`;
    if (g.operator) return `<span class="tok-operator">${escapeHtml(match)}</span>`;
    if (g.punct) return `<span class="tok-punct">${escapeHtml(match)}</span>`;
    return escapeHtml(match);
  });
}

export function highlightToml(code: string): string {
  if (!code) return '';
  return code.replace(tomlRegex, (match, ...args) => {
    const g = args[args.length - 1] as Record<string, string | undefined>;
    if (g.escape) return escapeHtml(g.escape);
    if (g.comment) return `<span class="tok-comment">${escapeHtml(match)}</span>`;
    if (g.attribute) return `<span class="tok-attr">${escapeHtml(match)}</span>`;
    if (g.prop) return `<span class="tok-prop">${escapeHtml(match)}</span>`;
    if (g.string) return `<span class="tok-string">${escapeHtml(match)}</span>`;
    if (g.literal) return `<span class="tok-literal">${escapeHtml(match)}</span>`;
    if (g.number) return `<span class="tok-number">${escapeHtml(match)}</span>`;
    if (g.operator) return `<span class="tok-operator">${escapeHtml(match)}</span>`;
    return escapeHtml(match);
  });
}

export function highlightBash(code: string): string {
  if (!code) return '';
  return code.replace(bashRegex, (match, ...args) => {
    const g = args[args.length - 1] as Record<string, string | undefined>;
    if (g.escape) return escapeHtml(g.escape);
    if (g.comment) return `<span class="tok-comment">${escapeHtml(match)}</span>`;
    if (g.string) return `<span class="tok-string">${escapeHtml(match)}</span>`;
    if (g.keyword) return `<span class="tok-keyword">${escapeHtml(match)}</span>`;
    if (g.builtin) return `<span class="tok-builtin">${escapeHtml(match)}</span>`;
    if (g.number) return `<span class="tok-number">${escapeHtml(match)}</span>`;
    return escapeHtml(match);
  });
}

export function detectLang(code: string): 'rust' | 'js' | 'toml' | 'bash' {
  const s = code.trim();
  if (s.startsWith('[') && s.includes(']')) return 'toml';
  if (s.startsWith('FROM ') || (s.includes('FROM ') && s.includes('AS '))) return 'bash';
  if (/^(?:#\s*|cargo\s+|rustup\s+|valgrind\s+|RUSTFLAGS=)/.test(s)) {
    if (!/\b(?:fn\s+|impl\s+|let\s+mut|struct\s+|use\s+[\w:]+;)/.test(s)) return 'bash';
  }
  if (/\b(?:fn\s+|impl\s+|let\s+mut|struct\s+|enum\s+|use\s+[\w:]+|#\[derive|mod\s+tests|println!)\b/.test(s)) return 'rust';
  if (/\b(?:const\s+|let\s+|function\s+|import\s+|export\s+|class\s+|console\.)\b/.test(s)) return 'js';
  return 'rust';
}

export function highlightCode(code: string, lang?: string): string {
  const effectiveLang = (lang || detectLang(code)).toLowerCase();
  switch (effectiveLang) {
    case 'js':
    case 'ts':
    case 'javascript':
    case 'typescript':
      return highlightJS(code);
    case 'rust':
    case 'rs':
      return highlightRust(code);
    case 'toml':
      return highlightToml(code);
    case 'bash':
    case 'sh':
    case 'shell':
    case 'docker':
    case 'dockerfile':
      return highlightBash(code);
    default:
      return highlightRust(code);
  }
}

/**
 * Transforms raw HTML by finding all <pre><code> blocks and Cheatsheet table
 * comparisons, applying syntax highlighting to each code snippet.
 */
export function highlightCodeInHtml(html: string): string {
  if (!html) return '';

  // 1. Process <pre ...><code ...>...</code></pre> blocks
  let result = html.replace(/(<pre[^>]*><code[^>]*>)([\s\S]*?)(<\/code><\/pre>)/g, (match, openTag, code, closeTag) => {
    if (code.includes('class="tok-')) return match;
    const raw = unescapeHtml(code);
    const highlighted = highlightCode(raw);
    return `${openTag}${highlighted}${closeTag}`;
  });

  // 2. Process Cheatsheet 3-column table comparison rows: <td>...</td><td><code>JS</code></td><td><code>Rust</code></td>
  result = result.replace(
    /(<tr[^>]*>[\s\S]*?<td[^>]*>[\s\S]*?<\/td>[\s\S]*?<td[^>]*>)([\s\S]*?)(<\/td>[\s\S]*?<td[^>]*>)([\s\S]*?)(<\/td>[\s\S]*?<\/tr>)/g,
    (match, prefix, jsCol, mid, rustCol, suffix) => {
      const newJsCol = jsCol.replace(/(<code>)([\s\S]*?)(<\/code>)/g, (m: string, o: string, code: string, c: string) => {
        if (code.includes('class="tok-')) return m;
        const parts = code.split(/(<br\s*\/?>)/i);
        const highlightedParts = parts.map(part => {
          if (part.toLowerCase().startsWith('<br')) return part;
          return highlightJS(unescapeHtml(part.replace(/&nbsp;/g, ' ')));
        });
        return `${o}${highlightedParts.join('')}${c}`;
      });

      const newRustCol = rustCol.replace(/(<code>)([\s\S]*?)(<\/code>)/g, (m: string, o: string, code: string, c: string) => {
        if (code.includes('class="tok-')) return m;
        const parts = code.split(/(<br\s*\/?>)/i);
        const highlightedParts = parts.map(part => {
          if (part.toLowerCase().startsWith('<br')) return part;
          return highlightRust(unescapeHtml(part.replace(/&nbsp;/g, ' ')));
        });
        return `${o}${highlightedParts.join('')}${c}`;
      });

      return `${prefix}${newJsCol}${mid}${newRustCol}${suffix}`;
    }
  );

  return result;
}
