# Error Handling

This document describes how the SDK handles and surfaces errors.

The SDK treats errors as observable events, not silent failures.

---

## Internal SDK errors

The SDK logs its own errors using the same logging system exposed to users.

### Internal trace IDs

SDK internal logs use predictable trace IDs:
```python
f"datanadhi-internal-{module_name}"
f"datanadhi-async-worker"
f"datanadhi-drain-worker"
f"datanadhi-health-monitor"
```

This allows filtering SDK logs from application logs.

### Log level filtering

SDK has a separate log level threshold: `datanadhi_log_level` (default: INFO)

```python
def can_log(self, incoming_level: int):
    return incoming_level > self.config["datanadhi_log_level"]

# Only log SDK errors if they exceed threshold
if _datanadhi_internal and self.can_log(logging.WARNING):
    self.logger.warning("SDK warning", ...)
```

### Example SDK logs

**No rules configured:**
```python
logger.warning(
    "No rules set! Defaulting to stdout True",
    context={
        "reason": "Rules Empty",
        "datanadhi_dir": str(datanadhi_dir),
    },
    trace_id="datanadhi-internal-my_app",
    _datanadhi_internal=True,
)
```

**EchoPost binary download failed:**
```python
logger.warning(
    "Unable to download EchoPost binary",
    context={"type": "network_error", "detail": "..."},
    trace_id="datanadhi-internal-my_app",
    _datanadhi_internal=True,
)
```

**Worker errors:**
```python
logger.error(
    "Worker error",
    context={"error": str(e)},
    trace_id="datanadhi-async-worker",
    _datanadhi_internal=True,
)
```

### Properties

- SDK errors never interfere with user logs
- Always include structured context
- Respect dedicated log level threshold
- Use predictable trace IDs for filtering

---

## SDK log level

The SDK has a separate internal log level.

This allows users to:

- See SDK errors and warnings
- Filter SDK noise independently
- Debug delivery and configuration issues

SDK logs are never hidden silently.

---

## Error propagation

Errors inside the SDK:

- Are logged to the user's logging system
- Do not raise exceptions in user code  
- Do not break application execution

Delivery failures are isolated from logging calls.

### Exception handling patterns

**Rule evaluation:**
```python
try:
    pipelines, stdout = evaluate_rules(log_dict, rules)
except Exception:
    # Silently return empty on evaluation error
    return [], False
```

**Worker loops:**
```python
try:
    while not shutdown:
        item = queue.get()
        process_item(item)
except Exception as e:
    logger.error(
        "Worker error",
        context={"error": str(e)},
        _datanadhi_internal=True,
    )
finally:
    session.close()
```

**EchoPost communication:**
```python
try:
    sent = send_log_over_unix_grpc(...)
    if sent:
        queue.task_done()
    else:
        queue.writeback_batch([item])
except Exception as e:
    logger.error("Echopost error", ...)
    queue.writeback_batch([item])
```

### Key principles

- Exceptions caught at boundaries
- Errors logged, never raised to user
- Failed items requeued or dropped
- Application continues unaffected

---

## Failure isolation and data persistence

The SDK is designed so that:

- Logging continues even during partial failure
- Delivery failures do not cascade  
- Recovery is automatic when possible

Data loss is explicit and treated as a last resort.

### Dropped data handling

When items are permanently dropped, they are stored to disk for later recovery:

```python
from datanadhi.utils.files import store_dropped_data

file_path = store_dropped_data(
    datanadhi_dir,
    items,  # List of (pipelines, payload) tuples
    reason  # "primary_failed", "fallback_failed", "drain_worker_failed"
)
```

### Storage format

```
<datanadhi_dir>/.dropped/
├── primary_failed_20250129_143022_abc123.json
├── fallback_failed_20250129_143025_def456.json
└── drain_worker_failed_20250129_143030_ghi789.json
```

Each file contains:
```json
{
  "timestamp": "2025-01-29T14:30:22Z",
  "reason": "primary_failed",
  "items": [
    {
      "pipelines": ["pipeline-1"],
      "log_data": { ... }
    }
  ]
}
```

### When data is dropped

| Scenario | Action |
|----------|--------|
| Primary server 4xx/5xx error | Drop + store to disk |
| Fallback server 4xx/5xx error | Drop + store to disk |
| Drain worker send failed | Drop + store to disk |
| Queue full on submit | Return False, log not submitted |
| Exception in worker | Drop + mark done (prevents blocking) |

### Recovery

Dropped data files can be:
- Manually replayed via scripts
- Ingested via batch upload endpoints
- Used for debugging and auditing

---

## Design intent

Errors should be:

- Visible
- Structured
- Non-blocking
- Recoverable

The SDK favors correctness and observability over aggressive retries.