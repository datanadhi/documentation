# Delivery Strategy

This document explains how logs are routed and delivered once they leave the logging path.

The SDK follows a strict and deterministic delivery order.

---

## Delivery order

Logs are delivered in the following priority order:

1. Primary server
2. EchoPost
3. Fallback server
4. Drop with persistence

Each step exists to reduce data loss while maintaining system stability.

---

## Primary server delivery

The primary server is always the first choice.

### Endpoint and protocol

- **URL**: Configured via `server.host` or `DATANADHI_SERVER_HOST`
- **Endpoint**: `POST /log`
- **Format**: JSON with `pipelines` and `log_data`
- **Authentication**: `DATANADHI_API_KEY` header
- **Timeout**: 10 seconds

### Request format

```json
{
  "pipelines": ["pipeline-id-1", "pipeline-id-2"],
  "log_data": {
    "message": "...",
    "trace_id": "...",
    "timestamp": "...",
    "module_name": "...",
    "log_record": { ... },
    "context": { ... }
  }
}
```

### Response handling

| Status Code | Action |
|-------------|--------|
| 2xx | Success - mark item as done |
| 3xx-5xx | Failure - drop item, store to disk |
| 5xx+ | Unavailable - requeue item, mark server unhealthy |
| Timeout/Connection error | Unavailable - requeue item, mark server unhealthy |

### Health monitoring

When marked unhealthy:
1. Background health check thread starts
2. Checks `GET /` every 500ms
3. When server responds with 2xx, marks healthy
4. Routing automatically resumes

---

## EchoPost delivery

EchoPost is used only when the primary server is unavailable.

Behavior:

- Logs are sent locally over gRPC
- EchoPost buffers logs on disk
- Logs are replayed later by EchoPost

If EchoPost fails:
- It is disabled
- Logs move to fallback delivery

---

## Fallback server delivery

The fallback server is used when:
1. Primary server is down AND
2. EchoPost is disabled

### Endpoint and protocol

- **URL**: Configured via `server.fallback_host` or `DATANADHI_FALLBACK_SERVER_HOST`
- **Endpoint**: `POST /upload`
- **Format**: Gzipped JSONL (JSON Lines)
- **Authentication**: `DATANADHI_API_KEY` header
- **Timeout**: 30 seconds (longer for batch)
- **Batch size**: Up to 100 items per request

### Batch format

The worker collects up to 100 items and sends them as compressed JSONL:

```python
# Each line is one log entry
{"pipelines": [...], "log_data": {...}}\n
{"pipelines": [...], "log_data": {...}}\n
# Compressed with gzip, sent as application/octet-stream
```

### Response handling

| Status Code | Action |
|-------------|--------|
| 2xx | Success - mark all items as done |
| 3xx-5xx | Failure - drop batch, store to disk |
| 5xx+ | Unavailable - requeue batch, mark server unhealthy |
| Timeout/Connection error | Unavailable - requeue batch |

### Batching logic

When a worker sends to fallback:
1. Takes first item from queue
2. Calls `queue.get_batch(99)` to get up to 99 more
3. Sends all as a single compressed batch
4. Marks all as done on success

---

## Drain worker

When the async queue reaches 90% capacity:

- A drain worker is started automatically
- Logs are drained in batches to the fallback server
- Draining continues until the queue drops to 10%
- The drain worker exits when finished

The drain worker exists purely for overload protection.

---

## Health monitoring

Health is tracked independently for primary and fallback servers using `ServerHealthMonitor`.

### Implementation

```python
class ServerHealthMonitor:
    # Track health state
    _is_healthy = {"server_url": True, "fallback:server_url": True}
    
    # Active health check threads
    _check_threads = {}
```

### Health state transitions

**Mark server as down:**
1. Worker encounters unavailability (5xx, timeout, connection error)
2. Calls `health_monitor.set_health_down(server_host)`
3. Monitor spawns daemon health check thread

**Health check loop:**
```python
while True:
    sleep(0.5)
    if check_server_health(server_host):  # GET /
        mark_server_healthy()
        break  # Exit thread
```

**Automatic recovery:**
- Workers check `health_monitor.is_server_up(server)` before routing
- When health check succeeds, routing resumes immediately
- No manual intervention required

### Key properties

- Primary and fallback servers tracked separately
- Each server gets its own health check thread
- Health check threads are daemon (don't block shutdown)
- Single check thread per server (protected by lock)
- Polling interval: 500ms
- Timeout: 2 seconds per check
