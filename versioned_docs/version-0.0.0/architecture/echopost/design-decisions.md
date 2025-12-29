# Design Decisions

## Why a short-lived agent?
- EchoPost exists only to cover downtime.
- Keeping it alive after replay provides no value.
- A short-lived process reduces memory usage and operational complexity.

## Why local buffering instead of a remote fallback?
- Removes network dependency during failure.
- Lower latency.
- Smaller failure surface area.
- Disk is already available on the host.

## Why PebbleDB?
- Golang-native.
- Low overhead.
- Fast reads during replay.
- Survives crashes without additional recovery logic.

## Why gRPC over REST?
- Lower overhead.
- Persistent connections.
- Better suited for high-frequency writes.

## Why UNIX sockets?
- SDK and EchoPost run on the same machine.
- No port management.
- Faster than TCP loopback.

This limits Windows support, which is acceptable for current targets.