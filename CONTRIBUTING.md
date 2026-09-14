# Contributing to @purecore/aon

Thank you for your interest in contributing to **@purecore/aon**! This project is the official reference implementation of the **Adaptive Observability Negotiation Protocol (AONP v1.0.0)** and the **CrystalBox Interactive Healing** runtime engine.

## Code of Conduct

All contributors are expected to adhere to our [Code of Conduct](./CODE_OF_CONDUCT.md).

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher (Node 20+ recommended)
- `npm`, `pnpm`, or `bun`
- Jujutsu (`jj`) or Git for version control

### Development Setup

1. Fork and clone the repository:
   ```bash
   git clone https://github.com/purecore/aon.git
   cd aon
   ```

2. If using Jujutsu (recommended by our team):
   ```bash
   jj git init --colocated
   ```

3. Install development dependencies:
   ```bash
   npm install
   ```

4. Verify build and tests:
   ```bash
   npm run typecheck
   npm run test
   npm run build
   ```

## Development Guidelines

### Zero Runtime Dependencies Principle

The `@purecore/aon` core package enforces a **strict zero-runtime-dependency** policy.
- All core HTTP parsing, stream writing, and healing coordination MUST rely exclusively on standard Node.js libraries (`node:http`, `node:crypto`, `node:stream`).
- Do not introduce third-party runtime dependencies into the core package.
- Framework-specific adapters (Express, Fastify, Hono) should either be lightweight optional peer integrations or isolated sub-modules.

### RFC Conformance

Any change affecting the wire protocol or event serialization must conform to:
- [RFC-0001: Adaptive Observability Negotiation Protocol (AONP)](./docs/AONP.md)
- [RFC-0004: Observability Modes & CrystalBox Specification](./docs/Observability.modes.md)
- [RFC-0005: Interactive Runtime Healing Specification](./docs/InteractiveHealing.md)

### Code Style & Types

- Strict TypeScript with no implicit `any`.
- Keep exports clean and explicit in `index.ts`.
- Document all public classes, functions, and interfaces with clear JSDoc comments.

### Running Tests

We use Node.js's built-in native test runner (`node:test`):

```bash
# Run all tests
npm test

# Run a single test file
node --test --import tsx test/aon-stream.test.ts
```

## Pull Request Process

1. Create a descriptive branch or Jujutsu change:
   ```bash
   jj new -m "feat(stream): add custom backpressure buffer threshold"
   ```
2. Ensure `npm run typecheck` and `npm test` pass with 100% success.
3. Submit your pull request with:
   - Clear summary of the problem and solution.
   - Reference to any related GitHub issues or RFC sections.
   - New unit tests covering any bug fix or new feature.
