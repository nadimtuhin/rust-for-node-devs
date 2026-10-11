# 🦀 Rust for Node.js Developers Masterclass Studio

> An interactive, visual learning platform and live playground tailored specifically for JavaScript and TypeScript engineers making the leap to Rust. Powered by **Astro 5** & TypeScript.

[![Rust Version](https://img.shields.io/badge/Rust-1.80+-b7410e?style=flat&logo=rust)](https://rust-lang.org)
[![Astro Version](https://img.shields.io/badge/Astro-5.0+-FF5D01?style=flat&logo=astro)](https://astro.build)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=flat&logo=vercel)](https://rust-for-node-devs.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

---

## 🌐 Live Interactive Studio

> **Try it live in your browser right now:**  
> 👉 [**https://rust-for-node-devs.vercel.app**](https://rust-for-node-devs.vercel.app)

---

## 🌟 Overview

Transitioning from dynamic, garbage-collected, single-threaded V8 JavaScript to statically-typed, borrow-checked, multi-threaded Rust can feel intimidating. **Rust for Node.js Developers Studio** bridges that gap by directly mapping every systems concept to its Node.js equivalent — with side-by-side code comparisons, architectural diagrams, interview questions, known footguns, production Docker recipes, LeetCode solutions, and an interactive in-browser compiler.

Built with **Astro 5** for lightning-fast zero-JS static generation, modular components, and seamless developer ergonomics.

---

## 🚀 Key Features

- **💻 Interactive 3-Column Studio:**
  - **Column 1:** Chapter Navigation across 56 interactive lessons with live instant search (`⌘+K`).
  - **Column 2:** Lesson Briefing with explicit Node.js vs Rust comparisons, "The Rust Mental Model", and pro-tips/footguns.
  - **Column 3:** Live CodeMirror Rust Editor connected to the official Rust Playground compilation API (`play.rust-lang.org`) with a real-time output terminal (`⌘+⏎`).
- **🦀 Borrow Checker Demystified:** Visual breakdown of Aliasing XOR Mutability, Non-Lexical Lifetimes (NLL), and why the borrow checker prevents data races at compile time.
- **⚡ Async Rust & Tokio Runtime:** In-depth architectural comparison between Node.js libuv event loop and Tokio's multi-threaded work-stealing scheduler.
- **📦 Cargo vs npm Deep-Dive:** `Cargo.toml` & `Cargo.lock` vs `package.json` & `package-lock.json` (why Rust has no 500MB `node_modules` or runtime prototype pollution).
- **📂 Real-World Microservice Architecture:** Express/Mongoose re-architected in Axum, Tower Middleware, SQLx compile-time query verification, and graceful SIGTERM shutdown.
- **🐳 Production Docker Recipes:** Ready-to-deploy multi-stage Dockerfiles using `cargo-chef` and Google Distroless (< 15MB) for zero-CVE deployment.
- **🧪 Testing & Mocking:** Built-in test harnesses, parallel test execution, and trait-based dependency injection vs Jest/Vitest.
- **🦾 AI & LLM Agents in Rust:** High-throughput token streaming gateways, tool callers, and local inference pipelines using `rig-core` and `candle`.
- **🎯 Senior Systems Interview Q&A:** High-frequency interview questions covering memory layout (`String` vs `&str`), Tokio mutex traps, and RAII.
- **⚠️ Known Pitfalls & Footguns:** Top 8 gotchas where JS intuition fails (overusing `.clone()`, blocking async workers, lock poisoning).
- **🛠️ Diagnostics & Profiling:** Playbooks for profiling CPU with `cargo flamegraph` and catching undefined behavior with `cargo miri`.
- **🧩 LeetCode Easy in Rust:** Classic algorithmic problems (Two Sum, Valid Parentheses, Merge Lists, Buy/Sell Stock, Kadane's) solved with zero allocations.
- **📖 Rosetta Code Cheatsheet:** Quick lookup table for common syntax, error handling patterns, and data structures.

---

## 🏗️ Project Structure

```bash
rust-for-node-devs/
├── public/                 # Static assets, web manifests, and client data bundles
├── src/
│   ├── components/         # Modular Astro studio components
│   │   ├── Header.astro    # Global navigation and dropdown
│   │   ├── Sidebar.astro   # Progressive 56-chapter table of contents
│   │   ├── LessonDetail.astro # Side-by-side JS vs Rust briefings
│   │   ├── Playground.astro   # CodeMirror & live Rust compiler
│   │   └── views/          # 13 dedicated architecture appendix views
│   ├── data/
│   │   ├── chapters.ts     # 56 full curriculum chapters with code
│   │   └── chapterInsights.ts # Deep architectural pro-tips & footguns
│   ├── layouts/
│   │   └── Layout.astro    # SEO-optimized GitBook shell & JSON-LD
│   ├── pages/              # Astro static routes
│   └── styles/
│       └── global.css      # Polished GitBook studio theme
└── astro.config.mjs        # Static Astro configuration
```

---

## 🛠️ Quick Start

```bash
# Clone the repository
git clone https://github.com/nadimtuhin/rust-for-node-devs.git
cd rust-for-node-devs

# Install dependencies
pnpm install

# Start local development server
pnpm dev

# Build production static bundle
pnpm build
```

---

## 📜 License

MIT © [Nadim Tuhin](https://github.com/nadimtuhin)
