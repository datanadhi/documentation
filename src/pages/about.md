# Why Data Nadhi is Different and Why It Matters

### 1. How is it different from log service providers
Tools like **Fluent Bit or Logstash** mainly just **collect logs and send them somewhere**. After that, you need extra tools or scripts to transform or route the data.

**Data Nadhi is different:**
- **Complete pipeline:** Direct → Transform → Deliver. Logs can flow from your app, get shaped in JSON, and go anywhere — all in one place.
- **No agents needed:** No software on every server; logs flow via SDKs or APIs.
- **Flexible routing:** Send the same log to different places if needed.

This means you don’t need multiple tools to handle logs — Data Nadhi does it all.

---

### 2. How is it different from agent-based setups
Tools like td-agent or Datadog agents need to be installed on every server or container. Updating and managing these agents can be a headache, especially in cloud environments where workloads come and go.

**Advantages of agent-based tools:**
- **Local buffering:** Agents can temporarily store logs on the host if the network or central server is down.
- **System-level access:** Agents can read system logs or metrics without changing application code.
- **Pre-processing at the source:** Filtering, parsing, or tagging logs locally reduces load on the network.
- **Mature ecosystem:** Well-tested and supported agents with many integrations.

**Data Nadhi solves the same problems differently:**
- **Agent-free:** No per-server installation required.
- Works **inside the app**, so temporary workloads (like short-lived containers or serverless functions) are easy to handle.
- **Future fail-safe:** We are working on a mechanism where **multiple redundant servers** can handle logs if one server is down. Combined with retries and temporary buffering, this will ensure **reliable delivery** even during server downtime.
- Fully **containerized services** make dev, testing, and production consistent.

You get the **benefits of agents** (reliability, temporary buffering) but without the extra maintenance, cost, and complexity.

---

### 3. How is it different from pipeline providers
Pipeline tools like Fivetran or Airbyte move structured data from source to destination. They usually don’t handle raw logs and need extra tools for transformation or routing.

**Data Nadhi:**
- Handles **raw logs directly**.
- Can **transform and enrich logs on the fly**.
- Supports **multiple destinations**, smart routing, retries, and exactly-once delivery.

It combines collection, transformation, and delivery in one unified platform.

---

### 4. How is it different from Splunk or Datadog
- **Agentless vs Agent-heavy:** Splunk/DataDog rely on agents installed everywhere. Data Nadhi works via SDKs/APIs, which is better for temporary workloads.
- **Unified pipeline:** Splunk/DataDog mainly collect and visualize logs. Data Nadhi **directly transforms and delivers logs** anywhere.
- **Developer-first:** SDK integration allows full control from applications.
- **Security & cost:** Logs are **not stored permanently**, reducing security risks and infra costs.
- **Full visibility:** Planned UI will show **where logs went, where they got stuck, and what happened**, end-to-end.

---

### 5. What is new that this gives
Data Nadhi combines the best parts of all tools and adds features others don’t:
- **End-to-end visibility:** See exactly where logs flow, where they get stuck, and why.
- **Safe temporary storage:** Logs are only stored temporarily if there’s a failure, then deleted once action is taken.
  - **Security advantage:** Less risk because logs aren’t permanently stored.
  - **Cost advantage:** Lower infrastructure costs, no need for permanent storage.
- **Developer and ops-friendly:** Easy SDKs, containerized setup, minimal maintenance.
- **Planned fail-safe:** We are **working on a multi-server setup with retries and temporary buffering** so logs remain safe even if a server goes down.

**Bottom line:** Data Nadhi is a **modern, unified, developer-friendly platform** that handles logs from start to finish. It is reliable, visible, secure, cost-efficient, and has the potential to replace multiple tools in your workflow.
