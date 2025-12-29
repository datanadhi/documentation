# Error Handling & Failure Modes

This section defines **what failures mean** and **how EchoPost behaves**.

## Main server unavailable
- EchoPost starts.
- All incoming data is buffered locally.
- No data is dropped.

## Main server becomes available
- Replay starts automatically.
- Data is replayed in order.
- Successfully replayed records are deleted.

## EchoPost crash
- No buffered data is deleted.
- On restart, EchoPost resumes from existing storage.

## Replay failure
- Failed records are retried.
- Replay continues until success or shutdown.

## Disk full
- New data cannot be accepted.
- This is treated as a **fatal condition**.
- Errors are surfaced through logs.

## Storage corruption (definition)
Storage corruption means **one or more of the following**:
- PebbleDB cannot be opened.
- Stored records cannot be decoded.
- On-disk data fails checksum or integrity checks.

This does **not** include:
- Process crashes
- Power loss
- Partial replay

### Behavior on storage corruption
- EchoPost cannot guarantee recovery.
- Replay is aborted.
- Manual intervention is required.

This scenario is expected to be extremely rare.