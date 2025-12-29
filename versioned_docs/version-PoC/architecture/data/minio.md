# MinIO in Data Nadhi

Data Nadhi uses **MinIO** to store **failed records** and related metadata.  
We picked MinIO because it's **S3-compatible**, lightweight, and makes it easy to migrate to AWS S3 later if needed.

---

## Why MinIO?

- **Failure handling:** Stores logs that fail during processing so you don't lose data.  
- **S3-compatible:** Easy to switch to AWS S3 or other compatible storage down the line.  
- **Original and transformed data:** Keeps both the original log and what the data looked like when it failed.  
- **Durable storage:** You can inspect or reprocess failed records later.  

> 💡 *MinIO acts as a "safety net" for the platform - makes sure failed data is stored reliably so you can investigate or retry later.*

---

## Failure Log Schema

Each failure log is stored as a **JSON object** in MinIO. They're organized in folders based on org, project, pipeline, and message IDs.  

### Fields:

- `timestamp` – ISO timestamp of when it failed.  
- `organisationId` – ID of the org that owns the pipeline.  
- `projectId` – ID of the project the pipeline is in.  
- `pipelineId` – ID of the pipeline where the failure happened.  
- `messageId` – Unique ID for the log message.  
- `originalInput` – The original log data the system got.  
- `currentInput` – What the data looked like when it failed (after any partial transformations).  
- `error` – Object with:
  - `message` – Error message.  
  - `type` – What type of exception it was.  
  - `stack` – Stack trace.  
  - `description` – Human-readable description of what went wrong.  
- `context` *(optional)* – Any extra context added during failure handling.

---

## Storage Structure

- **Folder hierarchy:** `<organisationId>/<projectId>/<pipelineId>/<messageId>/`  
- **Filename:** `<activity_name>-<timestamp>.json`  
- **Example:**  
```
11111111-1111-1111-1111-111111111111/
22222222-2222-2222-2222-222222222222/
33333333-3333-3333-3333-333333333333/
TransformationWorkflow-transform-20251023120000123456.json
```

**Why this works:**  
- Organizes failed logs **by hierarchy** - makes it easy to find records by org, project, and pipeline.  
- Keeps **timestamps and activity names** in the filename so you can version and inspect things quickly.  
- Stores both the **original and current input** so you have full traceability of what failed.  

> 💡 *This setup makes sure all failures are durable, easy to find, and ready for reprocessing or debugging.*
