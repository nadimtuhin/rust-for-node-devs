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
    "nodeCode": "// Node.js objects have shared reference semantics\nconst user = { name: 'Alice' };
