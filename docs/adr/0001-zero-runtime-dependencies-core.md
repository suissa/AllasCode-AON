# Zero Runtime Dependencies for Core AON Protocol

We decided to implement `@allascode.institute/aon` with zero external runtime dependencies, relying exclusively on Node.js standard library primitives (`node:http`, `node:crypto`).

## Context & Problem

Observability and self-healing middleware intercept mission-critical request lifecycles. Coupling the core library to specific web frameworks (e.g., Express, Fastify) or heavy telemetry SDKs (e.g., OpenTelemetry) introduces transitive dependency bloat, version drift, security vulnerabilities, and prevents adoption in alternative runtimes like Bun, Deno, or minimal microservices.

## Decision

The core protocol negotiation (`Accept` header handling, chunked NDJSON streaming, and self-healing event emission) operates directly over Node's native `http.IncomingMessage` and `http.ServerResponse`. Framework adapters (Express, Fastify, Hono) are provided as zero-cost type abstractions and thin wrappers rather than required runtime dependencies.

## Consequences

- **Universal Portability**: Consumable in any Node.js 18+ application, Bun, Deno, or edge container.
- **Zero Supply-Chain Attack Surface**: No external production packages to audit, update, or suffer CVE compromises from.
- **High Performance**: Minimal overhead during hot-path HTTP request handling.
