# Redis Cache in Data Nadhi

Data Nadhi uses **Redis** as a caching layer to improve performance and give near real-time access to frequently used data.  
This doc explains **why we chose Redis** and how the cache keys are structured.

---

## Why Redis?

Redis fits the **high-performance, low-latency needs** of Data Nadhi:

- **Fast in-memory storage:** Redis keeps data in memory, which means **sub-millisecond reads and writes** - perfect for caching frequently accessed metadata.  
- **Simple key-value access:** Most of our cached data (orgs, projects, pipelines, API keys) gets retrieved by unique keys, which is exactly what Redis is good at.  
- **TTL support:** Redis lets us set **expiration times** for keys, so the cache stays fresh without manual cleanup.  
- **Non-critical cache:** If the cache fails, it **doesn't break the system** - the primary source of truth is still MongoDB. We just fall back to the database if a key is missing.  
- **Atomic operations:** Redis provides safe atomic operations, which helps when managing secrets and other metadata consistently.  

> 💡 *Redis gives us a lightweight, fast, and reliable caching layer that reduces database load and improves response times.*

---

## Connection Management & Singleton Pattern

Both the **Python** temporal workers and **Node.js** server use a **singleton-based Redis connection manager** to keep the cache layer lightweight and resilient.

### Singleton Pattern
The Redis client uses a **singleton design** - only **one connection instance** exists for the entire service process.  
When a component requests Redis access:
- If a client is already active, it gets reused.  
- If not, a new client gets created, connected, and stored as the single global instance.  

This avoids unnecessary reconnections, keeps connection usage predictable, and makes Redis operations super fast.

### Connection Handling
The connection layer is designed for **stability** without letting cache failures mess with the core workflow:
- **Non-blocking reconnection:** If Redis disconnects, the service tries a single reconnection in the background without stopping the main process.  
- **No hard retry loops:** Cache failures get logged, but the system keeps running normally using MongoDB as the fallback.  
- **Silent failure mode:** All cache operations (`safe_get`, `safe_set`, `del`) fail silently if Redis is unavailable — this guarantees caching never breaks the data flow.  
- **Connection monitoring:** The client logs key events like connection loss, recovery, and ping failures through the shared `Logger` utility.  

### Optimized Cache Access
Both languages have *safe wrappers* (`safe_get` and `safe_set`) that automatically:
- Check connection health using a lightweight `PING`.  
- Try a single reconnect if needed.  
- Only execute cache operations when the connection is confirmed healthy.  

### Result
This makes Redis usage:
- **Fast** — single shared client, minimal latency.  
- **Safe** — never blocks main operations due to cache failures.  
- **Self-healing** — auto-reconnects when possible and logs all failures cleanly.

> 💡 *Data Nadhi treats Redis as a best-effort caching layer — optimized for speed, stable under failure, and always non-blocking.*

---

## Cache Key Structure

Cache keys in Data Nadhi are **structured hierarchically** to match the relationships between orgs, projects, and pipelines:

- **API Keys:**  
  `datanadhiserver:apikey:<apiKey>` – Stores API key metadata for fast validation.  

- **Organisation data:**  
  `datanadhiserver:org:<orgId>` – Stores org metadata for quick retrieval.  

- **Project data:**  
  `datanadhiserver:org:<orgId>:prj:<projectId>` – Stores project-level info including API key and config.  

- **Pipeline data:**  
  - By code: `datanadhiserver:org:<orgId>:prj:<projectId>:plc:<pipelineCode>`  
  - By ID: `datanadhiserver:org:<orgId>:prj:<projectId>:pl:<pipelineId>`  

- **Workflow nodes:**  
  `datanadhiserver:org:<orgId>:prj:<projectId>:pl:<pipelineId>:workflow` – Stores the pipeline's workflow nodes for fast access.  

- **Integration Connectors (decrypted credentials):**  
  `datanadhiserver:org:<orgId>:prj:<projectId>:ic:<connectorId>:decrypted` – Stores decrypted connector credentials for immediate use.  

- **Integration Targets:**  
  `datanadhiserver:org:<orgId>:prj:<projectId>:pl:<pipelineId>:it:<targetId>` – Stores the config of pipeline targets.  

- **Organisation & Project secrets:**  
  - Org secret: `datanadhiserver:org:<orgId>:secret`  
  - Project secret: `datanadhiserver:org:<orgId>:prj:<projectId>:secret`  

**Why this works:**  
- Mirrors the **hierarchical relationships** in the system (org → project → pipeline → workflow → connector/target).  
- Enables **fast lookups** using a single key without complex queries.  
- Makes it easy to **invalidate or update** keys at any level (org, project, pipeline, workflow, or integration).  

> 💡 *This design keeps the cache simple, fast, and fully aligned with the main data model in MongoDB.*
