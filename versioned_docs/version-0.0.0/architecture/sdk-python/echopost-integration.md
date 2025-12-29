# EchoPost Integration

This document describes how the SDK integrates with EchoPost as a local reliability layer.

EchoPost is optional and never treated as a hard dependency.

---

## Purpose of EchoPost

EchoPost acts as a local buffer when the primary server is unavailable.

It allows the SDK to:
- Avoid data loss during outages
- Avoid immediate fallback to remote systems
- Keep communication local and fast

---

## Binary management

EchoPost is managed entirely by the SDK.

### Download logic

On first use:
1. Check if binary exists at `<datanadhi_dir>/echopost/echopost`
2. If not, determine download URL based on platform
3. Download from `https://downloads.datanadhi.com/echopost/{os}/{arch}/echopost-latest`
4. Save to datanadhi directory
5. Set executable permissions (chmod 0o755)

### Supported platforms

| OS | Architecture | Status |
|----|--------------|--------|
| darwin | amd64 | ✓ Supported |
| darwin | arm64 | ✓ Supported |
| linux | amd64 | ✓ Supported |
| linux | arm64 | ✓ Supported |
| windows | * | ✗ Not supported |

### Platform detection

```python
system = platform.system().lower()  # darwin, linux, windows
machine = platform.machine().lower()  # x86_64, amd64, arm64, aarch64

# Map to standard names
if machine in ("x86_64", "amd64"):
    arch = "amd64"
elif machine in ("arm64", "aarch64"):
    arch = "arm64"
```

### Download failure handling

| Error | Action |
|-------|--------|
| Unsupported OS/arch | Set `force_disable_echopost = True`, continue without EchoPost |
| Network error | Set `force_disable_echopost = True`, log warning |
| HTTP error (non-200) | Log error, disable EchoPost |
| Write/permission error | Set `force_disable_echopost = True`, log error |

### File locations

```
<datanadhi_dir>/
├── echopost/
│   ├── echopost                    # Binary
│   └── data-nadhi-agent.sock       # Unix socket
├── config.yml                       # User config
├── .config.resolved.json           # Resolved config
└── rules/
    └── *.yml                        # Rule files
```

---

## Startup behavior

EchoPost is started lazily when needed.

### When EchoPost starts

1. Primary server is down
2. Worker attempts to send log via EchoPost
3. Socket doesn't exist
4. Worker calls `start_if_socket_not_exists()`

### Startup process

```python
def start_if_socket_not_exists(datanadhi_dir, api_key, server_host):
    if socket_exists(datanadhi_dir):
        return True
    
    # Acquire per-directory lock
    with get_start_lock(datanadhi_dir):
        # Double-check after acquiring lock
        if socket_exists(datanadhi_dir):
            return True
        
        # Delete stale socket if exists
        delete_socket_if_exists(datanadhi_dir)
        
        # Start detached process
        subprocess.Popen([
            str(binary_path),
            "-datanadhi", str(echopost_dir),
            "-api-key", api_key,
            "-health-url", server_host
        ], 
        stdout=DEVNULL,
        stderr=DEVNULL,
        stdin=DEVNULL,
        close_fds=True,
        start_new_session=True  # Fully detach from parent
        )
        
    # Wait for socket (timeout: 2 seconds)
    return wait_for_socket(datanadhi_dir, timeout=2.0)
```

### Process isolation

- **One instance per directory**: Protected by per-directory locks
- **Fully detached**: `start_new_session=True` ensures process survives parent exit
- **No stdio**: All streams redirected to DEVNULL
- **Socket-based readiness**: SDK waits for socket creation

### Key properties

- Startup protected by threading.Lock (keyed by directory path)
- Double-check pattern prevents race conditions
- Process is fully daemonized
- 2-second timeout for socket creation
- Stale sockets are cleaned before startup

---

## Communication model

### Protocol

- **Transport**: UNIX domain socket
- **Protocol**: gRPC
- **Socket path**: `<datanadhi_dir>/echopost/data-nadhi-agent.sock`
- **Format**: Protobuf

### gRPC service definition

```protobuf
service LogAgent {
  rpc SendLog(LogRequest) returns (LogResponse);
}

message LogRequest {
  string json_data = 1;   // Serialized log payload
  repeated string pipelines = 2;
  string api_key = 3;
}

message LogResponse {
  bool success = 1;
}
```

### SDK implementation

```python
def send_log_over_unix_grpc(datanadhi_dir, pipelines, payload, api_key):
    socket_path = get_socket_path(datanadhi_dir)
    target = f"unix://{socket_path}"
    
    req = LogRequest(
        json_data=orjson.dumps(payload).decode(),
        pipelines=pipelines,
        api_key=api_key
    )
    
    with grpc.insecure_channel(target) as channel:
        stub = LogAgentStub(channel)
        resp = stub.SendLog(req)
        return resp.success
```

### Benefits

- No TCP ports (reduces attack surface)
- Local-only communication (fast)
- No authentication complexity (file permissions)
- Connection pooling via gRPC channels

---

## Failure handling

If EchoPost:

- Fails to download
- Fails to start
- Fails to accept logs

Then:

- EchoPost is disabled automatically
- Logs fall back to the next delivery strategy
- The SDK continues operating normally

EchoPost failure never crashes the application.