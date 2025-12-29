# Rules and Configuration

This document describes how configuration and rules are defined, resolved, and applied inside the SDK.

The SDK treats configuration and rules as inputs, not runtime concerns.
They are resolved once and reused consistently across components.

---

## Configuration sources

Configuration is resolved in the following order (highest priority first):

1. Explicit overrides passed while creating the logger
2. YAML configuration files
3. Environment variables
4. Defaults

Once resolved:

- Configuration is written to disk
- The resolved form is reused
- All components see the same values

---

## Where configuration can be defined

Configuration can be provided in the following ways:

- YAML files under the Data Nadhi directory
- Environment variables
- Explicit overrides passed to the logger

YAML files supported:
```bash
<datanadhi-folder>/config.yml
<datanadhi-folder>/config.yaml
```
Environment variables override YAML values when present.

---

## Supported configuration keys

### Server configuration

| Key | YAML Path | Environment Variable | Default |
| --- | --- | --- | --- |
| server_host | `server.host` | `DATANADHI_SERVER_HOST` | `http://data-nadhi-server:5000` |
| fallback_server_host | `server.fallback_host` | `DATANADHI_FALLBACK_SERVER_HOST` | `http://datanadhi-fallback-server:5001` |

**Note:** Trailing slashes are automatically removed from URLs.

---

### Logging configuration

| Key | YAML Path | Default | Description |
| --- | --- | --- | --- |
| log_level | `log.level` | `INFO` | Application log level (DEBUG/INFO/WARNING/ERROR/CRITICAL) |
| stack_level | `log.stack_level` | `0` | Stack depth adjustment for caller detection (+2 internally) |
| skip_stack | `log.skip_stack` | `0` | Frames to skip for caller info (+4 internally) |
| datanadhi_log_level | `log.datanadhi_log_level` | `INFO` | SDK internal log threshold |

**Note:** Log levels are converted to Python logging constants during resolution.

---

### Async processing configuration

| Key | YAML Path | Environment Variable | Default |
| --- | --- | --- | --- |
| async_queue_size | `async.queue_size` | `DATANADHI_QUEUE_SIZE` | `1000` |
| async_workers | `async.workers` | `DATANADHI_WORKERS` | `2` |
| async_exit_timeout | `async.exit_timeout` | `DATANADHI_EXIT_TIMEOUT` | `5` |

---

### EchoPost configuration

| Key | YAML Path | Default | Description |
| --- | --- | --- | --- |
| echopost_disable | `echopost.disable` | `False` | Disable EchoPost integration |

---

## Configuration resolution

On startup:

1. YAML configuration is loaded if present
2. Environment variables override YAML values
3. Defaults are applied where values are missing
4. Explicit overrides are applied last
5. Log levels are normalized
6. Stack levels are adjusted internally

The resolved configuration is written to:
```bash
<datanadhi-folder>/.config.resolved.json
```
This resolved file is treated as read-only by the SDK.

---

## Rules overview

Rules decide what happens to a log after it is created.

A rule can:

- Enable or disable stdout logging
- Route logs to one or more pipelines

Rules are declarative and order-independent.

---

## Where rules are defined

Rules are defined as YAML files under:
```bash
<datanadhi-folder>/rules/*.yaml
<datanadhi-folder>/rules/*.yml
```
All rule files are loaded and merged at startup.

---

## Rule structure

Rules are defined as YAML lists with the following structure:

```yaml
- name: "error-logs"  # Optional: rule name for documentation
  any_condition_match: false  # Optional: OR logic (default: false for AND)
  conditions:
    - key: "log_record.level"  # Dot notation for nested fields
      type: "exact"            # exact | partial | regex
      value: "ERROR"
      negate: false            # Optional: negate the condition
  stdout: true               # Optional: print to stdout
  pipelines:                 # Optional: list of pipeline IDs
    - "error-pipeline"
    - "alert-pipeline"
```

### Condition types

- **exact**: Exact string match (`value == field_value`)
- **partial**: Substring match (`value in str(field_value)`)
- **regex**: Regular expression match

### Condition matching logic

- **any_condition_match: false** (default): ALL conditions must match (AND logic)
- **any_condition_match: true**: ANY condition must match (OR logic)
- For single-condition rules, `any_condition_match` is automatically set to `true`

### Example rules

```yaml
# Route all ERROR logs to pipeline
- conditions:
    - key: "log_record.level"
      type: "exact"
      value: "ERROR"
  pipelines:
    - "error-handler"

# Multiple conditions with AND logic
- any_condition_match: false
  conditions:
    - key: "context.user.type"
      type: "exact"
      value: "admin"
    - key: "log_record.level"
      type: "exact"
      value: "INFO"
  stdout: true
  pipelines:
    - "admin-audit"

# Multiple conditions with OR logic
- any_condition_match: true
  conditions:
    - key: "log_record.level"
      type: "exact"
      value: "ERROR"
    - key: "log_record.level"
      type: "exact"
      value: "CRITICAL"
  pipelines:
    - "alert-pipeline"

# Negate condition
- conditions:
    - key: "context.user.type"
      type: "exact"
      value: "guest"
      negate: true  # Match everything except guests
  pipelines:
    - "authenticated-logs"

# Regex pattern matching
- conditions:
    - key: "message"
      type: "regex"
      value: "^Database.*error"
  pipelines:
    - "db-errors"
```

---

## Rule actions

A rule can define the following actions:

- **stdout:** Whether the log should be printed to stdout
- **pipelines:** List of pipeline identifiers to trigger

If neither stdout nor pipelines are defined, the rule is ignored.

---

## Rule resolution

On startup:

1. All rule files are loaded
2. Rules are validated
3. Invalid rules are ignored silently
4. Valid rules are normalized
5. Rules are compiled into a resolved form

The resolved rules are written to:
```bash
<datanadhi-folder>/.rules.resolved.json
```
This resolved form is used during runtime for fast evaluation.

---

## Runtime behavior

At runtime:

- Rules are not reloaded
- Rule evaluation is synchronous but lightweight
- The resolved form avoids repeated parsing

If no valid rules are present:

- Pipeline delivery is disabled
- EchoPost is disabled
- Logs default to stdout only