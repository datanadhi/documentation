# Data Usage, Storage, and Operations

This document describes how data is handled inside EchoPost, how storage is used, and what operational behavior looks like during normal and failure scenarios.

This is the authoritative reference for **data safety and runtime behavior**.

---

## Data usage semantics

### Ordering
- Data is written in the order it is received.
- Replay happens in the same order.
- Ordering is preserved across restarts.

### Delivery semantics
- Delivery is **at-least-once**.
- Duplicate delivery is possible and expected.
- Downstream systems must be idempotent.

EchoPost prioritizes **durability over replay speed**.

---

## Local storage model

EchoPost uses **PebbleDB** as a local, embedded storage engine.

### Why PebbleDB fits EchoPost
- Go-native, no external dependencies.
- Low overhead.
- Optimized for sequential reads during replay.
- Data survives crashes without custom recovery logic.

PebbleDB is used strictly as a **temporary persistence layer**, not as a long-term store.

---

## File layout and disk usage

### Storage directory
- EchoPost creates a dedicated working directory on startup.
- All data for a single EchoPost session lives inside this directory.

Typical contents:
- PebbleDB files (SSTables, WALs, metadata)
- Session-specific log files

No data is shared across machines.

---

## PebbleDB lifecycle

### Writes
- Incoming data is written immediately.
- Writes are append-heavy.
- No compaction tuning is done beyond defaults.

### Reads
- Reads happen only during replay.
- Data is read sequentially.

### Deletion
- Records are deleted **only after successful replay**.
- If replay fails or EchoPost crashes, data remains intact.

### Cleanup
- When replay completes and no data remains:
  - PebbleDB is closed
  - The process exits
- Disk cleanup is left to deployment policy.

EchoPost does not run background cleanup after shutdown.

---

## Crash safety

- If EchoPost crashes at any point:
  - No buffered data is deleted
  - PebbleDB remains on disk
- On restart:
  - Existing data is reused
  - Replay resumes from the last known state

Crash recovery is automatic and requires no manual steps.

---

## Storage corruption (explicit definition)

Storage corruption means **one or more of the following**:
- PebbleDB fails to open
- On-disk data fails integrity or checksum validation
- Stored records cannot be decoded

This does **not** include:
- Process crashes
- Power loss
- Partial replay
- Incomplete shutdown

### Behavior on storage corruption
- EchoPost cannot guarantee recovery.
- Replay is aborted.
- Manual intervention is required.

This scenario is expected to be extremely rare.

---

## Logging model

### Per-session logs
- Each EchoPost run is treated as a **single session**.
- Logs are scoped to that session.
- Logs are written to local disk.

### What is logged
- Startup and shutdown
- Replay start and completion
- Fatal errors
- Disk and storage failures

Logs are not persisted beyond the session unless retained externally.

---

## Operational behavior

### Startup
- EchoPost starts when the main server is unavailable.
- A local gRPC server is started over a UNIX socket.
- Data ingestion begins immediately.

### Replay
- Replay starts only after the main server is confirmed healthy.
- Data is replayed in order.
- Failed records are retried.

### Shutdown
- When all buffered data is replayed successfully:
  - EchoPost shuts down gracefully
- EchoPost does not stay idle.

---

## Resource usage

### Memory
- Minimal and short-lived.
- No unbounded growth.

### Disk
- Usage depends on:
  - Downtime duration
  - Data volume
- Disk exhaustion is treated as fatal.

---

## Deployment assumptions
- Linux or macOS environment
- Local disk available
- SDK/application and EchoPost run on the same machine
