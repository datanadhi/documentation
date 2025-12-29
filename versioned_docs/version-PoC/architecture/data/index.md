# Data in Data Nadhi

This doc covers the **data model and storage** setup in Data Nadhi.  
Since we don't store raw log data permanently, we need way less storage than traditional logging systems.

**[Github Repository]**: [data-nadhi-dev](https://github.com/Data-ARENA-Space/data-nadhi-dev)

---

## Data Stores Used

### MongoDB
- Stores **transactional data** like org info and pipeline workflow configs.  
- Went with MongoDB because it's **schemaless** - gives us flexibility since we don't know the exact schema upfront in some entities.  
- Most of the time we're doing **single-row reads** using indexed fields.  
- Makes it easy to grab the core metadata we need quickly.
- More details here: [Mongo DB for Data Nadhi](/docs/architecture/data/mongo)

### Redis Cache
- Used to **cache data at each stage** of the pipeline so things run near real-time.  
- Redis is solid for fast, temporary storage.  
- If the cache fails, the system keeps running fine - you just might get some cache misses. 
- More details here: [Redis in Data Nadhi](/docs/architecture/data/redis)

### Postgres 
- Not yet in use
- Stores data for **analytics**.  
- Has things like:
  - Organisation ID, Project ID, Pipeline ID  
  - Message ID, Node ID (workflow)  
  - Start and completion timestamps  
- Used for reporting and analyzing how your pipelines are running.

### MinIO
- Stores **failed records** until you do something about them.  
- Picked MinIO because it's **compatible with Amazon S3** - makes migrating later way easier if needed. 
- More details here: [MinIO in Data Nadhi](/docs/architecture/data/minio)

---

## Data Model

Here are the **main entities** in Data Nadhi and how they relate to each other:

- **Organisation** – The top-level entity - represents a company or individual using the platform.  
- **Project** – A way to group pipelines under an org.  
  - **API Key** gets assigned at the project level.  
- **Pipeline** – A single data pipeline.  
- **Pipeline Node** – An individual node in a pipeline workflow.  
- **Integration Connector** – An **instance of a destination**, like a Slack bot or AWS account.  
- **Integration Target** – The **specific destination** that uses the connector for credentials, like a Slack message template or S3 bucket with prefix.

> 💡 *This setup lets each database and storage system do what it does best while keeping the platform flexible and efficient.*
