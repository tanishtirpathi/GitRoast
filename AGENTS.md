<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AI Platform Build Plan (No-Code Roadmap)

## Objective
Build a reliable voice-first AI assistant platform in 7 stages:
1. Basic backend
2. Basic Gemini prompt send/receive
3. Gemini asks follow-up questions
4. Real-time conversation flow over WebSockets
5. Speech-to-text
6. Send transcribed text to Gemini
7. Text-to-speech for Gemini responses

## Recommended Architecture (Best Way)

### Core Services
- API Service: REST endpoints for health, session creation, auth, and configuration.
- Realtime Gateway: WebSocket service for low-latency streaming events.
- AI Orchestrator: Manages prompt construction, context memory, tool policies, and Gemini calls.
- Voice Pipeline:
	- STT Processor: Converts user audio stream to text.
	- TTS Processor: Converts Gemini text output into playable audio chunks.
- Session Store: Tracks conversation state, user metadata, and message history.
- Observability Layer: Structured logs, metrics, traces, and alerting.

### Event-Driven Flow
- Client audio/text input enters via WebSocket events.
- Server normalizes input into a single conversation event model.
- Orchestrator updates session memory and calls Gemini.
- Gemini response is emitted as text chunks and optionally TTS audio chunks.
- Client receives incremental updates for smooth real-time UX.

### Why this is the best approach
- Separation of concerns keeps each component simple and testable.
- Unified event model supports both text and voice without duplicated logic.
- WebSockets reduce latency and support partial/streaming responses.
- Central orchestration makes behavior control, safety, and analytics easier.

## Step-by-Step Delivery Plan

## Step 1: Basic Backend
### Goal
Stand up a stable backend foundation before AI/voice complexity.

### Deliverables
- Health and readiness endpoints.
- Environment/config validation.
- Error handling strategy (typed errors + safe user messages).
- Logging baseline with request IDs.
- Session management abstraction (in-memory first, persistent later).

### Quality Gate
- API boots in all target environments.
- Basic endpoint tests pass.
- Logs clearly show request lifecycle and failures.

## Step 2: Basic Gemini Prompt Send and Receive
### Goal
Send a user message to Gemini and return a response deterministically.

### Deliverables
- One orchestrator entrypoint: `processUserMessage(sessionId, message)`.
- Prompt template with system instructions and minimal context.
- Retry + timeout + fallback handling for model/API failures.
- Token and latency tracking for each request.

### Quality Gate
- Round-trip reliability under normal load.
- Clean failure responses when provider is unavailable.

## Step 3: Gemini Asks Future Questions
### Goal
Enable proactive follow-up questions that move conversation forward.

### Best Practice
- Add a dialogue policy layer between app and model:
	- Ask a follow-up when user intent is unclear.
	- Ask one question at a time.
	- Prioritize high-value clarifications.
	- Avoid repetitive questions if already answered in history.

### Deliverables
- Conversation state labels (e.g., `new`, `clarifying`, `executing`, `complete`).
- Follow-up question rubric and constraints.
- Guardrails to prevent question loops.

### Quality Gate
- Assistant asks relevant follow-ups in ambiguous cases.
- No repeated question loops across 5+ turns.

## Step 4: Real-Time Conversation with WebSockets
### Goal
Move from request/response to streaming, low-latency interaction.

### WebSocket Event Contract
- `session.start`
- `user.text`
- `user.audio.chunk`
- `assistant.text.chunk`
- `assistant.text.done`
- `assistant.audio.chunk`
- `assistant.audio.done`
- `error`
- `session.end`

### Best Practice
- Use acknowledgments and sequence IDs.
- Add heartbeat/ping handling.
- Keep messages small and chunked.
- Design idempotent event processing for reconnect safety.

### Quality Gate
- Stable reconnect behavior.
- End-to-end streaming with no ordering corruption.

## Step 5: Speech-to-Text
### Goal
Convert user speech to text accurately and quickly.

### Best Practice
- Use streaming STT for responsive UX.
- Support interim and final transcripts.
- Add voice activity detection (VAD) to detect turn boundaries.
- Include language/accent configuration.

### Deliverables
- Audio format standardization pipeline.
- STT confidence scoring.
- Transcript normalization (punctuation/casing cleanup).

### Quality Gate
- Acceptable word error rate for target users.
- Turn boundary detection works in noisy real-world samples.

## Step 6: Send STT Output to Gemini
### Goal
Bridge voice input into the existing text AI pipeline.

### Best Practice
- Keep one canonical input path: all user input becomes text events.
- Annotate messages with metadata (`source=voice`, confidence, timestamps).
- If confidence is low, ask user for confirmation before important actions.

### Quality Gate
- Voice turns produce same quality output as typed turns.
- Low-confidence transcripts are handled safely.

## Step 7: Text-to-Speech for Gemini Responses
### Goal
Return Gemini output as natural, low-latency speech.

### Best Practice
- Stream TTS incrementally as text chunks complete.
- Maintain sentence-aware chunking for natural prosody.
- Support interruption/barge-in (user speaks while assistant speaks).
- Keep selectable voice profiles but default to one consistent voice.

### Quality Gate
- Speech starts quickly and sounds coherent.
- Barge-in cleanly stops current playback and resumes new turn.

## Cross-Cutting Production Standards

### Security
- Strict secret management and key rotation.
- AuthN/AuthZ for all session endpoints.
- Input validation and payload size limits.

### Reliability
- Timeouts, retries with backoff, circuit breakers.
- Graceful degradation when STT/TTS/LLM provider fails.
- Queueing/backpressure protection during spikes.

### Observability
- Metrics: latency, error rate, tokens, STT confidence, TTS start delay.
- Tracing across websocket event -> orchestrator -> provider calls.
- Conversation-level diagnostics for debugging failures.

### Cost Control
- Token budgeting and context truncation policy.
- Cache repetitive system/context components.
- Tiered model strategy (fast model for simple turns, stronger model for complex turns).

## Suggested Milestones
1. Foundation Milestone: Step 1 completed with tests and logs.
2. AI Text Milestone: Steps 2-3 completed and stable in multi-turn chat.
3. Realtime Milestone: Step 4 completed with resilient socket sessions.
4. Voice Input Milestone: Steps 5-6 completed with reliable transcripts.
5. Voice Output Milestone: Step 7 completed with natural streaming playback.
6. Production Hardening: security, load testing, monitoring, and failure drills.

## Execution Notes for This Repo
- Keep backend and frontend loosely coupled via explicit API and event contracts.
- Define schemas early for REST payloads and WebSocket events to avoid integration drift.
- Validate each milestone with measurable latency and quality targets before moving ahead.
