import os
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

# ==========================================
# PART 0: LANGUAGE FUNDAMENTALS
# ==========================================
add_chapter(
    "basic_vars",
    "B1",
    "Part 0: Language Basics",
    "Variables, Immutability & let mut",
    "In JS, variables declared with `let` are mutable by default. In Rust, all variables are immutable by default! You must explicitly opt into mutability using `let mut`. Rust also features compile-time type inference and shadowing.",
    "// In Node.js / JS, let variables are always mutable\nlet count = 10;\ncount += 5; // Mutates freely\n\n// const prevents re-assignment, but not object mutation:\nconst user = { name: 'Alice' };\nuser.name = 'Bob'; // Valid in JS!\nconsole.log({ count, user });",
    "Immutability by default eliminates entire categories of concurrency data races and subtle state mutation bugs before your code even compiles.",
    """fn main() {
    // 1. Immutable by default (cannot be changed)
    let service_name = "AuthWorker";
    println!("Service: {}", service_name);

    // 2. Explicit mutability with `let mut`
    let mut request_count = 0;
    request_count += 1;
    request_count += 5;
    println!("Requests processed: {}", request_count);

    // 3. Variable Shadowing (re-declaring with same name, can even change types!)
    let raw_port = "8080";
    let raw_port: u16 = raw_port.parse().expect("Invalid port");
    println!("Port parsed via shadowing: {}", raw_port);
}""",
    {
        "proTip": "Use variable shadowing instead of dummy temporary names like `port_str` and `port_int`. Shadowing keeps variable names clean.",
        "footgun": "Forgetting that `mut` is required will cause `E0384: cannot assign twice to immutable variable`. The compiler tells you exactly where to add `mut`.",
        "archNote": "Rust immutability is deeply integrated with the borrow checker: multiple threads can read immutable data simultaneously without locks."
    }
)

add_chapter(
    "basic_ownership",
    "B2",
    "Part 0: Language Basics",
    "Ownership, Move Semantics & Affine Types",
    "In JavaScript, objects are garbage collected and passed by reference. In Rust, every value has a single owner. When you assign a heap value to another variable or pass it to a function, ownership moves. The original variable becomes invalid!",
    "// In Node.js, variables hold references to heap objects\nconst user = { username: 'gopher_fan' };\nconst alias = user;\n\n// Both point to the same object in V8's heap\nalias.username = 'rustacean';\nconsole.log(user.username); // 'rustacean' — shared mutable reference!",
    "Single ownership eliminates both manual free() memory leaks AND Garbage Collection pause latency with zero runtime overhead.",
    """fn main() {
    // String is allocated on the heap (pointer + len + capacity)
    let s1 = String::from("hello node devs");

    // Ownership MOVES from s1 to s2!
    let s2 = s1;

    // println!("{}", s1); // COMPILE ERROR! `s1` value used here after move
    println!("s2 owns the string: {}", s2);

    // If you genuinely want a duplicate heap allocation, explicitly .clone()
    let s3 = s2.clone();
    println!("Cloned: s2='{}', s3='{}'", s2, s3);
}""",
    {
        "proTip": "Primitives implementing the `Copy` trait (integers, booleans, floats, fixed arrays) are copied automatically on the stack instead of moving.",
        "footgun": "Calling `.clone()` everywhere silences the compiler but destroys Rust's zero-allocation performance advantage. Use references (&) instead.",
        "archNote": "Rust's affine type system guarantees at compile time that heap resources are freed exactly once when their owner goes out of scope (RAII)."
    }
)

add_chapter(
    "basic_borrowing",
    "B3",
    "Part 0: Language Basics",
    "Borrowing & References (&T vs &mut T)",
    "Instead of moving ownership, you can borrow access using references. Rust enforces the core law of aliasing XOR mutability: you can have either any number of immutable references (&T) OR exactly one mutable reference (&mut T), never both!",
    "// Node.js allows endless shared mutable references\nconst cache = new Map();\nfunction workerA(c) { c.set('k', 1); }\nfunction workerB(c) { c.set('k', 2); }\nworkerA(cache);\nworkerB(cache);\n// In concurrent environments, this causes silent race conditions!",
    "Aliasing XOR Mutability makes data races mathematically impossible at compile time without needing locks for read-only access.",
    """fn calculate_len(s: &String) -> usize {
    // Borrowed immutably — we can read s, but cannot modify it or drop it
    s.len()
}

fn append_suffix(s: &mut String) {
    // Borrowed mutably — exclusive access
    s.push_str(" [PROCESSED]");
}

fn main() {
    let mut message = String::from("Node.js to Rust");

    // Immutable borrow (&T)
    let len = calculate_len(&message);
    println!("Original length: {}", len);

    // Mutable borrow (&mut T)
    append_suffix(&mut message);
    println!("After mutation: {}", message);
}""",
    {
        "proTip": "Prefer string slices `&str` over `&String` in function parameters so callers can pass string literals and heap strings alike.",
        "footgun": "Attempting to create `&mut` while an active `&` reference exists causes `E0502: cannot borrow as mutable because it is also borrowed as immutable`.",
        "archNote": "The Rust compiler tracks reference lifetimes (Non-Lexical Lifetimes, NLL). A borrow ends at its last point of use, not the end of the curly brace scope."
    }
)

add_chapter(
    "basic_structs",
    "B4",
    "Part 0: Language Basics",
    "Structs, impl Blocks & Methods",
    "JavaScript uses ES6 `class` with prototype inheritance. Rust has no classes and no inheritance! Instead, state is modeled with `struct` and behavior is implemented in separate `impl` blocks with explicit `&self` or `&mut self` receivers.",
    "// Node.js ES6 Class\nclass HttpServer {\n  constructor(host, port) {\n    this.host = host;\n    this.port = port;\n  }\n  addr() {\n    return `${this.host}:${this.port}`;\n  }\n}\nconst s = new HttpServer('127.0.0.1', 8080);\nconsole.log(s.addr());",
    "Separating data (struct) from logic (impl) keeps data layouts cache-friendly and contiguous in memory without hidden prototype chains.",
    """#[derive(Debug)]
struct HttpServer {
    host: String,
    port: u16,
    active_connections: u32,
}

impl HttpServer {
    // Associated constructor function (like `new HttpServer(...)` in JS)
    fn new(host: &str, port: u16) -> Self {
        Self {
            host: host.to_string(),
            port,
            active_connections: 0,
        }
    }

    // Method with immutable reference to self
    fn address(&self) -> String {
        format!("{}:{}", self.host, self.port)
    }

    // Method with mutable reference to self
    fn register_connection(&mut self) {
        self.active_connections += 1;
    }
}

fn main() {
    let mut server = HttpServer::new("127.0.0.1", 3000);
    println!("Listening on: {}", server.address());

    server.register_connection();
    server.register_connection();
    println!("Server status: {:?}", server);
}""",
    {
        "proTip": "Use `#[derive(Debug, Clone, PartialEq)]` on your structs to automatically generate common standard utility behaviors.",
        "footgun": "Forgetting `&self` turns a method into an associated function (static method) that cannot be called with dot syntax `server.method()`.",
        "archNote": "Rust structs have zero memory overhead: no vtables, no hidden prototype pointers. A struct with two u32 fields occupies exactly 8 bytes."
    }
)

add_chapter(
    "basic_enums",
    "B5",
    "Part 0: Language Basics",
    "Algebraic Enums & Pattern Matching",
    "TypeScript enums are simple number/string mappings. Rust Enums are full Algebraic Data Types (tagged unions) where each variant can hold different payloads! Combined with exhaustive `match`, they replace polymorphic class hierarchies.",
    "// TypeScript Discriminated Unions\ntype NetworkEvent =\n  | { type: 'connected'; socketId: string }\n  | { type: 'data'; payload: Buffer }\n  | { type: 'disconnected'; code: number };\n\nfunction handle(event) {\n  switch(event.type) {\n    case 'connected': return console.log(event.socketId);\n    // Missing cases cause silent runtime bugs!\n  }\n}",
    "Rust's pattern matching is verified exhaustive by rustc: if you miss a single enum variant, the build fails immediately.",
    """#[derive(Debug)]
enum NetworkEvent {
    Connected(String),               // Holds socket ID
    DataReceived(Vec<u8>),          // Holds raw byte payload
    Disconnected { code: u16, reason: String }, // Struct-like variant
}

fn process_event(event: NetworkEvent) {
    match event {
        NetworkEvent::Connected(id) => {
            println!("Client connected with socket ID: {}", id);
        }
        NetworkEvent::DataReceived(bytes) => {
            println!("Received {} bytes over wire", bytes.len());
        }
        NetworkEvent::Disconnected { code, reason } => {
            println!("Socket closed. Code: {}, Reason: {}", code, reason);
        }
    }
}

fn main() {
    let ev1 = NetworkEvent::Connected("ws-9872".to_string());
    let ev2 = NetworkEvent::DataReceived(vec![0x47, 0x45, 0x54]);
    let ev3 = NetworkEvent::Disconnected { code: 1000, reason: "Normal closure".to_string() };

    process_event(ev1);
    process_event(ev2);
    process_event(ev3);
}""",
    {
        "proTip": "Use `if let NetworkEvent::Connected(id) = event` when you only care about matching a single specific variant without a full match block.",
        "footgun": "Using `_ => {}` catch-all wildcards everywhere defeats the safety of compiler exhaustiveness when new variants are added later.",
        "archNote": "Rust represents enums in memory with a compact discriminant tag byte followed by a union of variant payloads, padded for alignment."
    }
)

add_chapter(
    "basic_option",
    "B6",
    "Part 0: Language Basics",
    "Option<T> — Banishing null & undefined",
    "Tony Hoare called `null` his 'Billion Dollar Mistake'. Rust has no `null`, `nil`, or `undefined`. Instead, optional presence is explicitly wrapped in the `Option<T>` enum: `Some(T)` or `None`. You cannot access the value without unwrapping.",
    "// In Node.js, functions return null or undefined\nfunction findUser(id) {\n  if (id === 1) return { name: 'Alice' };\n  return null;\n}\nconst user = findUser(2);\n// TypeError: Cannot read properties of null (reading 'name')\nconsole.log(user.name);",
    "Option<T> makes null pointer exceptions impossible: you cannot accidentally treat a missing value as if it existed.",
    """fn find_user_by_id(id: u32) -> Option<String> {
    if id == 1 {
        Some(String::from("Alice Admin"))
    } else {
        None
    }
}

fn main() {
    let user1 = find_user_by_id(1);
    let user2 = find_user_by_id(999);

    // 1. Pattern matching Option
    match user1 {
        Some(name) => println!("Found user: {}", name),
        None => println!("User not found"),
    }

    // 2. Safe combinators (like Optional Chaining ?. in JS)
    let display_name = user2.unwrap_or_else(|| String::from("Anonymous Guest"));
    println!("Fallback name: {}", display_name);

    // 3. Mapping inner values (.map)
    let name_len = find_user_by_id(1).map(|u| u.len());
    println!("User name length: {:?}", name_len);
}""",
    {
        "proTip": "Never call `.unwrap()` in production code. Use `.unwrap_or()`, `.unwrap_or_default()`, or pattern match to handle `None` gracefully.",
        "footgun": "Calling `.unwrap()` on a `None` value panics your program at runtime, reverting you to the exact runtime crash behavior of Node.js.",
        "archNote": "Null Pointer Optimization (NPO): For reference types (`&T`, `Box<T>`, `NonNull`), `Option<&T>` has the EXACT same size in memory as a raw C pointer (where 0x0 is None)."
    }
)

add_chapter(
    "basic_result",
    "B7",
    "Part 0: Language Basics",
    "Result<T, E> & the '?' Operator",
    "In Node.js, asynchronous errors reject promises or throw exceptions that crash the process if unhandled. Rust treats recoverable errors as regular values using `Result<Ok(T), Err(E)>`. The `?` operator provides ergonomic error propagation.",
    "// Node.js throw / try-catch pattern\nfunction parseConfig(raw) {\n  if (!raw) throw new Error('Empty payload');\n  return JSON.parse(raw);\n}\ntry {\n  const cfg = parseConfig('{\"port\":8080}');\n} catch (err) {\n  console.error('Failed:', err.message);\n}",
    "Result<T, E> forces explicit error handling at compile time. Functions cannot silently throw invisible exceptions behind your back.",
    """use std::num::ParseIntError;

fn parse_port(port_str: &str) -> Result<u16, ParseIntError> {
    // The '?' operator returns Err early if parse fails, or unwraps Ok(val)
    let port: u16 = port_str.parse()?;
    Ok(port)
}

fn main() {
    let valid_port = parse_port("8080");
    match valid_port {
        Ok(p) => println!("Listening on port: {}", p),
        Err(e) => eprintln!("Configuration error: {}", e),
    }

    let invalid_port = parse_port("not_a_number");
    if let Err(err) = invalid_port {
        println!("Correctly caught invalid port: {}", err);
    }
}""",
    {
        "proTip": "In real-world applications, use crates like `thiserror` for library domain errors and `anyhow` for top-level application error reporting.",
        "footgun": "The `?` operator can only be used in functions whose return type matches the error variant or implements `From<Error>`.",
        "archNote": "Zero overhead: unlike C++ or Java exceptions that unwind stacks and allocate exception objects, Rust Results return simple enum tags in CPU registers."
    }
)

add_chapter(
    "basic_traits",
    "B8",
    "Part 0: Language Basics",
    "Traits & Interfaces (Duck Typing vs Explicit Contracts)",
    "TypeScript interfaces check shapes at runtime via duck typing ('if it walks like a duck'). Rust Traits define shared abstract behavior that types must explicitly implement. Traits power polymorphism, operator overloading, and generic constraints.",
    "// TypeScript structural typing (duck typing)\ninterface Logger {\n  log(msg: string): void;\n}\n\nconst consoleLogger = {\n  log: (msg) => console.log('[LOG]:', msg)\n}; // Implements Logger implicitly!",
    "Explicit trait implementation eliminates unintentional interface matches and enables zero-cost static dispatch via monomorphization.",
    """// Define a trait (behavior contract)
trait Summarizable {
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

// Static dispatch via generics (zero runtime cost!)
fn print_summary<T: Summarizable>(item: &T) {
    println!("Summary: {}", item.summarize());
}

fn main() {
    let article = Article {
        title: String::from("Rust for JavaScript Engineers"),
        author: String::from("Nadim Tuhin"),
    };

    print_summary(&article);
}""",
    {
        "proTip": "Traits can provide default method implementations so implementors only need to supply the core missing functions.",
        "footgun": "The Orphan Rule: you can only implement a trait if either the trait or the target type is defined in your current crate.",
        "archNote": "Static dispatch (`impl Trait` / `<T: Trait>`) is monomorphized into specialized machine code with zero vtable pointer overhead. Dynamic dispatch uses `&dyn Trait`."
    }
)

add_chapter(
    "basic_generics",
    "B9",
    "Part 0: Language Basics",
    "Generics & Monomorphization (Zero-Cost Abstractions)",
    "TypeScript generics are erased during compilation to JavaScript. Rust generics are monomorphized: the compiler generates specialized, dedicated machine code for every concrete type used! There is zero runtime performance penalty.",
    "// TypeScript Generics (erased at runtime)\nfunction wrapInBox<T>(val: T): { value: T } {\n  return { value: val };\n}\nconst numBox = wrapInBox(42);\nconst strBox = wrapInBox('hello');",
    "Zero-cost abstractions: you get generic code reuse with the raw execution speed of hand-written specialized assembly.",
    """// Generic container struct
#[derive(Debug)]
struct ApiResponse<T> {
    status_code: u16,
    payload: T,
}

impl<T> ApiResponse<T> {
    fn ok(payload: T) -> Self {
        Self { status_code: 200, payload }
    }
}

fn main() {
    // Compiler generates specialized ApiResponse_i32 struct
    let int_resp = ApiResponse::ok(42);
    println!("Integer Response: {:?}", int_resp);

    // Compiler generates specialized ApiResponse_String struct
    let str_resp = ApiResponse::ok(String::from("System operational"));
    println!("String Response: {:?}", str_resp);
}""",
    {
        "proTip": "Use `where` clauses when generic trait bounds get long and complex to keep function signatures readable.",
        "footgun": "Heavy monomorphization can increase binary size ('code bloat') and compile times. For large binary reductions, consider `dyn Trait`.",
        "archNote": "Because monomorphized types are fully known to LLVM at compile time, the optimizer can aggressively inline function calls across trait boundaries."
    }
)

add_chapter(
    "basic_lifetimes",
    "B10",
    "Part 0: Language Basics",
    "Lifetimes Explained for JavaScript Developers",
    "In Node.js, V8 keeps objects alive as long as any reference exists. In Rust, the borrow checker verifies at compile time that no reference ever outlives the data it points to! Lifetime annotations (`'a`) do not change runtime duration; they declare relationships to the compiler.",
    "// In JS, closures hold references indefinitely without dangling pointers\nfunction getGreeter() {\n  const message = 'Hello';\n  return () => console.log(message);\n}\nconst greet = getGreeter();\ngreet(); // Garbage collector kept `message` alive!",
    "Lifetimes prevent dangling pointer bugs (use-after-free) entirely at compile time without requiring a garbage collector to inspect the heap.",
    """// 'a indicates that the returned reference lives as long as the shorter input
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() {
        x
    } else {
        y
    }
}

fn main() {
    let string1 = String::from("short");
    let string2 = String::from("substantially longer string");

    let result = longest(string1.as_str(), string2.as_str());
    println!("The longest string is: '{}'", result);
}""",
    {
        "proTip": "Lifetime Elision Rules: the Rust compiler automatically infers lifetimes for simple function signatures. You only annotate when multiple references interact.",
        "footgun": "Trying to return a reference to a local variable created inside a function (`&local_val`) causes `E0515: cannot return value referencing local variable`. Return owned values (`String`, `Vec`) instead!",
        "archNote": "Lifetimes have zero runtime representation. They exist solely inside the compiler's borrow checker phase and are stripped before code generation."
    }
)

# Continue writing parts 1 to 7...
