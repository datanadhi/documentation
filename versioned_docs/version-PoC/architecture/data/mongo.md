# MongoDB for Data Nadhi

Data Nadhi uses **MongoDB** for transactional and metadata storage.  
This doc explains **why we chose MongoDB** and gives you an overview of the main collections.

---

## Why MongoDB?

MongoDB fits well with the **flexible and dynamic nature** of Data Nadhi's metadata and workflow configs:

- **Schemaless flexibility:** Things like pipelines, nodes, and connectors have configs that can vary quite a bit. MongoDB lets us store these as documents without needing a rigid schema.  
- **Hierarchical data support:** Entities like pipelines, nodes, and integration targets have nested relationships that map naturally to how documents work.  
- **Frequent single-row access:** Most queries grab **one org, project or pipeline** at a time, which MongoDB handles well with indexed fields.  
- **Easy updates and changes:** Node configs and connector credentials change over time. MongoDB lets us modify documents without messing with unrelated data.  
- **Rapid development:** We can add new fields or change the workflow structure without needing database migrations.  

> 💡 *MongoDB gives us the right mix of flexibility, simplicity, and efficiency for storing Data Nadhi's transactional metadata.*

---

## Connection Management & Singleton Pattern

Both the **Python** temporal workers and **Node.js** server uses a **singleton-based MongoDB connection manager**.

### Singleton Pattern
The Mongo connection manager uses a **singleton design** - meaning only **one instance** of the Mongo client exists for the entire service lifecycle.  
This avoids having multiple redundant connections and makes sure all database operations share a single, pooled client.

When a service requests a database connection for the first time:
- If a client instance already exists, it gets reused.
- If not, a new client gets created, connected, and cached as the singleton instance.

This approach gives us:
- Consistent access to MongoDB across all modules.
- Controlled connection pooling with minimal resource overhead.
- Simpler health checking and reconnection logic.

### Connection Handling
The connection layer does several built-in checks and protections:
- **Health verification:** Each access triggers a lightweight `ping` to make sure the connection is alive.  
- **Automatic reconnection:** If the `ping` fails, the service tries a single reconnect before raising an error.  
- **Connection pooling:** Clients are configured with bounded pool sizes (min/max), socket timeouts, and retry behavior for reads/writes.  
- **Centralized logging:** Any failure to connect, ping, or reconnect gets logged through the standard `Logger` utility.  

### Result
This makes MongoDB access:
- **Reliable** — automatically recovers from transient disconnections.  
- **Efficient** — reuses connections instead of repeatedly opening and closing them.  
- **Consistent** — one Mongo client instance is used throughout the entire process lifecycle.

> 💡 *Data Nadhi keeps Mongo connections lightweight, monitored, and resilient using a singleton pattern with built-in reconnection and health-check logic.*

---

## Collections Schema Overview

### Organisations
Represents an org or individual using the platform:

- `organisationName` – Name of the org  
- `organisationId` – Auto-generated UUID  
- `organisationSecretEncrypted` – Org-level secret for API key generation  
- `processorId` – Optional; indicates a dedicated queue at org level  

### Projects
Grouping of pipelines under an org. API Keys are generated at this level:

- `organisationId`  
- `projectName`  
- `projectId` – Auto-generated UUID  
- `projectSecretEncrypted` – Project-level secret for API key  
- `processorId` – Optional; dedicated queue at project level  

### Pipelines
Represents a single pipeline in a project:

- `organisationId`, `projectId`  
- `pipelineName`, `pipelineId` – Auto-generated UUID  
- `active` – Whether the pipeline is active or not  
- `pipelineCode` – Code users include in their log config  
- `processorId` – Optional; dedicated queue at pipeline level  
- `startNodeId` – The node where workflow execution starts  

### PipelineNodes
Stores workflow nodes for each pipeline:

- `organisationId`, `projectId`, `pipelineId`  
- `nodeId` – Auto-generated UUID  
- `nodeConfig` – Config for the node, includes:
  - `name` – Node name  
  - `type` – `condition-branching`, `transformation`, or `end`  
  - `filters` – Config for `condition-branching` nodes  
  - `transformation_fn` – Function name for `transformation` nodes  
  - `transformation_params` – Parameters for the transformation function  
  - `target_id` – ID of the target for `end` nodes  
  - `input_type` – Optional, used for validation  
  - `output_type` – Data type after transformation  

### IntegrationConnectors
Top-level destination credentials at the project level:

- `organisationId`, `projectId`  
- `connectorName`, `connectorId` – Auto-generated UUID  
- `integrationType` – e.g., Slack bot, AWS IAM  
- `encryptedCredentials` – Credentials stored as encrypted JSON  

### IntegrationTargets
Detailed destination config at the pipeline level:

- `organisationId`, `projectId`, `pipelineId`  
- `connectorId`  
- `destinationName`, `targetId` – Auto-generated UUID  
- `destinationParams` – JSON with destination-specific details, like S3 prefix or Slack channel  

> 💡 *MongoDB's document model works naturally with this nested, flexible structure - makes it easy to store and query pipeline metadata efficiently.*
