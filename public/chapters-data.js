window.chaptersData = {
  "basic_vars": {
    "num": "B1",
    "part": "Part 0: Language Basics",
    "title": "Variables, Immutability & let mut",
    "desc": "In JS, variables declared with let are mutable. In Rust, all variables are immutable by default! You must explicitly opt into mutability with `let mut`. Rust also features compile-time type inference and variable shadowing.",
    "nodeCode": "// Node.js let variables mutate at runtime\nlet count = 10;\ncount += 5;\nconsole.log({ count });",
    "why": "Immutability by default eliminates entire categories of concurrency race conditions before compilation.",
    "code": "fn main() {\n    let service_name = \"AuthWorker\";\n    println!(\"Service: {}\", service_name);\n\n    let mut request_count = 0;\n    request_count += 1;\n    request_count += 5;\n    println!(\"Requests processed: {}\", request_count);\n\n    // Variable Shadowing (re-declaring with same name, can change type)\n    let raw_port = \"8080\";\n    let raw_port: u16 = raw_port.parse().expect(\"Invalid port\");\n    println!(\"Parsed port: {}\", raw_port);\n}"
  },
  "basic_ownership": {
    "num": "B2",
    "part": "Part 0: Language Basics",
    "title": "Ownership & Move Semantics",
    "desc": "In JavaScript, objects live in the V8 heap and are managed by garbage collection. In Rust, every value has a single owner. When passing a heap value or reassigning, ownership moves. The original variable becomes invalid!",
    "nodeCode": "// Node.js objects have shared reference semantics\nconst user = { name: 'Alice' };\nconst alias = user;\nalias.name = 'Bob'; // Mutates original user!",
    "why": "Single ownership eliminates both manual free() memory leaks and Garbage Collection pause latency.",
    "code": "fn main() {\n    let s1 = String::from(\"hello node devs\");\n    // Ownership moves from s1 to s2\n    let s2 = s1;\n    // println!(\"{}\", s1); // Compile error! s1 was moved.\n    println!(\"s2 owns the string: {}\", s2);\n\n    // Explicit clone creates a true duplicate heap allocation\n    let s3 = s2.clone();\n    println!(\"Cloned: s2='{}', s3='{}'\", s2, s3);\n}"
  },
  "basic_borrowing": {
    "num": "B3",
    "part": "Part 0: Language Basics",
    "title": "Borrowing & References (&T vs &mut T)",
    "desc": "Instead of transferring ownership, you can borrow access. Rust enforces the core law: you can have either any number of immutable references (&T) OR exactly one mutable reference (&mut T), never both simultaneously!",
    "nodeCode": "// Node.js allows unlimited shared mutable references\nconst cache = new Map();\nfunction a(c) { c.set('k', 1); }\nfunction b(c) { c.set('k', 2); }\na(cache); b(cache);",
    "why": "Aliasing XOR Mutability makes data races impossible at compile time without needing locks for read-only access.",
    "code": "fn calculate_len(s: &str) -> usize {\n    s.len()\n}\n\nfn append_suffix(s: &mut String) {\n    s.push_str(\" [PROCESSED]\");\n}\n\nfn main() {\n    let mut message = String::from(\"Node.js to Rust\");\n    let len = calculate_len(&message);\n    println!(\"Original length: {}\", len);\n\n    append_suffix(&mut message);\n    println!(\"After mutation: {}\", message);\n}"
  },
  "basic_structs": {
    "num": "B4",
    "part": "Part 0: Language Basics",
    "title": "Structs, impl Blocks & Methods",
    "desc": "JavaScript uses ES6 class with prototype inheritance. Rust has no classes. State is defined with struct, and methods are implemented in separate impl blocks with &self or &mut self receivers.",
    "nodeCode": "// Node.js Class\nclass HttpServer {\n  constructor(host, port) {\n    this.host = host;\n    this.port = port;\n  }\n  addr() { return `${this.host}:${this.port}`; }\n}",
    "why": "Separating data layout from logic keeps memory contiguous and eliminates prototype chain lookups.",
    "code": "#[derive(Debug)]\nstruct HttpServer {\n    host: String,\n    port: u16,\n    connections: u32,\n}\n\nimpl HttpServer {\n    fn new(host: &str, port: u16) -> Self {\n        Self { host: host.to_string(), port, connections: 0 }\n    }\n\n    fn address(&self) -> String {\n        format!(\"{}:{}\", self.host, self.port)\n    }\n\n    fn register_conn(&mut self) {\n        self.connections += 1;\n    }\n}\n\nfn main() {\n    let mut server = HttpServer::new(\"127.0.0.1\", 8080);\n    println!(\"Listening on: {}\", server.address());\n    server.register_conn();\n    println!(\"Status: {:?}\", server);\n}"
  },
  "basic_enums": {
    "num": "B5",
    "part": "Part 0: Language Basics",
    "title": "Algebraic Enums & Pattern Matching",
    "desc": "TypeScript enums are numbers or strings. Rust Enums are full Algebraic Data Types where each variant can hold different payloads. Combined with exhaustive match, they replace polymorphic class hierarchies.",
    "nodeCode": "// TypeScript Discriminated Union\ntype Event = \n  | { type: 'connect', id: string }\n  | { type: 'data', bytes: number[] };",
    "why": "Compiler-verified exhaustiveness guarantees no unhandled state transitions or missing cases.",
    "code": "#[derive(Debug)]\nenum NetworkEvent {\n    Connected(String),\n    DataReceived(Vec<u8>),\n    Disconnected { code: u16, reason: String },\n}\n\nfn process_event(event: NetworkEvent) {\n    match event {\n        NetworkEvent::Connected(id) => println!(\"Connected: {}\", id),\n        NetworkEvent::DataReceived(bytes) => println!(\"Got {} bytes\", bytes.len()),\n        NetworkEvent::Disconnected { code, reason } => {\n            println!(\"Disconnected: {} (code {})\", reason, code);\n        }\n    }\n}\n\nfn main() {\n    process_event(NetworkEvent::Connected(\"ws-101\".to_string()));\n    process_event(NetworkEvent::DataReceived(vec![1, 2, 3]));\n    process_event(NetworkEvent::Disconnected { code: 1000, reason: \"Normal\".to_string() });\n}"
  },
  "basic_option": {
    "num": "B6",
    "part": "Part 0: Language Basics",
    "title": "Option<T> \u2014 Banishing null & undefined",
    "desc": "Rust has no null or undefined. Optional presence is explicitly wrapped in the Option<T> enum: Some(T) or None. You cannot access the inner value without unwrapping or matching.",
    "nodeCode": "// Node.js null crashes at runtime when unchecked\nfunction findUser(id) { return id === 1 ? { name: 'Alice' } : null; }\nconst user = findUser(2);\n// Accessing properties directly triggers runtime crash:\nconsole.log(user?.name ?? 'Not found'); // Safe with optional chaining, but user.name throws TypeError!",
    "why": "Option<T> makes null pointer exceptions impossible by enforcing compile-time handling of absence.",
    "code": "fn find_user(id: u32) -> Option<String> {\n    if id == 1 { Some(\"Alice\".to_string()) } else { None }\n}\n\nfn main() {\n    let user1 = find_user(1);\n    let user2 = find_user(99);\n\n    match user1 {\n        Some(name) => println!(\"Found: {}\", name),\n        None => println!(\"Not found\"),\n    }\n\n    let display = user2.unwrap_or_else(|| \"Guest\".to_string());\n    println!(\"Fallback: {}\", display);\n}"
  },
  "basic_result": {
    "num": "B7",
    "part": "Part 0: Language Basics",
    "title": "Result<T, E> & the '?' Operator",
    "desc": "In Node.js, asynchronous errors reject promises or throw exceptions. Rust treats recoverable errors as regular values using Result<T, E>. The '?' operator provides ergonomic early-return propagation.",
    "nodeCode": "// Node.js throw / try-catch\nfunction parsePort(raw) {\n  const p = parseInt(raw);\n  if (isNaN(p)) throw new Error('Invalid');\n  return p;\n}",
    "why": "Result<T, E> forces explicit error handling at compile time without hidden runtime exception jumps.",
    "code": "use std::num::ParseIntError;\n\nfn parse_port(port_str: &str) -> Result<u16, ParseIntError> {\n    let port: u16 = port_str.parse()?;\n    Ok(port)\n}\n\nfn main() {\n    match parse_port(\"8080\") {\n        Ok(p) => println!(\"Port configured: {}\", p),\n        Err(e) => eprintln!(\"Parse failed: {}\", e),\n    }\n\n    if let Err(err) = parse_port(\"not_number\") {\n        println!(\"Expected failure handled: {}\", err);\n    }\n}"
  },
  "basic_traits": {
    "num": "B8",
    "part": "Part 0: Language Basics",
    "title": "Traits & Explicit Contracts",
    "desc": "TypeScript interfaces use duck typing (structural typing). Rust Traits define shared behavior that types must explicitly implement. Traits power polymorphism and generic bounds.",
    "nodeCode": "// TypeScript structural typing\ninterface Printable { print(): void; }\nconst obj = { print() { console.log('hi'); } };",
    "why": "Explicit trait implementation eliminates unintentional duck-typing collisions and enables zero-cost static dispatch.",
    "code": "trait Summarizable {\n    fn summarize(&self) -> String;\n}\n\nstruct Article {\n    title: String,\n    author: String,\n}\n\nimpl Summarizable for Article {\n    fn summarize(&self) -> String {\n        format!(\"'{}' by {}\", self.title, self.author)\n    }\n}\n\nfn display<T: Summarizable>(item: &T) {\n    println!(\"Summary: {}\", item.summarize());\n}\n\nfn main() {\n    let art = Article { title: \"Rust Guide\".into(), author: \"Nadim\".into() };\n    display(&art);\n}"
  },
  "basic_generics": {
    "num": "B9",
    "part": "Part 0: Language Basics",
    "title": "Generics & Monomorphization",
    "desc": "TypeScript generics are erased during compilation to JavaScript. Rust generics are monomorphized: the compiler creates specialized machine code for every concrete type used with zero runtime penalty.",
    "nodeCode": "// TypeScript generics erased at runtime\nfunction wrap<T>(val: T): { value: T } { return { value: val }; }",
    "why": "Zero-cost abstractions: reuse generic code with the raw speed of hand-written specialized assembly.",
    "code": "#[derive(Debug)]\nstruct ApiResponse<T> {\n    status: u16,\n    payload: T,\n}\n\nimpl<T> ApiResponse<T> {\n    fn ok(payload: T) -> Self {\n        Self { status: 200, payload }\n    }\n}\n\nfn main() {\n    let int_resp = ApiResponse::ok(42);\n    let str_resp = ApiResponse::ok(String::from(\"Healthy\"));\n    println!(\"{:?}\n{:?}\", int_resp, str_resp);\n}"
  },
  "basic_lifetimes": {
    "num": "B10",
    "part": "Part 0: Language Basics",
    "title": "Lifetimes Explained for JS Devs",
    "desc": "In Node.js, V8 keeps objects alive as long as references exist. In Rust, the borrow checker verifies at compile time that no reference ever outlives the data it points to! Lifetimes declare relationships to rustc.",
    "nodeCode": "// JS closures retain references automatically\nfunction getGreeter() { const msg = 'hi'; return () => msg; }",
    "why": "Lifetimes prevent dangling pointer bugs (use-after-free) at compile time without garbage collection.",
    "code": "fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {\n    if x.len() > y.len() { x } else { y }\n}\n\nfn main() {\n    let str1 = String::from(\"short\");\n    let str2 = String::from(\"longer string\");\n    let result = longest(str1.as_str(), str2.as_str());\n    println!(\"Longest: {}\", result);\n}"
  },
  "axum_api": {
    "num": "1",
    "part": "Part 1: Web APIs & Axum",
    "title": "Express.js vs Axum Routing & Handlers",
    "desc": "Express uses callback middleware and mutable req/res objects. Axum leverages Tokio and type-safe extractors: handler parameters automatically deserialize JSON, headers, or state at compile time.",
    "nodeCode": "import express from 'express';\nconst app = express();\n\n// Express.js route handler\napp.get('/users/:id', (req, res) => {\n  res.json({ id: req.params.id, status: 'active' });\n});",
    "why": "Type-safe extractors parse requests declaratively and fail invalid requests before handler execution.",
    "code": "// Simulated Axum-style handler pattern for standalone playground\nstruct PathExtractor(u32);\nstruct JsonResponse { id: u32, status: &'static str }\n\nfn user_handler(PathExtractor(id): PathExtractor) -> JsonResponse {\n    JsonResponse { id, status: \"active\" }\n}\n\nfn main() {\n    let req = PathExtractor(42);\n    let resp = user_handler(req);\n    println!(\"Status: 200 OK | Payload: {{ id: {}, status: '{}' }}\", resp.id, resp.status);\n}"
  },
  "state_singleton": {
    "num": "2",
    "part": "Part 1: Web APIs & Axum",
    "title": "Shared State with Arc<T> vs Global Singletons",
    "desc": "Node.js shares module-level variables across all requests because of the single-threaded event loop. Rust web servers are multi-threaded: shared state requires thread-safe reference counting (`Arc<T>`).",
    "nodeCode": "// In Node.js, async connection singletons must guard against boot races\nlet poolPromise: Promise<{ host: string; port: number }> | null = null;\n\nexport async function getDbPool() {\n  if (!poolPromise) {\n    poolPromise = Promise.resolve({ host: 'localhost', port: 5432 });\n  }\n  return poolPromise;\n}",
    "why": "Arc<T> ensures safe thread-safe reference sharing without global mutable state corruption.",
    "code": "use std::sync::Arc;\nuse std::sync::atomic::{AtomicUsize, Ordering};\n\nstruct AppState {\n    request_counter: AtomicUsize,\n    db_pool_name: String,\n}\n\nfn main() {\n    // Wrap state in thread-safe reference counted pointer\n    let shared_state = Arc::new(AppState {\n        request_counter: AtomicUsize::new(0),\n        db_pool_name: \"PostgreSQL-Pool-1\".to_string(),\n    });\n\n    // Clone pointer for another thread or request\n    let worker_state = Arc::clone(&shared_state);\n    // Monotonic request counter: Relaxed ordering is optimal and hardware-efficient\n    worker_state.request_counter.fetch_add(1, Ordering::Relaxed);\n\n    println!(\"Pool: {}\", shared_state.db_pool_name);\n    println!(\"Requests: {}\", shared_state.request_counter.load(Ordering::Relaxed));\n}"
  },
  "tower_middleware": {
    "num": "3",
    "part": "Part 1: Web APIs & Axum",
    "title": "Tower Middleware vs Express Middleware",
    "desc": "Express passes `(req, res, next)` through a chain of callbacks. Axum uses the Tower ecosystem, where middleware wraps asynchronous services adhering to `Service<Request>` contracts.",
    "nodeCode": "import express from 'express';\nconst app = express();\n\n// Express middleware\napp.use((req, res, next) => {\n  console.log(`${req.method} ${req.url}`);\n  next();\n});",
    "why": "Tower middleware is composable across any network protocol (HTTP, gRPC, TCP) with compile-time type verification.",
    "code": "// Demonstration of composable request pipeline\nstruct Request { method: &'static str, path: &'static str }\nstruct Response { status: u16 }\n\nfn logging_middleware<F>(req: Request, next: F) -> Response\nwhere\n    F: FnOnce(Request) -> Response,\n{\n    println!(\"[LOG] Received {} {}\", req.method, req.path);\n    let res = next(req);\n    println!(\"[LOG] Responded with status {}\", res.status);\n    res\n}\n\nfn main() {\n    let req = Request { method: \"GET\", path: \"/api/health\" };\n    let res = logging_middleware(req, |_| Response { status: 200 });\n    println!(\"Pipeline finished: status {}\", res.status);\n}"
  },
  "reqwest_client": {
    "num": "4",
    "part": "Part 1: Web APIs & Axum",
    "title": "HTTP Client: fetch / axios vs reqwest",
    "desc": "Node.js uses global `fetch()` or `axios`. In Rust, `reqwest` is the de-facto production HTTP client with built-in connection pooling, compression, JSON serialization, and streaming support.",
    "nodeCode": "// Node.js 18+ native global fetch (verifying res.ok status)\nconst res = await fetch('https://api.github.com/zen');\nif (!res.ok) {\n  throw new Error(`HTTP ${res.status}: ${res.statusText}`);\n}\nconst text = await res.text();\nconsole.log(text);",
    "why": "Connection pooling is reused automatically across requests with static typing for incoming payloads.",
    "code": "// In reqwest: client.get(url).send().await?.error_for_status()?.text().await?\n#[derive(Debug)]\nstruct MockResponse { status: u16, body: String }\n\nstruct Client;\nimpl Client {\n    fn get(&self, url: &str) -> Result<MockResponse, &'static str> {\n        if url.is_empty() { return Err(\"Empty URL\"); }\n        Ok(MockResponse { status: 200, body: format!(\"Mock response from {}\", url) })\n    }\n}\n\nfn main() {\n    let client = Client;\n    match client.get(\"https://api.example.com/status\") {\n        Ok(resp) if resp.status == 200 => println!(\"Body: {}\", resp.body),\n        Ok(resp) => eprintln!(\"HTTP Status: {}\", resp.status),\n        Err(e) => eprintln!(\"HTTP Error: {}\", e),\n    }\n}"
  },
  "serde_json": {
    "num": "5",
    "part": "Part 1: Web APIs & Axum",
    "title": "JSON Parsing: JSON.parse() vs Serde",
    "desc": "In Node.js, `JSON.parse()` produces an untyped dynamic object that requires runtime validation (Zod). In Rust, Serde serializes and deserializes directly into strongly-typed structs with zero intermediate allocations.",
    "nodeCode": "// Node.js JSON parsing with manual / Zod validation\nconst payload = JSON.parse('{\"id\":10,\"active\":true}');\nconsole.log(payload.id);",
    "why": "Serde generates compile-time serialization code without runtime reflection, achieving multi-gigabyte/sec throughput.",
    "code": "// Standalone representation of Serde struct mapping\n#[derive(Debug)]\nstruct UserPayload {\n    id: u64,\n    username: String,\n    is_active: bool,\n}\n\nimpl UserPayload {\n    fn mock_deserialize(id: u64, name: &str) -> Self {\n        Self { id, username: name.to_string(), is_active: true }\n    }\n}\n\nfn main() {\n    let user = UserPayload::mock_deserialize(101, \"nadimtuhin\");\n    println!(\"Deserialized struct: {:?}\", user);\n    println!(\"User {} is active: {}\", user.username, user.is_active);\n}"
  },
  "env_config": {
    "num": "6",
    "part": "Part 1: Web APIs & Axum",
    "title": "Environment Variables & Configuration",
    "desc": "Node.js reads `process.env.PORT` dynamically at runtime as strings. Rust loads and validates configuration during server boot using `dotenvy` and strongly-typed config structs.",
    "nodeCode": "// Modern Node.js configuration (ESM / Node 20+ --env-file=.env)\nimport 'dotenv/config';\n\nconst port = parseInt(process.env.PORT ?? '3000', 10);\nconsole.log({ port });",
    "why": "Validate environment variables at startup so bad configurations fail fast before serving traffic.",
    "code": "use std::env;\n\nstruct AppConfig {\n    port: u16,\n    env: String,\n}\n\nimpl AppConfig {\n    fn load() -> Self {\n        let port = env::var(\"APP_PORT\")\n            .ok()\n            .and_then(|p| p.parse().ok())\n            .unwrap_or(8080);\n        let env = env::var(\"APP_ENV\").unwrap_or_else(|_| \"development\".to_string());\n        Self { port, env }\n    }\n}\n\nfn main() {\n    let config = AppConfig::load();\n    println!(\"Booting in [{}] mode on port :{}\", config.env, config.port);\n}"
  },
  "vec_transform": {
    "num": "7",
    "part": "Part 2: Collections & Data",
    "title": "Array.map / filter / reduce vs Vec Iterators",
    "desc": "JavaScript arrays provide `.map()`, `.filter()`, and `.reduce()`. Rust vectors provide lazy `Iterator` chains that compile into zero-allocation SIMD vector loops.",
    "nodeCode": "// JS Array transformations allocate new arrays at each step\nconst nums = [1, 2, 3, 4, 5];\nconst evensDoubled = nums.filter(n => n % 2 === 0).map(n => n * 2);",
    "why": "Rust iterators are completely lazy: no intermediate heap allocations occur between filter and map operations.",
    "code": "fn main() {\n    let numbers = vec![1, 2, 3, 4, 5, 6, 7, 8, 9, 10];\n\n    // Lazy iterator chain: zero intermediate allocations\n    let evens_doubled: Vec<i32> = numbers\n        .iter()\n        .filter(|&&x| x % 2 == 0)\n        .map(|&x| x * 2)\n        .collect();\n\n    println!(\"Doubled evens: {:?}\", evens_doubled);\n\n    // Sum reduction (fold / reduce)\n    let sum: i32 = numbers.iter().sum();\n    println!(\"Sum of all numbers: {}\", sum);\n}"
  },
  "hashmap_set": {
    "num": "8",
    "part": "Part 2: Collections & Data",
    "title": "Map & Set vs HashMap & HashSet",
    "desc": "JavaScript offers `new Map()` and `new Set()`. Rust provides `std::collections::HashMap` and `HashSet`. Rust allows custom hasher algorithms and in-place entry modifications.",
    "nodeCode": "// JS Map operations\nconst counts = new Map();\ncounts.set('apple', (counts.get('apple') || 0) + 1);",
    "why": "The Entry API provides safe, zero-lookup atomic updates without querying the key twice.",
    "code": "use std::collections::HashMap;\n\nfn main() {\n    let mut word_counts: HashMap<&str, u32> = HashMap::new();\n\n    let words = vec![\"rust\", \"node\", \"rust\", \"axum\", \"node\", \"rust\"];\n\n    for word in words {\n        // Entry API: inspect and update in a single lookup!\n        *word_counts.entry(word).or_insert(0) += 1;\n    }\n\n    println!(\"Word counts: {:?}\", word_counts);\n    println!(\"Occurrences of 'rust': {:?}\", word_counts.get(\"rust\"));\n}"
  },
  "slices_strings": {
    "num": "9",
    "part": "Part 2: Collections & Data",
    "title": "String vs &str & Slices Explained",
    "desc": "In JavaScript, all strings are immutable UTF-16 primitives. In Rust, `String` is an owned, growable heap buffer, while `&str` is an immutable borrowed UTF-8 slice pointing to existing bytes.",
    "nodeCode": "// JS strings are UTF-16 and slice creates a copy or substring\nconst s = 'Hello World';\nconst sub = s.slice(0, 5);",
    "why": "Slices (`&str`, `&[T]`) let you view subsections of data without allocating new memory.",
    "code": "fn main() {\n    // 1. Owned String on heap (pointer, capacity, length)\n    let mut owned = String::from(\"Rustacean\");\n    owned.push_str(\" Developer\");\n\n    // 2. Borrowed slice (&str) pointing to a subsection (zero copy!)\n    let slice: &str = &owned[0..9];\n    println!(\"Slice: '{}'\", slice);\n\n    // 3. Array slices (&[T])\n    let numbers = [10, 20, 30, 40, 50];\n    let middle_slice: &[i32] = &numbers[1..4];\n    println!(\"Middle numbers: {:?}\", middle_slice);\n}"
  },
  "smart_pointers": {
    "num": "10",
    "part": "Part 2: Collections & Data",
    "title": "Smart Pointers: Box, Rc, Arc & RefCell",
    "desc": "In Node.js, V8 manages all memory on the garbage-collected heap. In Rust, values default to the stack. Smart pointers provide explicit heap allocation (`Box`), reference counting (`Rc`/`Arc`), and interior mutability (`RefCell`).",
    "nodeCode": "// Node.js objects are heap pointers behind the scenes\nconst node = { val: 1, next: null };",
    "why": "Explicit smart pointers give you precise control over memory layout and caching.",
    "code": "use std::sync::Arc;\n\n// Recursive data structure requires Box for known compile-time size\n#[derive(Debug)]\nenum LinkedList {\n    Cons(i32, Box<LinkedList>),\n    Nil,\n}\n\nfn main() {\n    // Heap allocation with Box<T>\n    let list = LinkedList::Cons(1, Box::new(LinkedList::Cons(2, Box::new(LinkedList::Nil))));\n    println!(\"Linked List: {:?}\", list);\n\n    // Shared thread-safe ownership with Arc<T>\n    let shared_num = Arc::new(42);\n    let clone_ref = Arc::clone(&shared_num);\n    println!(\"Arc value: {}, strong count: {}\", clone_ref, Arc::strong_count(&shared_num));\n}"
  },
  "interior_mutability": {
    "num": "11",
    "part": "Part 2: Collections & Data",
    "title": "Interior Mutability: Mutex & RwLock",
    "desc": "In JavaScript, objects can be mutated even if declared with const. In Rust, interior mutability allows mutating data behind an immutable reference using thread-safe `Mutex` or `RwLock`.",
    "nodeCode": "// JS objects can mutate fields even when held in a const binding\nconst config = { hits: 0 };\nconfig.hits++;",
    "why": "Rust Mutex wraps the data itself: you cannot access the inner data without locking first.",
    "code": "use std::sync::{Mutex, RwLock};\n\nfn main() {\n    // Mutex wraps the data, enforcing mutual exclusion\n    let counter = Mutex::new(0);\n\n    {\n        let mut lock = counter.lock().unwrap();\n        *lock += 10;\n        // Lock automatically releases when `lock` drops here!\n    }\n\n    println!(\"Counter: {}\", *counter.lock().unwrap());\n\n    // RwLock allows many readers OR one writer\n    let cache = RwLock::new(String::from(\"Cached payload\"));\n    {\n        let read_guard = cache.read().unwrap();\n        println!(\"Read cache: {}\", *read_guard);\n    }\n}"
  },
  "memory_alignment": {
    "num": "12",
    "part": "Part 2: Collections & Data",
    "title": "Struct Memory Layout, Alignment & Padding",
    "desc": "In V8, JavaScript objects are hidden-class shapes with pointer overhead. In Rust, structs are laid out contiguously in memory with hardware-level byte alignment and padding.",
    "nodeCode": "// In Node.js, Buffer / ArrayBuffer allows inspecting binary memory layout\nconst buffer = new ArrayBuffer(24);\nconst view = new DataView(buffer);\n// Unaligned 8-byte float write across byte offset 1\nview.setFloat64(1, 3.14159, true);\nconsole.log({ byteLength: buffer.byteLength });",
    "why": "Understanding struct alignment enables cache-line optimization and zero-waste memory footprints.",
    "code": "use std::mem::{size_of, align_of};\n\n// Field ordering impacts padding bytes\n#[repr(C)]\nstruct Unoptimized {\n    a: u8,   // 1 byte + 7 bytes padding\n    b: u64,  // 8 bytes\n    c: u8,   // 1 byte + 7 bytes padding = 24 bytes total\n}\n\n#[repr(C)]\nstruct Optimized {\n    b: u64,  // 8 bytes\n    a: u8,   // 1 byte\n    c: u8,   // 1 byte + 6 bytes padding = 16 bytes total\n}\n\nfn main() {\n    println!(\"Unoptimized size: {} bytes, align: {}\", size_of::<Unoptimized>(), align_of::<Unoptimized>());\n    println!(\"Optimized size:   {} bytes, align: {}\", size_of::<Optimized>(), align_of::<Optimized>());\n}"
  },
  "sqlx_compile_time": {
    "num": "13",
    "part": "Part 3: Databases & SQL",
    "title": "Prisma / TypeORM vs SQLx Compile-Time SQL",
    "desc": "Node.js ORMs generate SQL queries dynamically at runtime or rely on code generators. SQLx connects to your database at build time and validates that every SQL query, table, and column exists and matches types!",
    "nodeCode": "import { PrismaClient } from '@prisma/client';\nconst prisma = new PrismaClient();\n\n// Prisma runtime query (types checked against schema generator)\nconst users = await prisma.user.findMany({\n  where: { active: true }\n});",
    "why": "Compile-time query verification eliminates runtime SQL syntax and column mismatch errors before deployment.",
    "code": "// Demonstration of type-safe SQL query projection\n#[derive(Debug)]\nstruct UserRow {\n    id: i64,\n    email: String,\n    is_active: bool,\n}\n\nfn mock_query_user(id: i64) -> Result<UserRow, &'static str> {\n    // In SQLx: sqlx::query_as!(UserRow, \"SELECT id, email, is_active FROM users WHERE id = $1\", id)\n    if id > 0 {\n        Ok(UserRow { id, email: \"user@example.com\".into(), is_active: true })\n    } else {\n        Err(\"User not found\")\n    }\n}\n\nfn main() {\n    match mock_query_user(1) {\n        Ok(user) => println!(\"Loaded user: {:?}\", user),\n        Err(e) => eprintln!(\"Database error: {}\", e),\n    }\n}"
  },
  "db_pool": {
    "num": "14",
    "part": "Part 3: Databases & SQL",
    "title": "Connection Pools: pg.Pool vs sqlx::Pool",
    "desc": "Node.js `pg.Pool` handles connections via the event loop. In Rust, `sqlx::Pool` manages asynchronous connection pooling across multi-threaded worker pools with configurable timeouts and keep-alives.",
    "nodeCode": "import { Pool } from 'pg';\n\nconst pool = new Pool({ max: 20 });\nconst client = await pool.connect();",
    "why": "Robust connection pooling prevents connection starvation and balances load across database replicas.",
    "code": "use std::sync::atomic::{AtomicUsize, Ordering};\n\nstruct MockDbPool {\n    max_connections: usize,\n    active_connections: AtomicUsize,\n}\n\nimpl MockDbPool {\n    fn new(max: usize) -> Self {\n        Self { max_connections: max, active_connections: AtomicUsize::new(0) }\n    }\n\n    fn acquire(&self) -> Result<usize, &'static str> {\n        let current = self.active_connections.fetch_add(1, Ordering::SeqCst);\n        if current >= self.max_connections {\n            self.active_connections.fetch_sub(1, Ordering::SeqCst);\n            return Err(\"Pool exhausted\");\n        }\n        Ok(current + 1)\n    }\n}\n\nfn main() {\n    let pool = MockDbPool::new(5);\n    println!(\"Connection acquired: {:?}\", pool.acquire());\n    println!(\"Connection acquired: {:?}\", pool.acquire());\n}"
  },
  "db_transactions": {
    "num": "15",
    "part": "Part 3: Databases & SQL",
    "title": "Transactions & RAII Rollback",
    "desc": "In Node.js, unhandled exceptions inside transactions require manual `try/catch` and `ROLLBACK` calls. In Rust, transactions roll back automatically on drop if not explicitly committed!",
    "nodeCode": "import { Pool } from 'pg';\nconst pool = new Pool();\n\n// Node.js manual transaction management\nconst client = await pool.connect();\ntry {\n  await client.query('BEGIN');\n  // ... execute queries\n  await client.query('COMMIT');\n} catch (e) {\n  await client.query('ROLLBACK');\n  throw e;\n} finally {\n  client.release();\n}",
    "why": "RAII Rollback ensures transactions never leak or hang in an uncommitted state even during panics.",
    "code": "// Simulation of RAII transaction auto-rollback\nstruct Transaction {\n    committed: bool,\n}\n\nimpl Transaction {\n    fn begin() -> Self { Self { committed: false } }\n    fn commit(mut self) {\n        self.committed = true;\n        println!(\"--> Transaction successfully COMMITTED.\");\n    }\n}\n\nimpl Drop for Transaction {\n    fn drop(&mut self) {\n        if !self.committed {\n            println!(\"--> Transaction dropped without commit: Auto-ROLLBACK triggered!\");\n        }\n    }\n}\n\nfn main() {\n    println!(\"--- Test 1: Successful commit ---\");\n    let tx1 = Transaction::begin();\n    tx1.commit();\n\n    println!(\"\\n--- Test 2: Early return / error branch ---\");\n    let _tx2 = Transaction::begin();\n    // Scope ends here without commit -> Auto Rollback!\n}"
  },
  "redis_caching": {
    "num": "16",
    "part": "Part 3: Databases & SQL",
    "title": "Redis Caching & Mutex Stampede Protection",
    "desc": "Node.js uses `ioredis` for caching. In Rust, `redis-rs` provides async connection multiplexing. Combining Redis with in-memory locks prevents cache stampedes on hot keys.",
    "nodeCode": "import Redis from 'ioredis';\n\nconst redis = new Redis();\nconst val = await redis.get('user:10');",
    "why": "Connection multiplexing allows thousands of requests to pipeline commands over a single TCP socket.",
    "code": "use std::collections::HashMap;\n\n// Mock cache layer\nstruct Cache {\n    store: HashMap<String, String>,\n}\n\nimpl Cache {\n    fn new() -> Self { Self { store: HashMap::new() } }\n    fn get_or_set<F>(&mut self, key: &str, compute: F) -> String\n    where F: FnOnce() -> String {\n        if let Some(val) = self.store.get(key) {\n            return val.clone();\n        }\n        let computed = compute();\n        self.store.insert(key.to_string(), computed.clone());\n        computed\n    }\n}\n\nfn main() {\n    let mut cache = Cache::new();\n    let val1 = cache.get_or_set(\"hero\", || \"Batman\".to_string());\n    let val2 = cache.get_or_set(\"hero\", || \"Superman\".to_string());\n    println!(\"Val1: {}, Val2 (cached): {}\", val1, val2);\n}"
  },
  "seaorm_patterns": {
    "num": "17",
    "part": "Part 3: Databases & SQL",
    "title": "SeaORM & ActiveModel vs TypeORM",
    "desc": "If you require an ORM rather than raw SQLx, SeaORM provides an async ActiveModel pattern built on top of SQLx with migrations, relation mapping, and typed schema builders.",
    "nodeCode": "import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';\n\n// TypeORM Entity decorator\n@Entity()\nclass User {\n  @PrimaryGeneratedColumn()\n  id!: number;\n\n  @Column()\n  name!: string;\n}",
    "why": "Type-safe relation joins with compile-time generated queries without dynamic reflection.",
    "code": "// SeaORM ActiveModel pattern with ActiveValue (Set vs Unchanged)\n#[derive(Debug, Clone)]\nenum ActiveValue<T> {\n    Set(T),\n    Unchanged(T),\n    NotSet,\n}\n\n#[derive(Debug)]\nstruct UserModel {\n    id: i32,\n    username: String,\n}\n\nstruct UserActiveModel {\n    username: ActiveValue<String>,\n}\n\nimpl UserActiveModel {\n    fn insert(self, id: i32) -> UserModel {\n        let name = match self.username {\n            ActiveValue::Set(val) => val,\n            ActiveValue::Unchanged(val) => val,\n            ActiveValue::NotSet => String::from(\"anonymous\"),\n        };\n        UserModel { id, username: name }\n    }\n}\n\nfn main() {\n    let new_user = UserActiveModel {\n        username: ActiveValue::Set(\"rustacean_hero\".to_string()),\n    };\n    let saved = new_user.insert(101);\n    println!(\"Saved SeaORM ActiveModel entity: {:?}\", saved);\n}"
  },
  "mongodb_driver": {
    "num": "18",
    "part": "Part 3: Databases & SQL",
    "title": "MongoDB: Mongoose vs official mongodb crate",
    "desc": "Mongoose defines dynamic schemas with hooks. Rust's official `mongodb` crate uses Serde for BSON document mapping with type-safe collections.",
    "nodeCode": "import mongoose, { Schema } from 'mongoose';\n\n// Mongoose schema and model definition\nconst userSchema = new Schema({ email: String });\nconst User = mongoose.model('User', userSchema);",
    "why": "Type-safe BSON serialization eliminates schema validation discrepancies between app and database.",
    "code": "#[derive(Debug)]\nstruct MongoDocument {\n    oid: &'static str,\n    title: &'static str,\n}\n\nfn main() {\n    let doc = MongoDocument { oid: \"60c72b2f9b1d8b001c8e4d2a\", title: \"Rust BSON\" };\n    println!(\"MongoDB document: {:?}\", doc);\n}"
  },
  "redis_queues": {
    "num": "19",
    "part": "Part 4: Queues & Workers",
    "title": "BullMQ vs Redis Streams in Rust",
    "desc": "BullMQ coordinates background job queues in Node.js using Redis Lua scripts. In Rust, Redis Streams or dedicated engines (`faktory-rs`, `apalis`) provide high-throughput job consumer workers.",
    "nodeCode": "import { Worker } from 'bullmq';\n\n// BullMQ worker processing background jobs\nconst worker = new Worker('emails', async (job) => {\n  console.log(`Sending email to ${job.data.to}`);\n});",
    "why": "Consumer groups allow scaling background workers across multiple machines with reliable delivery guarantees.",
    "code": "use std::sync::mpsc;\nuse std::thread;\n\nstruct Job { id: u64, payload: &'static str }\n\nfn main() {\n    let (tx, rx) = mpsc::channel::<Job>();\n\n    // Worker thread\n    let worker = thread::spawn(move || {\n        while let Ok(job) = rx.recv() {\n            println!(\"Worker processed job #{}: {}\", job.id, job.payload);\n        }\n    });\n\n    // Enqueue jobs\n    tx.send(Job { id: 1, payload: \"Send Welcome Email\" }).unwrap();\n    tx.send(Job { id: 2, payload: \"Process Invoice\" }).unwrap();\n    drop(tx); // Close channel\n\n    worker.join().unwrap();\n}"
  },
  "job_retries": {
    "num": "20",
    "part": "Part 4: Queues & Workers",
    "title": "Exponential Backoff & Dead-Letter Queues",
    "desc": "BullMQ handles retries with backoff strategies. In Rust, exponential backoff with jitter prevents thundering herd problems when downstream services experience outages.",
    "nodeCode": "import { Queue } from 'bullmq';\nconst queue = new Queue('payments');\n\n// BullMQ exponential backoff retry configuration\nawait queue.add('process-payment', { amount: 100 }, {\n  attempts: 5,\n  backoff: { type: 'exponential', delay: 1000 }\n});",
    "why": "Adding randomized jitter to exponential backoff prevents synchronized retries from overwhelming recovering services.",
    "code": "fn calculate_backoff_with_jitter(attempt: u32, base_ms: u64, max_ms: u64, jitter_factor: f64) -> u64 {\n    // Prevent integer bitshift overflow on large retry attempts\n    let exp = 1u64.checked_shl(attempt.min(30)).unwrap_or(u64::MAX);\n    let raw_delay = base_ms.saturating_mul(exp).min(max_ms);\n    let jittered = (raw_delay as f64 * (1.0 + jitter_factor)).max(0.0);\n    (jittered as u64).min(max_ms)\n}\n\nfn main() {\n    let jitter_samples = [0.05, -0.02, 0.08, -0.04, 0.02];\n    for attempt in 0..5 {\n        let ms = calculate_backoff_with_jitter(attempt, 100, 5000, jitter_samples[attempt as usize]);\n        println!(\"Retry attempt {}: backoff with jitter {} ms\", attempt + 1, ms);\n    }\n    println!(\"[DLQ Status] Exhausted 5 retry attempts -> Routed message to Dead-Letter Queue (DLQ)\\n\");\n}"
  },
  "tokio_spawn": {
    "num": "21",
    "part": "Part 5: Async & Tokio",
    "title": "Promise.all vs tokio::join! & tokio::spawn",
    "desc": "JavaScript runs on a single thread event loop. `Promise.all` executes concurrent async tasks cooperatively. In Rust, Tokio provides a multi-threaded work-stealing runtime with `tokio::join!` and `tokio::spawn`.",
    "nodeCode": "// Concurrent async execution via Promise.all in Node.js\nasync function fetchUsers() { return ['Alice', 'Bob']; }\nasync function fetchPosts() { return [{ title: 'Intro to Rust' }]; }\n\nconst [users, posts] = await Promise.all([\n  fetchUsers(),\n  fetchPosts()\n]);",
    "why": "Tokio distributes asynchronous tasks across all physical CPU cores using work-stealing algorithms.",
    "code": "// Conceptual demonstration of concurrent tasks\nfn fetch_users() -> &'static str { \"users_loaded\" }\nfn fetch_posts() -> &'static str { \"posts_loaded\" }\n\nfn main() {\n    // In Tokio: let (users, posts) = tokio::join!(fetch_users(), fetch_posts());\n    let u = fetch_users();\n    let p = fetch_posts();\n    println!(\"Completed concurrent batch: {}, {}\", u, p);\n}"
  },
  "select_race": {
    "num": "22",
    "part": "Part 5: Async & Tokio",
    "title": "Promise.race vs tokio::select!",
    "desc": "Node.js uses `Promise.race()` to await the fastest promise. Rust provides `tokio::select!`, which can simultaneously await futures, channel receives, and timeouts, canceling unselected branches.",
    "nodeCode": "// In Node.js, Promise.race does NOT cancel losers! The loser promise continues in background.\nconst fetchData = async () => 'data';\nconst timeout = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms));\n\nconst result = await Promise.race([fetchData(), timeout(5000)]);",
    "why": "tokio::select! drops unselected futures immediately, cancelling them cleanly without lingering background execution.",
    "code": "// Simulation of select race pattern\nenum RaceResult {\n    Data(&'static str),\n    Timeout,\n}\n\nfn race_operation(fast: bool) -> RaceResult {\n    if fast { RaceResult::Data(\"Payload ready\") } else { RaceResult::Timeout }\n}\n\nfn main() {\n    match race_operation(true) {\n        RaceResult::Data(d) => println!(\"Fastest branch won: {}\", d),\n        RaceResult::Timeout => println!(\"Operation timed out!\"),\n    }\n}"
  },
  "cancellation_tokens": {
    "num": "23",
    "part": "Part 5: Async & Tokio",
    "title": "AbortController vs CancellationToken",
    "desc": "Node.js uses `AbortController` and `signal` to propagate cancellation. Rust's `tokio_util::sync::CancellationToken` provides cooperative cancellation across threads and tasks.",
    "nodeCode": "// Node.js AbortController for cooperative cancellation\nconst ac = new AbortController();\nsetTimeout(() => ac.abort(), 1000);\n\nawait fetch('https://example.com/api', { signal: ac.signal });",
    "why": "CancellationToken enables clean, structured shutdowns across tree-like hierarchies of background worker tasks.",
    "code": "use std::sync::atomic::{AtomicBool, Ordering};\nuse std::sync::Arc;\n\nstruct MockToken {\n    cancelled: Arc<AtomicBool>,\n}\n\nimpl MockToken {\n    fn new() -> Self { Self { cancelled: Arc::new(AtomicBool::new(false)) } }\n    fn cancel(&self) { self.cancelled.store(true, Ordering::SeqCst); }\n    fn is_cancelled(&self) -> bool { self.cancelled.load(Ordering::SeqCst) }\n}\n\nfn main() {\n    let token = MockToken::new();\n    println!(\"Running worker. Is cancelled? {}\", token.is_cancelled());\n    token.cancel();\n    println!(\"Cancel signal sent. Is cancelled? {}\", token.is_cancelled());\n}"
  },
  "error_anyhow_thiserror": {
    "num": "24",
    "part": "Part 5: Async & Tokio",
    "title": "Error Architecture: anyhow vs thiserror",
    "desc": "In Node.js, libraries and applications throw arbitrary `Error` instances. In Rust, libraries use `thiserror` to define strongly-typed domain error enums, while applications use `anyhow` for rich error contexts with backtraces.",
    "nodeCode": "// Node.js arbitrary error throwing\nthrow new Error('Database connection failed: ' + err.message);",
    "why": "Separate library errors (predictable contracts) from application errors (rich diagnostics and context).",
    "code": "#[derive(Debug)]\nenum DatabaseError {\n    NotFound,\n    ConnectionLost(String),\n}\n\nimpl std::fmt::Display for DatabaseError {\n    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {\n        match self {\n            Self::NotFound => write!(f, \"Record was not found\"),\n            Self::ConnectionLost(msg) => write!(f, \"Database lost connection: {}\", msg),\n        }\n    }\n}\nimpl std::error::Error for DatabaseError {}\n\nfn query() -> Result<(), DatabaseError> {\n    Err(DatabaseError::ConnectionLost(\"Connection timeout after 30s\".into()))\n}\n\nfn main() {\n    if let Err(e) = query() {\n        println!(\"Domain error handled: {}\", e);\n    }\n}"
  },
  "channels_sync": {
    "num": "25",
    "part": "Part 5: Async & Tokio",
    "title": "Channels: mpsc, broadcast, watch & oneshot",
    "desc": "Node.js uses `EventEmitter` with event callbacks. Rust uses strongly typed channels: `oneshot` (single message), `mpsc` (many producers, one consumer), `broadcast` (pub/sub), and `watch` (state changes).",
    "nodeCode": "import { EventEmitter } from 'node:events';\n\nconst emitter = new EventEmitter();\nemitter.on('data', (chunk) => console.log(chunk));\nemitter.emit('data', 'hello');",
    "why": "Channels provide thread-safe communication and backpressure without shared memory locks.",
    "code": "use std::sync::mpsc;\n\nfn main() {\n    // MPSC: Multi-producer, single-consumer channel\n    let (tx, rx) = mpsc::channel();\n    let tx_clone = tx.clone();\n\n    tx.send(\"Message from worker 1\").unwrap();\n    tx_clone.send(\"Message from worker 2\").unwrap();\n    drop(tx);\n    drop(tx_clone);\n\n    for msg in rx {\n        println!(\"Received on channel: {}\", msg);\n    }\n}"
  },
  "graceful_shutdown": {
    "num": "26",
    "part": "Part 5: Async & Tokio",
    "title": "Graceful Shutdown & OS Signal Handling",
    "desc": "In Node.js, `process.on('SIGTERM')` handles shutdown. In Rust, Axum and Tokio provide `.with_graceful_shutdown()` to drain in-flight HTTP requests, commit transactions, and close sockets cleanly.",
    "nodeCode": "import http from 'node:http';\nconst server = http.createServer();\n\n// Node.js SIGTERM graceful shutdown with idle keep-alive socket closing\nprocess.on('SIGTERM', () => {\n  server.close(() => process.exit(0));\n  if (typeof server.closeIdleConnections === 'function') {\n    server.closeIdleConnections();\n  }\n});",
    "why": "Graceful shutdown drains in-flight requests during zero-downtime rolling Kubernetes deployments.",
    "code": "use std::sync::atomic::{AtomicBool, Ordering};\nuse std::sync::Arc;\n\nstruct Server {\n    is_running: Arc<AtomicBool>,\n}\n\nimpl Server {\n    fn shutdown(&self) {\n        println!(\"Received SIGTERM: Draining in-flight requests...\");\n        self.is_running.store(false, Ordering::SeqCst);\n        println!(\"All connections drained. Server terminated cleanly.\");\n    }\n}\n\nfn main() {\n    let server = Server { is_running: Arc::new(AtomicBool::new(true)) };\n    println!(\"Server running on :8080\");\n    server.shutdown();\n}"
  },
  "simd_optimization": {
    "num": "27",
    "part": "Part 6: Systems Internals",
    "title": "SIMD Vectorization & Zero-Cost Abstractions",
    "desc": "Node.js relies on V8 JIT compiler optimizations. Rust compiles directly via LLVM to machine code, taking full advantage of auto-vectorization and AVX-512 SIMD instructions to process multiple numbers per CPU cycle.",
    "nodeCode": "// JS loop relies on V8 JIT Turbofan / Maglev vectorization\nconst typed = new Uint32Array(1000).fill(1);\nlet total = 0;\nfor (let i = 0; i < typed.length; i++) {\n  total += typed[i];\n}\nconsole.log({ total });",
    "why": "Auto-vectorization executes arithmetic across 4 to 16 data points simultaneously in hardware vector registers.",
    "code": "fn sum_slice(slice: &[u32]) -> u32 {\n    // LLVM recognizes this pattern and emits SIMD vector instructions\n    slice.iter().sum()\n}\n\nfn main() {\n    let numbers: Vec<u32> = (1..=1000).collect();\n    let total = sum_slice(&numbers);\n    println!(\"Total calculated with SIMD: {}\", total);\n}"
  },
  "napi_rs": {
    "num": "28",
    "part": "Part 6: Systems Internals",
    "title": "NAPI-RS: Accelerating Node.js with Rust",
    "desc": "Instead of rewriting your entire Node.js backend, you can write performance-critical modules in Rust and compile them directly to native Node.js addons using `napi-rs` with zero V8 GC overhead.",
    "nodeCode": "// Native ESM import of NAPI-RS compiled addon\nimport { calculateHash } from './index.node';\n\nconst payload = Buffer.from('high-throughput payload');\nconst rustHash = calculateHash(payload);\nconsole.log({ rustHash });",
    "why": "Native addons execute at C speed directly within Node.js processes, offloading CPU-intensive tasks from the V8 event loop.",
    "code": "// Conceptual NAPI-RS export pattern in Rust\nfn fast_fibonacci(n: u32) -> u64 {\n    match n {\n        0 => 0,\n        1 => 1,\n        _ => {\n            let mut a = 0;\n            let mut b = 1;\n            for _ in 2..=n {\n                let temp = a + b;\n                a = b;\n                b = temp;\n            }\n            b\n        }\n    }\n}\n\nfn main() {\n    let result = fast_fibonacci(40);\n    println!(\"Fibonacci(40) computed in sub-microsecond: {}\", result);\n}"
  },
  "unsafe_rust": {
    "num": "29",
    "part": "Part 6: Systems Internals",
    "title": "Unsafe Rust: When & How to Use It",
    "desc": "By default, Rust guarantees memory safety. The `unsafe` keyword does not turn off the borrow checker; it enables five specific superpowers: dereferencing raw pointers, calling FFI, mutating statics, and implementing unsafe traits.",
    "nodeCode": "import { Buffer } from 'node:buffer';\n\n// Buffer.allocUnsafe skips zeroing memory (risks leaking uninitialized RAM if not zeroed)\nconst uninit = Buffer.allocUnsafe(100);\nuninit.fill(0); // Zero memory to prevent security leaks",
    "why": "Unsafe allows writing operating system drivers, lock-free data structures, and hardware interactions with strict isolation.",
    "code": "fn main() {\n    let mut num = 42;\n\n    // Creating raw pointers is safe\n    let r1 = &num as *const i32;\n    let r2 = &mut num as *mut i32;\n\n    // Dereferencing raw pointers requires unsafe block\n    unsafe {\n        println!(\"Raw pointer read: {}\", *r1);\n        *r2 = 99;\n        println!(\"Mutated via raw pointer: {}\", *r2);\n    }\n}"
  },
  "foreign_function_interface": {
    "num": "30",
    "part": "Part 6: Systems Internals",
    "title": "FFI: Calling C Libraries from Rust",
    "desc": "Node.js uses node-gyp or modern koffi. Rust natively supports C ABI calls using `extern \"C\"`, allowing seamless integration with system libraries like libssl, SQLite, or hardware SDKs.",
    "nodeCode": "// Cross-platform Node.js FFI using koffi\nimport koffi from 'koffi';\n\nconst libPath = process.platform === 'darwin' ? 'libSystem.B.dylib' : process.platform === 'win32' ? 'msvcrt.dll' : 'libc.so.6';\nconst libc = koffi.load(libPath);\nconst puts = libc.func('int puts(const char *str)');\nputs('Hello from native C via Node.js!');",
    "why": "Rust links directly to C static and dynamic libraries with zero wrapper performance penalty.",
    "code": "use std::ffi::CString;\nuse std::os::raw::c_char;\n\n// Direct C ABI foreign function declaration\nextern \"C\" {\n    fn puts(s: *const c_char) -> i32;\n}\n\n#[repr(C)]\nstruct Point {\n    x: f64,\n    y: f64,\n}\n\nfn main() {\n    let pt = Point { x: 3.0, y: 4.0 };\n    println!(\"Point coordinate struct [repr(C)]: ({}, {})\", pt.x, pt.y);\n\n    let msg = CString::new(\"--> Executed foreign C ABI libc::puts directly from Rust!\").unwrap();\n    unsafe {\n        puts(msg.as_ptr());\n    }\n}"
  },
  "custom_allocators": {
    "num": "31",
    "part": "Part 6: Systems Internals",
    "title": "Custom Allocators: jemalloc & mimalloc",
    "desc": "V8 handles heap allocations using its internal garbage-collected heap. Rust defaults to the system allocator (glibc malloc), but switching to `jemalloc` or `mimalloc` dramatically improves multi-threaded throughput and prevents memory fragmentation.",
    "nodeCode": "// In Node.js, V8 heap vs ArrayBuffer external memory\nimport v8 from 'node:v8';\n\nconst heapStats = v8.getHeapStatistics();\nconsole.log({ heapLimitMB: heapStats.heap_size_limit / 1024 / 1024 });\nconsole.log('External / ArrayBuffer usage:', process.memoryUsage().external);",
    "why": "jemalloc reduces lock contention on multi-core servers, preventing performance degradation under heavy concurrency.",
    "code": "// Rust allows declaring a global allocator with a single line:\n// #[global_allocator]\n// static GLOBAL: tikv_jemallocator::Jemalloc = tikv_jemallocator::Jemalloc;\n\nfn main() {\n    // Demonstration of high-frequency allocations\n    let mut data = Vec::new();\n    for i in 0..10_000 {\n        data.push(i);\n    }\n    println!(\"Allocated {} items with allocator\", data.len());\n}"
  },
  "atomics_memory_ordering": {
    "num": "32",
    "part": "Part 6: Systems Internals",
    "title": "Atomics & Hardware Memory Ordering",
    "desc": "Node.js has `Atomics` for SharedArrayBuffer across worker threads. Rust provides full hardware atomic primitives (`AtomicBool`, `AtomicUsize`) with precise memory orderings (Relaxed, Acquire, Release, SeqCst).",
    "nodeCode": "// SharedArrayBuffer and sequential consistency across Worker threads in Node.js\nconst sab = new SharedArrayBuffer(1024);\nconst i32 = new Int32Array(sab);\n\nAtomics.store(i32, 0, 42); // Sequentially consistent store\nAtomics.add(i32, 0, 1);\nconsole.log('Atomic load:', Atomics.load(i32, 0));",
    "why": "Atomic operations execute directly in CPU hardware without requiring operating system mutex locks.",
    "code": "use std::sync::atomic::{AtomicUsize, Ordering};\n\nfn main() {\n    let counter = AtomicUsize::new(0);\n\n    // Atomic fetch_add returns previous value\n    let prev = counter.fetch_add(1, Ordering::SeqCst);\n    println!(\"Previous: {}, Current: {}\", prev, counter.load(Ordering::SeqCst));\n\n    // Compare and swap (CAS) loop\n    let success = counter.compare_exchange(1, 10, Ordering::SeqCst, Ordering::Relaxed);\n    println!(\"CAS Result: {:?}, New value: {}\", success, counter.load(Ordering::SeqCst));\n}"
  },
  "procedural_macros": {
    "num": "33",
    "part": "Part 6: Systems Internals",
    "title": "Macros: Declarative vs Procedural Macros",
    "desc": "JavaScript uses Babel plugins or TypeScript decorators for meta-programming. Rust provides declarative macros (`macro_rules!`) and procedural macros (derive, attribute, function-like) that manipulate Rust AST tokens at compile time.",
    "nodeCode": "import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';\n\n// TypeScript Decorator (requires experimentalDecorators: true)\n@Entity()\nexport class User {\n  @PrimaryGeneratedColumn()\n  id!: number;\n\n  @Column()\n  name!: string;\n}",
    "why": "Rust macros run strictly at compile time with zero runtime reflection overhead.",
    "code": "// Declarative macro for calculating operations\nmacro_rules! calculate {\n    (add $a:expr, $b:expr) => {\n        $a + $b\n    };\n    (mul $a:expr, $b:expr) => {\n        $a * $b\n    };\n}\n\nfn main() {\n    let sum = calculate!(add 10, 20);\n    let product = calculate!(mul 5, 4);\n    println!(\"Macro results: sum={}, product={}\", sum, product);\n}"
  },
  "const_eval": {
    "num": "34",
    "part": "Part 6: Systems Internals",
    "title": "Compile-Time Computation with const fn",
    "desc": "JavaScript evaluates code dynamically at runtime. Rust allows running pure functions at compile time using `const fn`, pre-computing lookups, hashes, and lookup tables into the static binary.",
    "nodeCode": "// JS constants are evaluated at runtime initialization\nconst SQUARES = [0, 1, 4, 9, 16];",
    "why": "Pre-computing data at compile time turns expensive runtime algorithms into instant static table lookups.",
    "code": "const fn precompute_factorial(n: u64) -> u64 {\n    let mut result = 1;\n    let mut i = 1;\n    while i <= n {\n        result *= i;\n        i += 1;\n    }\n    result\n}\n\n// Evaluated by rustc during compilation!\nconst FACTORIAL_10: u64 = precompute_factorial(10);\n\nfn main() {\n    println!(\"Factorial of 10 computed at compile-time: {}\", FACTORIAL_10);\n}"
  },
  "philo_fearless_concurrency": {
    "num": "P1",
    "part": "Part 7: Rust Philosophy",
    "title": "Fearless Concurrency & Send / Sync",
    "desc": "Node.js avoided concurrency bugs by keeping everything single-threaded. Rust allows multi-threaded concurrency with zero data races: the compiler verifies thread safety through the `Send` and `Sync` auto-traits.",
    "nodeCode": "// Node.js is single-threaded to avoid multi-thread concurrency bugs\nsetTimeout(() => console.log('async task'), 0);",
    "why": "Send and Sync make multi-threaded concurrency safe: if data cannot be safely shared across threads, it will not compile.",
    "code": "use std::thread;\n\nfn main() {\n    let data = vec![1, 2, 3, 4, 5];\n\n    // `move` transfers ownership of `data` into the thread safely\n    let handle = thread::spawn(move || {\n        let sum: i32 = data.iter().sum();\n        println!(\"Sum computed on background OS thread: {}\", sum);\n    });\n\n    handle.join().unwrap();\n}"
  },
  "philo_raii_drop": {
    "num": "P2",
    "part": "Part 7: Rust Philosophy",
    "title": "RAII & Deterministic Resource Management",
    "desc": "JavaScript relies on garbage collection: you never know when memory will be reclaimed. Rust uses RAII (Resource Acquisition Is Initialization): when a variable goes out of scope, its `Drop` implementation executes immediately.",
    "nodeCode": "import fs from 'node:fs';\n\n// Node.js has no deterministic destructor\nconst fd = fs.openSync('file.txt', 'r'); // Must manually close or leak handle!\nfs.closeSync(fd);",
    "why": "Deterministic cleanup eliminates resource leaks: file handles, network sockets, and database transactions close automatically.",
    "code": "struct FileHandle {\n    name: String,\n}\n\nimpl Drop for FileHandle {\n    fn drop(&mut self) {\n        println!(\"--> [RAII Drop]: File handle '{}' closed and flushed to disk.\", self.name);\n    }\n}\n\nfn main() {\n    println!(\"Opening resource in inner scope...\");\n    {\n        let _file = FileHandle { name: \"access.log\".to_string() };\n        println!(\"Using file inside scope...\");\n    } // Drop runs automatically right here!\n    println!(\"Scope closed.\");\n}"
  },
  "philo_zero_cost": {
    "num": "P3",
    "part": "Part 7: Rust Philosophy",
    "title": "The Zero-Cost Abstraction Principle",
    "desc": "Bjarne Stroustrup defined zero-cost abstractions: what you don't use, you don't pay for; what you do use, you couldn't hand code any better. Rust applies this to iterators, generics, closures, and futures.",
    "nodeCode": "// High-level abstractions in JS (arrays, classes) have runtime GC overhead\n[1, 2, 3].map(x => x * 2);",
    "why": "Write expressive, high-level code without sacrificing bare-metal systems execution speed.",
    "code": "fn main() {\n    let arr = [10, 20, 30, 40, 50];\n\n    // High level iterator abstraction compiles into direct pointer arithmetic\n    let doubled: Vec<i32> = arr.iter().map(|&x| x * 2).collect();\n    println!(\"Doubled: {:?}\", doubled);\n}"
  },
  "philo_type_driven": {
    "num": "P4",
    "part": "Part 7: Rust Philosophy",
    "title": "Make Illegal States Unrepresentable",
    "desc": "In JavaScript, objects can be in invalid partial states (e.g., `{ connected: false, socketId: '123' }`). In Rust, use the type system and state-machine pattern to make illegal states impossible to construct.",
    "nodeCode": "// JS allows inconsistent states\nconst conn = { status: 'disconnected', socketId: 42 }; // Inconsistent!",
    "why": "Encode application invariants into the type system so errors are caught at compile time rather than via runtime checks.",
    "code": "// Typestate pattern: State is encoded in the type\nstruct Disconnected;\nstruct Connected { socket_id: u32 }\n\nstruct Connection<State> {\n    state: State,\n}\n\nimpl Connection<Disconnected> {\n    fn new() -> Self { Self { state: Disconnected } }\n    fn connect(self, socket_id: u32) -> Connection<Connected> {\n        Connection { state: Connected { socket_id } }\n    }\n}\n\nimpl Connection<Connected> {\n    fn send_data(&self, msg: &str) {\n        println!(\"Sending '{}' via socket {}\", msg, self.state.socket_id);\n    }\n}\n\nfn main() {\n    let conn = Connection::new();\n    // conn.send_data(\"hello\"); // COMPILE ERROR! Method does not exist for Disconnected state\n    let active_conn = conn.connect(9001);\n    active_conn.send_data(\"Ready for traffic\");\n}"
  },
  "philo_explicit_over_implicit": {
    "num": "P5",
    "part": "Part 7: Rust Philosophy",
    "title": "Explicit Over Implicit",
    "desc": "JavaScript features implicit type coercion (`'5' + 5 = '55'`) and hidden global scopes. Rust requires explicit conversions (`as`, `From`/`Into`), explicit borrows (`&`), and explicit error returns (`?`).",
    "nodeCode": "// Implicit JS coercion surprises\nconsole.log([] + []); // ''\nconsole.log([] + {}); // '[object Object]'",
    "why": "Code is read far more often than written: explicitness prevents subtle bugs in high-scale production systems.",
    "code": "fn main() {\n    let int_val: i32 = 42;\n    // Rust will NEVER implicitly convert i32 to f64\n    let float_val: f64 = int_val as f64 + 0.5;\n    println!(\"Explicitly converted float: {}\", float_val);\n\n    let s = String::from(\"explicit\");\n    // Explicit borrow with &\n    let len = s.len();\n    println!(\"String '{}' has length {}\", s, len);\n}"
  },
  "lc_two_sum": {
    "num": "LC1",
    "part": "Part 8: LeetCode in Rust",
    "title": "Two Sum (#1) — Zero-Allocation Map",
    "desc": "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to target. Solved in Rust using `HashMap` in O(n) time.",
    "nodeCode": "// TypeScript Two Sum\nfunction twoSum(nums: number[], target: number): number[] {\n  const map = new Map<number, number>();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) return [map.get(complement)!, i];\n    map.set(nums[i], i);\n  }\n  return [];\n}",
    "why": "Solve in O(n) time using HashMap lookup with explicit 0-based vector index returns.",
    "code": "use std::collections::HashMap;\n\nfn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {\n    let mut map: HashMap<i32, usize> = HashMap::with_capacity(nums.len());\n\n    for (i, &num) in nums.iter().enumerate() {\n        let complement = target - num;\n        if let Some(&prev_idx) = map.get(&complement) {\n            return vec![prev_idx as i32, i as i32];\n        }\n        map.insert(num, i);\n    }\n    vec![]\n}\n\nfn main() {\n    let nums = vec![2, 7, 11, 15];\n    let target = 9;\n    let result = two_sum(nums, target);\n    println!(\"Two Sum indices: {:?}\", result);\n}"
  },
  "lc_valid_parentheses": {
    "num": "LC20",
    "part": "Part 8: LeetCode in Rust",
    "title": "Valid Parentheses (#20) — Vector Stack",
    "desc": "Given a string `s` containing '(', ')', '{', '}', '[' and ']', determine if the input string is valid. Solved using `Vec<char>` as a fast LIFO stack.",
    "nodeCode": "// TypeScript Valid Parentheses\nfunction isValid(s: string): boolean {\n  const stack: string[] = [];\n  for (const c of s) {\n    if (c === '(') stack.push(')');\n    else if (c === '{') stack.push('}');\n    else if (c === '[') stack.push(']');\n    else if (stack.pop() !== c) return false;\n  }\n  return stack.length === 0;\n}",
    "why": "Rust's Vec functions as a cache-efficient LIFO stack with O(1) push and pop.",
    "code": "fn is_valid(s: &str) -> bool {\n    let mut stack = Vec::new();\n\n    for ch in s.chars() {\n        match ch {\n            '(' => stack.push(')'),\n            '{' => stack.push('}'),\n            '[' => stack.push(']'),\n            ')' | '}' | ']' => {\n                if stack.pop() != Some(ch) {\n                    return false;\n                }\n            }\n            _ => {}\n        }\n    }\n    stack.is_empty()\n}\n\nfn main() {\n    println!(\"'()[]{{}}' valid? {}\", is_valid(\"()[]{}\"));\n    println!(\"'(]' valid?     {}\", is_valid(\"(]\"));\n}"
  },
  "lc_merge_lists": {
    "num": "LC21",
    "part": "Part 8: LeetCode in Rust",
    "title": "Merge Two Sorted Lists (#21)",
    "desc": "Merge two sorted linked lists and return it as a sorted list. In Rust, recursive or loop-based pointer manipulation is solved cleanly with Option and pattern matching.",
    "nodeCode": "interface ListNode { val: number; next: ListNode | null; }\n\n// TypeScript Merge Lists\nfunction mergeTwoLists(l1: ListNode | null, l2: ListNode | null): ListNode | null {\n  if (!l1) return l2;\n  if (!l2) return l1;\n  if (l1.val < l2.val) { l1.next = mergeTwoLists(l1.next, l2); return l1; }\n  l2.next = mergeTwoLists(l1, l2.next); return l2;\n}",
    "why": "Demonstrates recursive pattern matching over optional node links.",
    "code": "#[derive(Debug, PartialEq, Eq)]\nstruct ListNode {\n    val: i32,\n    next: Option<Box<ListNode>>,\n}\n\nfn merge_two_lists(mut l1: Option<Box<ListNode>>, mut l2: Option<Box<ListNode>>) -> Option<Box<ListNode>> {\n    let mut dummy = ListNode { val: 0, next: None };\n    let mut tail = &mut dummy.next;\n\n    while l1.is_some() && l2.is_some() {\n        if l1.as_ref().unwrap().val <= l2.as_ref().unwrap().val {\n            let next = l1.as_mut().unwrap().next.take();\n            *tail = l1;\n            l1 = next;\n        } else {\n            let next = l2.as_mut().unwrap().next.take();\n            *tail = l2;\n            l2 = next;\n        }\n        tail = &mut tail.as_mut().unwrap().next;\n    }\n    *tail = l1.or(l2);\n    dummy.next\n}\n\nfn main() {\n    let l1 = Some(Box::new(ListNode { val: 1, next: Some(Box::new(ListNode { val: 4, next: None })) }));\n    let l2 = Some(Box::new(ListNode { val: 2, next: Some(Box::new(ListNode { val: 3, next: None })) }));\n    let merged = merge_two_lists(l1, l2);\n    println!(\"Merged ListNode linked lists: {:?}\", merged);\n}"
  },
  "lc_buy_sell_stock": {
    "num": "LC121",
    "part": "Part 8: LeetCode in Rust",
    "title": "Best Time to Buy & Sell Stock (#121)",
    "desc": "Find maximum profit from buying and selling a stock once. Single-pass greedy algorithm tracking minimum price seen so far in O(n) time and O(1) space.",
    "nodeCode": "// TypeScript Stock Profit\nfunction maxProfit(prices: number[]): number {\n  let minPrice = Infinity, maxProfit = 0;\n  for (const p of prices) {\n    minPrice = Math.min(minPrice, p);\n    maxProfit = Math.max(maxProfit, p - minPrice);\n  }\n  return maxProfit;\n}",
    "why": "Single-pass greedy algorithm with zero heap allocations and branch optimization.",
    "code": "fn max_profit(prices: Vec<i32>) -> i32 {\n    let mut min_price = i32::MAX;\n    let mut max_profit = 0;\n\n    for price in prices {\n        if price < min_price {\n            min_price = price;\n        } else if price - min_price > max_profit {\n            max_profit = price - min_price;\n        }\n    }\n    max_profit\n}\n\nfn main() {\n    let prices = vec![7, 1, 5, 3, 6, 4];\n    println!(\"Max profit: {}\", max_profit(prices));\n}"
  },
  "lc_valid_palindrome": {
    "num": "LC125",
    "part": "Part 8: LeetCode in Rust",
    "title": "Valid Palindrome (#125) — Two Pointers",
    "desc": "Verify if a string is a palindrome considering only alphanumeric characters and ignoring case. Solved in Rust using two pointers over an iterator with zero heap allocations.",
    "nodeCode": "// TypeScript Valid Palindrome\nfunction isPalindrome(s: string): boolean {\n  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');\n  return clean === clean.split('').reverse().join('');\n}",
    "why": "Two-pointer in-place traversal avoids allocating new filtered strings.",
    "code": "fn is_palindrome(s: &str) -> bool {\n    let chars: Vec<char> = s.chars()\n        .filter(|c| c.is_alphanumeric())\n        .map(|c| c.to_ascii_lowercase())\n        .collect();\n    if chars.is_empty() {\n        return true;\n    }\n    let mut left = 0;\n    let mut right = chars.len() - 1;\n    while left < right {\n        if chars[left] != chars[right] {\n            return false;\n        }\n        left += 1;\n        right -= 1;\n    }\n    true\n}\n\nfn main() {\n    println!(\"'A man, a plan, a canal: Panama' is palindrome? {}\", is_palindrome(\"A man, a plan, a canal: Panama\"));\n    println!(\"'race a car' is palindrome? {}\", is_palindrome(\"race a car\"));\n}"
  },
  "lc_reverse_linked_list": {
    "num": "LC206",
    "part": "Part 8: LeetCode in Rust",
    "title": "Reverse Linked List (#206) — Ownership Transfer",
    "desc": "Reverse a singly linked list. In Rust, pointer reversal requires carefully moving node ownership between `prev` and `curr` without triggering use-after-move compiler errors.",
    "nodeCode": "interface ListNode { val: number; next: ListNode | null; }\n\nfunction reverseList(head: ListNode | null): ListNode | null {\n  let prev: ListNode | null = null;\n  let curr = head;\n  while (curr) {\n    const next = curr.next;\n    curr.next = prev;\n    prev = curr;\n    curr = next;\n  }\n  return prev;\n}",
    "why": "Mastering ownership transfer between pointers is the ultimate rite of passage for Rust developers.",
    "code": "#[derive(Debug)]\nstruct Node {\n    val: i32,\n    next: Option<Box<Node>>,\n}\n\nfn reverse_list(mut head: Option<Box<Node>>) -> Option<Box<Node>> {\n    let mut prev = None;\n    while let Some(mut current) = head {\n        head = current.next.take(); // Detach next link safely\n        current.next = prev;\n        prev = Some(current);\n    }\n    prev\n}\n\nfn main() {\n    let list = Some(Box::new(Node {\n        val: 1,\n        next: Some(Box::new(Node {\n            val: 2,\n            next: Some(Box::new(Node { val: 3, next: None })),\n        })),\n    }));\n\n    let reversed = reverse_list(list);\n    println!(\"Reversed list: {:?}\", reversed);\n}"
  },
  "lc_max_subarray": {
    "num": "LC53",
    "part": "Part 8: LeetCode in Rust",
    "title": "Maximum Subarray (#53) — Kadane's Algorithm",
    "desc": "Given an integer array `nums`, find the subarray with the largest sum and return its sum. Kadane's dynamic programming algorithm executes in O(n) time and O(1) space.",
    "nodeCode": "// TypeScript Kadane's Algorithm\nfunction maxSubArray(nums: number[]): number {\n  let maxSoFar = nums[0], currMax = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    currMax = Math.max(nums[i], currMax + nums[i]);\n    maxSoFar = Math.max(maxSoFar, currMax);\n  }\n  return maxSoFar;\n}",
    "why": "Kadane's algorithm executes in a single pass with O(1) auxiliary space.",
    "code": "use std::cmp::max;\n\nfn max_sub_array(nums: Vec<i32>) -> i32 {\n    if nums.is_empty() {\n        return 0;\n    }\n    let mut max_so_far = nums[0];\n    let mut current_max = nums[0];\n\n    for &num in nums.iter().skip(1) {\n        current_max = max(num, current_max + num);\n        max_so_far = max(max_so_far, current_max);\n    }\n\n    max_so_far\n}\n\nfn main() {\n    let nums = vec![-2, 1, -3, 4, -1, 2, 1, -5, 4];\n    println!(\"Maximum subarray sum: {}\", max_sub_array(nums));\n}"
  }
};