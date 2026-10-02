export const projects = [
  {
    id: "rag",
    number: "01",
    title: "Hybrid RAG pipeline",
    description:
      "Build a system that finds the right evidence and knows when it does not have an answer.",
    level: "After levels 5–12",
    tags: ["Python", "BM25", "Vector search", "Reranking", "Evaluation"],
    why: "The interesting problem is retrieval quality. Show that your hybrid search improves on a dense-only baseline using a fixed evaluation set.",
    steps: [
      "Collect documents you have permission to use; define 20 realistic questions and their expected evidence.",
      "Build ingestion with stable document IDs, metadata, and repeatable chunking.",
      "Implement dense retrieval and BM25 separately, then combine their rankings.",
      "Add reranking and measure whether the relevant passages reach the top results.",
      "Generate answers with source IDs; verify citations resolve to the retrieved evidence.",
      "Add an explicit no-answer path and compare retrieval, correctness, latency, and cost.",
    ],
    acceptance: [
      "Reproducible evaluation script and a documented baseline",
      "Citations that link to actual supporting passages",
      "A no-answer test, a malicious-document test, and latency measurements",
      "README with setup, architecture, limitations, and a small demo",
    ],
    brainstorm:
      "When would keyword search find a result that semantic search misses? How could a citation be valid but still fail to support an answer?",
    first:
      "Start with a tiny document-search program after your API and Python missions. Add one retrieval method before combining them.",
  },
  {
    id: "agents",
    number: "02",
    title: "Agent orchestration system",
    description:
      "Coordinate specialized agents with tools, persistent state, and meaningful human review.",
    level: "After levels 6–15",
    tags: ["Tool use", "Supervisor", "PostgreSQL", "Human review", "Tracing"],
    why: "A useful agent system must recover from errors and respect boundaries. A reliable workflow is more valuable than many agents talking to each other.",
    steps: [
      "Choose one constrained task, such as preparing a support investigation from approved sources.",
      "Implement a supervisor that assigns bounded work to research and validation workers.",
      "Define typed tool inputs, permissions, timeouts, and structured error responses.",
      "Persist run state so a stopped job can resume without repeating completed side effects.",
      "Add a human approval checkpoint before external writes or consequential actions.",
      "Evaluate successful runs, missing information, tool failures, prompt injection, and escalation.",
    ],
    acceptance: [
      "A run trace showing task assignments and tool results",
      "A resume-after-failure demonstration",
      "Human approval required before a sample side effect",
      "An evaluation set covering successful and unsafe requests",
    ],
    brainstorm:
      "Which parts should be deterministic code? What exact decision needs a human? How will you prevent retries from performing the same action twice?",
    first:
      "Begin with a deterministic Python workflow that reads, validates, and summarizes a local task. Add a model only where judgment is useful.",
  },
  {
    id: "gateway",
    number: "03",
    title: "LLM gateway with fallback routing",
    description:
      "Give applications one reliable entry point to models, budgets, and operational visibility.",
    level: "After levels 6–16",
    tags: [
      "FastAPI",
      "Rate limits",
      "Budgets",
      "Circuit breakers",
      "Observability",
    ],
    why: "This project connects software engineering to AI infrastructure. Measure how your gateway behaves when providers fail, slow down, or exceed a budget.",
    steps: [
      "Define a provider-neutral request and response schema; create two mock providers first.",
      "Implement routing and configurable provider fallback with bounded retries and timeouts.",
      "Enforce per-team request limits and reserve budgets before dispatch to prevent overspending races.",
      "Add circuit breakers that stop calls to unhealthy providers and probe for recovery.",
      "Record usage, latency, error rates, routing decisions, and redacted traces.",
      "Run load and failure tests; document streaming behavior and retry/idempotency tradeoffs.",
    ],
    acceptance: [
      "Deterministic tests with provider timeouts and 429/500 responses",
      "Concurrent budget tests that prevent overspending",
      "A circuit-breaker recovery demonstration",
      "A dashboard or report showing latency, usage, and failures",
    ],
    brainstorm:
      "Should a timeout always trigger a retry? What happens when a response starts streaming and then fails? When should you fail closed on an unknown budget?",
    first:
      "After the API mission, write a client that calls two mock services and falls back when the first one fails.",
  },
];
