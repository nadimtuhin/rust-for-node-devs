// Builds public/llms.txt (llmstxt.org index), public/llms-full.txt (full corpus) and public/chapters-data.js
// from the same sources the site renders, so the AI-facing copy never drifts.
// Run: node scripts/generate-llms.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const SITE = 'https://rust-for-node-devs.vercel.app';

// Ordered as numbered in each view's "Appendix NN" badge.
const APPENDICES = [
  { slug: 'borrow-checker', view: 'BorrowCheckerView' },
  { slug: 'async-tokio', view: 'AsyncTokioView' },
  { slug: 'cargo-vs-npm', view: 'CargoVsNpmView' },
  { slug: 'microservice', view: 'MicroserviceView' },
  { slug: 'docker', view: 'DockerView' },
  { slug: 'testing', view: 'TestingView' },
  { slug: 'ai-agents', view: 'AiAgentsView' },
  { slug: 'interviews', view: 'InterviewsView' },
  { slug: 'troubleshooting', view: 'TroubleshootingView' },
  { slug: 'philosophy', view: 'PhilosophyView' },
  { slug: 'pitfalls', view: 'PitfallsView' },
  { slug: 'leetcode', view: 'LeetcodeView' },
  { slug: 'cheatsheet', view: 'CheatsheetView' },
  { slug: 'roadmap', view: 'RoadmapView' },
];

const SUMMARY =
  'An interactive, free curriculum that teaches Rust to Node.js and TypeScript developers by mapping every concept to its JavaScript equivalent: 56 side-by-side chapters with a live in-browser Rust compiler, plus 14 architecture appendices on the borrow checker, Tokio, Cargo, Axum microservices, Docker, testing, and interviews.';

const OVERVIEW = `Rust for Node.js Devs is a Rosetta Stone between the V8/libuv world and systems Rust. Each chapter shows the Node.js/TypeScript code a backend engineer already writes (Express handlers, Promise.all, pg.Pool, BullMQ, AbortController), then the idiomatic Rust equivalent (Axum, tokio::join!, sqlx::Pool, Redis Streams, CancellationToken), explains why Rust does it differently, and lists a pro tip, a common footgun, and an architecture note. Every Rust example can be edited in the browser and compiled and run through the official Rust Playground (play.rust-lang.org).

The curriculum is organised in 9 parts: language basics (ownership, borrowing, lifetimes, Option/Result), web APIs with Axum and Tower, collections and smart pointers, databases (SQLx, SeaORM, MongoDB, Redis), queues and workers, async with Tokio, systems internals (SIMD, NAPI-RS, unsafe, FFI, allocators, atomics, macros), Rust philosophy, and LeetCode problems solved in idiomatic Rust.`;

const CORE_CONCEPTS = `| Concern | Node.js / TypeScript | Rust |
|---|---|---|
| Runtime | V8 JIT + libuv single-threaded event loop; CPU work blocks every request unless moved to worker_threads | Ahead-of-time native binary; Tokio multi-threaded work-stealing scheduler runs futures across all cores |
| Concurrency model | Promises resolved on one thread; Promise.all / Promise.race | Lazy futures polled by an executor; tokio::join!, tokio::spawn, tokio::select! |
| Memory management | Tracing garbage collector (Orinoco/Scavenger) with stop-the-world pauses and non-deterministic cleanup | Ownership + borrow checker at compile time; RAII frees memory and closes resources deterministically when the owner goes out of scope (Drop) |
| Aliasing | Unlimited shared mutable references to any object | Aliasing XOR mutability: many &T or exactly one &mut T, enforced by the compiler, so data races cannot compile |
| null / errors | null, undefined, thrown exceptions | Option<T> and Result<T, E>, propagated with ?; panics reserved for bugs |
| Types | Structural, erased at runtime; any escapes | Nominal, checked at compile time; generics monomorphized to zero-cost code |
| Thread safety | worker_threads isolates communicating via postMessage, or SharedArrayBuffer + Atomics with no compile-time race checks | Send / Sync marker traits let the compiler prove what can cross threads (Arc, Mutex, channels) |
| Packages | npm, package.json, package-lock.json, node_modules | Cargo, Cargo.toml, Cargo.lock, crates.io, features |
| Deploy artifact | Node runtime + node_modules (hundreds of MB) | Single native binary (dynamically linked to glibc by default); distroless/cc image under 20 MB, musl + scratch under 10 MB |`;

function exportedRecordSource(file, exportName) {
  const source = readFileSync(`${root}/${file}`, 'utf8');
  const start = source.indexOf('{', source.indexOf(`export const ${exportName}`));
  return source.slice(start, source.lastIndexOf('}') + 1);
}

const parseExportedRecord = (file, exportName) => JSON.parse(exportedRecordSource(file, exportName));

function decodeEntities(text) {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&bull;/g, '•')
    .replace(/&rarr;/g, '→')
    .replace(/&amp;/g, '&');
}

// Only strips real tags: prose like "(< 20MB)" contains a bare '<'.
const stripTags = (html) => html.replace(/<\/?[a-zA-Z!][^>]*>/g, '');
const collapseWhitespace = (text) => text.replace(/\s+/g, ' ').trim();

// Converts the hand-written appendix HTML into plain Markdown.
// Code blocks are pulled out first so their contents are never reformatted.
function htmlToMarkdown(html) {
  const codeBlocks = [];
  let md = html.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/g, (_, inner) => {
    codeBlocks.push('\n```\n' + decodeEntities(stripTags(inner)).trim() + '\n```\n');
    return `\u0000${codeBlocks.length - 1}\u0000`;
  });

  // Anchors go first: some wrap headings, which would otherwise leak '#' into link labels.
  // Headings shift down two levels to nest under the "## Appendix N" heading.
  md = md
    .replace(/<a [^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g, (_, href, text) => {
      const url = href.startsWith('/') ? SITE + href : href;
      return `[${collapseWhitespace(stripTags(text))}](${url})`;
    })
    .replace(/<h([1-4])[^>]*>([\s\S]*?)<\/h\1>/g, (_, level, text) => `\n\n${'#'.repeat(Number(level) + 2)} ${stripTags(text).trim()}\n\n`)
    .replace(/<code[^>]*>([\s\S]*?)<\/code>/g, '`$1`')
    .replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/g, '**$2**')
    .replace(/<em[^>]*>([\s\S]*?)<\/em>/g, '*$1*')
    .replace(/<tr[^>]*>([\s\S]*?)<\/tr>/g, (_, row) => {
      const cells = [...row.matchAll(/<t([hd])[^>]*>([\s\S]*?)<\/t\1>/g)];
      const toCell = (text) => collapseWhitespace(stripTags(text.replace(/<br\s*\/?>/g, '; '))).replace(/\|/g, '\\|');
      const line = '| ' + cells.map(([, , text]) => toCell(text)).join(' | ') + ' |';
      const isHeader = cells.length > 0 && cells.every(([, kind]) => kind === 'h');
      return isHeader ? `\n${line}\n|${' --- |'.repeat(cells.length)}` : `\n${line}`;
    })
    .replace(/<dt[^>]*>([\s\S]*?)<\/dt>/g, (_, text) => `\n\n**Q: ${collapseWhitespace(stripTags(text))}**\n`)
    .replace(/<dd[^>]*>([\s\S]*?)<\/dd>/g, (_, text) => `\nA: ${collapseWhitespace(stripTags(text))}\n`)
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/g, (_, text) => `\n- ${collapseWhitespace(stripTags(text))}`)
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<\/(p|div|section|aside|ul|ol|dl|table)>/g, '\n\n');

  md = decodeEntities(stripTags(md))
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .replace(/\u0000(\d+)\u0000/g, (_, i) => codeBlocks[Number(i)])
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^(\|.*\|)\n\n(?=\|)/gm, '$1\n');

  return md.trim();
}

function loadAppendices() {
  return APPENDICES.map(({ slug, view }, index) => {
    const html = readFileSync(`${root}/src/components/views/${view}.html`, 'utf8');
    const page = readFileSync(`${root}/src/pages/${slug}.astro`, 'utf8');
    const badge = html.match(/Appendix (\d+)/);
    if (!badge || Number(badge[1]) !== index + 1) {
      throw new Error(`${view}.html is not Appendix ${index + 1}; update APPENDICES order`);
    }
    return {
      slug,
      number: index + 1,
      url: `${SITE}/${slug}`,
      title: page.match(/title="([^"|]+)/)[1].trim(),
      description: page.match(/description="([^"]+)"/)[1],
      body: htmlToMarkdown(html),
    };
  });
}

function groupByPart(chapters) {
  const parts = new Map();
  for (const [id, chapter] of Object.entries(chapters)) {
    if (!parts.has(chapter.part)) parts.set(chapter.part, []);
    parts.get(chapter.part).push({ id, ...chapter, url: `${SITE}/chapter/${id}` });
  }
  return parts;
}


function buildIndex(parts, appendices) {
  const lines = [
    '# Rust for Node.js Devs',
    '',
    `> ${SUMMARY}`,
    '',
    OVERVIEW,
    '',
    // llmstxt.org reserves H2 sections for link lists, so the table stays in the prose block.
    '**Core concepts: Node.js vs Rust**',
    '',
    CORE_CONCEPTS,
    '',
    `Full text of every chapter and appendix, including code: ${SITE}/llms-full.txt`,
    '',
  ];

  for (const [part, chapters] of parts) {
    lines.push(`## ${part}`, '');
    for (const chapter of chapters) {
      lines.push(`- [${chapter.num}. ${chapter.title}](${chapter.url}): ${chapter.metaDescription}`);
    }
    lines.push('');
  }

  lines.push('## Architecture Appendices', '');
  for (const appendix of appendices) {
    lines.push(`- [Appendix ${appendix.number}: ${appendix.title}](${appendix.url}): ${appendix.description}`);
  }

  lines.push(
    '',
    '## Optional',
    '',
    `- [Curriculum index](${SITE}/chapters): All 56 chapters on one page`,
    `- [Home and live playground](${SITE}/): Interactive studio with the in-browser Rust compiler`,
    '',
  );
  return lines.join('\n');
}

function buildFull(parts, appendices, insights) {
  const lines = [
    '# Rust for Node.js Devs: Full Knowledge Base',
    '',
    `> ${SUMMARY}`,
    '',
    `Source: ${SITE}`,
    `Index: ${SITE}/llms.txt`,
    '',
    OVERVIEW,
    '',
    '## Core Concepts: Node.js vs Rust',
    '',
    CORE_CONCEPTS,
    '',
    '# Part A: Curriculum (56 chapters)',
    '',
  ];

  for (const [part, chapters] of parts) {
    lines.push(`## ${part}`, '');
    for (const chapter of chapters) {
      const insight = insights[chapter.id];
      lines.push(
        `### Chapter ${chapter.num}: ${chapter.title}`,
        '',
        `URL: ${chapter.url}`,
        '',
        chapter.desc,
        '',
        `**Why Rust does it this way:** ${chapter.why}`,
        '',
        'Node.js / TypeScript:',
        '',
        '```ts',
        chapter.nodeCode,
        '```',
        '',
        'Rust:',
        '',
        '```rust',
        chapter.code,
        '```',
        '',
      );
      if (insight) {
        lines.push(
          `- **Pro tip:** ${insight.proTip}`,
          `- **Footgun:** ${insight.footgun}`,
          `- **Architecture note:** ${insight.archNote}`,
          '',
        );
      }
      const relatedSlugs = crossLinks.lessonAppendices[chapter.id] ?? [];
      const relatedAppendices = relatedSlugs.map((slug) => appendices.find((appendix) => appendix.slug === slug));
      if (relatedAppendices.length > 0) {
        const links = relatedAppendices.map((appendix) => `[Appendix ${appendix.number}: ${appendix.title}](${appendix.url})`);
        lines.push(`Go deeper: ${links.join(', ')}`, '');
      }
    }
  }

  const allChapters = [...parts.values()].flat();
  lines.push('# Part B: Architecture Appendices (14 guides)', '');
  for (const appendix of appendices) {
    lines.push(`## Appendix ${appendix.number}: ${appendix.title}`, '', `URL: ${appendix.url}`, '', appendix.body, '');
    const foundational = allChapters.filter((chapter) => crossLinks.lessonAppendices[chapter.id]?.includes(appendix.slug));
    if (foundational.length > 0) {
      const links = foundational.map((chapter) => `[Chapter ${chapter.num}: ${chapter.title}](${chapter.url})`);
      lines.push(`Foundational chapters: ${links.join(', ')}`, '');
    }
  }
  return lines.join('\n');
}

const chapters = parseExportedRecord('src/data/chapters.ts', 'chaptersData');
const insights = parseExportedRecord('src/data/chapterInsights.ts', 'chapterInsights');
const crossLinks = JSON.parse(readFileSync(`${root}/src/data/crossLinks.json`, 'utf8'));
// The site numbers appendices by crossLinks.json key order, so it must match the badge order here.
if (Object.keys(crossLinks.appendices).join() !== APPENDICES.map(({ slug }) => slug).join()) {
  throw new Error('src/data/crossLinks.json appendices are out of order with APPENDICES');
}
const parts = groupByPart(chapters);
const appendices = loadAppendices();

// The browser studio swaps lessons client-side from this copy of the chapter data.
writeFileSync(
  `${root}/public/chapters-data.js`,
  `window.chaptersData = ${exportedRecordSource('src/data/chapters.ts', 'chaptersData')};`,
);
writeFileSync(`${root}/public/llms.txt`, buildIndex(parts, appendices));
writeFileSync(`${root}/public/llms-full.txt`, buildFull(parts, appendices, insights));
console.log(`llms.txt + llms-full.txt: ${Object.keys(chapters).length} chapters, ${appendices.length} appendices`);
