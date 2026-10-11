import os

views_dir = "/Users/nadimtuhin/opensource/rust-for-node-devs/src/components/views"
pages_dir = "/Users/nadimtuhin/opensource/rust-for-node-devs/src/pages"

def write_view_and_page(name, astro_page_title, astro_page_desc, html_content):
    view_astro = f"""---
import htmlContent from "./{name}View.html?raw";
---
<Fragment set:html={{htmlContent}} />
"""
    with open(os.path.join(views_dir, f"{name}View.astro"), "w") as f:
        f.write(view_astro)

    with open(os.path.join(views_dir, f"{name}View.html"), "w") as f:
        f.write(html_content)

    slug = {
        "BorrowChecker": "borrow-checker",
        "AsyncTokio": "async-tokio",
        "CargoVsNpm": "cargo-vs-npm",
        "Microservice": "microservice",
        "Docker": "docker",
        "Testing": "testing",
        "AiAgents": "ai-agents",
        "Interviews": "interviews",
        "Troubleshooting": "troubleshooting",
        "Philosophy": "philosophy",
        "Pitfalls": "pitfalls",
        "Leetcode": "leetcode",
        "Cheatsheet": "cheatsheet",
    }[name]

    page_astro = f"""---
import Layout from '../layouts/Layout.astro';
import Header from '../components/Header.astro';
import ViewComponent from '../components/views/{name}View.astro';
---

<Layout title="{astro_page_title}" description="{astro_page_desc}">
  <Header />
  <main id="main-content" role="main" style="min-height: calc(100vh - 54px); overflow-y: auto;">
    <ViewComponent />
  </main>
</Layout>
"""
    with open(os.path.join(pages_dir, f"{slug}.astro"), "w") as f:
        f.write(page_astro)
    print(f"Generated {name}View and {slug}.astro")

# 1. BorrowChecker
write_view_and_page(
    "BorrowChecker",
    "Borrow Checker Mastery | Rust for Node Devs",
    "Mental models and visual guide to Rust's Borrow Checker, Aliasing XOR Mutability, and Non-Lexical Lifetimes for JavaScript developers.",
    """<div class="appendix-container" style="max-width: 900px; margin: 0 auto; padding: 2.5rem 1.5rem; color: #1e293b; font-family: var(--font-ui, sans-serif);">
  <div style="text-align: center; margin-bottom: 2.5rem;">
    <span style="background: #ffedd5; color: #c2410c; padding: 0.35rem 0.85rem; border-radius: 9999px; font-weight: 700; font-size: 0.85rem;">Appendix 01 • Core Mental Model</span>
    <h1 style="font-size: 2.25rem; font-weight: 800; margin: 0.75rem 0; color: #0f172a;">Mastering the Rust Borrow Checker</h1>
    <p style="font-size: 1.1rem; color: #64748b; max-width: 650px; margin: 0 auto;">How to reason about Aliasing XOR Mutability, Non-Lexical Lifetimes (NLL), and why the borrow checker is your pair programmer.</p>
  </div>

  <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 2rem; margin-bottom: 2rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
    <h2 style="font-size: 1.35rem; font-weight: 700; margin-top: 0; color: #b7410e;">1. The Golden Rule: Aliasing XOR Mutability</h2>
    <p>In JavaScript, references are shared everywhere without restrictions. If three functions hold a reference to the same object, any of them can mutate it at any time. In single-threaded Node.js, this causes hard-to-trace bugs. In multi-threaded systems, it causes fatal data races.</p>
    <p>Rust enforces a fundamental mathematical axiom at compile time:</p>
    <div style="background: #f8fafc; border-left: 4px solid #b7410e; padding: 1rem 1.25rem; border-radius: 4px; font-weight: 600; font-size: 1.05rem; margin: 1.25rem 0;">
      At any given time, for any resource T, you can have:<br>
      • Multiple immutable references (<code>&T</code>) OR<br>
      • Exactly one mutable reference (<code>&mut T</code>),<br>
      <strong>NEVER BOTH AT THE SAME TIME.</strong>
    </div>
  </div>

  <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 2rem; margin-bottom: 2rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
    <h2 style="font-size: 1.35rem; font-weight: 700; margin-top: 0; color: #b7410e;">2. Non-Lexical Lifetimes (NLL)</h2>
    <p>In early versions of Rust, a reference lived until the end of its enclosing curly brace scope <code>}</code>. Since Rust 2018, the compiler uses <strong>Non-Lexical Lifetimes (NLL)</strong>: a borrow ends at its <em>last point of usage</em>.</p>
    <pre style="background: #0f172a; color: #f8fafc; padding: 1.25rem; border-radius: 8px; overflow-x: auto; font-family: monospace;"><code>let mut data = vec![1, 2, 3];

let first = &data[0]; // Immutable borrow begins
println!("First item: {}", first); // Last point of usage! Immutable borrow ends here.

data.push(4); // Perfectly valid under NLL! No error.</code></pre>
  </div>

  <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 2rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
    <h2 style="font-size: 1.35rem; font-weight: 700; margin-top: 0; color: #b7410e;">3. Escape Hatches when Ownership isn't Tree-shaped</h2>
    <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.95rem;">
      <thead>
        <tr style="border-bottom: 2px solid #e2e8f0; color: #64748b;">
          <th style="padding: 0.75rem 0.5rem;">Pattern</th>
          <th style="padding: 0.75rem 0.5rem;">Rust Primitive</th>
          <th style="padding: 0.75rem 0.5rem;">JavaScript Analogy</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 0.75rem 0.5rem; font-weight: 600;">Shared Read-Only Ownership</td>
          <td style="padding: 0.75rem 0.5rem;"><code>Arc&lt;T&gt;</code> (or <code>Rc&lt;T&gt;</code>)</td>
          <td style="padding: 0.75rem 0.5rem;">Standard JS object reference</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 0.75rem 0.5rem; font-weight: 600;">Shared Mutable State</td>
          <td style="padding: 0.75rem 0.5rem;"><code>Arc&lt;Mutex&lt;T&gt;&gt;</code></td>
          <td style="padding: 0.75rem 0.5rem;">Global singleton with async locks</td>
        </tr>
        <tr>
          <td style="padding: 0.75rem 0.5rem; font-weight: 600;">Read-Heavy Shared State</td>
          <td style="padding: 0.75rem 0.5rem;"><code>Arc&lt;RwLock&lt;T&gt;&gt;</code></td>
          <td style="padding: 0.75rem 0.5rem;">In-memory cache with concurrent reads</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>"""
)

# 2. AsyncTokio
write_view_and_page(
    "AsyncTokio",
    "Async Rust & Tokio Runtime | Rust for Node Devs",
    "Exhaustive architectural comparison between the Node.js libuv Event Loop and Tokio's multi-threaded work-stealing scheduler.",
    """<div class="appendix-container" style="max-width: 900px; margin: 0 auto; padding: 2.5rem 1.5rem; color: #1e293b; font-family: var(--font-ui, sans-serif);">
  <div style="text-align: center; margin-bottom: 2.5rem;">
    <span style="background: #e0f2fe; color: #0284c7; padding: 0.35rem 0.85rem; border-radius: 9999px; font-weight: 700; font-size: 0.85rem;">Appendix 02 • Concurrency Deep Dive</span>
    <h1 style="font-size: 2.25rem; font-weight: 800; margin: 0.75rem 0; color: #0f172a;">Node.js libuv vs Tokio Multi-Threaded Runtime</h1>
    <p style="font-size: 1.1rem; color: #64748b; max-width: 650px; margin: 0 auto;">Understanding poll-based futures, work-stealing executors, and why async Rust achieves sub-millisecond p99 latencies.</p>
  </div>

  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.75rem;">
      <h3 style="margin-top: 0; color: #16a34a; font-size: 1.2rem;">🟢 Node.js (libuv)</h3>
      <ul style="padding-left: 1.25rem; color: #475569; line-height: 1.6;">
        <li><strong>Single-threaded:</strong> Javascript executes on exactly one thread.</li>
        <li><strong>Push-based:</strong> Callbacks pushed to microtask/macrotask queues.</li>
        <li><strong>Event loop blocking:</strong> Heavy CPU computations freeze all incoming HTTP requests.</li>
        <li><strong>Promises:</strong> Eager evaluation (starts executing immediately upon instantiation).</li>
      </ul>
    </div>
    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.75rem;">
      <h3 style="margin-top: 0; color: #b7410e; font-size: 1.2rem;">🦀 Rust (Tokio)</h3>
      <ul style="padding-left: 1.25rem; color: #475569; line-height: 1.6;">
        <li><strong>Multi-threaded:</strong> Work-stealing scheduler across all physical CPU cores.</li>
        <li><strong>Pull-based:</strong> Futures are polled only when awakened by <code>Waker</code>.</li>
        <li><strong>CPU isolation:</strong> CPU tasks run cleanly on <code>tokio::task::spawn_blocking</code> or Rayon.</li>
        <li><strong>Futures:</strong> Lazy evaluation (does nothing until polled with <code>.await</code>).</li>
      </ul>
    </div>
  </div>

  <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 2rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
    <h2 style="font-size: 1.35rem; font-weight: 700; margin-top: 0; color: #b7410e;">The Cardinal Rule of Tokio</h2>
    <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 1rem 1.25rem; border-radius: 4px; font-weight: 600; color: #991b1b; margin: 1rem 0;">
      NEVER CALL SYNCHRONOUS BLOCKING CODE INSIDE AN ASYNC FUNCTION!<br>
      <code>std::thread::sleep</code> or synchronous file I/O blocks the OS thread assigned to the Tokio worker, stalling hundreds of concurrent HTTP futures!
    </div>
    <p>Always use non-blocking equivalents: <code>tokio::time::sleep</code> and <code>tokio::fs</code>, or offload with <code>tokio::task::spawn_blocking</code>.</p>
  </div>
</div>"""
)

# 3. CargoVsNpm
write_view_and_page(
    "CargoVsNpm",
    "Cargo vs npm Architecture Guide | Rust for Node Devs",
    "Deep dive comparing Cargo.toml & Cargo.lock against package.json & package-lock.json.",
    """<div class="appendix-container" style="max-width: 900px; margin: 0 auto; padding: 2.5rem 1.5rem; color: #1e293b; font-family: var(--font-ui, sans-serif);">
  <div style="text-align: center; margin-bottom: 2.5rem;">
    <span style="background: #fef3c7; color: #d97706; padding: 0.35rem 0.85rem; border-radius: 9999px; font-weight: 700; font-size: 0.85rem;">Appendix 03 • Package Management</span>
    <h1 style="font-size: 2.25rem; font-weight: 800; margin: 0.75rem 0; color: #0f172a;">Cargo vs npm / pnpm</h1>
    <p style="font-size: 1.1rem; color: #64748b; max-width: 650px; margin: 0 auto;">Why Rust has no node_modules bloat, how Cargo handles duplicate dependencies, and feature flags.</p>
  </div>

  <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 2rem; margin-bottom: 2rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
    <h2 style="font-size: 1.35rem; font-weight: 700; margin-top: 0; color: #b7410e;">Rosetta Stone: Commands Mapping</h2>
    <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.95rem;">
      <thead>
        <tr style="border-bottom: 2px solid #e2e8f0; color: #64748b;">
          <th style="padding: 0.75rem 0.5rem;">Node.js / npm</th>
          <th style="padding: 0.75rem 0.5rem;">Rust / Cargo</th>
          <th style="padding: 0.75rem 0.5rem;">What it does</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 0.75rem 0.5rem;"><code>npm init -y</code></td>
          <td style="padding: 0.75rem 0.5rem;"><code>cargo init</code> / <code>cargo new &lt;name&gt;</code></td>
          <td style="padding: 0.75rem 0.5rem;">Initialize new project</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 0.75rem 0.5rem;"><code>npm install &lt;pkg&gt;</code></td>
          <td style="padding: 0.75rem 0.5rem;"><code>cargo add &lt;crate&gt;</code></td>
          <td style="padding: 0.75rem 0.5rem;">Add dependency to Cargo.toml</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 0.75rem 0.5rem;"><code>npm run build</code></td>
          <td style="padding: 0.75rem 0.5rem;"><code>cargo build --release</code></td>
          <td style="padding: 0.75rem 0.5rem;">Compile optimized binary</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 0.75rem 0.5rem;"><code>npm test</code></td>
          <td style="padding: 0.75rem 0.5rem;"><code>cargo test</code></td>
          <td style="padding: 0.75rem 0.5rem;">Run unit & integration tests</td>
        </tr>
        <tr>
          <td style="padding: 0.75rem 0.5rem;"><code>npx eslint .</code></td>
          <td style="padding: 0.75rem 0.5rem;"><code>cargo clippy</code></td>
          <td style="padding: 0.75rem 0.5rem;">Run strict static linter</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>"""
)

# 4. Microservice
write_view_and_page(
    "Microservice",
    "Production Axum Microservice | Rust for Node Devs",
    "Full side-by-side comparison of an Express/Mongoose microservice re-architected in Axum and SQLx.",
    """<div class="appendix-container" style="max-width: 900px; margin: 0 auto; padding: 2.5rem 1.5rem; color: #1e293b; font-family: var(--font-ui, sans-serif);">
  <div style="text-align: center; margin-bottom: 2.5rem;">
    <span style="background: #f3e8ff; color: #9333ea; padding: 0.35rem 0.85rem; border-radius: 9999px; font-weight: 700; font-size: 0.85rem;">Appendix 04 • Microservice Blueprint</span>
    <h1 style="font-size: 2.25rem; font-weight: 800; margin: 0.75rem 0; color: #0f172a;">Production Axum Microservice Architecture</h1>
    <p style="font-size: 1.1rem; color: #64748b; max-width: 650px; margin: 0 auto;">From Express & Mongoose to Axum, Tower Middleware, SQLx connection pool, and graceful SIGTERM shutdown.</p>
  </div>

  <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 2rem; margin-bottom: 2rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
    <h2 style="font-size: 1.35rem; font-weight: 700; margin-top: 0; color: #b7410e;">Canonical Project Layout</h2>
    <pre style="background: #0f172a; color: #f8fafc; padding: 1.25rem; border-radius: 8px; font-family: monospace;"><code>my-axum-service/
├── Cargo.toml
├── src/
│   ├── main.rs            # Entry point: binds TCP, initializes Tokio & tracing
│   ├── config.rs          # Strongly typed environment configuration
│   ├── state.rs           # Arc&lt;AppState&gt; (SQLx Pool, Redis client)
│   ├── routes/
│   │   ├── mod.rs         # Router aggregation
│   │   ├── health.rs      # GET /healthz
│   │   └── users.rs       # POST /api/users, GET /api/users/:id
│   └── models/
│       └── user.rs        # Serde structs & SQLx database row mappings
└── tests/
    └── api_tests.rs       # End-to-end integration tests</code></pre>
  </div>
</div>"""
)

# 5. Docker
write_view_and_page(
    "Docker",
    "Production Distroless Rust Dockerfile | Rust for Node Devs",
    "Ultra-compact multi-stage Docker build producing standalone binaries under 15MB.",
    """<div class="appendix-container" style="max-width: 900px; margin: 0 auto; padding: 2.5rem 1.5rem; color: #1e293b; font-family: var(--font-ui, sans-serif);">
  <div style="text-align: center; margin-bottom: 2.5rem;">
    <span style="background: #e0f2fe; color: #0284c7; padding: 0.35rem 0.85rem; border-radius: 9999px; font-weight: 700; font-size: 0.85rem;">Appendix 05 • Containerization</span>
    <h1 style="font-size: 2.25rem; font-weight: 800; margin: 0.75rem 0; color: #0f172a;">Production Multi-Stage Dockerfile</h1>
    <p style="font-size: 1.1rem; color: #64748b; max-width: 650px; margin: 0 auto;">Build static binaries with cargo-chef caching and Google Distroless for minimal attack surfaces.</p>
  </div>

  <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 2rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
    <h2 style="font-size: 1.35rem; font-weight: 700; margin-top: 0; color: #b7410e;">The Gold-Standard Dockerfile</h2>
    <pre style="background: #0f172a; color: #f8fafc; padding: 1.25rem; border-radius: 8px; overflow-x: auto; font-family: monospace;"><code># Stage 1: Dependency Chef Recipe
FROM rust:1.80-bullseye AS chef
RUN cargo install cargo-chef
WORKDIR /app

# Stage 2: Prepare lockfile recipe
FROM chef AS planner
COPY . .
RUN cargo chef prepare --recipe-path recipe.json

# Stage 3: Build cached dependencies
FROM chef AS builder
COPY --from=planner /app/recipe.json recipe.json
RUN cargo chef cook --release --recipe-path recipe.json
COPY . .
RUN cargo build --release --bin server

# Stage 4: Ultra-minimal production runtime (< 15MB)
FROM gcr.io/distroless/cc-debian12:nonroot
WORKDIR /app
COPY --from=builder /app/target/release/server /app/server
USER nonroot:nonroot
EXPOSE 8080
ENTRYPOINT ["/app/server"]</code></pre>
  </div>
</div>"""
)

# 6. Testing
write_view_and_page(
    "Testing",
    "Testing & Mocking in Rust | Rust for Node Devs",
    "Unit tests, integration tests, mockall crate, and cargo test comparisons with Jest and Vitest.",
    """<div class="appendix-container" style="max-width: 900px; margin: 0 auto; padding: 2.5rem 1.5rem; color: #1e293b; font-family: var(--font-ui, sans-serif);">
  <div style="text-align: center; margin-bottom: 2.5rem;">
    <span style="background: #dcfce7; color: #15803d; padding: 0.35rem 0.85rem; border-radius: 9999px; font-weight: 700; font-size: 0.85rem;">Appendix 06 • Quality & Testing</span>
    <h1 style="font-size: 2.25rem; font-weight: 800; margin: 0.75rem 0; color: #0f172a;">Testing & Mocking: Jest / Vitest vs Rust</h1>
    <p style="font-size: 1.1rem; color: #64748b; max-width: 650px; margin: 0 auto;">First-class built-in test runner, parallel execution by default, and trait-based dependency injection.</p>
  </div>

  <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 2rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
    <h2 style="font-size: 1.35rem; font-weight: 700; margin-top: 0; color: #b7410e;">Built-in Test Module (Unit Testing)</h2>
    <pre style="background: #0f172a; color: #f8fafc; padding: 1.25rem; border-radius: 8px; overflow-x: auto; font-family: monospace;"><code>pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_add() {
        assert_eq!(add(2, 2), 4);
    }

    #[test]
    #[should_panic(expected = "divide by zero")]
    fn test_panics() {
        panic!("divide by zero");
    }
}</code></pre>
  </div>
</div>"""
)

# 7. AiAgents
write_view_and_page(
    "AiAgents",
    "AI & Autonomous Agents in Rust | Rust for Node Devs",
    "Building high-throughput LLM tool callers, token streamers, and local inference pipelines in Rust with rig-core and candle.",
    """<div class="appendix-container" style="max-width: 900px; margin: 0 auto; padding: 2.5rem 1.5rem; color: #1e293b; font-family: var(--font-ui, sans-serif);">
  <div style="text-align: center; margin-bottom: 2.5rem;">
    <span style="background: #fae8ff; color: #a21caf; padding: 0.35rem 0.85rem; border-radius: 9999px; font-weight: 700; font-size: 0.85rem;">Appendix 07 • Artificial Intelligence</span>
    <h1 style="font-size: 2.25rem; font-weight: 800; margin: 0.75rem 0; color: #0f172a;">Building AI Agents in Rust</h1>
    <p style="font-size: 1.1rem; color: #64748b; max-width: 650px; margin: 0 auto;">Why leading AI companies are migrating agent execution loops and token streaming gateways from Node.js/Python to Rust.</p>
  </div>

  <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 2rem; margin-bottom: 2rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
    <h2 style="font-size: 1.35rem; font-weight: 700; margin-top: 0; color: #b7410e;">The Modern Rust AI Ecosystem</h2>
    <ul style="padding-left: 1.25rem; color: #475569; line-height: 1.7;">
      <li><strong>rig-core:</strong> Declarative LLM agent and tool framework with OpenAI, Anthropic, and local model support.</li>
      <li><strong>candle:</strong> Minimalist, zero-Python ML framework by Hugging Face running local models on Metal & CUDA.</li>
      <li><strong>tiktoken-rs:</strong> Blazing-fast BPE token counting without Python subprocess overhead.</li>
      <li><strong>qdrant:</strong> Production vector database written entirely in Rust for maximum memory efficiency.</li>
    </ul>
  </div>
</div>"""
)

# 8. Interviews
write_view_and_page(
    "Interviews",
    "Senior Rust Interview Q&A | Rust for Node Devs",
    "High-frequency senior systems engineering interview questions covering memory layout, Tokio internals, and borrow checker subtleties.",
    """<div class="appendix-container" style="max-width: 900px; margin: 0 auto; padding: 2.5rem 1.5rem; color: #1e293b; font-family: var(--font-ui, sans-serif);">
  <div style="text-align: center; margin-bottom: 2.5rem;">
    <span style="background: #fee2e2; color: #b91c1c; padding: 0.35rem 0.85rem; border-radius: 9999px; font-weight: 700; font-size: 0.85rem;">Appendix 08 • Career Preparation</span>
    <h1 style="font-size: 2.25rem; font-weight: 800; margin: 0.75rem 0; color: #0f172a;">Senior Systems Interview Q&A</h1>
    <p style="font-size: 1.1rem; color: #64748b; max-width: 650px; margin: 0 auto;">Master the deep technical questions asked at companies like Cloudflare, Discord, AWS, and Figma.</p>
  </div>

  <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 2rem; margin-bottom: 2rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
    <h3 style="margin-top: 0; color: #0f172a;">Q1: What is the difference between String and &str in memory?</h3>
    <p style="color: #475569; line-height: 1.6;"><code>String</code> is an owned, growable vector of UTF-8 bytes stored on the heap. Its stack representation is 24 bytes (pointer to heap buffer, capacity, and current length). In contrast, <code>&str</code> is a borrowed string slice consisting of only 16 bytes on the stack: a pointer to existing bytes (which can be on the heap, stack, or static binary data section) and length.</p>
  </div>

  <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 2rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
    <h3 style="margin-top: 0; color: #0f172a;">Q2: Why can't you hold a std::sync::MutexGuard across an .await point in Tokio?</h3>
    <p style="color: #475569; line-height: 1.6;">When a future yields at an <code>.await</code> point, the Tokio runtime may resume that task on a <em>different worker thread</em>. Standard OS mutexes (like pthread_mutex) require the unlocking thread to be the exact same thread that acquired the lock. Holding an OS mutex across await violates Send bounds or can cause catastrophic deadlocks. The fix is using <code>tokio::sync::Mutex</code> or scoping the lock guard to drop before the await.</p>
  </div>
</div>"""
)

# 9. Troubleshooting
write_view_and_page(
    "Troubleshooting",
    "Diagnostics, Profiling & Valgrind | Rust for Node Devs",
    "Playbooks for debugging compiler errors, profiling CPU with cargo-flamegraph, and detecting leaks with Miri.",
    """<div class="appendix-container" style="max-width: 900px; margin: 0 auto; padding: 2.5rem 1.5rem; color: #1e293b; font-family: var(--font-ui, sans-serif);">
  <div style="text-align: center; margin-bottom: 2.5rem;">
    <span style="background: #e2e8f0; color: #334155; padding: 0.35rem 0.85rem; border-radius: 9999px; font-weight: 700; font-size: 0.85rem;">Appendix 09 • Diagnostics</span>
    <h1 style="font-size: 2.25rem; font-weight: 800; margin: 0.75rem 0; color: #0f172a;">Diagnostics, Flamegraphs & Profiling</h1>
    <p style="font-size: 1.1rem; color: #64748b; max-width: 650px; margin: 0 auto;">Tools and step-by-step diagnostic workflows for identifying bottlenecks and undefined behavior.</p>
  </div>

  <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 2rem; margin-bottom: 2rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
    <h2 style="font-size: 1.35rem; font-weight: 700; margin-top: 0; color: #b7410e;">The Diagnostic Toolkit</h2>
    <ul style="padding-left: 1.25rem; color: #475569; line-height: 1.7;">
      <li><code>cargo clippy</code>: Catches anti-patterns, non-idiomatic code, and performance traps.</li>
      <li><code>cargo flamegraph</code>: Generates interactive SVG flamegraphs of CPU time spent in functions.</li>
      <li><code>cargo miri test</code>: Interprets Rust code to catch undefined behavior and pointer violations.</li>
      <li><code>tokio-console</code>: Live interactive terminal dashboard for debugging async tasks and Tokio channels.</li>
    </ul>
  </div>
</div>"""
)

# 10. Philosophy
write_view_and_page(
    "Philosophy",
    "The Rust Philosophy | Rust for Node Devs",
    "The fundamental philosophical principles of Rust explained for JavaScript and TypeScript engineers.",
    """<div class="appendix-container" style="max-width: 900px; margin: 0 auto; padding: 2.5rem 1.5rem; color: #1e293b; font-family: var(--font-ui, sans-serif);">
  <div style="text-align: center; margin-bottom: 2.5rem;">
    <span style="background: #ffedd5; color: #c2410c; padding: 0.35rem 0.85rem; border-radius: 9999px; font-weight: 700; font-size: 0.85rem;">Appendix 10 • Philosophy</span>
    <h1 style="font-size: 2.25rem; font-weight: 800; margin: 0.75rem 0; color: #0f172a;">The Core Philosophy of Rust</h1>
    <p style="font-size: 1.1rem; color: #64748b; max-width: 650px; margin: 0 auto;">Memory safety without garbage collection, zero-cost abstractions, and fearless concurrency.</p>
  </div>

  <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 2rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
    <h2 style="font-size: 1.35rem; font-weight: 700; margin-top: 0; color: #b7410e;">The 3 Pillars of Rust</h2>
    <ol style="padding-left: 1.25rem; color: #475569; line-height: 1.8;">
      <li><strong>Safety:</strong> Memory safety and thread safety without Garbage Collector pause spikes.</li>
      <li><strong>Speed:</strong> Zero-cost abstractions that compile directly to raw machine instructions.</li>
      <li><strong>Concurrency:</strong> Compile-time thread safety that turns data races into compile errors.</li>
    </ol>
  </div>
</div>"""
)

# 11. Pitfalls
write_view_and_page(
    "Pitfalls",
    "Top 8 Rust Pitfalls & Footguns | Rust for Node Devs",
    "The top gotchas where JavaScript intuition fails: clone overuse, blocking async workers, lock poisoning, and recursive types.",
    """<div class="appendix-container" style="max-width: 900px; margin: 0 auto; padding: 2.5rem 1.5rem; color: #1e293b; font-family: var(--font-ui, sans-serif);">
  <div style="text-align: center; margin-bottom: 2.5rem;">
    <span style="background: #fee2e2; color: #b91c1c; padding: 0.35rem 0.85rem; border-radius: 9999px; font-weight: 700; font-size: 0.85rem;">Appendix 11 • Footguns</span>
    <h1 style="font-size: 2.25rem; font-weight: 800; margin: 0.75rem 0; color: #0f172a;">Top 8 Rust Footguns for Node Developers</h1>
    <p style="font-size: 1.1rem; color: #64748b; max-width: 650px; margin: 0 auto;">Common misconceptions and pitfalls when transitioning from dynamic JavaScript to systems Rust.</p>
  </div>

  <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 2rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
    <h3 style="margin-top: 0; color: #dc2626;">Footgun 1: Calling .clone() to appease the compiler</h3>
    <p style="color: #475569; line-height: 1.6;">Calling <code>.clone()</code> duplicates heap memory allocations. If you clone a 50MB buffer on every incoming HTTP request, your performance will be worse than Node.js! Take borrowed references (<code>&T</code>) instead.</p>

    <h3 style="color: #dc2626;">Footgun 2: Blocking the Tokio thread pool</h3>
    <p style="color: #475569; line-height: 1.6;">Node.js developers used to single-threaded async sometimes use synchronous file reads or <code>std::thread::sleep</code> inside async blocks. In Tokio, this starves worker threads!</p>
  </div>
</div>"""
)

# 12. Leetcode
write_view_and_page(
    "Leetcode",
    "LeetCode Easy in Rust | Rust for Node Devs",
    "Classic data structures and algorithms solved with zero-allocation Rust patterns vs JavaScript objects.",
    """<div class="appendix-container" style="max-width: 900px; margin: 0 auto; padding: 2.5rem 1.5rem; color: #1e293b; font-family: var(--font-ui, sans-serif);">
  <div style="text-align: center; margin-bottom: 2.5rem;">
    <span style="background: #f1f5f9; color: #475569; padding: 0.35rem 0.85rem; border-radius: 9999px; font-weight: 700; font-size: 0.85rem;">Appendix 12 • Problem Solving</span>
    <h1 style="font-size: 2.25rem; font-weight: 800; margin: 0.75rem 0; color: #0f172a;">LeetCode in Rust (JS vs Rust)</h1>
    <p style="font-size: 1.1rem; color: #64748b; max-width: 650px; margin: 0 auto;">Master core Rust idioms through classic algorithmic problems.</p>
  </div>

  <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem;">
    <a href="/chapter/lc_two_sum" style="display: block; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem; text-decoration: none; color: inherit;">
      <span style="font-weight: 800; color: #b7410e;">LC #1</span>
      <h3 style="margin: 0.35rem 0 0; font-size: 1.05rem;">Two Sum</h3>
      <p style="font-size: 0.85rem; color: #64748b; margin: 0.35rem 0 0;">Zero-allocation HashMap in O(n) time.</p>
    </a>
    <a href="/chapter/lc_valid_parentheses" style="display: block; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem; text-decoration: none; color: inherit;">
      <span style="font-weight: 800; color: #b7410e;">LC #20</span>
      <h3 style="margin: 0.35rem 0 0; font-size: 1.05rem;">Valid Parentheses</h3>
      <p style="font-size: 0.85rem; color: #64748b; margin: 0.35rem 0 0;">LIFO stack with Vec&lt;char&gt;.</p>
    </a>
    <a href="/chapter/lc_buy_sell_stock" style="display: block; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem; text-decoration: none; color: inherit;">
      <span style="font-weight: 800; color: #b7410e;">LC #121</span>
      <h3 style="margin: 0.35rem 0 0; font-size: 1.05rem;">Best Time to Buy/Sell</h3>
      <p style="font-size: 0.85rem; color: #64748b; margin: 0.35rem 0 0;">Single-pass greedy algorithm in O(1) space.</p>
    </a>
    <a href="/chapter/lc_max_subarray" style="display: block; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem; text-decoration: none; color: inherit;">
      <span style="font-weight: 800; color: #b7410e;">LC #53</span>
      <h3 style="margin: 0.35rem 0 0; font-size: 1.05rem;">Maximum Subarray</h3>
      <p style="font-size: 0.85rem; color: #64748b; margin: 0.35rem 0 0;">Kadane's algorithm in O(n) time.</p>
    </a>
  </div>
</div>"""
)

# 13. Cheatsheet
write_view_and_page(
    "Cheatsheet",
    "Rosetta Stone Cheatsheet | Rust for Node Devs",
    "Syntax and idiom quick lookup comparing JavaScript/TypeScript with Rust.",
    """<div class="appendix-container" style="max-width: 900px; margin: 0 auto; padding: 2.5rem 1.5rem; color: #1e293b; font-family: var(--font-ui, sans-serif);">
  <div style="text-align: center; margin-bottom: 2.5rem;">
    <span style="background: #e0e7ff; color: #4338ca; padding: 0.35rem 0.85rem; border-radius: 9999px; font-weight: 700; font-size: 0.85rem;">Appendix 13 • Reference</span>
    <h1 style="font-size: 2.25rem; font-weight: 800; margin: 0.75rem 0; color: #0f172a;">Rosetta Stone Syntax Cheatsheet</h1>
    <p style="font-size: 1.1rem; color: #64748b; max-width: 650px; margin: 0 auto;">Quick syntax lookup comparing TypeScript and Rust side-by-side.</p>
  </div>

  <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 2rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
    <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.95rem;">
      <thead>
        <tr style="border-bottom: 2px solid #e2e8f0; color: #64748b;">
          <th style="padding: 0.75rem 0.5rem;">TypeScript Concept</th>
          <th style="padding: 0.75rem 0.5rem;">Rust Equivalent</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 0.75rem 0.5rem;"><code>const x = 5; let y = 10;</code></td>
          <td style="padding: 0.75rem 0.5rem;"><code>let x = 5; let mut y = 10;</code></td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 0.75rem 0.5rem;"><code>number</code></td>
          <td style="padding: 0.75rem 0.5rem;"><code>i32, i64, u32, u64, f64, usize</code></td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 0.75rem 0.5rem;"><code>string</code></td>
          <td style="padding: 0.75rem 0.5rem;"><code>String</code> (owned heap) or <code>&str</code> (borrowed slice)</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 0.75rem 0.5rem;"><code>null | undefined</code></td>
          <td style="padding: 0.75rem 0.5rem;"><code>Option&lt;T&gt; (Some(val) | None)</code></td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 0.75rem 0.5rem;"><code>throw new Error(...)</code></td>
          <td style="padding: 0.75rem 0.5rem;"><code>Result&lt;T, E&gt; (Ok(v) | Err(e))</code></td>
        </tr>
        <tr>
          <td style="padding: 0.75rem 0.5rem;"><code>Array&lt;T&gt; / T[]</code></td>
          <td style="padding: 0.75rem 0.5rem;"><code>Vec&lt;T&gt;</code> (dynamic) or <code>[T; N]</code> (fixed)</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>"""
)

print("Generated all 13 appendices successfully!")
