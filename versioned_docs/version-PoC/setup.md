# Setup Guide

This guide walks you through setting up your local environment, starting databases, and running the required services.  
Before starting, make sure you’ve read the [Architecture](/docs/architecture) section to understand the overall structure.

---

## Overview
- The setup follows a **Docker-first** approach — this doesn’t mean every service runs inside Docker, but it helps manage dependencies and environments easily.
- Data stores and Temporal use official/public Docker images.
- Application services and Temporal workers run inside **VS Code Dev Containers**, giving a consistent and isolated local setup.

---

## Prerequisites
- Git
- Visual Studio Code
- Docker

---

## Dev Containers

### What is a Dev Container?
A Dev Container is a Docker-based development environment defined by a `.devcontainer` folder (usually with a `devcontainer.json` file).  
It allows VS Code (or other compatible editors) to open your project inside a pre-configured container that includes all the required tools, dependencies, and settings — ensuring your code runs in the same environment every time.

### Why use a Dev Container?
- **Network Advantage** – You can attach the dev container to the same Docker network as your other containers (like Postgres, Redis, etc.), allowing services to communicate directly using container names.
- **Consistent Setup** – All VS Code extensions, plugins, and settings defined in the container apply automatically, ensuring every developer works in the same environment.
- **Minimal Local Setup** – No need to install runtimes, dependencies, or databases on your local system. Everything runs inside Docker, keeping your setup clean.

### How to open a project in a Dev Container
1. Go to your repository folder:
    ```bash
    cd <path-to-repo>/<repo-folder>
    ```
2. Open it in VS Code:
    ```bash
    code .
    ```
3. When prompted, click “Reopen in Container”
    - If not prompted, use Ctrl+Shift+P (or Cmd+Shift+P on Mac) → search for Reopen in Container
    - If this is your first time, install the Dev Containers extension when prompted
4. VS Code will reload, build the Docker image, and run any postCreateCommand defined
5. Once loaded, your VS Code terminal is now running inside the container
> **Note:** Some commands that work on your host system may behave differently inside this terminal since it runs from the Docker container. 

---

## Steps to setup everything

### Docker Network

**How?**
- We’ll create a Docker network that connects all our containers.
- Let’s call it `datanadhi-net`.
    ```bash
    docker network create datanadhi-net
    ```

**What is acheived?**
A shared Docker network is created so that all our services and containers can communicate seamlessly.

---

### 2. DataStores and Temporal

**How?**
1. Clone the repository [data-nadhi-dev](https://github.com/Data-ARENA-Space/data-nadhi-dev)
2. Start the datastores and Temporal in Docker
    ```bash
    cd <path-to-repo>/data-nadhi-dev

    docker compose up -d
    ```
3. Setup MinIO bucket
    ```bash
    docker exec -it datanadhi-minio /bin/bash

    mc alias set local http://localhost:9000 minio minio123

    mc mb local/failure-logs
    ```
4. Open the repository in a Dev Container
5. Open the terminal and run Mongo migrations
    ```bash
    npm run mongo:migrate:up
    ```

**What is acheived?**
- Mongo is up with necessary collections
- Temporal is running
- Minio is up with the bucket name `failure-logs`
- All data stores and Temporal are part of the `datanadhi-net` network

---

### 3. Data Nadhi Internal Server

**How?**
1. Open [data-nadhi-internal-server](https://github.com/Data-ARENA-Space/data-nadhi-internal-server) in a Dev Container
2. Add this to your `.env` file
    ```bash
    # Secrets
    SEC_DB=my-secret-db-key
    SEC_GLOBAL=my-global-root-key
    NONCE_VALUE=DataNadhi

    # TTLs
    API_KEY_CACHE_TTL_SECONDS=300
    ENTITY_CACHE_TTL_SECONDS=1800
    SECRET_CACHE_TTL_SECONDS=3600

    # DBs and Port
    PORT=5001
    MONGO_URL=mongodb://mongo:27017/datanadhi_dev
    REDIS_URL=redis://redis:6379
    ```
3. Start the server
    ```bash
    npm run dev
    ```
4. Refer to [Internal Server APIs](/docs/PoC/internal-server-apis) on how to add data to Mongo for you to start using the server

**What is acheived?**
- Your database has the required data to start testing the setup.

---

### 4. Data Nadhi Temporal Worker
1. Open [data-nadhi-temporal-worker](https://github.com/Data-ARENA-Space/data-nadhi-temporal-worker) in Dev Container
2. Set this in `.env` file
    ```bash
    # Secret Key for decrypting encrypted Creds
    SEC_DB=my-secret-db-key

    # MongoDB Configuration
    MONGO_URL=mongodb://mongo:27017/datanadhi_dev
    MONGO_DATABASE=datanadhi_dev

    # Redis Configuration (for caching)
    REDIS_URL=redis://redis:6379

    # MinIO
    MINIO_ENDPOINT=datanadhi-minio:9000
    MINIO_ACCESS_KEY=minio
    MINIO_SECRET_KEY=minio123
    MINIO_BUCKET=failure-logs
    ```
3. Give execute permission for the worker script
    ```bash
    chmod +x scripts/run-worker.sh
    ```
4. Run these in separate terminals:
    ```bash
    ./scripts/run-worker.sh default main
    ./scripts/run-worker.sh default-transform transformation
    ./scripts/run-worker.sh default-destination destination
    ```

**What is acheived?**
- All three workers are running independently in their respective task queues.

---

### 5. Data Nadhi Server

**How?**
1. Open [data-nadhi-server](https://github.com/Data-ARENA-Space/data-nadhi-server) in Dev Container
2. Add this to your `.env` file
    ```bash
    # Secrets
    SEC_DB=my-secret-db-key
    SEC_GLOBAL=my-global-root-key
    NONCE_VALUE=DataNadhi

    # TTLs
    API_KEY_CACHE_TTL_SECONDS=300
    ENTITY_CACHE_TTL_SECONDS=1800
    SECRET_CACHE_TTL_SECONDS=3600

    # DBs and Port
    PORT=5000
    MONGO_URL=mongodb://mongo:27017/datanadhi_dev
    REDIS_URL=redis://redis:6379
    ```
3. Open a terminal in VS Code
4. Start the service
    ```bash
    npm run dev
    ```
5. Test the API
    ```curl
    curl --location 'http://localhost:5000/api/entities/pipeline/trigger' \
    --header 'x-datanadhi-api-key: <api-key>' \
    --header 'Content-Type: application/json' \
    --data '{
    "pipeline_id": {{pipeline-id}},
    "log_data": {
        "trace_id": "563985c1-f119-4118-9e57-2c7e43b71b92",
                "user": {
                    "name": "UserName",
                    "id": "user123",
                    "status": "active",
                    "email_verified": true,
                    "type": "authenticated",
                    "permissions": {"guest_allowed": false}
                }
            }
    }'
    ```

**What is acheived?**
- The backend flow works end-to-end — from trigger to Temporal to destination.

---

### 6. Data Nadhi SDK
> If you want to modify or test it, open it directly in a Dev Container.

**To use it as a package:**
1. Install it
    ```bash
    pip install git+https://github.com/Data-ARENA-Space/data-nadhi-sdk.git
    ```
2. Add the following to your `.env` file
    ```bash
    DATA_NADHI_API_KEY=<API-KEY>
    DATA_NADHI_SERVER_HOST=http://localhost
    ```
    - If your service runs inside the same Docker network, remove the `DATA_NADHI_SERVER_HOST` variable.
3. Add Log config file in `.datanadhi` folder - See [Log Config](/docs/PoC/architecture/sdk/log-config)
4. Try logging
    ```python
    from dotenv import load_dotenv
    from datanadhi import DataNadhiLogger
    load_dotenv()

    def main():
        # Set up API key (in production, use environment variable)
        # os.environ["DATA_NADHI_API_KEY"] = "dummy_api_key_123"

        # Initialize logger with module name
        logger = DataNadhiLogger(module_name="test_app")

        logger.info(
            "Testing basic stuff",
            context={
                "user": {
                    "id": "user123",
                    "status": "active",
                    "email_verified": True,
                    "type": "authenticated",
                    "permissions": {"guest_allowed": False},
                }
            },
        )
    ```
**What is acheived?**
- You’ve successfully verified the full Data Nadhi flow — from logs to pipelines to destinations.

--- 

## Conclusion
You now have the full Data Nadhi ecosystem running locally — databases, Temporal, servers, and SDK — all in one networked environment.
This setup ensures consistent development, minimal manual setup, and easy collaboration across repositories.
Once you’ve verified everything works, you can start building and extending your own pipelines and integrations confidently.