// Compiles and runs every chapter's Rust example (src/data/chapters.ts) with the local stable toolchain.
// Uses edition 2021 and a debug build, the same settings the in-site playground sends to play.rust-lang.org.
// Run: node --experimental-strip-types scripts/check-rust-examples.mjs [workDir]
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chaptersData } from '../src/data/chapters.ts';

const work = process.argv[2] ?? join(tmpdir(), 'rust-for-node-devs-examples');
const bins = join(work, 'src', 'bin');
rmSync(bins, { recursive: true, force: true });
mkdirSync(bins, { recursive: true });

// Crates the examples import that the playground also provides.
writeFileSync(
  join(work, 'Cargo.toml'),
  `[package]
name = "chapter-examples"
version = "0.0.0"
edition = "2021"
publish = false

[dependencies]
anyhow = "1"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
thiserror = "2"
tokio = { version = "1", features = ["full"] }
tokio-util = { version = "0.7", features = ["rt"] }
`,
);

const ids = Object.keys(chaptersData);
for (const id of ids) writeFileSync(join(bins, `${id}.rs`), chaptersData[id].code);

// Warnings are shown but don't fail the check; compile errors do.
execFileSync('cargo', ['build', '--bins', '--quiet'], { cwd: work, stdio: 'inherit' });

const failures = [];
for (const id of ids) {
  const run = spawnSync(join(work, 'target', 'debug', id), { timeout: 30_000, encoding: 'utf8' });
  if (run.status !== 0) {
    failures.push(id);
    console.error(`✗ ${id} exited with ${run.status ?? run.signal}\n${run.stderr}`);
  }
}

if (failures.length) {
  console.error(`${failures.length}/${ids.length} chapter examples failed: ${failures.join(', ')}`);
  process.exit(1);
}
console.log(`✓ all ${ids.length} chapter examples compile and run`);
