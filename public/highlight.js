/**
 * Client-Side Syntax Highlighter for Rust for Node Devs.
 * Provides window.highlightJS, window.highlightRust, window.highlightCode,
 * and auto-enhances pre code elements on page load.
 */
(function(root) {
  function escapeHtml(str) {
    return (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function unescapeHtml(str) {
    return (str || '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }

  var jsPatterns = [
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
  ];

  var rustPatterns = [
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
  ];

  var tomlPatterns = [
    ['comment', /(#[^\n]*)/.source],
    ['attribute', /(\[[^\]]+\])/.source],
    ['prop', /([a-zA-Z0-9_-]+(?=\s*=))/.source],
    ['string', /("(?:\\.|[^"\\])*")/.source],
    ['literal', /\b(?:true|false)\b/.source],
    ['number', /\b\d+(?:\.\d+)?\b/.source],
    ['operator', /([=])/.source],
    ['escape', /[&<>]/.source]
  ];

  var bashPatterns = [
    ['comment', /(#[^\n]*)/.source],
    ['string', /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/.source],
    ['keyword', /\b(?:cargo|rustup|valgrind|docker|npm|pnpm|node|npx|git|curl|FROM|AS|RUN|COPY|WORKDIR|CMD|ENTRYPOINT|ENV|EXPOSE|RUSTFLAGS)\b/.source],
    ['builtin', /(--[a-zA-Z0-9_-]+|-[a-zA-Z0-9])/.source],
    ['number', /\b\d+\b/.source],
    ['escape', /[&<>]/.source]
  ];

  var jsRegex = new RegExp(jsPatterns.map(function(pair) { return '(?<' + pair[0] + '>' + pair[1] + ')'; }).join('|'), 'g');
  var rustRegex = new RegExp(rustPatterns.map(function(pair) { return '(?<' + pair[0] + '>' + pair[1] + ')'; }).join('|'), 'g');
  var tomlRegex = new RegExp(tomlPatterns.map(function(pair) { return '(?<' + pair[0] + '>' + pair[1] + ')'; }).join('|'), 'g');
  var bashRegex = new RegExp(bashPatterns.map(function(pair) { return '(?<' + pair[0] + '>' + pair[1] + ')'; }).join('|'), 'g');

  function highlightJS(code) {
    if (!code) return '';
    return code.replace(jsRegex, function(match) {
      var args = Array.prototype.slice.call(arguments);
      var g = args[args.length - 1] || {};
      if (g.escape) return escapeHtml(g.escape);
      if (g.comment) return '<span class="tok-comment">' + escapeHtml(match) + '</span>';
      if (g.string) return '<span class="tok-string">' + escapeHtml(match) + '</span>';
      if (g.decorator) return '<span class="tok-decorator">' + escapeHtml(match) + '</span>';
      if (g.keyword) return '<span class="tok-keyword">' + escapeHtml(match) + '</span>';
      if (g.literal) return '<span class="tok-literal">' + escapeHtml(match) + '</span>';
      if (g.type || g.type_ident) return '<span class="tok-type">' + escapeHtml(match) + '</span>';
      if (g.builtin) return '<span class="tok-builtin">' + escapeHtml(match) + '</span>';
      if (g.number) return '<span class="tok-number">' + escapeHtml(match) + '</span>';
      if (g.prop) return '<span class="tok-prop">' + escapeHtml(match) + '</span>';
      if (g.func) return '<span class="tok-func">' + escapeHtml(match) + '</span>';
      if (g.operator) return '<span class="tok-operator">' + escapeHtml(match) + '</span>';
      if (g.punct) return '<span class="tok-punct">' + escapeHtml(match) + '</span>';
      return escapeHtml(match);
    });
  }

  function highlightRust(code) {
    if (!code) return '';
    return code.replace(rustRegex, function(match) {
      var args = Array.prototype.slice.call(arguments);
      var g = args[args.length - 1] || {};
      if (g.escape) return escapeHtml(g.escape);
      if (g.comment) return '<span class="tok-comment">' + escapeHtml(match) + '</span>';
      if (g.attribute) return '<span class="tok-attr">' + escapeHtml(match) + '</span>';
      if (g.string) return '<span class="tok-string">' + escapeHtml(match) + '</span>';
      if (g.lifetime) return '<span class="tok-lifetime">' + escapeHtml(match) + '</span>';
      if (g.macro) return '<span class="tok-macro">' + escapeHtml(match) + '</span>';
      if (g.keyword) return '<span class="tok-keyword">' + escapeHtml(match) + '</span>';
      if (g.literal) return '<span class="tok-literal">' + escapeHtml(match) + '</span>';
      if (g.type || g.type_ident) return '<span class="tok-type">' + escapeHtml(match) + '</span>';
      if (g.number) return '<span class="tok-number">' + escapeHtml(match) + '</span>';
      if (g.func) return '<span class="tok-func">' + escapeHtml(match) + '</span>';
      if (g.operator) return '<span class="tok-operator">' + escapeHtml(match) + '</span>';
      if (g.punct) return '<span class="tok-punct">' + escapeHtml(match) + '</span>';
      return escapeHtml(match);
    });
  }

  function highlightToml(code) {
    if (!code) return '';
    return code.replace(tomlRegex, function(match) {
      var args = Array.prototype.slice.call(arguments);
      var g = args[args.length - 1] || {};
      if (g.escape) return escapeHtml(g.escape);
      if (g.comment) return '<span class="tok-comment">' + escapeHtml(match) + '</span>';
      if (g.attribute) return '<span class="tok-attr">' + escapeHtml(match) + '</span>';
      if (g.prop) return '<span class="tok-prop">' + escapeHtml(match) + '</span>';
      if (g.string) return '<span class="tok-string">' + escapeHtml(match) + '</span>';
      if (g.literal) return '<span class="tok-literal">' + escapeHtml(match) + '</span>';
      if (g.number) return '<span class="tok-number">' + escapeHtml(match) + '</span>';
      if (g.operator) return '<span class="tok-operator">' + escapeHtml(match) + '</span>';
      return escapeHtml(match);
    });
  }

  function highlightBash(code) {
    if (!code) return '';
    return code.replace(bashRegex, function(match) {
      var args = Array.prototype.slice.call(arguments);
      var g = args[args.length - 1] || {};
      if (g.escape) return escapeHtml(g.escape);
      if (g.comment) return '<span class="tok-comment">' + escapeHtml(match) + '</span>';
      if (g.string) return '<span class="tok-string">' + escapeHtml(match) + '</span>';
      if (g.keyword) return '<span class="tok-keyword">' + escapeHtml(match) + '</span>';
      if (g.builtin) return '<span class="tok-builtin">' + escapeHtml(match) + '</span>';
      if (g.number) return '<span class="tok-number">' + escapeHtml(match) + '</span>';
      return escapeHtml(match);
    });
  }

  function detectLang(code) {
    var s = (code || '').trim();
    if (s.startsWith('[') && s.includes(']')) return 'toml';
    if (s.startsWith('FROM ') || (s.includes('FROM ') && s.includes('AS '))) return 'bash';
    if (/^(?:#\s*|cargo\s+|rustup\s+|valgrind\s+|RUSTFLAGS=)/.test(s)) {
      if (!/\b(?:fn\s+|impl\s+|let\s+mut|struct\s+|use\s+[\w:]+;)/.test(s)) return 'bash';
    }
    if (/\b(?:fn\s+|impl\s+|let\s+mut|struct\s+|enum\s+|use\s+[\w:]+|#\[derive|mod\s+tests|println!)\b/.test(s)) return 'rust';
    if (/\b(?:const\s+|let\s+|function\s+|import\s+|export\s+|class\s+|console\.)\b/.test(s)) return 'js';
    return 'rust';
  }

  function highlightCode(code, lang) {
    var effectiveLang = (lang || detectLang(code)).toLowerCase();
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

  function highlightCodeInHtml(html) {
    if (!html) return '';
    return html.replace(/(<pre[^>]*><code[^>]*>)([\s\S]*?)(<\/code><\/pre>)/g, function(match, openTag, code, closeTag) {
      if (code.includes('class="tok-')) return match;
      var raw = unescapeHtml(code);
      var highlighted = highlightCode(raw);
      return openTag + highlighted + closeTag;
    });
  }

  root.escapeHtml = escapeHtml;
  root.unescapeHtml = unescapeHtml;
  root.highlightJS = highlightJS;
  root.highlightRust = highlightRust;
  root.highlightToml = highlightToml;
  root.highlightBash = highlightBash;
  root.detectLang = detectLang;
  root.highlightCode = highlightCode;
  root.highlightCodeInHtml = highlightCodeInHtml;

  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
      var pres = document.querySelectorAll('pre code');
      pres.forEach(function(el) {
        if (!el.querySelector('.tok-keyword, .tok-string, .tok-comment, .tok-func, .tok-type')) {
          var lang = el.getAttribute('data-lang') || (el.className.match(/language-(\w+)/) || [])[1];
          el.innerHTML = highlightCode(el.textContent || '', lang);
        }
      });
    });
  }
})(typeof window !== 'undefined' ? window : globalThis);
