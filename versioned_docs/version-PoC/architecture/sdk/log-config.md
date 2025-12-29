# Log Config - SDK

The Log Config controls what flows into Data Nadhi and what gets printed to your standard output.

It defines **rules and actions** — each rule decides what happens to a specific log entry (e.g., print to stdout, send to a pipeline).

---

## Structure

```yaml
rules:
  - name: info-to-stdout
    conditions:
      - key: "log_record.level"
        type: "exact"
        value: "INFO"
    stdout: true
  - name: error-warn-to-pipeline
    any_condition_match: true
    conditions:
      - key: "log_record.level"
        type: "exact"
        value: "ERROR"
      - key: "log_record.level"
        type: "exact"
        value: "WARN"
    stdout: true
    pipelines:
    - test-pipeline-1
    - test-pipeline-2
```

Think of the log config as a list of rule–action pairs — each one can make its own decision.

There's a top-level key called `rules` so we can extend the config later (global settings) with minimal changes.

---

## Parts of a Rule

### `name`
- Just for readability and easier identification.
- Doesn't affect behavior.

### `conditions`
- Define when the rule should match.
- Each condition has:
    - **`key`:** Dot-separated path to a field in `log_data`
    - **`type`:** Comparison type (`exact`, `partial`, or `regex`)
    - **`value`:** The value to match against
- **Types:**
    - **`exact`** → Value must match exactly
    - **`partial`** → Value is a substring
    - **`regex`** → Match using a regular expression
- By default **all conditions must pass** for the rule to match.

### `any_condition_match`
- When `true`, any one condition passing is enough.
- Defaults to `false` (AND behavior).

### `stdout`
- One of the two available actions.
- Decides if the log should be written to stdout.

### `pipelines`
- The second available action.
- A list of pipeline codes to trigger when the rule passes.
- If omitted, no pipelines are triggered for that rule.

---

## Design Decisions
- `any_condition_match` defaults to `false`
- `stdout` defaults to `false`
- If any rule passes with `stdout: true`, the log will be printed
- Duplicate pipelines across multiple matching rules trigger only once
- Keys in conditions are assumed to be strings
- You can have multiple config files in the config directory — all rules are automatically combined and evaluated

---

## Some common examples

### 1. Just log `INFO` and `ERROR` always to `stdout`

```yaml
rules:
  - name: info-to-stdout
    any_condition_match: true
    conditions:
      - key: "log_record.level"
        type: "exact"
        value: "INFO"
      - key: "log_record.level"
        type: "exact"
        value: "ERROR"
    stdout: true
```
Logs both INFO and ERROR messages to the console, ignoring everything else.

---

### 2. Send only application errors to a pipeline

```yaml
rules:
  - name: send-app-errors
    conditions:
      - key: "context.app_name"
        type: "exact"
        value: "user-service"
      - key: "log_record.level"
        type: "exact"
        value: "ERROR"
    pipelines:
      - user-error-pipeline
```
Logs from the `user-service` app with level `ERROR` are sent to the `user-error-pipeline`.

---

### 3. Match nested data and log warnings to both stdout and pipeline

```yaml
rules:
  - name: warning-rule
    conditions:
      - key: "context.request.status_code"
        type: "exact"
        value: "429"
      - key: "log_record.level"
        type: "exact"
        value: "WARN"
    stdout: true
    pipelines:
      - throttling-pipeline
```
Triggers when the status code is `429` (too many requests) and level is `WARN`.

---

### 4. Using Regex for pattern-based matching

```yaml
rules:
  - name: match-login-errors
    conditions:
      - key: "message"
        type: "regex"
        value: ".*(login failed|invalid credentials).*"
      - key: "log_record.level"
        type: "exact"
        value: "ERROR"
    pipelines:
      - auth-alerts
```
This rule catches any log messages containing “login failed” or “invalid credentials” and sends them to the `auth-alerts` pipeline.

---

### 5. Using multiple rules together

```yaml
rules:
  - name: info-to-stdout
    conditions:
      - key: "log_record.level"
        type: "exact"
        value: "INFO"
    stdout: true

  - name: error-to-both
    conditions:
      - key: "log_record.level"
        type: "exact"
        value: "ERROR"
    stdout: true
    pipelines:
      - error-tracker
```
Here:
- `INFO` logs only appear in `stdout`.
- `ERROR` logs appear in `stdout` and are sent to a pipeline.

---

### 6. Fallback rule (catch all)

```yaml
rules:
  - name: catch-all
    conditions:
      - key: "log_record.level"
        type: "partial"
        value: ""
    stdout: true
```
This acts as a fallback — captures everything (since condition always passes) and ensures all logs appear on stdout.
Useful during local development or debugging.

---

## Summary
- Log Config gives fine-grained control over what gets logged and where.
- Supports deep nested condition checks.
- Can handle simple if-else style configs or complex multi-pipeline routing.
- Lightweight, readable, and easily extendable.
