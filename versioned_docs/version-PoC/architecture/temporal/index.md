# Temporal in Data Nadhi

Data Nadhi uses **Temporal** to orchestrate and manage data processing workflows.  
Temporal gives us **reliability, scalability, and fault tolerance** - perfect for complex, long-running workflows.

---

## Why Temporal?

We use Temporal in Data Nadhi because it solves key challenges in workflow orchestration:

- **Reliable execution:** Workflows are guaranteed to complete, even if a worker or service fails.  
- **Scalable:** Supports horizontal scaling by adding more workers to handle increased load.  
- **Fault tolerant:** Automatic retry and state recovery means no data loss.  
- **Code-first approach:** Workflows are written in standard programming languages, making them easy to maintain.  
- **State management:** Temporal automatically tracks workflow progress - you don't need to manage state manually.  

> 💡 *Temporal gives us a durable, scalable, and easy-to-use workflow engine for orchestrating Data Nadhi pipelines.*

---

## Temporal Workflow Integration

### 1. **Data Nadhi Server**
- Receives incoming log data.  
- Validates the API key and figures out the org and project.  
- Pushes tasks into Temporal's `task-q` queue for processing.  
- See [Server](/docs/architecture/server) for more info

### 2. **Data Nadhi Main Worker**
- Gets the workflow config for each pipeline.  
- Prepares a traversable workflow structure and finds the **start node**.  
- Pushes tasks into Temporal's `task-q-transform` queue for transformation.  
- See [Main Worker](/docs/architecture/temporal/main-worker) for more info

### 3. **Data Nadhi Transformation Worker**
- Processes tasks from `task-q-transform`.  
- Applies **transformations**, **filters**, and **branching logic** based on the workflow.  
- Pushes transformed data into Temporal's `task-q-destination` queue. 
- See [Transformation Worker](/docs/architecture/temporal/transformation-worker) for more info 

### 4. **Data Nadhi Destination Worker**
- Gets tasks from `task-q-destination`.  
- Fetches the **destination and connector config**.  
- Sends processed data to the configured target (databases, APIs, etc.).
- See [Destination Worker](/docs/architecture/temporal/destination-worker) for more info

---

## Temporal Architecture Overview

- **Temporal Service:** Coordinates workflow execution and makes sure everything's durable.  
- **Workers:** Application-side processes that execute tasks defined in workflows.  
- **Workflows:** Code-defined sequences of tasks that Temporal manages and persists.  
- **Queues:** `task-q`, `task-q-transform`, and `task-q-destination` handle task distribution and sequencing.  

> 💡 *This architecture lets Data Nadhi reliably orchestrate complex pipelines without manual state management.*

---

## Benefits of Using Temporal

- **Reliability:** Makes sure workflows complete even when there are failures.  
- **Scalability:** Can handle high loads by adding more workers.  
- **Fault Tolerance:** Automatic retries and state recovery.  
- **Code-first Development:** Easy to write and maintain workflows in standard languages.  
- **Automatic State Management:** No need to persist workflow state manually.
