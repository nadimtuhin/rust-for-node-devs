import json

chapters = {}
chapter_insights = {}

def add_chapter(key, num, part, title, desc, node_code, why, rust_code, insight):
    chapters[key] = {
        "num": num,
        "part": part,
        "title": title,
        "desc": desc,
        "nodeCode": node_code,
        "why": why,
        "code": rust_code
    }
    chapter_insights[key] = insight

# ========================================================
# PART 0: LANGUAGE BASICS (B1 - B10)
# ========================================================
add_chapter(
    "basic_vars", "B1", "Part 0: Language Basics",
    "Variables, Immutability & let mut",
    "In JS, variables declared with let are mutable. In Rust, all variables are immutable by default! You must explicitly opt into mutability with `let mut`. Rust also features compile-time type inference and variable shadowing.",
    "// Node.js let variables mutate at runtime\nlet count = 10;\ncount += 5;\nconsole.log({ count });",
    "Immutability by default eliminates entire categories of concurrency race conditions before compilation.",
    """fn main() {
    let service_name = "AuthWorker";
    println!("Service: {}", service_name);

    let mut request_count = 0;
    request_count += 1;
    request_count += 5;
    println!("Requests processed: {}", request_count);

    // Variable Shadowing (re-declaring with same name, can change type)
    let raw_port = "8080";
    let raw_port: u16 = raw_port.parse().expect("Invalid port");
    println!("Parsed port: {}", raw_port);
}""",
    {
        "proTip": "Use variable shadowing instead of dummy temporary variables like port_str and port_int.",
        "footgun": "Forgetting `mut` causes compile error E0384: cannot assign twice to immutable variable.",
        "archNote": "Rust immutability is fundamental to thread safety: multiple threads can read immutable data simultaneously without locks."
    }
)

add_chapter(
    "basic_ownership", "B2", "Part 0: Language Basics",
    "Ownership & Move Semantics",
    "In JavaScript, objects live in the V8 heap and are managed by garbage collection. In Rust, every value has a single owner. When passing a heap value or reassigning, ownership moves. The original variable becomes invalid!",
    "// Node.js objects have shared reference semantics\nconst user = { name: 'Alice' };\nconst alias = user;\nalias.name = 'Bob'; // Mutates original user!",
    "Single ownership eliminates both manual free() memory leaks and Garbage Collection pause latency.",
    """fn main() {
    let s1 = String::from("hello node devs");
    // Ownership moves from s1 to s2
    let s2 = s1;
    // println!("{}", s1); // Compile error! s1 was moved.
    println!("s2 owns the string: {}", s2);

    // Explicit clone creates a true duplicate heap allocation
    let s3 = s2.clone();
    println!("Cloned: s2='{}', s3='{}'", s2, s3);
}""",
    {
        "proTip": "Primitives implementing Copy (integers, booleans, floats) copy automatically on the stack instead of moving.",
        "footgun": "Calling .clone() everywhere silences the borrow checker but reintroduces allocation overhead. Use references (&) instead.",
        "archNote": "Rust uses RAII: heap resources are automatically freed when their owner goes out of scope, guaranteeing deterministic deallocation."
    }
)

add_chapter(
    "basic_borrowing", "B3", "Part 0: Language Basics",
    "Borrowing & References (&T vs &mut T)",
    "Instead of transferring ownership, you can borrow access. Rust enforces the core law: you can have either any number of immutable references (&T) OR exactly one mutable reference (&mut T), never both simultaneously!",
    "// Node.js allows unlimited shared mutable references\nconst cache = new Map();\nfunction a(c) { c.set('k', 1); }\nfunction b(c) { c.set('k', 2); }\na(cache); b(cache);",
    "Aliasing XOR Mutability makes data races impossible at compile time without needing locks for read-only access.",
    """fn calculate_len(s: &String) -> usize {
    s.len()
}

fn append_suffix(s: &mut String) {
    s.push_str(" [PROCESSED]");
}

fn main() {
    let mut message = String::from("Node.js to Rust");
    let len = calculate_len(&message);
    println!("Original length: {}", len);

    append_suffix(&mut message);
    println!("After mutation: {}", message);
}""",
    {
        "proTip": "Prefer string slice `&str` over `&String` in function parameters for maximum caller flexibility.",
        "footgun": "Attempting to create `&mut` while an active `&` reference exists causes error E0502.",
        "archNote": "Non-Lexical Lifetimes (NLL) allows borrows to end at their last point of usage rather than the closing curly brace."
    }
)

add_chapter(
    "basic_structs", "B4", "Part 0: Language Basics",
    "Structs, impl Blocks & Methods",
    "JavaScript uses ES6 class with prototype inheritance. Rust has no classes. State is defined with struct, and methods are implemented in separate impl blocks with &self or &mut self receivers.",
    "// Node.js Class\nclass HttpServer {\n  constructor(host, port) {\n    this.host = host;\n    this.port = port;\n  }\n  addr() { return `${this.host}:${this.port}`; }\n}",
    "Separating data layout from logic keeps memory contiguous and eliminates prototype chain lookups.",
    """#[derive(Debug)]
struct HttpServer {
    host: String,
    port: u16,
    connections: u32,
}

impl HttpServer {
    fn new(host: &str, port: u16) -> Self {
        Self { host: host.to_string(), port, connections: 0 }
    }

    fn address(&self) -> String {
        format!("{}:{}", self.host, self.port)
    }

    fn register_conn(&mut self) {
        self.connections += 1;
    }
}

fn main() {
    let mut server = HttpServer::new("127.0.0.1", 8080);
    println!("Listening on: {}", server.address());
    server.register_conn();
    println!("Status: {:?}", server);
}""",
    {
        "proTip": "Use #[derive(Debug, Clone, PartialEq)] on structs for automatic standard utility implementations.",
        "footgun": "Forgetting &self turns a method into an associated static function that cannot be called with dot syntax.",
        "archNote": "Rust structs have zero memory overhead: a struct with two u32 fields takes exactly 8 bytes of memory."
    }
)

add_chapter(
    "basic_enums", "B5", "Part 0: Language Basics",
    "Algebraic Enums & Pattern Matching",
    "TypeScript enums are numbers or strings. Rust Enums are full Algebraic Data Types where each variant can hold different payloads. Combined with exhaustive match, they replace polymorphic class hierarchies.",
    "// TypeScript Discriminated Union\ntype Event = \n  | { type: 'connect', id: string }\n  | { type: 'data', bytes: number[] };",
    "Compiler-verified exhaustiveness guarantees no unhandled state transitions or missing cases.",
    """#[derive(Debug)]
enum NetworkEvent {
    Connected(String),
    DataReceived(Vec<u8>),
    Disconnected { code: u16, reason: String },
}

fn process_event(event: NetworkEvent) {
    match event {
        NetworkEvent::Connected(id) => println!("Connected: {}", id),
        NetworkEvent::DataReceived(bytes) => println!("Got {} bytes", bytes.len()),
        NetworkEvent::Disconnected { code, reason } => {
            println!("Disconnected: {} (code {})", reason, code);
        }
    }
}

fn main() {
    process_event(NetworkEvent::Connected("ws-101".to_string()));
    process_event(NetworkEvent::DataReceived(vec![1, 2, 3]));
    process_event(NetworkEvent::Disconnected { code: 1000, reason: "Normal".to_string() });
}""",
    {
        "proTip": "Use `if let NetworkEvent::Connected(id) = event` when you only need to match a single variant.",
        "footgun": "Overusing `_ => {}` wildcards defeats compiler exhaustiveness checks when adding new variants.",
        "archNote": "Rust enums are tagged unions in memory with a compact discriminant byte followed by aligned payload space."
    }
)

add_chapter(
    "basic_option", "B6", "Part 0: Language Basics",
    "Option<T> — Banishing null & undefined",
    "Rust has no null or undefined. Optional presence is explicitly wrapped in the Option<T> enum: Some(T) or None. You cannot access the inner value without unwrapping or matching.",
    "// Node.js null can crash at runtime\nfunction findUser(id) { return id === 1 ? { name: 'Alice' } : null; }\nconst user = findUser(2);\n// TypeError: Cannot read properties of null",
    "Option<T> makes null pointer exceptions impossible by enforcing compile-time handling of absence.",
    """fn find_user(id: u32) -> Option<String> {
    if id == 1 { Some("Alice".to_string()) } else { None }
}

fn main() {
    let user1 = find_user(1);
    let user2 = find_user(99);

    match user1 {
        Some(name) => println!("Found: {}", name),
        None => println!("Not found"),
    }

    let display = user2.unwrap_or_else(|| "Guest".to_string());
    println!("Fallback: {}", display);
}""",
    {
        "proTip": "Use .unwrap_or() or .unwrap_or_default() instead of .unwrap() in production.",
        "footgun": "Calling .unwrap() on None panics the program at runtime.",
        "archNote": "Null Pointer Optimization (NPO) ensures Option<&T> has identical size and performance to a raw C pointer."
    }
)

add_chapter(
    "basic_result", "B7", "Part 0: Language Basics",
    "Result<T, E> & the '?' Operator",
    "In Node.js, asynchronous errors reject promises or throw exceptions. Rust treats recoverable errors as regular values using Result<T, E>. The '?' operator provides ergonomic early-return propagation.",
    "// Node.js throw / try-catch\nfunction parsePort(raw) {\n  const p = parseInt(raw);\n  if (isNaN(p)) throw new Error('Invalid');\n  return p;\n}",
    "Result<T, E> forces explicit error handling at compile time without hidden runtime exception jumps.",
    """use std::num::ParseIntError;

fn parse_port(port_str: &str) -> Result<u16, ParseIntError> {
    let port: u16 = port_str.parse()?;
    Ok(port)
}

fn main() {
    match parse_port("8080") {
        Ok(p) => println!("Port configured: {}", p),
        Err(e) => eprintln!("Parse failed: {}", e),
    }

    if let Err(err) = parse_port("not_number") {
        println!("Expected failure handled: {}", err);
    }
}""",
    {
        "proTip": "Use `anyhow` for applications and `thiserror` for library domain errors in production.",
        "footgun": "The '?' operator only works in functions whose return type matches the Result/Option error signature.",
        "archNote": "Rust error handling has zero runtime stack-unwinding penalty during normal execution."
    }
)

add_chapter(
    "basic_traits", "B8", "Part 0: Language Basics",
    "Traits & Explicit Contracts",
    "TypeScript interfaces use duck typing (structural typing). Rust Traits define shared behavior that types must explicitly implement. Traits power polymorphism and generic bounds.",
    "// TypeScript structural typing\ninterface Printable { print(): void; }\nconst obj = { print() { console.log('hi'); } };",
    "Explicit trait implementation eliminates unintentional duck-typing collisions and enables zero-cost static dispatch.",
    """trait Summarizable {
    fn summarize(&self) -> String;
}

struct Article {
    title: String,
    author: String,
}

impl Summarizable for Article {
    fn summarize(&self) -> String {
        format!("'{}' by {}", self.title, self.author)
    }
}

fn display<T: Summarizable>(item: &T) {
    println!("Summary: {}", item.summarize());
}

fn main() {
    let art = Article { title: "Rust Guide".into(), author: "Nadim".into() };
    display(&art);
}""",
    {
        "proTip": "Traits can provide default method implementations for optional or utility behavior.",
        "footgun": "The Orphan Rule prevents implementing an external trait on an external type.",
        "archNote": "Static dispatch via `<T: Trait>` monomorphizes into direct function calls with zero vtable pointer overhead."
    }
)

add_chapter(
    "basic_generics", "B9", "Part 0: Language Basics",
    "Generics & Monomorphization",
    "TypeScript generics are erased during compilation to JavaScript. Rust generics are monomorphized: the compiler creates specialized machine code for every concrete type used with zero runtime penalty.",
    "// TypeScript generics erased at runtime\nfunction wrap<T>(val: T): { value: T } { return { value: val }; }",
    "Zero-cost abstractions: reuse generic code with the raw speed of hand-written specialized assembly.",
    """#[derive(Debug)]
struct ApiResponse<T> {
    status: u16,
    payload: T,
}

impl<T> ApiResponse<T> {
    fn ok(payload: T) -> Self {
        Self { status: 200, payload }
    }
}

fn main() {
    let int_resp = ApiResponse::ok(42);
    let str_resp = ApiResponse::ok(String::from("Healthy"));
    println!("{:?}\n{:?}", int_resp, str_resp);
}""",
    {
        "proTip": "Use `where` clauses when generic trait bounds become long and complex.",
        "footgun": "Extensive generic monomorphization can increase compilation time and binary size.",
        "archNote": "Because monomorphized types are known at compile time, LLVM can aggressively inline functions across boundaries."
    }
)

add_chapter(
    "basic_lifetimes", "B10", "Part 0: Language Basics",
    "Lifetimes Explained for JS Devs",
    "In Node.js, V8 keeps objects alive as long as references exist. In Rust, the borrow checker verifies at compile time that no reference ever outlives the data it points to! Lifetimes declare relationships to rustc.",
    "// JS closures retain references automatically\nfunction getGreeter() { const msg = 'hi'; return () => msg; }",
    "Lifetimes prevent dangling pointer bugs (use-after-free) at compile time without garbage collection.",
    """fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}

fn main() {
    let str1 = String::from("short");
    let str2 = String::from("longer string");
    let result = longest(str1.as_str(), str2.as_str());
    println!("Longest: {}", result);
}""",
    {
        "proTip": "Lifetime elision rules infer lifetimes automatically for most standard functions.",
        "footgun": "Trying to return a reference to a local variable created inside a function causes error E0515.",
        "archNote": "Lifetimes have zero runtime representation; they exist solely in the compiler and are erased before codegen."
    }
)

# ========================================================
# PART 1: AXUM & ASYNC WEB SERVICES (1 - 6)
# ========================================================
add_chapter(
    "axum_api", "1", "Part 1: Web APIs & Axum",
    "Express.js vs Axum Routing & Handlers",
    "Express uses callback middleware and mutable req/res objects. Axum leverages Tokio and type-safe extractors: handler parameters automatically deserialize JSON, headers, or state at compile time.",
    "// Express.js route\napp.get('/users/:id', (req, res) => {\n  res.json({ id: req.params.id, status: 'active' });\n});",
    "Type-safe extractors parse requests declaratively and fail invalid requests before handler execution.",
    """use std::collections::HashMap;

// Simulated Axum-style handler pattern for standalone playground
struct PathExtractor(u32);
struct JsonResponse { id: u32, status: &'static str }

fn user_handler(PathExtractor(id): PathExtractor) -> JsonResponse {
    JsonResponse { id, status: "active" }
}

fn main() {
    let req = PathExtractor(42);
    let resp = user_handler(req);
    println!("Status: 200 OK | Payload: {{ id: {}, status: '{}' }}", resp.id, resp.status);
}""",
    {
        "proTip": "In Axum, handlers return anything implementing `IntoResponse` (strings, tuples, Json<T>, Result).",
        "footgun": "Extractor order matters in Axum: body extractors must typically be the final argument.",
        "archNote": "Axum runs on Hyper and Tower, achieving over 150,000 req/sec on modest server hardware."
    }
)

add_chapter(
    "state_singleton", "2", "Part 1: Web APIs & Axum",
    "Shared State with Arc<T> vs Global Singletons",
    "Node.js shares module-level variables across all requests because of the single-threaded event loop. Rust web servers are multi-threaded: shared state requires thread-safe reference counting (`Arc<T>`).",
    "// Node.js module singleton\nlet dbConnection = null;\nexport function getDb() { if (!dbConnection) dbConnection = connect(); return dbConnection; }",
    "Arc<T> ensures safe thread-safe reference sharing without global mutable state corruption.",
    """use std::sync::Arc;
use std::sync::atomic::{AtomicUsize, Ordering};

struct AppState {
    request_counter: AtomicUsize,
    db_pool_name: String,
}

fn main() {
    // Wrap state in thread-safe reference counted pointer
    let shared_state = Arc::new(AppState {
        request_counter: AtomicUsize::new(0),
        db_pool_name: "PostgreSQL-Pool-1".to_string(),
    });

    // Clone pointer for another thread or request
    let worker_state = Arc::clone(&shared_state);
    worker_state.request_counter.fetch_add(1, Ordering::SeqCst);

    println!("Pool: {}", shared_state.db_pool_name);
    println!("Requests: {}", shared_state.request_counter.load(Ordering::SeqCst));
}""",
    {
        "proTip": "Use `Arc::clone(&state)` rather than `state.clone()` to make pointer cloning visually explicit.",
        "footgun": "Using standard `Rc<T>` across threads fails compilation because Rc does not implement Send.",
        "archNote": "Arc increments an atomic reference count on the heap. When the count hits zero, the memory is freed."
    }
)

add_chapter(
    "tower_middleware", "3", "Part 1: Web APIs & Axum",
    "Tower Middleware vs Express Middleware",
    "Express passes `(req, res, next)` through a chain of callbacks. Axum uses the Tower ecosystem, where middleware wraps asynchronous services adhering to `Service<Request>` contracts.",
    "// Express middleware\napp.use((req, res, next) => {\n  console.log(`${req.method} ${req.url}`);\n  next();\n});",
    "Tower middleware is composable across any network protocol (HTTP, gRPC, TCP) with compile-time type verification.",
    """// Demonstration of composable request pipeline
struct Request { method: &'static str, path: &'static str }
struct Response { status: u16 }

fn logging_middleware<F>(req: Request, next: F) -> Response
where
    F: FnOnce(Request) -> Response,
{
    println!("[LOG] Received {} {}", req.method, req.path);
    let res = next(req);
    println!("[LOG] Responded with status {}", res.status);
    res
}

fn main() {
    let req = Request { method: "GET", path: "/api/health" };
    let res = logging_middleware(req, |_| Response { status: 200 });
    println!("Pipeline finished: status {}", res.status);
}""",
    {
        "proTip": "Tower provides `tower_http::cors::CorsLayer` and `TraceLayer` out of the box.",
        "footgun": "Middleware state mutations in Rust require synchronization primitives rather than mutating req directly.",
        "archNote": "Tower's Service trait separates transport from business logic, making middleware universal across frameworks."
    }
)

add_chapter(
    "reqwest_client", "4", "Part 1: Web APIs & Axum",
    "HTTP Client: fetch / axios vs reqwest",
    "Node.js uses global `fetch()` or `axios`. In Rust, `reqwest` is the de-facto production HTTP client with built-in connection pooling, compression, JSON serialization, and streaming support.",
    "// Node.js fetch\nconst res = await fetch('https://api.github.com/zen');\nconst text = await res.text();\nconsole.log(text);",
    "Connection pooling is reused automatically across requests with static typing for incoming payloads.",
    """// Simulated HTTP client response parsing pattern
struct Client;
impl Client {
    fn get(&self, url: &str) -> Result<String, &'static str> {
        if url.is_empty() { return Err("Empty URL"); }
        Ok(format!("Mock response from {}", url))
    }
}

fn main() {
    let client = Client;
    match client.get("https://api.example.com/status") {
        Ok(body) => println!("Body: {}", body),
        Err(e) => eprintln!("HTTP Error: {}", e),
    }
}""",
    {
        "proTip": "Instantiate `reqwest::Client` once and reuse it across your application to leverage keep-alive connections.",
        "footgun": "Instantiating a new reqwest client per request leaks sockets and disables connection pooling.",
        "archNote": "Reqwest is built on Hyper and Rustls, providing modern TLS without depending on OpenSSL C libraries."
    }
)

add_chapter(
    "serde_json", "5", "Part 1: Web APIs & Axum",
    "JSON Parsing: JSON.parse() vs Serde",
    "In Node.js, `JSON.parse()` produces an untyped dynamic object that requires runtime validation (Zod). In Rust, Serde serializes and deserializes directly into strongly-typed structs with zero intermediate allocations.",
    "// Node.js JSON parsing with manual / Zod validation\nconst payload = JSON.parse('{\"id\":10,\"active\":true}');\nconsole.log(payload.id);",
    "Serde generates compile-time serialization code without runtime reflection, achieving multi-gigabyte/sec throughput.",
    """// Standalone representation of Serde struct mapping
#[derive(Debug)]
struct UserPayload {
    id: u64,
    username: String,
    is_active: bool,
}

impl UserPayload {
    fn mock_deserialize(id: u64, name: &str) -> Self {
        Self { id, username: name.to_string(), is_active: true }
    }
}

fn main() {
    let user = UserPayload::mock_deserialize(101, "nadimtuhin");
    println!("Deserialized struct: {:?}", user);
    println!("User {} is active: {}", user.username, user.is_active);
}""",
    {
        "proTip": "Use `#[serde(rename_all = \"camelCase\")]` to bridge JavaScript camelCase API conventions with Rust snake_case.",
        "footgun": "Missing fields in incoming JSON cause Serde deserialization errors unless marked with `Option<T>` or `#[serde(default)]`.",
        "archNote": "Serde's visitor model decodes tokens directly from byte streams without building a dynamic AST tree."
    }
)

add_chapter(
    "env_config", "6", "Part 1: Web APIs & Axum",
    "Environment Variables & Configuration",
    "Node.js reads `process.env.PORT` dynamically at runtime as strings. Rust loads and validates configuration during server boot using `dotenvy` and strongly-typed config structs.",
    "// Node.js dotenv\nrequire('dotenv').config();\nconst port = parseInt(process.env.PORT || '3000', 10);",
    "Validate environment variables at startup so bad configurations fail fast before serving traffic.",
    """use std::env;

struct AppConfig {
    port: u16,
    env: String,
}

impl AppConfig {
    fn load() -> Self {
        let port = env::var("APP_PORT")
            .ok()
            .and_then(|p| p.parse().ok())
            .unwrap_or(8080);
        let env = env::var("APP_ENV").unwrap_or_else(|_| "development".to_string());
        Self { port, env }
    }
}

fn main() {
    let config = AppConfig::load();
    println!("Booting in [{}] mode on port :{}", config.env, config.port);
}""",
    {
        "proTip": "Use crates like `config` or `envy` to deserialize environment variables directly into typed structs with Serde.",
        "footgun": "Reading `env::var()` inside request loops is slow because it performs system calls. Cache config in AppState.",
        "archNote": "Environment validation during main() guarantees all required secrets exist before starting listener sockets."
    }
)

# ========================================================
# PART 2: DATA STRUCTURES & COLLECTIONS (7 - 12)
# ========================================================
add_chapter(
    "vec_transform", "7", "Part 2: Collections & Data",
    "Array.map / filter / reduce vs Vec Iterators",
    "JavaScript arrays provide `.map()`, `.filter()`, and `.reduce()`. Rust vectors provide lazy `Iterator` chains that compile into zero-allocation SIMD vector loops.",
    "// JS Array transformations allocate new arrays at each step\nconst nums = [1, 2, 3, 4, 5];\nconst evensDoubled = nums.filter(n => n % 2 === 0).map(n => n * 2);",
    "Rust iterators are completely lazy: no intermediate heap allocations occur between filter and map operations.",
    """fn main() {
    let numbers = vec![1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    // Lazy iterator chain: zero intermediate allocations
    let evens_doubled: Vec<i32> = numbers
        .iter()
        .filter(|&&x| x % 2 == 0)
        .map(|&x| x * 2)
        .collect();

    println!("Doubled evens: {:?}", evens_doubled);

    // Sum reduction (fold / reduce)
    let sum: i32 = numbers.iter().sum();
    println!("Sum of all numbers: {}", sum);
}""",
    {
        "proTip": "Call `.collect::<Vec<_>>()` at the end of an iterator chain to evaluate and collect into a vector.",
        "footgun": "Iterators do nothing until consumed by `.collect()`, `.sum()`, `.count()`, or a `for` loop.",
        "archNote": "LLVM optimizes Rust iterator chains into single tightly unrolled assembly loops with vector registers."
    }
)

add_chapter(
    "hashmap_set", "8", "Part 2: Collections & Data",
    "Map & Set vs HashMap & HashSet",
    "JavaScript offers `new Map()` and `new Set()`. Rust provides `std::collections::HashMap` and `HashSet`. Rust allows custom hasher algorithms and in-place entry modifications.",
    "// JS Map operations\nconst counts = new Map();\ncounts.set('apple', (counts.get('apple') || 0) + 1);",
    "The Entry API provides safe, zero-lookup atomic updates without querying the key twice.",
    """use std::collections::HashMap;

fn main() {
    let mut word_counts: HashMap<&str, u32> = HashMap::new();

    let words = vec!["rust", "node", "rust", "axum", "node", "rust"];

    for word in words {
        // Entry API: inspect and update in a single lookup!
        *word_counts.entry(word).or_insert(0) += 1;
    }

    println!("Word counts: {:?}", word_counts);
    println!("Occurrences of 'rust': {:?}", word_counts.get("rust"));
}""",
    {
        "proTip": "Use `ahash` or `foldhash` instead of default SipHash for 2-3x faster hashing when DoS protection is not required.",
        "footgun": "Keys stored in HashMap must implement `Eq` and `Hash` traits (derive them with #[derive(Hash, PartialEq, Eq)]).",
        "archNote": "Standard library HashMap uses Google's SwissTable (HashBrown) algorithm for high-performance cache locality."
    }
)

add_chapter(
    "slices_strings", "9", "Part 2: Collections & Data",
    "String vs &str & Slices Explained",
    "In JavaScript, all strings are immutable UTF-16 primitives. In Rust, `String` is an owned, growable heap buffer, while `&str` is an immutable borrowed UTF-8 slice pointing to existing bytes.",
    "// JS strings are UTF-16 and slice creates a copy or substring\nconst s = 'Hello World';\nconst sub = s.slice(0, 5);",
    "Slices (`&str`, `&[T]`) let you view subsections of data without allocating new memory.",
    """fn main() {
    // 1. Owned String on heap (pointer, capacity, length)
    let mut owned = String::from("Rustacean");
    owned.push_str(" Developer");

    // 2. Borrowed slice (&str) pointing to a subsection (zero copy!)
    let slice: &str = &owned[0..9];
    println!("Slice: '{}'", slice);

    // 3. Array slices (&[T])
    let numbers = [10, 20, 30, 40, 50];
    let middle_slice: &[i32] = &numbers[1..4];
    println!("Middle numbers: {:?}", middle_slice);
}""",
    {
        "proTip": "Function arguments should almost always take `&str` instead of `&String` for zero-allocation compatibility.",
        "footgun": "Slicing strings on byte boundaries that split UTF-8 multi-byte characters panics at runtime.",
        "archNote": "Rust strings are strictly guaranteed valid UTF-8. A `&str` consists of just two 64-bit words: pointer and length."
    }
)

add_chapter(
    "smart_pointers", "10", "Part 2: Collections & Data",
    "Smart Pointers: Box, Rc, Arc & RefCell",
    "In Node.js, V8 manages all memory on the garbage-collected heap. In Rust, values default to the stack. Smart pointers provide explicit heap allocation (`Box`), reference counting (`Rc`/`Arc`), and interior mutability (`RefCell`).",
    "// Node.js objects are heap pointers behind the scenes\nconst node = { val: 1, next: null };",
    "Explicit smart pointers give you precise control over memory layout and caching.",
    """use std::sync::Arc;

// Recursive data structure requires Box for known compile-time size
#[derive(Debug)]
enum LinkedList {
    Cons(i32, Box<LinkedList>),
    Nil,
}

fn main() {
    // Heap allocation with Box<T>
    let list = LinkedList::Cons(1, Box::new(LinkedList::Cons(2, Box::new(LinkedList::Nil))));
    println!("Linked List: {:?}", list);

    // Shared thread-safe ownership with Arc<T>
    let shared_num = Arc::new(42);
    let clone_ref = Arc::clone(&shared_num);
    println!("Arc value: {}, strong count: {}", clone_ref, Arc::strong_count(&shared_num));
}""",
    {
        "proTip": "Use `Box<T>` for heap allocation of large structs and recursive data structures with indefinite depth.",
        "footgun": "`Rc<T>` and `RefCell<T>` are single-threaded only and cannot be passed across thread boundaries.",
        "archNote": "Box<T> is a unique owned pointer with zero abstraction overhead over a raw malloc/free heap pointer."
    }
)

add_chapter(
    "interior_mutability", "11", "Part 2: Collections & Data",
    "Interior Mutability: Mutex & RwLock",
    "In JavaScript, objects can be mutated even if declared with const. In Rust, interior mutability allows mutating data behind an immutable reference using thread-safe `Mutex` or `RwLock`.",
    "// JS objects can mutate fields even when held in a const binding\nconst config = { hits: 0 };\nconfig.hits++;",
    "Rust Mutex wraps the data itself: you cannot access the inner data without locking first.",
    """use std::sync::{Mutex, RwLock};

fn main() {
    // Mutex wraps the data, enforcing mutual exclusion
    let counter = Mutex::new(0);

    {
        let mut lock = counter.lock().unwrap();
        *lock += 10;
        // Lock automatically releases when `lock` drops here!
    }

    println!("Counter: {}", *counter.lock().unwrap());

    // RwLock allows many readers OR one writer
    let cache = RwLock::new(String::from("Cached payload"));
    {
        let read_guard = cache.read().unwrap();
        println!("Read cache: {}", *read_guard);
    }
}""",
    {
        "proTip": "Locks release automatically when guard variables go out of scope via RAII Drop implementation.",
        "footgun": "Holding a lock guard across an `.await` boundary in Tokio causes thread deadlocks. Use `tokio::sync::Mutex`.",
        "archNote": "Unlike Java or C# where locks are separate monitors, Rust locks wrap the protected data directly."
    }
)

add_chapter(
    "memory_alignment", "12", "Part 2: Collections & Data",
    "Struct Memory Layout, Alignment & Padding",
    "In V8, JavaScript objects are hidden-class shapes with pointer overhead. In Rust, structs are laid out contiguously in memory with hardware-level byte alignment and padding.",
    "// V8 hides memory layout, object headers, and pointer tags\nconst point = { x: 10, y: 20 };",
    "Understanding struct alignment enables cache-line optimization and zero-waste memory footprints.",
    """use std::mem::{size_of, align_of};

// Field ordering impacts padding bytes
struct Unoptimized {
    a: u8,   // 1 byte + 7 bytes padding
    b: u64,  // 8 bytes
    c: u8,   // 1 byte + 7 bytes padding = 24 bytes total
}

struct Optimized {
    b: u64,  // 8 bytes
    a: u8,   // 1 byte
    c: u8,   // 1 byte + 6 bytes padding = 16 bytes total
}

fn main() {
    println!("Unoptimized size: {} bytes, align: {}", size_of::<Unoptimized>(), align_of::<Unoptimized>());
    println!("Optimized size:   {} bytes, align: {}", size_of::<Optimized>(), align_of::<Optimized>());
}""",
    {
        "proTip": "Place largest alignment fields first (u64/u128) followed by smaller fields to minimize padding bytes.",
        "footgun": "By default, Rust compiler optimizes field layout under `repr(Rust)`. Use `#[repr(C)]` for FFI boundaries.",
        "archNote": "Keeping structs within a 64-byte CPU cache line prevents expensive extra memory bus fetch cycles."
    }
)

# ========================================================
# PART 3: DATABASE & PERSISTENCE (13 - 18)
# ========================================================
add_chapter(
    "sqlx_compile_time", "13", "Part 3: Databases & SQL",
    "Prisma / TypeORM vs SQLx Compile-Time SQL",
    "Node.js ORMs generate SQL queries dynamically at runtime or rely on code generators. SQLx connects to your database at build time and validates that every SQL query, table, and column exists and matches types!",
    "// Prisma runtime query\nconst users = await prisma.user.findMany({\n  where: { active: true }\n});",
    "Compile-time query verification eliminates runtime SQL syntax and column mismatch errors before deployment.",
    """// Demonstration of type-safe SQL query projection
#[derive(Debug)]
struct UserRow {
    id: i64,
    email: String,
    is_active: bool,
}

fn mock_query_user(id: i64) -> Result<UserRow, &'static str> {
    // In SQLx: sqlx::query_as!(UserRow, "SELECT id, email, is_active FROM users WHERE id = $1", id)
    if id > 0 {
        Ok(UserRow { id, email: "user@example.com".into(), is_active: true })
    } else {
        Err("User not found")
    }
}

fn main() {
    match mock_query_user(1) {
        Ok(user) => println!("Loaded user: {:?}", user),
        Err(e) => eprintln!("Database error: {}", e),
    }
}""",
    {
        "proTip": "Use `sqlx-data.json` offline mode for CI/CD pipelines where live database connections are unavailable.",
        "footgun": "Schema migrations must be applied before running `cargo build` when compile-time query macros are used.",
        "archNote": "SQLx requires zero ORM abstraction tax: raw SQL queries execute directly with zero runtime query building overhead."
    }
)

add_chapter(
    "db_pool", "14", "Part 3: Databases & SQL",
    "Connection Pools: pg.Pool vs sqlx::Pool",
    "Node.js `pg.Pool` handles connections via the event loop. In Rust, `sqlx::Pool` manages asynchronous connection pooling across multi-threaded worker pools with configurable timeouts and keep-alives.",
    "// pg pool in Node.js\nconst { Pool } = require('pg');\nconst pool = new Pool({ max: 20 });\nconst client = await pool.connect();",
    "Robust connection pooling prevents connection starvation and balances load across database replicas.",
    """use std::sync::atomic::{AtomicUsize, Ordering};

struct MockDbPool {
    max_connections: usize,
    active_connections: AtomicUsize,
}

impl MockDbPool {
    fn new(max: usize) -> Self {
        Self { max_connections: max, active_connections: AtomicUsize::new(0) }
    }

    fn acquire(&self) -> Result<usize, &'static str> {
        let current = self.active_connections.fetch_add(1, Ordering::SeqCst);
        if current >= self.max_connections {
            self.active_connections.fetch_sub(1, Ordering::SeqCst);
            return Err("Pool exhausted");
        }
        Ok(current + 1)
    }
}

fn main() {
    let pool = MockDbPool::new(5);
    println!("Connection acquired: {:?}", pool.acquire());
    println!("Connection acquired: {:?}", pool.acquire());
}""",
    {
        "proTip": "Configure maximum connections based on CPU cores and database server resource limits.",
        "footgun": "Holding a database connection across long asynchronous HTTP calls exhausts connection pools rapidly.",
        "archNote": "Sqlx pools implement RAII: when connection handles go out of scope, they return automatically to the pool."
    }
)

add_chapter(
    "db_transactions", "15", "Part 3: Databases & SQL",
    "Transactions & RAII Rollback",
    "In Node.js, unhandled exceptions inside transactions require manual `try/catch` and `ROLLBACK` calls. In Rust, transactions roll back automatically on drop if not explicitly committed!",
    "// Node.js transaction pattern\nconst client = await pool.connect();\ntry {\n  await client.query('BEGIN');\n  await client.query('COMMIT');\n} catch (e) {\n  await client.query('ROLLBACK');\n}",
    "RAII Rollback ensures transactions never leak or hang in an uncommitted state even during panics.",
    """// Simulation of RAII transaction auto-rollback
struct Transaction {
    committed: bool,
}

impl Transaction {
    fn begin() -> Self { Self { committed: false } }
    fn commit(mut self) {
        self.committed = true;
        println!("--> Transaction successfully COMMITTED.");
    }
}

impl Drop for Transaction {
    fn drop(&mut self) {
        if !self.committed {
            println!("--> Transaction dropped without commit: Auto-ROLLBACK triggered!");
        }
    }
}

fn main() {
    println!("--- Test 1: Successful commit ---");
    let tx1 = Transaction::begin();
    tx1.commit();

    println!("\\n--- Test 2: Early return / error branch ---");
    let _tx2 = Transaction::begin();
    // Scope ends here without commit -> Auto Rollback!
}""",
    {
        "proTip": "Explicitly call `tx.commit().await?` at the end of your business logic.",
        "footgun": "Forgetting that `?` early returns will drop the transaction and roll it back.",
        "archNote": "Rust's Drop trait guarantees deterministic cleanup, eliminating dangling open database locks."
    }
)

add_chapter(
    "redis_caching", "16", "Part 3: Databases & SQL",
    "Redis Caching & Mutex Stampede Protection",
    "Node.js uses `ioredis` for caching. In Rust, `redis-rs` provides async connection multiplexing. Combining Redis with in-memory locks prevents cache stampedes on hot keys.",
    "// Node.js ioredis\nconst Redis = require('ioredis');\nconst redis = new Redis();\nconst val = await redis.get('user:10');",
    "Connection multiplexing allows thousands of requests to pipeline commands over a single TCP socket.",
    """use std::collections::HashMap;

// Mock cache layer
struct Cache {
    store: HashMap<String, String>,
}

impl Cache {
    fn new() -> Self { Self { store: HashMap::new() } }
    fn get_or_set<F>(&mut self, key: &str, compute: F) -> String
    where F: FnOnce() -> String {
        if let Some(val) = self.store.get(key) {
            return val.clone();
        }
        let computed = compute();
        self.store.insert(key.to_string(), computed.clone());
        computed
    }
}

fn main() {
    let mut cache = Cache::new();
    let val1 = cache.get_or_set("hero", || "Batman".to_string());
    let val2 = cache.get_or_set("hero", || "Superman".to_string());
    println!("Val1: {}, Val2 (cached): {}", val1, val2);
}""",
    {
        "proTip": "Use Redis MultiplexedConnection in Tokio for asynchronous pipelining.",
        "footgun": "Storing large blobs in Redis without compression wastes network bandwidth and memory.",
        "archNote": "Redis-rs uses connection multiplexing, avoiding connection-per-thread bottlenecks."
    }
)

add_chapter(
    "seaorm_patterns", "17", "Part 3: Databases & SQL",
    "SeaORM & ActiveModel vs TypeORM",
    "If you require an ORM rather than raw SQLx, SeaORM provides an async ActiveModel pattern built on top of SQLx with migrations, relation mapping, and typed schema builders.",
    "// TypeORM Entity\n@Entity()\nclass User { @PrimaryGeneratedColumn() id: number; }",
    "Type-safe relation joins with compile-time generated queries without dynamic reflection.",
    """// Conceptual Model & ActiveModel pattern in Rust
#[derive(Debug, Clone)]
struct UserModel {
    id: i32,
    username: String,
}

struct UserActiveModel {
    username: Option<String>,
}

impl UserActiveModel {
    fn insert(self, id: i32) -> UserModel {
        UserModel { id, username: self.username.unwrap_or_default() }
    }
}

fn main() {
    let new_user = UserActiveModel { username: Some("rustacean".into()) };
    let saved = new_user.insert(1);
    println!("Saved entity: {:?}", saved);
}""",
    {
        "proTip": "Use `sea-orm-cli generate entity` to generate models directly from your database schema.",
        "footgun": "ActiveModels require distinguishing between Set(val) and Unchanged(val) states.",
        "archNote": "SeaORM compiles into standard SQLx queries under the hood, keeping performance high."
    }
)

add_chapter(
    "mongodb_driver", "18", "Part 3: Databases & SQL",
    "MongoDB: Mongoose vs official mongodb crate",
    "Mongoose defines dynamic schemas with hooks. Rust's official `mongodb` crate uses Serde for BSON document mapping with type-safe collections.",
    "// Mongoose Model\nconst User = mongoose.model('User', new mongoose.Schema({ email: String }));",
    "Type-safe BSON serialization eliminates schema validation discrepancies between app and database.",
    """#[derive(Debug)]
struct MongoDocument {
    oid: &'static str,
    title: &'static str,
}

fn main() {
    let doc = MongoDocument { oid: "60c72b2f9b1d8b001c8e4d2a", title: "Rust BSON" };
    println!("MongoDB document: {:?}", doc);
}""",
    {
        "proTip": "Use `bson::oid::ObjectId` and Serde attributes for MongoDB ID mapping.",
        "footgun": "BSON integers are strictly typed (i32 vs i64); mismatching types causes deserialization errors.",
        "archNote": "The official MongoDB Rust driver is fully async and built directly on Tokio."
    }
)

# ========================================================
# PART 4: BACKGROUND JOBS & QUEUES (19 - 20)
# ========================================================
add_chapter(
    "redis_queues", "19", "Part 4: Queues & Workers",
    "BullMQ vs Redis Streams in Rust",
    "BullMQ coordinates background job queues in Node.js using Redis Lua scripts. In Rust, Redis Streams or dedicated engines (`faktory-rs`, `apalis`) provide high-throughput job consumer workers.",
    "// BullMQ worker\nconst worker = new Worker('emails', async job => {\n  await sendMail(job.data);\n});",
    "Consumer groups allow scaling background workers across multiple machines with reliable delivery guarantees.",
    """use std::sync::mpsc;
use std::thread;

struct Job { id: u64, payload: &'static str }

fn main() {
    let (tx, rx) = mpsc::channel();

    // Worker thread
    let worker = thread::spawn(move || {
        while let Ok(job) = rx.recv() {
            println!("Worker processed job #{}: {}", job.id, job.payload);
        }
    });

    // Enqueue jobs
    tx.send(Job { id: 1, payload: "Send Welcome Email" }).unwrap();
    tx.send(Job { id: 2, payload: "Process Invoice" }).unwrap();
    drop(tx); // Close channel

    worker.join().unwrap();
}""",
    {
        "proTip": "Use `apalis` for a full-featured background processing framework with Redis/SQL backends.",
        "footgun": "Forgetting to ACK messages in consumer groups causes jobs to re-deliver repeatedly.",
        "archNote": "Rust job workers can process tens of thousands of background tasks per second with minimal RAM."
    }
)

add_chapter(
    "job_retries", "20", "Part 4: Queues & Workers",
    "Exponential Backoff & Dead-Letter Queues",
    "BullMQ handles retries with backoff strategies. In Rust, exponential backoff with jitter prevents thundering herd problems when downstream services experience outages.",
    "// BullMQ backoff config\n{ attempts: 5, backoff: { type: 'exponential', delay: 1000 } }",
    "Adding randomized jitter to exponential backoff prevents synchronized retries from overwhelming recovering services.",
    """fn calculate_backoff(attempt: u32, base_ms: u64, max_ms: u64) -> u64 {
    let exp = 2u64.pow(attempt);
    let delay = base_ms * exp;
    std::cmp::min(delay, max_ms)
}

fn main() {
    for attempt in 0..5 {
        let delay = calculate_backoff(attempt, 100, 5000);
        println!("Retry attempt {}: backoff delay {} ms", attempt + 1, delay);
    }
}""",
    {
        "proTip": "Move permanently failed jobs to a Dead Letter Queue (DLQ) after maximum retry exhaustion.",
        "footgun": "Retrying non-idempotent operations without idempotency keys can cause duplicate billing or data corruption.",
        "archNote": "Deterministic backoff logic compiles into simple arithmetic operations with zero runtime dependencies."
    }
)

# ========================================================
# PART 5: ASYNC, CONCURRENCY & TOKIO (21 - 26)
# ========================================================
add_chapter(
    "tokio_spawn", "21", "Part 5: Async & Tokio",
    "Promise.all vs tokio::join! & tokio::spawn",
    "JavaScript runs on a single thread event loop. `Promise.all` executes concurrent async tasks cooperatively. In Rust, Tokio provides a multi-threaded work-stealing runtime with `tokio::join!` and `tokio::spawn`.",
    "// Promise.all in Node.js\nconst [users, posts] = await Promise.all([\n  fetchUsers(),\n  fetchPosts()\n]);",
    "Tokio distributes asynchronous tasks across all physical CPU cores using work-stealing algorithms.",
    """// Conceptual demonstration of concurrent tasks
fn fetch_users() -> &'static str { "users_loaded" }
fn fetch_posts() -> &'static str { "posts_loaded" }

fn main() {
    // In Tokio: let (users, posts) = tokio::join!(fetch_users(), fetch_posts());
    let u = fetch_users();
    let p = fetch_posts();
    println!("Completed concurrent batch: {}, {}", u, p);
}""",
    {
        "proTip": "Use `tokio::join!` for concurrent futures on the same task, and `tokio::spawn` for background tasks across threads.",
        "footgun": "Blocking the thread inside an async task with `std::thread::sleep` freezes the Tokio worker thread! Use `tokio::time::sleep`.",
        "archNote": "Tokio futures are lazy state machines: nothing happens until a future is polled by `.await` or an executor."
    }
)

add_chapter(
    "select_race", "22", "Part 5: Async & Tokio",
    "Promise.race vs tokio::select!",
    "Node.js uses `Promise.race()` to await the fastest promise. Rust provides `tokio::select!`, which can simultaneously await futures, channel receives, and timeouts, canceling unselected branches.",
    "// Promise.race\nconst result = await Promise.race([fetchData(), timeout(5000)]);",
    "tokio::select! drops unselected futures immediately, cancelling them cleanly without lingering background execution.",
    """// Simulation of select race pattern
enum RaceResult {
    Data(&'static str),
    Timeout,
}

fn race_operation(fast: bool) -> RaceResult {
    if fast { RaceResult::Data("Payload ready") } else { RaceResult::Timeout }
}

fn main() {
    match race_operation(true) {
        RaceResult::Data(d) => println!("Fastest branch won: {}", d),
        RaceResult::Timeout => println!("Operation timed out!"),
    }
}""",
    {
        "proTip": "Ensure futures passed to `tokio::select!` are cancellation-safe before using them in production.",
        "footgun": "Branches in `tokio::select!` drop non-winning futures, which can drop half-written streams if not cancellation-safe.",
        "archNote": "Cancellation in Rust is zero-cost: futures are simply dropped without requiring special cancellation tokens."
    }
)

add_chapter(
    "cancellation_tokens", "23", "Part 5: Async & Tokio",
    "AbortController vs CancellationToken",
    "Node.js uses `AbortController` and `signal` to propagate cancellation. Rust's `tokio_util::sync::CancellationToken` provides cooperative cancellation across threads and tasks.",
    "// Node.js AbortController\nconst ac = new AbortController();\nsetTimeout(() => ac.abort(), 1000);\nfetch(url, { signal: ac.signal });",
    "CancellationToken enables clean, structured shutdowns across tree-like hierarchies of background worker tasks.",
    """use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;

struct MockToken {
    cancelled: Arc<AtomicBool>,
}

impl MockToken {
    fn new() -> Self { Self { cancelled: Arc::new(AtomicBool::new(false)) } }
    fn cancel(&self) { self.cancelled.store(true, Ordering::SeqCst); }
    fn is_cancelled(&self) -> bool { self.cancelled.load(Ordering::SeqCst) }
}

fn main() {
    let token = MockToken::new();
    println!("Running worker. Is cancelled? {}", token.is_cancelled());
    token.cancel();
    println!("Cancel signal sent. Is cancelled? {}", token.is_cancelled());
}""",
    {
        "proTip": "Pass child tokens to subordinate tasks using `token.child_token()` for hierarchical cancellation.",
        "footgun": "Ignoring the cancellation token in long CPU-bound loops prevents tasks from shutting down promptly.",
        "archNote": "Tokens use atomic notifications without allocating operating system signals."
    }
)

add_chapter(
    "error_anyhow_thiserror", "24", "Part 5: Async & Tokio",
    "Error Architecture: anyhow vs thiserror",
    "In Node.js, libraries and applications throw arbitrary `Error` instances. In Rust, libraries use `thiserror` to define strongly-typed domain error enums, while applications use `anyhow` for rich error contexts with backtraces.",
    "// Node.js arbitrary error throwing\nthrow new Error('Database connection failed: ' + err.message);",
    "Separate library errors (predictable contracts) from application errors (rich diagnostics and context).",
    """#[derive(Debug)]
enum DatabaseError {
    NotFound,
    ConnectionLost(String),
}

impl std::fmt::Display for DatabaseError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::NotFound => write!(f, "Record was not found"),
            Self::ConnectionLost(msg) => write!(f, "Database lost connection: {}", msg),
        }
    }
}
impl std::error::Error for DatabaseError {}

fn query() -> Result<(), DatabaseError> {
    Err(DatabaseError::ConnectionLost("Connection timeout after 30s".into()))
}

fn main() {
    if let Err(e) = query() {
        eprintln!("Domain error handled: {}", e);
    }
}""",
    {
        "proTip": "Use `.context(\"failed to read user config\")` in anyhow to add actionable breadcrumbs to errors.",
        "footgun": "Exposing anyhow::Error in public library APIs prevents consumers from matching on specific error variants.",
        "archNote": "Anyhow boxes the error on the heap only when an error actually occurs, keeping the success path zero-cost."
    }
)

add_chapter(
    "channels_sync", "25", "Part 5: Async & Tokio",
    "Channels: mpsc, broadcast, watch & oneshot",
    "Node.js uses `EventEmitter` with event callbacks. Rust uses strongly typed channels: `oneshot` (single message), `mpsc` (many producers, one consumer), `broadcast` (pub/sub), and `watch` (state changes).",
    "// Node.js EventEmitter\nconst emitter = new EventEmitter();\nemitter.on('data', chunk => console.log(chunk));\nemitter.emit('data', 'hello');",
    "Channels provide thread-safe communication and backpressure without shared memory locks.",
    """use std::sync::mpsc;

fn main() {
    // MPSC: Multi-producer, single-consumer channel
    let (tx, rx) = mpsc::channel();
    let tx_clone = tx.clone();

    tx.send("Message from worker 1").unwrap();
    tx_clone.send("Message from worker 2").unwrap();
    drop(tx);
    drop(tx_clone);

    for msg in rx {
        println!("Received on channel: {}", msg);
    }
}""",
    {
        "proTip": "Use bounded channels (`mpsc::sync_channel`) in production to prevent unbounded memory growth under load.",
        "footgun": "Failing to drop all sender clones keeps receiver loops waiting forever.",
        "archNote": "Tokio channels use lock-free ring buffers for high-throughput inter-task communication."
    }
)

add_chapter(
    "graceful_shutdown", "26", "Part 5: Async & Tokio",
    "Graceful Shutdown & OS Signal Handling",
    "In Node.js, `process.on('SIGTERM')` handles shutdown. In Rust, Axum and Tokio provide `.with_graceful_shutdown()` to drain in-flight HTTP requests, commit transactions, and close sockets cleanly.",
    "// Node.js SIGTERM handler\nprocess.on('SIGTERM', () => {\n  server.close(() => process.exit(0));\n});",
    "Graceful shutdown drains in-flight requests during zero-downtime rolling Kubernetes deployments.",
    """use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;

struct Server {
    is_running: Arc<AtomicBool>,
}

impl Server {
    fn shutdown(&self) {
        println!("Received SIGTERM: Draining in-flight requests...");
        self.is_running.store(false, Ordering::SeqCst);
        println!("All connections drained. Server terminated cleanly.");
    }
}

fn main() {
    let server = Server { is_running: Arc::new(AtomicBool::new(true)) };
    println!("Server running on :8080");
    server.shutdown();
}""",
    {
        "proTip": "Combine `tokio::signal::ctrl_c()` with unix signal listeners for cross-platform container signals.",
        "footgun": "Forgetting to set a shutdown timeout can cause stuck workers to prevent container termination.",
        "archNote": "Axum's graceful shutdown closes the listening socket first, allowing active requests to finish without accepting new ones."
    }
)

# ========================================================
# PART 6: SYSTEMS INTERNALS & PERFORMANCE (27 - 34)
# ========================================================
add_chapter(
    "simd_optimization", "27", "Part 6: Systems Internals",
    "SIMD Vectorization & Zero-Cost Abstractions",
    "Node.js relies on V8 JIT compiler optimizations. Rust compiles directly via LLVM to machine code, taking full advantage of auto-vectorization and AVX-512 SIMD instructions to process multiple numbers per CPU cycle.",
    "// JS loop relies on V8 JIT Turbofan optimization\nfunction sum(arr) { let s = 0; for(let i=0; i<arr.length; i++) s += arr[i]; return s; }",
    "Auto-vectorization executes arithmetic across 4 to 16 data points simultaneously in hardware vector registers.",
    """fn sum_slice(slice: &[u32]) -> u32 {
    // LLVM recognizes this pattern and emits SIMD vector instructions
    slice.iter().sum()
}

fn main() {
    let numbers: Vec<u32> = (1..=1000).collect();
    let total = sum_slice(&numbers);
    println!("Total calculated with SIMD: {}", total);
}""",
    {
        "proTip": "Build with `RUSTFLAGS=\"-C target-cpu=native\"` to enable all CPU instruction sets supported by your host.",
        "footgun": "Branching (if/else) inside tight loops can prevent LLVM from auto-vectorizing.",
        "archNote": "Rust exposes portable SIMD via `std::simd` for explicit data-parallel computing without writing assembly."
    }
)

add_chapter(
    "napi_rs", "28", "Part 6: Systems Internals",
    "NAPI-RS: Accelerating Node.js with Rust",
    "Instead of rewriting your entire Node.js backend, you can write performance-critical modules in Rust and compile them directly to native Node.js addons using `napi-rs` with zero V8 GC overhead.",
    "// Calling native Rust addon from Node.js\nconst { calculateHash } = require('./index.node');\nconst hash = calculateHash(largeBuffer);",
    "Native addons execute at C speed directly within Node.js processes, offloading CPU-intensive tasks from the V8 event loop.",
    """// Conceptual NAPI-RS export pattern in Rust
fn fast_fibonacci(n: u32) -> u64 {
    match n {
        0 => 0,
        1 => 1,
        _ => {
            let mut a = 0;
            let mut b = 1;
            for _ in 2..=n {
                let temp = a + b;
                a = b;
                b = temp;
            }
            b
        }
    }
}

fn main() {
    let result = fast_fibonacci(40);
    println!("Fibonacci(40) computed in sub-microsecond: {}", result);
}""",
    {
        "proTip": "Use `napi-rs` threadsafe functions to run CPU-bound work on background thread pools without blocking V8.",
        "footgun": "Crossing the JS-to-native boundary too frequently on trivial functions adds FFI call overhead.",
        "archNote": "NAPI guarantees ABI stability across Node.js versions, so native binaries do not need recompilation per Node release."
    }
)

add_chapter(
    "unsafe_rust", "29", "Part 6: Systems Internals",
    "Unsafe Rust: When & How to Use It",
    "By default, Rust guarantees memory safety. The `unsafe` keyword does not turn off the borrow checker; it enables five specific superpowers: dereferencing raw pointers, calling FFI, mutating statics, and implementing unsafe traits.",
    "// Node.js FFI or Buffer manipulation\nconst buf = Buffer.allocUnsafe(100);",
    "Unsafe allows writing operating system drivers, lock-free data structures, and hardware interactions with strict isolation.",
    """fn main() {
    let mut num = 42;

    // Creating raw pointers is safe
    let r1 = &num as *const i32;
    let r2 = &mut num as *mut i32;

    // Dereferencing raw pointers requires unsafe block
    unsafe {
        println!("Raw pointer read: {}", *r1);
        *r2 = 99;
        println!("Mutated via raw pointer: {}", *r2);
    }
}""",
    {
        "proTip": "Wrap all unsafe code inside safe abstractions that uphold invariants so external consumers cannot trigger undefined behavior.",
        "footgun": "Undefined behavior in unsafe code can corrupt memory silently. Always test with `cargo miri`.",
        "archNote": "99% of production Rust code requires zero unsafe blocks; standard libraries encapsulate unsafe operations safely."
    }
)

add_chapter(
    "foreign_function_interface", "30", "Part 6: Systems Internals",
    "FFI: Calling C Libraries from Rust",
    "Node.js uses node-gyp or ffi-napi. Rust natively supports C ABI calls using `extern \"C\"`, allowing seamless integration with system libraries like libssl, SQLite, or hardware SDKs.",
    "// Node.js ffi-napi\nconst ffi = require('ffi-napi');\nconst lib = ffi.Library('libc', { 'puts': ['int', ['string']] });",
    "Rust links directly to C static and dynamic libraries with zero wrapper performance penalty.",
    """// Simulating C-compatible data structure with #[repr(C)]
#[repr(C)]
struct Point {
    x: f64,
    y: f64,
}

fn calculate_distance(p: &Point) -> f64 {
    (p.x * p.x + p.y * p.y).sqrt()
}

fn main() {
    let pt = Point { x: 3.0, y: 4.0 };
    println!("Point distance from origin: {}", calculate_distance(&pt));
}""",
    {
        "proTip": "Use `bindgen` to automatically generate Rust FFI bindings from C header (.h) files.",
        "footgun": "Memory allocated by C (malloc) must be freed by C (free), not by Rust's allocator.",
        "archNote": "#[repr(C)] guarantees struct memory layout matches C compiler alignment and padding rules."
    }
)

add_chapter(
    "custom_allocators", "31", "Part 6: Systems Internals",
    "Custom Allocators: jemalloc & mimalloc",
    "V8 handles heap allocations using its internal garbage-collected heap. Rust defaults to the system allocator (glibc malloc), but switching to `jemalloc` or `mimalloc` dramatically improves multi-threaded throughput and prevents memory fragmentation.",
    "// Node.js exposes --max-old-space-size for V8 heap limits\nnode --max-old-space-size=4096 server.js",
    "jemalloc reduces lock contention on multi-core servers, preventing performance degradation under heavy concurrency.",
    """// Rust allows declaring a global allocator with a single line:
// #[global_allocator]
// static GLOBAL: jemallocator::Jemalloc = jemallocator::Jemalloc;

fn main() {
    // Demonstration of high-frequency allocations
    let mut data = Vec::new();
    for i in 0..10_000 {
        data.push(i);
    }
    println!("Allocated {} items with allocator", data.len());
}""",
    {
        "proTip": "Add `tikv-jemallocator` to Cargo.toml to eliminate memory fragmentation in long-running web servers.",
        "footgun": "jemalloc may retain RSS memory longer than default glibc malloc before returning it to the OS.",
        "archNote": "jemalloc uses thread-local arenas to eliminate global heap mutex contention across CPU cores."
    }
)

add_chapter(
    "atomics_memory_ordering", "32", "Part 6: Systems Internals",
    "Atomics & Hardware Memory Ordering",
    "Node.js has `Atomics` for SharedArrayBuffer across worker threads. Rust provides full hardware atomic primitives (`AtomicBool`, `AtomicUsize`) with precise memory orderings (Relaxed, Acquire, Release, SeqCst).",
    "// JS Atomics\nAtomics.add(typedArray, 0, 1);",
    "Atomic operations execute directly in CPU hardware without requiring operating system mutex locks.",
    """use std::sync::atomic::{AtomicUsize, Ordering};

fn main() {
    let counter = AtomicUsize::new(0);

    // Atomic fetch_add returns previous value
    let prev = counter.fetch_add(1, Ordering::SeqCst);
    println!("Previous: {}, Current: {}", prev, counter.load(Ordering::SeqCst));

    // Compare and swap (CAS) loop
    let success = counter.compare_exchange(1, 10, Ordering::SeqCst, Ordering::Relaxed);
    println!("CAS Result: {:?}, New value: {}", success, counter.load(Ordering::SeqCst));
}""",
    {
        "proTip": "Use `Ordering::SeqCst` when learning atomics to guarantee sequential consistency across all cores.",
        "footgun": "Using `Ordering::Relaxed` incorrectly can result in CPU instruction reordering and subtle data corruption.",
        "archNote": "Hardware atomics map to x86 `LOCK CMPXCHG` or ARM `LDREX/STREX` machine instructions."
    }
)

add_chapter(
    "procedural_macros", "33", "Part 6: Systems Internals",
    "Macros: Declarative vs Procedural Macros",
    "JavaScript uses Babel plugins or TypeScript decorators for meta-programming. Rust provides declarative macros (`macro_rules!`) and procedural macros (derive, attribute, function-like) that manipulate Rust AST tokens at compile time.",
    "// TypeScript Decorator\n@Entity()\nclass User { @Column() name: string; }",
    "Rust macros run strictly at compile time with zero runtime reflection overhead.",
    """// Declarative macro for calculating operations
macro_rules! calculate {
    (add $a:expr, $b:expr) => {
        $a + $b
    };
    (mul $a:expr, $b:expr) => {
        $a * $b
    };
}

fn main() {
    let sum = calculate!(add 10, 20);
    let product = calculate!(mul 5, 4);
    println!("Macro results: sum={}, product={}", sum, product);
}""",
    {
        "proTip": "Use `cargo expand` to inspect the code generated by procedural macros like `#[derive(Serialize)]`.",
        "footgun": "Complex procedural macros can significantly increase compile times.",
        "archNote": "Macros operate on TokenStreams, providing hygienic code expansion without variable name collisions."
    }
)

add_chapter(
    "const_eval", "34", "Part 6: Systems Internals",
    "Compile-Time Computation with const fn",
    "JavaScript evaluates code dynamically at runtime. Rust allows running pure functions at compile time using `const fn`, pre-computing lookups, hashes, and lookup tables into the static binary.",
    "// JS constants are evaluated at runtime initialization\nconst SQUARES = [0, 1, 4, 9, 16];",
    "Pre-computing data at compile time turns expensive runtime algorithms into instant static table lookups.",
    """const fn precompute_factorial(n: u64) -> u64 {
    let mut result = 1;
    let mut i = 1;
    while i <= n {
        result *= i;
        i += 1;
    }
    result
}

// Evaluated by rustc during compilation!
const FACTORIAL_10: u64 = precompute_factorial(10);

fn main() {
    println!("Factorial of 10 computed at compile-time: {}", FACTORIAL_10);
}""",
    {
        "proTip": "Mark pure helper functions as `const fn` to allow them to be executed both at compile time and runtime.",
        "footgun": "Heap allocations and non-deterministic operations (like reading time or random numbers) cannot be used in `const fn`.",
        "archNote": "Compile-time evaluated constants are embedded directly in the `.rodata` section of the executable binary."
    }
)

# ========================================================
# PART 7: PHILOSOPHY & IDIOMATIC RUST (P1 - P5)
# ========================================================
add_chapter(
    "philo_fearless_concurrency", "P1", "Part 7: Rust Philosophy",
    "Fearless Concurrency & Send / Sync",
    "Node.js avoided concurrency bugs by keeping everything single-threaded. Rust allows multi-threaded concurrency with zero data races: the compiler verifies thread safety through the `Send` and `Sync` auto-traits.",
    "// Node.js is single-threaded to avoid multi-thread concurrency bugs\nsetTimeout(() => console.log('async task'), 0);",
    "Send and Sync make multi-threaded concurrency safe: if data cannot be safely shared across threads, it will not compile.",
    """use std::thread;

fn main() {
    let data = vec![1, 2, 3, 4, 5];

    // `move` transfers ownership of `data` into the thread safely
    let handle = thread::spawn(move || {
        let sum: i32 = data.iter().sum();
        println!("Sum computed on background OS thread: {}", sum);
    });

    handle.join().unwrap();
}""",
    {
        "proTip": "Types are automatically `Send` if all their fields are `Send`. The compiler handles this for you.",
        "footgun": "Types holding raw pointers do not implement Send or Sync automatically.",
        "archNote": "Send means ownership can transfer to another thread; Sync means references (&T) can be shared across threads."
    }
)

add_chapter(
    "philo_raii_drop", "P2", "Part 7: Rust Philosophy",
    "RAII & Deterministic Resource Management",
    "JavaScript relies on garbage collection: you never know when memory will be reclaimed. Rust uses RAII (Resource Acquisition Is Initialization): when a variable goes out of scope, its `Drop` implementation executes immediately.",
    "// JS has no deterministic destructor (FinalizationRegistry is non-deterministic)\nconst fd = fs.openSync('file.txt'); // Must manually close or leak handle!",
    "Deterministic cleanup eliminates resource leaks: file handles, network sockets, and database transactions close automatically.",
    """struct FileHandle {
    name: String,
}

impl Drop for FileHandle {
    fn drop(&mut self) {
        println!("--> [RAII Drop]: File handle '{}' closed and flushed to disk.", self.name);
    }
}

fn main() {
    println!("Opening resource in inner scope...");
    {
        let _file = FileHandle { name: "access.log".to_string() };
        println!("Using file inside scope...");
    } // Drop runs automatically right here!
    println!("Scope closed.");
}""",
    {
        "proTip": "Use `std::mem::drop(val)` if you need to release a resource before the end of its enclosing scope.",
        "footgun": "Types implementing the `Copy` trait cannot implement the `Drop` trait.",
        "archNote": "RAII Drop is injected by the compiler at AST lowering, guaranteeing zero garbage collection pauses."
    }
)

add_chapter(
    "philo_zero_cost", "P3", "Part 7: Rust Philosophy",
    "The Zero-Cost Abstraction Principle",
    "Bjarne Stroustrup defined zero-cost abstractions: what you don't use, you don't pay for; what you do use, you couldn't hand code any better. Rust applies this to iterators, generics, closures, and futures.",
    "// High-level abstractions in JS (arrays, classes) have runtime GC overhead\n[1, 2, 3].map(x => x * 2);",
    "Write expressive, high-level code without sacrificing bare-metal systems execution speed.",
    """fn main() {
    let arr = [10, 20, 30, 40, 50];

    // High level iterator abstraction compiles into direct pointer arithmetic
    let doubled: Vec<i32> = arr.iter().map(|&x| x * 2).collect();
    println!("Doubled: {:?}", doubled);
}""",
    {
        "proTip": "Don't avoid high-level abstractions like iterators and closures out of fear of performance loss: they are zero-cost.",
        "footgun": "Don't assume `dyn Trait` is zero-cost: dynamic dispatch involves vtable pointers and inhibits compiler inlining.",
        "archNote": "LLVM optimizes zero-cost abstractions by inlining closures and unrolling loops into direct machine instructions."
    }
)

add_chapter(
    "philo_type_driven", "P4", "Part 7: Rust Philosophy",
    "Make Illegal States Unrepresentable",
    "In JavaScript, objects can be in invalid partial states (e.g., `{ connected: false, socketId: '123' }`). In Rust, use the type system and state-machine pattern to make illegal states impossible to construct.",
    "// JS allows inconsistent states\nconst conn = { status: 'disconnected', socketId: 42 }; // Inconsistent!",
    "Encode application invariants into the type system so errors are caught at compile time rather than via runtime checks.",
    """// Typestate pattern: State is encoded in the type
struct Disconnected;
struct Connected { socket_id: u32 }

struct Connection<State> {
    state: State,
}

impl Connection<Disconnected> {
    fn new() -> Self { Self { state: Disconnected } }
    fn connect(self, socket_id: u32) -> Connection<Connected> {
        Connection { state: Connected { socket_id } }
    }
}

impl Connection<Connected> {
    fn send_data(&self, msg: &str) {
        println!("Sending '{}' via socket {}", msg, self.state.socket_id);
    }
}

fn main() {
    let conn = Connection::new();
    // conn.send_data("hello"); // COMPILE ERROR! Method does not exist for Disconnected state
    let active_conn = conn.connect(9001);
    active_conn.send_data("Ready for traffic");
}""",
    {
        "proTip": "Use the Typestate pattern for multi-step builders, network connections, and order processing pipelines.",
        "footgun": "Excessive type states can increase API surface complexity; apply it to critical business state transitions.",
        "archNote": "Zero-sized types (ZST) like `Disconnected` have zero bytes in memory: type safety with zero runtime cost."
    }
)

add_chapter(
    "philo_explicit_over_implicit", "P5", "Part 7: Rust Philosophy",
    "Explicit Over Implicit",
    "JavaScript features implicit type coercion (`'5' + 5 = '55'`) and hidden global scopes. Rust requires explicit conversions (`as`, `From`/`Into`), explicit borrows (`&`), and explicit error returns (`?`).",
    "// Implicit JS coercion surprises\nconsole.log([] + []); // ''\nconsole.log([] + {}); // '[object Object]'",
    "Code is read far more often than written: explicitness prevents subtle bugs in high-scale production systems.",
    """fn main() {
    let int_val: i32 = 42;
    // Rust will NEVER implicitly convert i32 to f64
    let float_val: f64 = int_val as f64 + 0.5;
    println!("Explicitly converted float: {}", float_val);

    let s = String::from("explicit");
    // Explicit borrow with &
    let len = s.len();
    println!("String '{}' has length {}", s, len);
}""",
    {
        "proTip": "Implement `From<T>` for your types; Rust automatically generates the reciprocal `Into<T>` trait implementation.",
        "footgun": "Overusing `as` for numeric conversions can silently truncate if target type is smaller (use `TryFrom` for safe conversions).",
        "archNote": "Explicitness ensures engineers and code reviewers can understand system behavior without memorizing coercion tables."
    }
)

# ========================================================
# PART 8: LEETCODE IN RUST (LC1 - LC7)
# ========================================================
add_chapter(
    "lc_two_sum", "LC1", "Part 8: LeetCode in Rust",
    "Two Sum (#1) — Zero-Allocation Map",
    "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to target. Solved in Rust using `HashMap` in O(n) time.",
    "// JS Two Sum\nfunction twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) return [map.get(complement), i];\n    map.set(nums[i], i);\n  }\n}",
    "Solve in O(n) time using HashMap lookup with explicit 0-based vector index returns.",
    """use std::collections::HashMap;

fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {
    let mut map: HashMap<i32, usize> = HashMap::with_capacity(nums.len());

    for (i, &num) in nums.iter().enumerate() {
        let complement = target - num;
        if let Some(&prev_idx) = map.get(&complement) {
            return vec![prev_idx as i32, i as i32];
        }
        map.insert(num, i);
    }
    vec![]
}

fn main() {
    let nums = vec![2, 7, 11, 15];
    let target = 9;
    let result = two_sum(nums, target);
    println!("Two Sum indices: {:?}", result);
}""",
    {
        "proTip": "Use `HashMap::with_capacity(nums.len())` to allocate table buckets upfront and prevent resizing.",
        "footgun": "Indexing arrays in Rust requires `usize`; casting `as i32` is needed when returning LeetCode problem signatures.",
        "archNote": "Standard Rust vectors guarantee contiguous heap storage, ensuring sequential memory reads hit L1 CPU cache."
    }
)

add_chapter(
    "lc_valid_parentheses", "LC20", "Part 8: LeetCode in Rust",
    "Valid Parentheses (#20) — Vector Stack",
    "Given a string `s` containing '(', ')', '{', '}', '[' and ']', determine if the input string is valid. Solved using `Vec<char>` as a fast LIFO stack.",
    "// JS Valid Parentheses\nfunction isValid(s) {\n  const stack = [];\n  for (const c of s) {\n    if (c === '(') stack.push(')');\n    else if (stack.pop() !== c) return false;\n  }\n  return stack.length === 0;\n}",
    "Rust's Vec functions as a cache-efficient LIFO stack with O(1) push and pop.",
    """fn is_valid(s: &str) -> bool {
    let mut stack = Vec::new();

    for ch in s.chars() {
        match ch {
            '(' => stack.push(')'),
            '{' => stack.push('}'),
            '[' => stack.push(']'),
            ')' | '}' | ']' => {
                if stack.pop() != Some(ch) {
                    return false;
                }
            }
            _ => {}
        }
    }
    stack.is_empty()
}

fn main() {
    println!("'()[]{}' valid? {}", is_valid("()[]{}"));
    println!("'(]' valid?     {}", is_valid("(]"));
}""",
    {
        "proTip": "Push the expected closing bracket instead of opening bracket to simplify the pop comparison.",
        "footgun": "Remember that Rust strings are UTF-8; iterate with `.chars()` to handle unicode properly.",
        "archNote": "Vec pop() returns an Option<T>, naturally avoiding out-of-bounds indexing errors."
    }
)

add_chapter(
    "lc_merge_lists", "LC21", "Part 8: LeetCode in Rust",
    "Merge Two Sorted Lists (#21)",
    "Merge two sorted linked lists and return it as a sorted list. In Rust, recursive or loop-based pointer manipulation is solved cleanly with Option and pattern matching.",
    "// JS Merge Lists\nfunction mergeTwoLists(l1, l2) {\n  if (!l1) return l2;\n  if (!l2) return l1;\n  if (l1.val < l2.val) { l1.next = mergeTwoLists(l1.next, l2); return l1; }\n  l2.next = mergeTwoLists(l1, l2.next); return l2;\n}",
    "Demonstrates recursive pattern matching over optional node links.",
    """#[derive(Debug, PartialEq, Eq)]
struct ListNode {
    val: i32,
    next: Option<Box<ListNode>>,
}

fn merge_two_vectors(mut v1: Vec<i32>, mut v2: Vec<i32>) -> Vec<i32> {
    let mut merged = Vec::with_capacity(v1.len() + v2.len());
    let (mut i, mut j) = (0, 0);

    while i < v1.len() && j < v2.len() {
        if v1[i] <= v2[j] {
            merged.push(v1[i]);
            i += 1;
        } else {
            merged.push(v2[j]);
            j += 1;
        }
    }
    merged.extend_from_slice(&v1[i..]);
    merged.extend_from_slice(&v2[j..]);
    merged
}

fn main() {
    let l1 = vec![1, 2, 4];
    let l2 = vec![1, 3, 4];
    println!("Merged sorted list: {:?}", merge_two_vectors(l1, l2));
}""",
    {
        "proTip": "Use `extend_from_slice` to append remaining elements in one fast memory copy operation.",
        "footgun": "Creating true linked lists in Rust requires `Option<Box<ListNode>>`; vectors are almost always faster in practice.",
        "archNote": "Because CPUs prefetch contiguous arrays into cache lines, array merges drastically outperform linked lists."
    }
)

add_chapter(
    "lc_buy_sell_stock", "LC121", "Part 8: LeetCode in Rust",
    "Best Time to Buy & Sell Stock (#121)",
    "Find maximum profit from buying and selling a stock once. Single-pass greedy algorithm tracking minimum price seen so far in O(n) time and O(1) space.",
    "// JS Stock Profit\nlet minPrice = Infinity, maxProfit = 0;\nfor (const p of prices) {\n  minPrice = Math.min(minPrice, p);\n  maxProfit = Math.max(maxProfit, p - minPrice);\n}",
    "Single-pass greedy algorithm with zero heap allocations and branch optimization.",
    """fn max_profit(prices: Vec<i32>) -> i32 {
    let mut min_price = i32::MAX;
    let mut max_profit = 0;

    for price in prices {
        if price < min_price {
            min_price = price;
        } else if price - min_price > max_profit {
            max_profit = price - min_price;
        }
    }
    max_profit
}

fn main() {
    let prices = vec![7, 1, 5, 3, 6, 4];
    println!("Max profit: {}", max_profit(prices));
}""",
    {
        "proTip": "Use `i32::MAX` as the initial sentinel value for finding minimum values.",
        "footgun": "Prices in strictly descending order yield a profit of 0, not a negative loss.",
        "archNote": "Zero heap allocations: runs entirely in CPU registers with O(1) space complexity."
    }
)

add_chapter(
    "lc_valid_palindrome", "LC125", "Part 8: LeetCode in Rust",
    "Valid Palindrome (#125) — Two Pointers",
    "Verify if a string is a palindrome considering only alphanumeric characters and ignoring case. Solved in Rust using two pointers over an iterator with zero heap allocations.",
    "// JS Valid Palindrome\nconst clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');\nreturn clean === clean.split('').reverse().join('');",
    "Two-pointer in-place traversal avoids allocating new filtered strings.",
    """fn is_palindrome(s: &str) -> bool {
    let chars: Vec<char> = s.chars()
        .filter(|c| c.is_alphanumeric())
        .map(|c| c.to_ascii_lowercase())
        .collect();

    if chars.is_empty() { return true; }

    let (mut left, mut right) = (0, chars.len() - 1);
    while left < right {
        if chars[left] != chars[right] {
            return false;
        }
        left += 1;
        right -= 1;
    }
    true
}

fn main() {
    println!("'A man, a plan, a canal: Panama' is palindrome? {}", is_palindrome("A man, a plan, a canal: Panama"));
    println!("'race a car' is palindrome? {}", is_palindrome("race a car"));
}""",
    {
        "proTip": "Use `c.is_alphanumeric()` and `c.to_ascii_lowercase()` for fast ASCII character normalization.",
        "footgun": "Be careful with unsigned integer underflow if decrementing `right` past 0 without checking bounds.",
        "archNote": "In-place comparison eliminates the regex engine overhead commonly present in JavaScript solutions."
    }
)

add_chapter(
    "lc_reverse_linked_list", "LC206", "Part 8: LeetCode in Rust",
    "Reverse Linked List (#206) — Ownership Transfer",
    "Reverse a singly linked list. In Rust, pointer reversal requires carefully moving node ownership between `prev` and `curr` without triggering use-after-move compiler errors.",
    "// JS Reverse Linked List\nlet prev = null, curr = head;\nwhile (curr) {\n  let next = curr.next;\n  curr.next = prev;\n  prev = curr;\n  curr = next;\n}",
    "Mastering ownership transfer between pointers is the ultimate rite of passage for Rust developers.",
    """#[derive(Debug)]
struct Node {
    val: i32,
    next: Option<Box<Node>>,
}

fn reverse_list(mut head: Option<Box<Node>>) -> Option<Box<Node>> {
    let mut prev = None;
    while let Some(mut current) = head {
        head = current.next.take(); // Detach next link safely
        current.next = prev;
        prev = Some(current);
    }
    prev
}

fn main() {
    let list = Some(Box::new(Node {
        val: 1,
        next: Some(Box::new(Node {
            val: 2,
            next: Some(Box::new(Node { val: 3, next: None })),
        })),
    }));

    let reversed = reverse_list(list);
    println!("Reversed list: {:?}", reversed);
}""",
    {
        "proTip": "Use `Option::take()` to extract and replace the value of an Option with `None` without cloning.",
        "footgun": "Directly assigning `current.next` while `current` is borrowed will cause compile errors without `.take()`.",
        "archNote": "Pattern `while let Some(...)` allows continuous ownership transfer along heap-allocated links."
    }
)

add_chapter(
    "lc_max_subarray", "LC53", "Part 8: LeetCode in Rust",
    "Maximum Subarray (#53) — Kadane's Algorithm",
    "Given an integer array `nums`, find the subarray with the largest sum and return its sum. Kadane's dynamic programming algorithm executes in O(n) time and O(1) space.",
    "// JS Kadane's Algorithm\nlet maxSoFar = nums[0], currMax = nums[0];\nfor (let i = 1; i < nums.length; i++) {\n  currMax = Math.max(nums[i], currMax + nums[i]);\n  maxSoFar = Math.max(maxSoFar, currMax);\n}",
    "Kadane's algorithm executes in a single pass with O(1) auxiliary space.",
    """use std::cmp::max;

fn max_sub_array(nums: Vec<i32>) -> i32 {
    let mut max_so_far = nums[0];
    let mut current_max = nums[0];

    for &num in nums.iter().skip(1) {
        current_max = max(num, current_max + num);
        max_so_far = max(max_so_far, current_max);
    }

    max_so_far
}

fn main() {
    let nums = vec![-2, 1, -3, 4, -1, 2, 1, -5, 4];
    println!("Maximum subarray sum: {}", max_sub_array(nums));
}""",
    {
        "proTip": "Use `std::cmp::max` for branch-free maximum calculations.",
        "footgun": "Initializing maximums to 0 fails when all array numbers are negative (initialize to `nums[0]`).",
        "archNote": "Iterating with `.skip(1)` cleanly handles the first element initialization without extra branch checks in the loop."
    }
)

# Output chapters.ts and chapterInsights.ts
chapters_ts = f"""export interface Chapter {{
  num: string;
  part: string;
  title: string;
  desc: string;
  nodeCode: string;
  why: string;
  code: string;
}}

export const chaptersData: Record<string, Chapter> = {json.dumps(chapters, indent=2)};
"""

insights_ts = f"""export interface ChapterInsight {{
  proTip: string;
  footgun: string;
  archNote: string;
}}

export const chapterInsights: Record<string, ChapterInsight> = {json.dumps(chapter_insights, indent=2)};
"""

with open("/Users/nadimtuhin/opensource/rust-for-node-devs/src/data/chapters.ts", "w", encoding="utf-8") as f:
    f.write(chapters_ts)

with open("/Users/nadimtuhin/opensource/rust-for-node-devs/src/data/chapterInsights.ts", "w", encoding="utf-8") as f:
    f.write(insights_ts)

# Also generate public JS bundles for direct client-side consumption
with open("/Users/nadimtuhin/opensource/rust-for-node-devs/public/chapters-data.js", "w", encoding="utf-8") as f:
    f.write(f"window.chaptersData = {json.dumps(chapters)};\n")

with open("/Users/nadimtuhin/opensource/rust-for-node-devs/public/chapter-insights.js", "w", encoding="utf-8") as f:
    f.write(f"window.chapterInsights = {json.dumps(chapter_insights)};\n")

print(f"Successfully generated {len(chapters)} progressive Rust chapters and insights!")
