# Features & Goals

Data Nadhi is built on **three core principles** that guide everything we do — plus a hidden one for trust and security. **_What's mentioned below is the future state of the platform, not where it currently is_**

---

## Principle 1: Direct (the verb, not the adjective)  
**Connect the Logs**  

Data should flow **wherever you want**, and the path should be fully configurable. Here’s what we're aiming for:  

- **Simple Ingestion:** Configure your log streams easily using a YAML file. Decide whether logs should go to stdout or just flow through the pipeline.  
- **Branching:** Not all data is one-size-fits-all. Branch your pipeline to create multiple versions of the same data for different destinations or alerting channels.  
- **Developer-Friendly SDKs:** We're planning to provide SDKs in as many languages as possible. The SDKs will feel like the native logger in each language but with a **JSON-first default formatter** that's fully customizable.  

### 🎯 Goals for Direct
- SDK support for the **top 10 programming languages**.  
- **Sub-second streaming latency** using caching wherever possible.  
- **Zero-downtime config updates**.  
- Built-in **data quality checks** at ingestion.  
- Maximum **flexibility** in defining log flows.

---

## Principle 2: Transform  
**Shape the Data**  

Data Nadhi lets you transform your logs into **any structure you need** for your destinations.  

- **Declarative Transformations:** Define what you want, not how to do it.  
- **Type Configurations:** Validate input/output types to avoid runtime exceptions.  
- **JSON-First Transformation:** Work with JSON natively and only convert when necessary.  

### 🎯 Goals for Transform
- **Visual transformation builder** for easier pipeline design.  
- Extensible support for **different data formats**.  
- **Validation at every step** to make sure data stays clean.  
- JSON-first transformations wherever possible.

---

## Principle 3: Deliver  
**Stream to Any Target**  

You own the data. Data Nadhi makes sure it reaches **any destination reliably and in the format it needs**.  

- **Multiple Destinations:** Databases, data lakes, warehouses, APIs — all supported.  
- **Smart Routing:** Route data differently based on your pipeline logic.  
- **Format Conversion:** Deliver in whatever format your destination needs.  
- **Guaranteed Delivery:** Critical data gets **exactly-once semantics**.  

### 🎯 Goals for Deliver
- Support for as many **destination connectors** as possible.  
- **Exactly-once delivery** for critical logs.  
- Single log to multiple **data stores or alerting channels**.  
- Multiple actions per destination.

---

## 🔒 Hidden Principle: Security  
**No Storage Policy**  

Your data is yours. Data Nadhi **doesn't store logs** except when necessary to avoid data loss:  

- Logs are **never stored** in the system if the flow succeeds.  
- If there are failures, logs get persisted temporarily **until you take action**.  
- All credentials are **encrypted**, and API keys are **project-specific** and get decrypted on-the-fly.  

---

✨ Ready to dive in? Check out the [documentation](/docs) or learn [how to contribute](/contributions).
