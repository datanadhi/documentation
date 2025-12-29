# Async Processing

This document explains how and why the SDK performs log delivery asynchronously.

The async processor exists to ensure that logging never blocks user code, regardless of network conditions or server availability.

---

## Why async processing is required

Directly sending logs from the logging call would:

- Block application threads
- Introduce unpredictable latency
- Amplify failures during network issues
- Make logging unsafe in hot paths

The SDK explicitly avoids this.

---

## High-level model

Once a log is evaluated against rules and marked for pipeline delivery:

- It is placed into an internal queue
- Control returns immediately to the caller
- Delivery happens in background worker threads

This guarantees consistent logging latency.

---

## Processor isolation

Each Data Nadhi directory owns exactly one async processor instance.

Queues, worker threads, drain workers, and health monitors are never shared
across directories.

The async processor is created on demand and cached per directory.
Requests for the same directory always return the same processor instance.

Backpressure, queue saturation, or delivery failures in one directory do not
impact async processing in any other directory.

---

## Internal queue (SafeQueue)

The async processor uses a `SafeQueue`, a wrapper around Python's `Queue` with additional features.

### Key properties

- **Fixed maximum size**: Configurable via `async_queue_size` (default: 1000)
- **Non-blocking enqueue**: Returns `True`/`False` immediately
- **Batch reads**: `get_batch(n)` retrieves up to n items at once
- **Writeback buffer**: Failed items can be requeued without blocking
- **Fill tracking**: `fill_percentage()` returns queue utilization (0.0 to 1.0+)

### API

```python
queue = SafeQueue(maxsize=1000)

# Add item (returns False if full)
success = queue.add((pipelines, payload))

# Get single item (returns None if empty)
item = queue.get(timeout=1.0)

# Get batch of items
items = queue.get_batch(100)

# Writeback failed items
queue.writeback_batch(items)

# Check fill percentage
fill_pct = queue.fill_percentage()  # 0.0 - 1.0+
```

### Writeback buffer

When items are written back but the queue is full:
- Items are stored in an internal `_writeback_buffer`
- The buffer is drained opportunistically when space becomes available
- Fill percentage can exceed 100% when buffer has items
- This prevents item loss during transient failures

### Behavior when full

- `add()` returns `False` immediately
- No blocking or exceptions
- Application continues unaffected
- Prevents unbounded memory growth

---

## Worker threads

A fixed number of daemon worker threads are started at initialization (default: 2, configurable via `async_workers`).

### Worker lifecycle

1. Started as daemon threads when AsyncProcessor is created
2. Run continuously until shutdown signal
3. Each worker maintains its own `requests.Session` for connection pooling

### Worker loop

```python
while not shutdown:
    item = queue.get(timeout=1.0)
    if item is None:
        continue
    
    # Route based on primary server health
    if primary_server_is_up:
        send_to_primary(item)
    else:
        if echopost_disabled:
            send_to_fallback_server(item)
        else:
            send_to_echopost(item)
```

### Routing logic

1. **Primary server healthy**: Send to primary via HTTP POST
2. **Primary server down**:
   - If EchoPost enabled: Send to EchoPost (local Unix socket)
   - If EchoPost disabled: Send to fallback server (batch HTTP POST)

### Error handling

- **Success**: Mark item as done
- **Server unavailable**: Requeue item, mark server unhealthy
- **Client/server error** (4xx/5xx): Drop item, store to disk
- **Exception**: Log error, mark item as done to prevent blocking

---

## Backpressure and overflow handling

The queue tracks its fill percentage continuously.

### Drain worker activation

When queue reaches **90% capacity**:
1. Drain worker automatically starts (if not already running)
2. Drains queue in batches of 100 to fallback server
3. Continues until queue drops to **10% capacity**
4. Dies automatically after draining completes

### How it works

```python
if queue.fill_percentage() >= 0.90:
    start_drain_worker()

# Drain worker loop
while queue.fill_percentage() > 0.10:
    items = queue.get_batch(100)
    send_batch_to_fallback(items)
```

### Benefits

- Prevents queue saturation under load
- Automatic without manual intervention
- Uses batch uploads for efficiency
- Falls back to drain worker's own error handling

### Graceful degradation

Under sustained overload:
1. Queue fills to 90%
2. Drain worker activates
3. If fallback server also fails, items may be dropped
4. Dropped items are stored to disk for later recovery

This prevents unbounded memory growth and application blocking.

---

## Why not direct threading per log

Spawning threads per log would:

- Create unbounded concurrency
- Increase memory pressure
- Complicate retry and recovery logic
- Make backpressure impossible

The queue-based model provides control, observability, and safety.