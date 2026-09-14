# Adaptive Observability & Runtime Healing (AON)

Protocol specifications and runtime abstractions enabling HTTP APIs to adaptively stream execution telemetry and orchestrate collaborative self-healing with autonomous agents and human responders.

## Language

### Protocol & Observability Modes

**Adaptive Observability Negotiation (AON)**:
A content-negotiation mechanism that allows HTTP clients to dynamically select between silent execution and real-time telemetry streaming over a single connection.
_Avoid_: dynamic logging, stream negotiation

**Black Box Mode**:
A standard REST request-response mode where execution details remain internal and only a single terminal payload is returned.
_Avoid_: silent mode, legacy mode, opaque mode

**Glass Box Mode**:
A unidirectional streaming mode that emits real-time telemetry, heuristic decisions, and automated self-healing events as newline-delimited JSON.
_Avoid_: telemetry mode, debug stream, verbose mode

**CrystalBox Mode**:
An interactive bidirectional observability mode supporting Early Hints (103) and runtime intervention by humans or supervisor agents when automated healing stalls.
_Avoid_: interactive mode, debug box, live-fix mode

### Healing & Cognitive Semantics

**Self-Healing**:
An autonomous corrective action performed by the server to remediate transient faults or contract deviations before rejecting a request.
_Avoid_: retry logic, error recovery, auto-fix

**Interactive Healing**:
A collaborative runtime recovery process that pauses request execution to solicit corrective input from a designated human or agent responder.
_Avoid_: manual override, human approval, breakpoint

**Human-Dev-in-the-loop**:
A technical intervention pathway targeting software developers or site reliability engineers for infrastructure and code-level faults.
_Avoid_: developer alert, on-call ticket, tech override

**Human-User-in-the-loop**:
A domain-level intervention pathway targeting business operators or product owners for policy, risk, or transactional decisions.
_Avoid_: user prompt, business approval, operator review

**Intent Analysis**:
A server-side semantic evaluation that infers the client's objective to correct syntax errors, path typos, or schema mismatches before execution.
_Avoid_: request parsing, input normalization, fuzzy dispatch

### Telemetry Stream Events

**Status Event**:
A non-terminal heartbeat chunk conveying operational progress and estimated latency to prevent client-side timeouts.
_Avoid_: ping, keep-alive chunk, progress bar

**Terminal Event**:
The final event in an AON stream (`result` or `error`) that signals execution completion immediately prior to socket closure.
_Avoid_: end chunk, final response, exit event
