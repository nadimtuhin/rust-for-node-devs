window.chapterInsights = {
  "basic_vars": {
    "proTip": "Use shadowing (`let port: u16 = port.parse()?;`) instead of inventing port_str and port_int. Each shadow is a new binding, so it can even change type.",
    "footgun": "Forgetting `mut` gives error E0384 (cannot assign twice to immutable variable). The opposite trap: in release builds integer overflow wraps silently, so use checked_add, saturating_add or wrapping_add when overflow is possible.",
    "archNote": "Deep immutability is what makes sharing cheap later: any number of threads can read through `&T` without locks, because the compiler guarantees nobody mutates through it. The exception is interior mutability (Cell, RefCell, Mutex, atomics), which is always visible in the type."
  },
  "basic_ownership": {
    "proTip": "Copy types (integers, floats, bool, char, and structs that derive Copy) are duplicated bitwise instead of moved, which is why `let b = a;` leaves `a` usable for numbers but not for a String.",
    "footgun": "Sprinkling `.clone()` to silence E0382 (use of moved value) compiles but allocates a new heap buffer every time. Pass `&T` when the callee only needs to read.",
    "archNote": "Ownership is RAII: Drop runs at scope exit in reverse declaration order, so sockets, file handles and mutex guards are released deterministically with no GC pause and no finalizer queue. Leaks are still possible (Rc cycles, mem::forget), but they are explicit, not the default."
  },
  "basic_borrowing": {
    "proTip": "Take `&str` instead of `&String` (and `&[T]` instead of `&Vec<T>`) in parameters: callers can pass a String, a literal or a slice of either.",
    "footgun": "Holding a `&` while creating a `&mut` gives E0502. The classic case for JS devs: pushing into a Vec while iterating over it, which is legal in JS and rejected in Rust because a reallocation would leave the iterator dangling.",
    "archNote": "Non-Lexical Lifetimes (NLL) end a borrow at its last use, not at the closing brace, which is why the snippet can mutate `message` right after the shared readers r1 and r2 stop being used."
  },
  "basic_structs": {
    "proTip": "Derive the boring parts: `#[derive(Debug, Clone, PartialEq, Default)]`. Add `#[repr(C)]` only for FFI, since it disables field reordering.",
    "footgun": "A method without `&self` is an associated function: call it as `HttpServer::new(...)`, not with dot syntax. Taking `self` by value consumes the struct, so the caller cannot use it afterwards.",
    "archNote": "Layout is yours to see: with fields u8, u32, u8 the default Rust repr is 8 bytes, while `#[repr(C)]` keeps declaration order and pads to 12. A `Vec<HttpServer>` stores structs inline and contiguously, where a JS array of class instances is an array of pointers to separate heap objects."
  },
  "basic_enums": {
    "proTip": "Use `if let Some(x) = ...` or `let ... else` when you only care about one variant, and keep a full `match` where every case matters.",
    "footgun": "A catch-all `_ => {}` arm silences exhaustiveness: when someone adds a variant later, the compiler can no longer point at every match that needs updating.",
    "archNote": "In TS, exhaustiveness is opt-in through a `never` check in `default`. In Rust it is the default and also applies across crate boundaries, unless the library marks the enum `#[non_exhaustive]` to reserve room for new variants."
  },
  "basic_option": {
    "proTip": "Chain instead of matching: `?` inside a function returning Option, plus .map, .and_then, .unwrap_or_default and .ok_or(err) to turn absence into a Result.",
    "footgun": "`.unwrap()` on None panics at runtime, which is the same crash as a TypeError, just with a better message. Use `.expect(\"why this cannot be None\")` when you truly know it is Some.",
    "archNote": "The niche trick is guaranteed for references, Box, NonNull and the NonZero integer types, which is why `Option<&T>` crosses FFI as a nullable C pointer."
  },
  "basic_result": {
    "proTip": "Use `thiserror` to derive Display and From for library error enums, and `anyhow` (or a `Box<dyn Error>`) in application code where you only need to report.",
    "footgun": "`?` only works in a function whose return type can absorb the error, and the error types must convert with From. A missing From impl gives E0277 at the `?`.",
    "archNote": "Because the error type is in the signature, adding a new failure mode to a library changes its API. That is intentional: callers get a compile error instead of an uncaught exception in production."
  },
  "basic_traits": {
    "proTip": "Default methods (like `headline` here) let you grow a trait without breaking implementors. Prefer generics for hot paths and `Box<dyn Trait>` for heterogeneous collections or plugin points.",
    "footgun": "The orphan rule forbids implementing a foreign trait for a foreign type (say, Display for Vec<T>). Wrap the type in a local newtype first.",
    "archNote": "Trait objects only work for dyn-compatible (formerly object-safe) traits: no generic methods and no `Self` outside the receiver (like `-> Self` or `other: &Self`) unless that method opts out with `where Self: Sized`, because the vtable needs one fixed function pointer per method."
  },
  "basic_generics": {
    "proTip": "Move long bounds into a `where` clause, and use `impl Trait` in argument position for simple one-off bounds.",
    "footgun": "Monomorphization multiplies code: a big generic function used with many types inflates compile time and binary size. Keep the generic shell thin and call a non-generic inner function, or use `dyn` where speed does not matter.",
    "archNote": "Unlike C++ templates, a Rust generic body is type-checked once against its bounds, so errors point at your bound, not at a wall of instantiation output."
  },
  "basic_lifetimes": {
    "proTip": "Elision covers most signatures: a function with one reference input, or a `&self` method, gets output lifetimes inferred. Write `'a` only when several inputs could be the source of the returned reference.",
    "footgun": "Returning a reference to a local (E0515) or dropping a buffer while a struct still borrows it (E0505) are the common errors. The fix is usually to return an owned value (String, Vec), not to fight the annotations.",
    "archNote": "`'static` means the data can live for the whole program (string literals, leaked or owned data), not that it is a global. That is why `thread::spawn` and `tokio::spawn` demand `'static`: the task may outlive the stack frame that started it."
  },
  "axum_api": {
    "proTip": "Handlers return anything implementing IntoResponse: &str, (StatusCode, Json<T>), or Result<T, E> where E: IntoResponse, so a custom AppError enum maps cleanly onto HTTP responses.",
    "footgun": "Extractors that consume the body (Json<T>, String, Bytes, Form<T>) must be the last handler argument. Axum 0.8 also changed path syntax from `/:id` to `/{id}`.",
    "archNote": "Handler signatures are checked at compile time: if an argument does not implement FromRequestParts or FromRequest, the route does not compile. Add `#[axum::debug_handler]` to get a readable error message."
  },
  "state_singleton": {
    "proTip": "Write `Arc::clone(&state)` instead of `state.clone()` so readers see that only a pointer is copied. In Axum, pass state with `Router::with_state` and extract it with `State<Arc<AppState>>`.",
    "footgun": "`Rc<T>` is not Send, so moving it into a thread or a Tokio task fails with E0277. And Arc only shares; mutating the inner value still needs a Mutex, RwLock or an atomic.",
    "archNote": "A hot shared atomic counter bounces its cache line between cores under heavy load. For high-traffic metrics, keep per-thread counters or use a metrics crate that shards them."
  },
  "tower_middleware": {
    "proTip": "Reach for tower-http before writing your own: TraceLayer, CorsLayer, TimeoutLayer, CompressionLayer and RequestBodyLimitLayer cover most Express middleware. For one-off logic, axum::middleware::from_fn is the closest to an Express function.",
    "footgun": "Layers wrap outside-in: in Router::layer calls the last layer added runs first. ServiceBuilder reads top-to-bottom instead, so mixing the two styles reorders your middleware.",
    "archNote": "Because Service is generic over the request type and returns a Future, middleware composes around anything request/response shaped. The cost of the deep nested types is longer compile times and long type names in errors."
  },
  "reqwest_client": {
    "proTip": "Build one Client at startup (ClientBuilder with timeout, connect_timeout and user_agent) and clone it into your handlers or AppState. A new Client per request means a fresh pool, so every call pays a TCP and TLS handshake.",
    "footgun": "reqwest has no request timeout by default, so a stalled server can hang a task forever. Also like fetch, a 404 or 500 is still Ok(Response): call `.error_for_status()?` to turn it into an Err.",
    "archNote": "The TLS backend is chosen with Cargo features: rustls (Rust TLS with a bundled crypto provider, ring or aws-lc-rs, so no system OpenSSL) or native-tls (OpenSSL on Linux, the OS stack on macOS and Windows). Check which one your reqwest version enables by default."
  },
  "serde_json": {
    "proTip": "`#[serde(rename_all = \"camelCase\")]` bridges JS camelCase and Rust snake_case, and `deny_unknown_fields` turns a client typo like `username` for `userName` into a 400 instead of a silently ignored key. Reach for `serde_json::Value` only for genuinely schemaless payloads.",
    "footgun": "Borrowing a plain `&'a str` from JSON fails at runtime when the string contains escapes (`\\n`, `\\\"`, `\\u00e9`), because the unescaped text doesn't exist in the input buffer. Use `Cow<'a, str>` with `#[serde(borrow)]` so it borrows when it can and allocates when it must. And without `#[serde(default)]` or `Option<T>`, a missing key is an error, not `undefined`.",
    "archNote": "Serde separates the format (serde_json, BSON, TOML, bincode) from the data model (your derive), so one struct decodes JSON in Axum, BSON in the MongoDB driver and env vars via envy. Numbers are range-checked against the field type while parsing: `-1` into a `u64` fails with ``invalid value: integer `-1`, expected u64 at line 1 column 8``, where JS stores -1 happily and `JSON.parse('1e400')` returns Infinity."
  },
  "env_config": {
    "proTip": "Call `dotenvy::dotenv().ok()` first thing in main: it doesn't override variables that are already set, so real environment variables win over `.env`, like dotenv in Node. For many fields, `envy::from_env::<Config>()` deserializes straight into a `#[derive(Deserialize)]` struct.",
    "footgun": "`.ok().and_then(|p| p.parse().ok()).unwrap_or(8080)` looks safe but silently swallows a typo like `PORT=80800` and boots on the default. Distinguish \"not set\" (use the default) from \"set but invalid\" (refuse to start). Also, `std::env::set_var` is `unsafe` in edition 2024 because another thread may be reading the environment at the same time.",
    "archNote": "Load config once, wrap it in `Arc<AppConfig>` (or put it in Axum's State) and pass it down. A typed struct also gives secrets one place to be redacted: implement `Debug` by hand or use the `secrecy` crate, so `DATABASE_URL` never ends up in a log line."
  },
  "vec_transform": {
    "proTip": "Pre-size when you know the count: `Vec::with_capacity(n)` skips the doubling reallocations. `collect()` already does this when the iterator reports an exact length (`map` over a `Vec`), but `filter` only knows an upper bound, so its result grows as it goes.",
    "footgun": "Adapters do nothing until consumed: `nums.iter().map(|n| println!(\"{n}\"));` prints nothing (rustc warns: unused `Map` that must be used). Also, `.iter()` yields `&T`, which is why the closures need `|&&n|` and `|&n|` patterns, while `.into_iter()` on a `Vec` yields owned `T` and consumes the vector.",
    "archNote": "JS now has lazy iterator helpers too (Node 22+: `arr.values().filter(..).map(..).toArray()`), but each step is still a generic `next()` call returning a `{ value, done }` object that the JIT has to optimize away. Rust adapters are monomorphized per closure type, so LLVM sees one concrete loop and can inline every closure."
  },
  "hashmap_set": {
    "proTip": "SipHash-1-3 is the default because it resists HashDoS from attacker-chosen keys. For internal keys (integer IDs, interned strings), `foldhash` or `ahash` via `HashMap::with_hasher` is typically several times faster on short keys. `HashMap::with_capacity(n)` skips the rehash-and-double steps when you know the size.",
    "footgun": "Iterating or printing a HashMap gives a different order on each run, which breaks snapshot tests and makes JSON responses look random. JS developers expect insertion order from Map; in Rust you pick: `BTreeMap` (sorted), the `indexmap` crate (insertion order), or sort before output.",
    "archNote": "`*map.entry(k).or_insert(0) += 1` hashes the key once, probes once and returns `&mut V` into the slot; the JS idiom `m.set(k, (m.get(k) ?? 0) + 1)` does two separate lookups (get, then set). Because Rust keys compare by value, a `#[derive(Hash, PartialEq, Eq)] struct UserId(u64)` works as a key directly, while a JS Map keyed by `{ id: 1 }` objects compares by reference and pushes you toward string keys like \"user:1\"."
  },
  "slices_strings": {
    "proTip": "Take `&str` in parameters, return `String` when you create new text, and use `Cow<'_, str>` when a function usually returns its input unchanged but sometimes has to allocate (escaping, trimming, normalizing).",
    "footgun": "A byte range that splits a multi-byte character panics: `&s[0..21]` on the string above crashes with \"byte index 21 is not a char boundary\". Use `s.get(0..21)` (returns `None`), `char_indices()` or `is_char_boundary()` when indices come from user input. JS never panics here; it silently produces a lone surrogate, which `isWellFormed()` reports as false.",
    "archNote": "UTF-8 everywhere means no transcoding at the edges: HTTP bodies, files and Postgres TEXT are already UTF-8, so `String::from_utf8(bytes)` validates the buffer in place without copying it. Node decodes UTF-8 into Latin-1 or UTF-16 V8 strings on the way in and encodes back to UTF-8 on the way out (`Buffer.from(str)`)."
  },
  "smart_pointers": {
    "proTip": "Use `Box` for recursive types, trait objects (`Box<dyn Error>`) and moving large values without copying them on the stack. For shared read-only data across Tokio tasks, `Arc<T>` is the default and cheap enough to clone per request; `Arc<str>` and `Arc<[T]>` save an allocation and a pointer hop over `Arc<String>` and `Arc<Vec<T>>`.",
    "footgun": "An `Rc<RefCell<T>>` cycle (parent and child holding strong references to each other) leaks silently: neither count reaches zero, no Drop runs, and nothing warns you. Make back-references `Weak` and call `upgrade()`, which returns `None` once the target is gone.",
    "archNote": "Prefer ownership trees and indices over pointer graphs: a `Vec<Node>` plus `usize` ids (an arena) gives you parent links without Rc, RefCell or Weak and keeps nodes contiguous in memory. `Rc<RefCell<T>>` is the closest thing to a JS object reference, and reaching for it everywhere is usually a sign the design is fighting the borrow checker."
  },
  "interior_mutability": {
    "proTip": "Keep critical sections short: `*counter.lock().unwrap() += 1;` drops the guard at the end of the statement. For a single counter or flag, an `AtomicU64` or `AtomicBool` beats a Mutex. Use `RwLock` only when reads vastly outnumber writes and take long enough to matter; for tiny reads a Mutex is often faster.",
    "footgun": "Holding a `std::sync::MutexGuard` across `.await` makes the future `!Send`, so `tokio::spawn` refuses to compile it, and where it does compile (`spawn_local`, `block_on`) another task locking on the same thread deadlocks it. Tokio's guidance: use `std::sync::Mutex` for short critical sections without awaits, and `tokio::sync::Mutex` only when the guard must live across one. Also, a thread that panics while holding a std Mutex poisons it, and every later `lock()` returns `Err`.",
    "archNote": "Because a Rust Mutex wraps the data (`Mutex<T>`), there is no way to reach the counter without taking the lock, unlike Java's `synchronized` or a C mutex sitting next to the data it is meant to protect. `Send` and `Sync` finish the job: `RefCell` is `Send` but not `Sync`, so the compiler rejects sharing it between threads and you have to upgrade to `Mutex` or `RwLock`."
  },
  "memory_alignment": {
    "proTip": "Print it, don't guess: `size_of`, `align_of` and `std::mem::offset_of!` (stable since 1.77) answer layout questions, and an `assert_eq!(size_of::<T>(), 16)` test catches regressions. For large arrays of structs, removing padding (or switching to a struct of arrays) directly cuts cache misses.",
    "footgun": "A `#[repr(packed)]` struct can't hand out `&wire.b` (error E0793) because a misaligned reference is undefined behavior; read the field by value (`let b = wire.b;`) instead. And never transmute bytes into a default-repr struct: its field order may change between compiler versions. Use `#[repr(C)]` plus a crate like `zerocopy` or `bytemuck` for wire formats.",
    "archNote": "`#[repr(align(64))]` gives each hot counter its own cache line so two cores incrementing neighbouring counters don't keep stealing the line from each other (false sharing). crossbeam's `CachePadded<T>` does the same, and uses 128 bytes on x86_64 and aarch64 because Intel prefetches cache lines in pairs and Apple M-series chips use 128-byte lines."
  },
  "sqlx_compile_time": {
    "proTip": "Run `cargo sqlx prepare` and commit the generated `.sqlx/` directory: with it present (or `SQLX_OFFLINE=true`), CI and Docker builds compile without a database. `cargo sqlx prepare --check` in CI fails when queries changed but the cache wasn't regenerated.",
    "footgun": "Nullability inference is conservative for expressions and outer joins: a `LEFT JOIN` column or `count(*)` can come back as `Option<T>`. Override per column with an alias: `SELECT count(*) AS \"total!\"` forces non-null and `\"name?\"` forces Option. The macros check against whatever schema DATABASE_URL points at, so run migrations before building.",
    "archNote": "SQLx is not an ORM: there is no query builder in the hot path and no generated client, just your SQL, compile-time-generated decode code and the Postgres wire protocol. For dynamic SQL (optional filters, variable column lists) use `sqlx::QueryBuilder` or the unchecked `sqlx::query_as::<_, T>()` with `#[derive(FromRow)]`, and accept that those are only checked at runtime."
  },
  "db_pool": {
    "proTip": "Size the pool from the database side, not the CPU count: the sum of `max_connections` across all app replicas must stay under Postgres's `max_connections` (100 by default) minus headroom for migrations and admin sessions. Put PgBouncer in front if you run many replicas, and set a short `acquire_timeout` (a few seconds) so overload fails fast instead of queueing requests.",
    "footgun": "Holding a `PoolConnection` (or an open `Transaction`) across a slow `.await` such as an HTTP call pins that connection for the whole call: with 10 connections and a 2-second upstream, throughput caps at 5 requests per second. Pass `&pool` to queries (`.fetch_one(&pool)`) so each statement checks out a connection only while it runs.",
    "archNote": "Prisma's Rust query engine ran its own pool (`connection_limit` defaulted to physical CPUs x 2 + 1, `pool_timeout` to 10s); with driver adapters the pool is the underlying driver's, such as pg.Pool. In Rust you put one `PgPool` in Axum `State`; because it's `Clone + Send + Sync`, every handler on every worker thread shares the same set of sockets."
  },
  "db_transactions": {
    "proTip": "Write transactional helpers against `&mut PgConnection` and pass `&mut *tx`, so the same function runs inside or outside a transaction and tests can wrap it in one that never commits. For SERIALIZABLE isolation, run `SET TRANSACTION ISOLATION LEVEL SERIALIZABLE` as the first statement and retry on SQLSTATE 40001.",
    "footgun": "With `panic = \"abort\"` in Cargo.toml a panic never runs Drop, so SQLx sends no ROLLBACK. The data is still safe, because the process dies, the socket closes and Postgres aborts the transaction, but any cleanup of your own in Drop never runs. Keep transactions short: row locks are held until commit, and a session left \"idle in transaction\" stops VACUUM from cleaning up dead rows.",
    "archNote": "This is RAII applied to a protocol, the same pattern as `MutexGuard` and `PoolConnection`: \"a transaction is open on this connection\" is state held by a value, and every exit path ends it. JavaScript is gaining a similar tool, `await using` with `Symbol.asyncDispose` (Node 24+), but it's opt-in per resource, whereas Drop always runs during unwinding."
  },
  "redis_caching": {
    "proTip": "Add jitter to TTLs (say 60s plus or minus 10%) so keys written together don't expire together. For protection across replicas, take a short Redis lock with `SET lock:user:10 <token> NX PX 5000` and have the losers wait briefly and re-read, or serve stale data while one worker refreshes.",
    "footgun": "A multiplexed connection is shared, so connection-scoped commands interfere with other callers: `SELECT`, `WATCH`/`MULTI` and blocking pops like `BLPOP` change state for, or stall, every task using that handle. Use a dedicated connection (or a `bb8`/`deadpool` pool) for those. And version your keys (`user:v2:10`) so a deploy that changes the struct doesn't fail to deserialize old cache entries.",
    "archNote": "The single-flight slot is an `Arc<Slot>` cloned out of the map before the slow load runs, so the map lock is released and a slow load for one key never blocks lookups of other keys; only callers of the same key wait. `OnceLock::get_or_init` runs the closure at most once per slot even when eight threads race, the same contract the in-flight Promise map gives you on one JS thread."
  },
  "seaorm_patterns": {
    "proTip": "Generate entities from an existing database with `sea-orm-cli generate entity -u $DATABASE_URL -o src/entity`, and keep schema changes in `sea-orm-migration` so entities and migrations stay in sync. For a hot query, drop down to SQLx: you can build the SeaORM connection from an existing `sqlx::PgPool`, so both share one pool.",
    "footgun": "Building an ActiveModel by hand with every field `Set` and calling `update()` writes every column, overwriting concurrent changes to fields you never meant to touch. Start from a loaded model (`model.into_active_model()`) and `Set` only what changed. The opposite trap: a required column left `NotSet` on insert fails at the database, not at compile time.",
    "archNote": "Underneath, SeaORM is SeaQuery (a SQL AST builder) plus a SQLx driver, so you get SQLx's pool, TLS and Postgres wire protocol. Relations are declared once with `#[derive(DeriveRelation)]` and loaded with `find_with_related` (one JOIN) or the loader API, which batches related rows in one query instead of TypeORM-style lazy N+1 loading."
  },
  "mongodb_driver": {
    "proTip": "Map the id explicitly: `#[serde(rename = \"_id\", skip_serializing_if = \"Option::is_none\")] id: Option<ObjectId>` lets the server generate ids on insert. Build filters with `doc! { \"email\": email }`, and keep `Collection<Document>` for genuinely schemaless data.",
    "footgun": "Mongoose features don't exist in the Rust driver: `default: 0`, `lowercase: true` and `pre('save')` logic must move into your constructors or service layer, or into a server-side `$jsonSchema` validator so every client, Node or Rust, is held to the same rules during a migration. Without that, a Node service and a Rust service writing the same collection drift apart.",
    "archNote": "The driver is async on Tokio. The 3.x API takes the filter directly (`find_one(doc! { .. }).await`) and sets options through builder methods. It keeps a connection pool per server, and `max_pool_size` defaults to 10 in the Rust driver versus `maxPoolSize` 100 in the Node driver, so a service ported one-to-one can hit pool waits under load that the Node version never saw."
  },
  "redis_queues": {
    "proTip": "Read in batches with `XREADGROUP GROUP workers <consumer> COUNT 32 BLOCK 5000 STREAMS jobs >` so one round trip fetches up to 32 jobs, and run a periodic `XAUTOCLAIM jobs workers <consumer> 60000 0` reaper. `apalis` packages this pattern, plus retries and monitoring, if you'd rather not hand-roll it.",
    "footgun": "A missing `XACK` doesn't cause redelivery on its own: the entry just sits in the PEL, invisible to `>` reads, and the PEL grows until memory or `XPENDING` alerts catch it. Pair every consumer group with a reclaim loop, and dead-letter entries whose delivery count passes a threshold so one poison job can't loop forever.",
    "archNote": "Acked entries are not deleted, so cap the stream with `XADD jobs MAXLEN ~ 1000000 * ...` (the `~` lets Redis trim whole internal nodes cheaply). Trimming ignores the PEL, so size the cap well above your worst-case backlog or pending jobs get trimmed away. `BLOCK` holds its connection for the whole wait, so give blocking `XREADGROUP` calls a dedicated connection and send `XACK` and other short commands over a shared `redis::aio::MultiplexedConnection`."
  },
  "job_retries": {
    "proTip": "Retry only what is idempotent: send a stable `Idempotency-Key` (the job id or order id) so the downstream service can de-duplicate a charge that succeeded but whose response was lost. Cap both the per-attempt delay and the number of attempts, and log the attempt number with every failure.",
    "footgun": "A retry loop in async code that calls `std::thread::sleep` blocks a Tokio worker thread for the whole backoff, stalling every task on that thread; use `tokio::time::sleep`. And retrying 4xx validation errors burns attempts and delays the DLQ alert a human actually needs to see.",
    "archNote": "Keep the policy a pure function of the attempt number, like `exponential_ms`, so you can unit test it without waiting on real time. Make the DLQ a real destination (a separate stream or table, or BullMQ's failed set with `removeOnFail: false`) that stores everything needed to replay: payload, last error, attempt count and timestamps."
  },
  "tokio_spawn": {
    "proTip": "Use `JoinSet` when you spawn a dynamic number of tasks: `join_next()` yields results as they finish, and dropping the set aborts every task still running. Use `try_join!` instead of `join!` when one error should fail the whole batch, like `Promise.all` rejecting.",
    "footgun": "Dropping a `JoinHandle` does not cancel the task: it detaches and keeps running, like an un-awaited promise. Call `handle.abort()` or keep tasks in a `JoinSet`. And a CPU-heavy loop or `std::thread::sleep` inside async code blocks its worker thread; move the work to `spawn_blocking` or use `tokio::time::sleep`.",
    "archNote": "`#[tokio::main]` starts one worker thread per CPU core by default, plus a separate blocking pool (up to 512 threads by default) for `spawn_blocking`. Scheduling is cooperative: a task runs until it returns `Pending` at an `.await`, and Tokio adds a per-task operation budget so a loop over always-ready channels still yields to other tasks."
  },
  "select_race": {
    "proTip": "Add `biased;` as the first line of `select!` to poll branches top to bottom instead of in random order, and put shutdown or high-priority channels first. Without it, Tokio randomizes the order on each poll so one always-ready branch can't starve the others.",
    "footgun": "A future that isn't cancel-safe inside a looping `select!` loses data without any error: a `read_exact` that loses to a timer drops the bytes it already consumed, so the next read starts in the middle of a frame. Keep partial state in a buffer that outlives the loop (`read_buf` into a `BytesMut`), or let `tokio_util::codec::FramedRead` handle framing.",
    "archNote": "`select!` expands into one future that polls every branch, so it runs inside the current task and spawns nothing. A branch whose pattern doesn't match (like `Some(x) = rx.recv()` once the channel closes) is disabled; when every branch is disabled the `else` branch runs, and without an `else` the macro panics."
  },
  "cancellation_tokens": {
    "proTip": "Give each subsystem a `child_token()` so it can be shut down on its own, and cancel the root on SIGTERM. Pair the tokens with `tokio_util::task::TaskTracker` or a `JoinSet` so after cancelling you can await every task's cleanup before the process exits.",
    "footgun": "A token only helps where it is checked. A loop that awaits an I/O call without racing it against `token.cancelled()` in `select!` won't notice cancellation until that call returns, which may be never. In CPU loops, check `is_cancelled()` every few thousand iterations, as `crunch` does.",
    "archNote": "Cancellation is sticky: `cancelled()` on an already-cancelled token completes immediately, so a task that starts late can't miss the signal. `token.drop_guard()` returns a guard that cancels the token when it is dropped, tying cancellation to a scope like a `finally { ac.abort() }` that also runs during a panic."
  },
  "error_anyhow_thiserror": {
    "proTip": "Add context that says what you were doing, not what failed: `.with_context(|| format!(\"loading config from {path}\"))?`. Print with `{:#}` for a one-line chain (`loading config from app.toml: No such file or directory`) or `{:?}` for the multi-line report with the backtrace.",
    "footgun": "Returning `anyhow::Error` from a library's public API forces callers to guess which types to downcast to. And `#[from]` on two variants with the same source type won't compile, because it generates two conflicting `From` impls. Keep `thiserror` enums at crate boundaries and convert to `anyhow` only in binaries and request handlers.",
    "archNote": "Neither crate changes how errors travel: `?` calls `From::from` on the error and returns early, a plain branch with no unwinding. Panics are Rust's only unwinding path and are meant for bugs, not expected failures like a missing user, whereas JS uses `throw` for both."
  },
  "channels_sync": {
    "proTip": "Model shared state as an actor: one task owns the data and receives `enum Command` messages over `mpsc`, each carrying a `oneshot::Sender` for the reply, as above. There is no `Mutex`, no lock held across `.await`, and the bounded queue gives you backpressure for free.",
    "footgun": "A receive loop ends only when every `Sender` clone has been dropped. One forgotten clone, often captured by a task you no longer need, keeps `rx.recv()` pending forever. And `unbounded_channel()` has no backpressure: a producer faster than its consumer grows memory without limit.",
    "archNote": "Use `std::sync::mpsc` or crossbeam between plain threads and Tokio channels between async tasks, because Tokio's `send().await` yields instead of blocking a worker thread. To cross between the two worlds, Tokio channels provide `blocking_send` and `blocking_recv` for code running outside the runtime, such as inside `spawn_blocking`."
  },
  "graceful_shutdown": {
    "proTip": "With Axum, `axum::serve(listener, app).with_graceful_shutdown(shutdown_signal()).await?` stops accepting when the signal fires and then waits for open connections with no time limit. Add your own deadline after the signal, like the `timeout` around the drain above, so one stuck connection can't hold the pod until SIGKILL.",
    "footgun": "The kernel applies no default signal actions to PID 1 inside a container. If your binary (Node or Rust) runs as PID 1 and never registers a SIGTERM handler, SIGTERM is ignored and every rollout waits the full grace period for SIGKILL. Register the handler, or run under an init such as `tini` (`docker run --init`).",
    "archNote": "Order matters: fail the readiness probe so the load balancer stops routing to you, stop accepting, drain in-flight requests, cancel background workers through the token and await them, then flush telemetry and close database pools. Dropping a Tokio runtime does not let tasks finish (they are dropped at their next `.await`), so call `pool.close().await` and await your workers explicitly."
  },
  "simd_optimization": {
    "proTip": "Check what LLVM emitted before hand-writing intrinsics: `cargo asm` (from cargo-show-asm) or `cargo rustc --release -- --emit asm`, then look for packed instructions such as `vaddps` or `paddd` on `xmm`/`ymm` registers. Slice iterators (`chunks_exact`, `zip`) vectorize more readily than index loops because they remove bounds checks.",
    "footgun": "`RUSTFLAGS=\"-C target-cpu=native\"` tunes the binary for the build machine. Ship it to an older CPU or a different cloud instance family and it dies with SIGILL. For distributed binaries, keep the baseline target and dispatch at runtime with `is_x86_feature_detected!`, as above.",
    "archNote": "Portable SIMD (`std::simd`, e.g. `f32x8`) still requires `#![feature(portable_simd)]` on nightly; on stable, the `wide` and `pulp` crates offer portable vector types. On AArch64 (Apple Silicon, AWS Graviton), NEON is part of the baseline target, so 128-bit vectorization is always available there."
  },
  "napi_rs": {
    "proTip": "Start from `napi new` (from `@napi-rs/cli`): it scaffolds the crate, a GitHub Actions matrix that cross-compiles every platform, and the npm packaging. For bulk data, accept `Buffer` or `Uint8Array` rather than strings or arrays of numbers, since those cross the boundary without per-element conversion.",
    "footgun": "Async tasks run on libuv's threadpool, which has only 4 threads by default (`UV_THREADPOOL_SIZE`) and is shared with `fs`, `dns.lookup`, `crypto.pbkdf2` and zlib. Long Rust jobs there can starve file I/O for the whole process; raise the pool size at startup or run your own Rust thread pool and report back through a threadsafe function.",
    "archNote": "The addon shares the process with V8: a segfault from buggy `unsafe` code takes down the whole Node process, not one request. Keep it a thin layer of pure functions over plain data. JS values passed in are only valid during the call, so anything kept longer must be copied into Rust-owned memory, as `input.to_vec()` does above."
  },
  "unsafe_rust": {
    "proTip": "Run tests under Miri (`cargo +nightly miri test`): it interprets your code and reports undefined behavior such as misaligned reads, out-of-bounds pointer arithmetic, use-after-free and `&mut` aliasing violations, though it can't execute most foreign C calls. Turn on the `unsafe_op_in_unsafe_fn` lint (it warns by default in edition 2024) so every operation inside an `unsafe fn` still needs its own `unsafe {}` block and justification.",
    "footgun": "Undefined behavior is not a crash you can catch. The optimizer assumes it never happens, so a misaligned `*ptr`, a `&mut` that aliases another reference, or reading a `MaybeUninit` before writing it can appear to work in debug and miscompile in release. Never create a reference (`&*ptr`) to memory you aren't sure is initialized, aligned and unaliased; use raw-pointer methods like `read_unaligned` and `ptr::copy` instead.",
    "archNote": "Most application code needs no `unsafe` at all; it concentrates in a few audited places such as std's `Vec` and `HashMap`, Tokio's internals and FFI bindings. Put `#![forbid(unsafe_code)]` in application crates to make that a compiler-enforced policy, and use `cargo geiger` to see how much unsafe your dependency tree carries."
  },
  "foreign_function_interface": {
    "proTip": "Generate bindings with `bindgen` (from C headers, usually in `build.rs`), and expose Rust to C with `cbindgen`. Put the raw `extern` declarations in a `-sys` crate (like `openssl-sys` or `libsqlite3-sys`) and wrap them in a safe crate, so the `unsafe` lives in one place.",
    "footgun": "Memory must be freed by the allocator that allocated it: a pointer from C's `malloc` goes back to `free`, and a `CString` handed to C with `into_raw()` must come back through `CString::from_raw` to be freed. And `let p = CString::new(s).unwrap().as_ptr();` leaves `p` dangling, because the temporary `CString` is dropped at the end of that statement; bind it to a variable first, as `message` is above.",
    "archNote": "A panic must not unwind out of an `extern \"C\"` function into C; since Rust 1.81 that aborts the process instead of being undefined behavior. Use `extern \"C-unwind\"` only when both sides agree on unwinding; otherwise catch panics at the boundary with `std::panic::catch_unwind` and return an error code."
  },
  "custom_allocators": {
    "proTip": "The swap is a dependency plus a few lines: `#[cfg(not(target_env = \"msvc\"))] #[global_allocator] static GLOBAL: tikv_jemallocator::Jemalloc = tikv_jemallocator::Jemalloc;`. The original `jemallocator` crate is unmaintained; `tikv-jemallocator` is the maintained fork and doesn't support MSVC Windows targets, hence the `cfg`. Measure RSS and p99 latency under realistic load before and after, because the winner depends on the workload.",
    "footgun": "Inside a `GlobalAlloc` implementation you must not allocate (no `println!`, `format!` or `Vec`), or you recurse into your own allocator. And memory must go back to the allocator that produced it: freeing a pointer from C's `malloc` through Rust's allocator, or the reverse, is undefined behavior with any allocator, and with jemalloc it usually crashes.",
    "archNote": "jemalloc returns memory to the OS gradually (unused pages decay over about 10 seconds by default), and that purging runs during allocator calls unless you enable `background_thread:true`, so an idle process can keep its RSS after a spike. The `tikv-jemalloc-ctl` crate exposes live statistics (`stats.allocated`, `stats.resident`) for a metrics endpoint. For per-request scratch data, an arena (bump) allocator like `bumpalo` skips the global allocator entirely and frees everything at once, close to how V8's young generation allocates."
  },
  "atomics_memory_ordering": {
    "proTip": "Pick the weakest ordering that matches a known pattern: `Relaxed` for counters and statistics, a `Release` store with an `Acquire` load for publishing data or flags, `AcqRel` for read-modify-write operations that do both (like a lock's CAS). Use `SeqCst` only when you can name the cross-variable ordering it buys. Mara Bos's *Rust Atomics and Locks*, free online, is the standard reference.",
    "footgun": "`Relaxed` on a flag that guards other data is a real bug, not a slowdown: the reader can see `READY == true` and still read the old `DATA`. It shows up mostly on ARM (Apple Silicon, Graviton) and rarely on x86 dev machines, whose TSO model hides the hardware reordering, although the compiler may still reorder `Relaxed` accesses on any target. Test lock-free code with `loom`, which explores thread interleavings and models many weak-memory reorderings.",
    "archNote": "Atomics are the building blocks under `Arc` (a `Relaxed` `fetch_add` on clone, a `Release` `fetch_sub` plus an `Acquire` fence before freeing), `Mutex` (a futex word on Linux), channels and Tokio's scheduler. So an `Arc::clone` is a single atomic instruction. JS has nothing similar, because objects can't be shared across workers at all, only copied or transferred."
  },
  "procedural_macros": {
    "proTip": "Run `cargo expand` (the cargo-expand subcommand) to see exactly what `#[derive(Serialize)]` or `#[tokio::main]` generated. Inside your own proc macro, return `syn::Error::new_spanned(tokens, msg).to_compile_error()` instead of panicking, so the error underlines the user's code instead of the derive attribute.",
    "footgun": "Proc macros are not hygienic by default: an identifier emitted with `Span::call_site()` resolves in the caller's scope. Emit absolute paths such as `::std::fmt::Debug` or `::my_crate::Trait`, or your generated code breaks when the caller has a local item with the same name. Also, `syn` with the `full` feature adds noticeable time to clean builds.",
    "archNote": "A proc-macro crate is built for the host and loaded into the rustc process, so it runs arbitrary code with your user's permissions during `cargo build`, like `build.rs`. Treat macro dependencies as build-time supply chain. They also can't see types: all they get is tokens."
  },
  "const_eval": {
    "proTip": "Use `static` for big tables (one copy, one address) and `const` for small values. `const _: () = assert!(...);` turns an invariant into a build failure, and `[const { Vec::new() }; N]` initializes an array of non-Copy values without a loop.",
    "footgun": "Stable `const fn` can't call trait methods, so `for` loops (E0015), `?`, `.iter().map()` and `==` on non-primitive types don't compile there. Write `while` loops with manual indices. And a `const fn` is only guaranteed to run at compile time in a const context: `let x = f(10);` runs at runtime (LLVM may still fold it, but that is an optimization, not a promise).",
    "archNote": "A `static` table lives in the read-only segment mapped from the executable, so processes running the same binary share those pages through the OS page cache, and writing to them faults. The const evaluator itself is deterministic (no clock, no I/O, no randomness), so it never makes a build non-reproducible. Macros like `env!` and `include_bytes!` can still bake build-machine state into consts."
  },
  "philo_fearless_concurrency": {
    "proTip": "Reach for `std::thread::scope` when threads only need to borrow local data: no `'static` bound, so no `Arc` and no clones. For data parallelism, rayon's `par_iter()` uses the same Send/Sync bounds to split work safely across a thread pool.",
    "footgun": "\"Fearless\" covers data races, not deadlocks: two threads locking the same two Mutexes in opposite order compiles cleanly and hangs forever. Also, holding a std `MutexGuard` across an `.await` makes the future `!Send`, so `tokio::spawn` rejects it; drop the guard before awaiting or use `tokio::sync::Mutex`.",
    "archNote": "Raw pointers are neither Send nor Sync, so a type wrapping one must opt in with `unsafe impl Send`, a promise the compiler can't check. That is where thread-safety bugs can still hide in Rust: inside `unsafe` code, never in safe code built on correct abstractions."
  },
  "philo_raii_drop": {
    "proTip": "Name RAII guards `_guard`, never `_`: `let _ = mutex.lock();` drops the guard (and unlocks) at the end of that statement. Call `drop(guard)` to release a lock before slow work instead of waiting for the end of the scope.",
    "footgun": "Drop is reliable but not guaranteed: `std::mem::forget` is safe, `Rc`/`Arc` cycles leak, and `panic = \"abort\"` or `std::process::exit` skip destructors. Drop also can't return errors, so `File` ignores errors on close; call `file.sync_all()?` yourself when durability matters.",
    "archNote": "A type can't be both `Copy` and `Drop` (E0184): a bitwise copy would run the destructor twice. Because drops are fixed when the program is compiled, Rust has no collector to pause the program; freeing a large structure costs exactly the time spent dropping it, at a line you can point to."
  },
  "philo_zero_cost": {
    "proTip": "Measure with `cargo build --release` or `cargo bench`, never debug builds. To confirm an iterator chain became a tight loop, check the assembly with `cargo asm` (cargo-show-asm) or Compiler Explorer.",
    "footgun": "`dyn Trait` is not zero-cost: unless the optimizer can devirtualize, calls go through a vtable and can't be inlined. The opposite trap is monomorphization bloat: a generic function used with 50 types is compiled 50 times. Keep a thin generic wrapper over a non-generic inner function (`fn open<P: AsRef<Path>>(p: P) { open_inner(p.as_ref()) }`), the pattern std itself uses.",
    "archNote": "\"Zero-cost\" means no runtime overhead compared to the hand-written equivalent, not \"free\". The price is paid at compile time and in code size. Niche optimization is part of it too: `Option<&u64>` is 8 bytes, the same as `&u64`, because null can never be a valid reference."
  },
  "philo_type_driven": {
    "proTip": "Use typestate when the state is known along a code path (builders, protocol handshakes, payment flows). Use an `enum` when the state is decided at runtime, for example loaded from a database, and match it exhaustively so a new variant breaks the build everywhere it isn't handled.",
    "footgun": "`#[derive(Clone, Copy, PartialEq)]` on `Id<T>` adds `T: Clone`, `T: Copy` and `T: PartialEq` bounds, so `Id<User>` isn't Copy unless `User` is. For phantom-tagged types, implement those traits by hand. `PhantomData<T>` also makes `Id<T>` inherit `T`'s Send/Sync; use `PhantomData<fn() -> T>` for pure tags.",
    "archNote": "State markers and `PhantomData` disappear after type checking, so typestate adds no runtime cost: each state's methods are compiled separately and no state tag is stored or checked."
  },
  "philo_explicit_over_implicit": {
    "proTip": "Implement `From<T>` for your error types: the standard library's blanket impl gives you `Into` for free, and `?` uses it automatically. For values from outside (config, network, user input), write `u16::try_from(n)?` instead of `n as u16`.",
    "footgun": "`as` never fails: it silently truncates integers, wraps signed to unsigned and saturates floats (NaN becomes 0). Enable Clippy's pedantic `cast_possible_truncation` and `cast_sign_loss` lints to flag risky casts in code review.",
    "archNote": "Exhaustive `match` is explicitness that scales: add a variant to `ConfigError` and every match that doesn't handle it stops compiling, which turns a refactor into a checklist the compiler hands you."
  },
  "lc_two_sum": {
    "proTip": "`HashMap::with_capacity(n)` sizes the table once (SwissTable keeps the load factor at or below 7/8). Outside LeetCode, swap in a faster non-cryptographic hasher for integer keys, such as `rustc_hash::FxHashMap` or `ahash`, when the keys don't come from untrusted input.",
    "footgun": "`target - num` panics on overflow in debug builds and wraps in release builds. LeetCode's limits (|values| up to 10^9) keep it inside i32, but with arbitrary input use `checked_sub` or widen to i64. And always check before inserting, or `[3]` with target 6 pairs index 0 with itself.",
    "archNote": "LeetCode's signature takes `Vec<i32>` by value and returns indices as `i32`. Idiomatic Rust borrows `&[i32]` and returns `Option<(usize, usize)>`, which makes \"no answer\" explicit instead of an empty `Vec` sentinel."
  },
  "lc_valid_parentheses": {
    "proTip": "Push the expected closing bracket instead of the opening one, so the check is a single `pop() != Some(b)` with no lookup table.",
    "footgun": "Use `.chars()` only when you need Unicode scalar values; for ASCII grammars (brackets, CSV, JSON punctuation) `.bytes()` is correct and faster. Never slice `&s[i..i + 1]` at arbitrary byte offsets: slicing in the middle of a multi-byte character panics.",
    "archNote": "`Vec::pop` returns `Option<T>`, so an unbalanced closing bracket becomes a `None` comparison handled by the type system, not an out-of-bounds read or an `undefined` that leaks into later logic."
  },
  "lc_merge_lists": {
    "proTip": "The cursor pattern `tail = &mut tail.insert(node).next;` (with `Option::insert`, Rust 1.53+) avoids `unwrap()` and keeps the borrow checker happy. Finish with `*tail = a.or(b);` to attach whatever is left in a single assignment.",
    "footgun": "Dropping a long `Option<Box<ListNode>>` chain is recursive: each Box's destructor drops the next one. A 100,000-node list overflows the 8 MiB main-thread stack in a debug build (about 1 million in release). For your own list types, implement `Drop` with a loop that uses `take()`.",
    "archNote": "Linked lists trade cache locality for O(1) splicing. Unless you really need to splice in the middle, a `Vec` plus `sort` or a k-way merge over slices wins, because sequential memory is what CPU caches and prefetchers are built for."
  },
  "lc_buy_sell_stock": {
    "proTip": "The same pass as a fold: `prices.iter().fold((i32::MAX, 0), |(min, best), &p| { let min = min.min(p); (min, best.max(p - min)) })`. It borrows a slice, so the caller keeps ownership of the data.",
    "footgun": "Strictly decreasing prices give a profit of 0, not a negative number: you are allowed not to trade. And a sentinel like `i32::MAX` is only safe if you never subtract from it before it has been replaced; with negative inputs `p - min` could overflow.",
    "archNote": "This is the simplest dynamic program: the best profit up to day i depends only on the minimum before day i, so the DP table collapses into two variables. Each element costs a load, a compare and a subtract."
  },
  "lc_valid_palindrome": {
    "proTip": "`u8::is_ascii_alphanumeric` and `u8::eq_ignore_ascii_case` are the allocation-free tools for ASCII rules. For Unicode, `chars().next_back()` lets you walk from the end without collecting into a `Vec<char>`.",
    "footgun": "Don't mix Unicode classification with ASCII case folding: `'É'.is_alphanumeric()` is true, but `to_ascii_lowercase()` leaves it unchanged, so \"Éé\" fails a check that is meant to ignore case. `char::to_lowercase` returns an iterator, not a char, because one character can lowercase to several ('İ' becomes \"i̇\"), hence `flat_map`.",
    "archNote": "UTF-8 continuation bytes always look like `10xxxxxx`, so `next_back()` finds the start of the last character by skipping at most three of them. That self-synchronizing property is why byte-level scanning for ASCII is always safe on a valid `&str`."
  },
  "lc_reverse_linked_list": {
    "proTip": "`Option::take()` (shorthand for `mem::replace(&mut opt, None)`) moves a value out of a field you only have `&mut` access to. `Option::replace(new)` does the same while putting a new value in.",
    "footgun": "Getting past borrow errors with `current.next.clone()` compiles, but it deep-copies the whole rest of the list at every step: O(n²) time and n² allocations for what should be pointer moves.",
    "archNote": "The reversal reuses every allocation, so node addresses never change and the allocator is never called. That is the payoff of modelling ownership: Rust can move whole structures by moving 8-byte pointers, with no GC write barriers or reference counts."
  },
  "lc_max_subarray": {
    "proTip": "`slice.split_first()` gives you the first element and the rest as `Option<(&T, &[T])>`, a panic-free replacement for `nums[0]` plus `&nums[1..]`. Reslicing is O(1) because it only creates a new pointer and length.",
    "footgun": "Initializing `best` to 0 gives the wrong answer when every number is negative (it should return the largest single element, -1 for `[-3, -1, -2]`). Start from the first element. And `nums[0]` panics on an empty Vec, which is fine under LeetCode's constraints and a bug anywhere else.",
    "archNote": "Each element costs a load, an add and two max operations, and the loop-carried dependency on `current` is what bounds its speed. Reading 4-byte values sequentially from a contiguous slice keeps the loop fed straight from the hardware prefetcher."
  }
};
