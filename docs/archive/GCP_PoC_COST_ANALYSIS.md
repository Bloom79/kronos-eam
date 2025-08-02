# Kronos EAM: GCP Proof of Concept (PoC) Cost Analysis

## 1. Executive Summary

This document provides a detailed cost estimation for running a Proof of Concept (PoC) of the Kronos EAM platform on Google Cloud Platform (GCP).

The primary goal of this PoC architecture is **cost control**. The strategy is to leverage serverless services that scale to zero and to provide simple start/stop scripts (`start-poc.sh`, `stop-poc.sh`) to manage resources that incur costs, ensuring that expenses are minimal when the environment is not in use.

- **Estimated Cost (Actively Running):** ~$0.12 - $0.20 per hour
- **Estimated Cost (Idle/Stopped):** ~$0.01 per hour

---

## 2. PoC Architecture & Cost Control Strategy

The architecture is designed to be shut down on demand. The `stop-poc.sh` script is the key to minimizing costs by stopping or deleting resources that are not in use.

| Service | Role in PoC | Cost Control Method |
| :--- | :--- | :--- |
| **Cloud Run** | Hosts Frontend (React) & Backend (FastAPI) | **Scales to Zero:** No cost when there are no requests. |
| **Cloud SQL (PostgreSQL)** | Primary relational database | **Stoppable:** The instance is stopped via script. |
| **Memorystore (Redis)** | Cache & Celery message broker | **Deletable:** The instance is deleted when stopped and recreated on start. |
| **Compute Engine** | Hosts the RPA (Playwright) agent | **Stoppable:** The VM is stopped via script. |
| **Vertex AI & APIs** | Gemini/Gemma models, Speech-to-Text | **Pay-per-use:** No cost if no API calls are made. |
| **Container Registry** | Stores Docker images | **Storage-based cost:** Minimal cost for storing images. |

---

## 3. Detailed Hourly Cost Breakdown

This section details the estimated costs for each service in both its "Running" and "Idle" states. All estimates are based on the `us-central1` region and are subject to change based on GCP pricing.

### 3.1. Core Stateful & Serverless Services

| Service | PoC Configuration | Cost (Running) | Cost (Idle) |
| :--- | :--- | :--- | :--- |
| **Cloud Run** | **Hosts Backend (FastAPI) & Frontend (React)**. Min Instances: 0. | ~$0.02 - $0.10 / hr | **$0 / hr** |
| **Cloud SQL (PostgreSQL)** | `db-g1-small` (or similar) | ~$0.05 / hr | **~$0.01 / hr** (Storage only) |
| **Memorystore (Redis)** | Basic Tier, 1GB | ~$0.03 / hr | **$0 / hr** (Deleted) |
| **Compute Engine (RPA)** | `e2-small` | ~$0.02 / hr | **$0 / hr** (Stopped) |
| **Sub-Total** | | **~$0.12 - $0.20 / hr** | **~$0.01 / hr** |

### 3.2. Usage-Based Services (APIs & Storage)

These services do not have a constant hourly cost. The cost is directly proportional to usage. For a PoC, these costs are expected to be very low and often fall within the GCP Free Tier.

| Service | Free Tier (Monthly) | Cost Beyond Free Tier | PoC Expected Cost |
| :--- | :--- | :--- | :--- |
| **Vertex AI (Gemini)** | Varies by model | Per 1,000 characters | **~$0** |
| **Cloud Speech-to-Text** | 60 minutes | Per 15 seconds | **~$0** |
| **Container Registry (GCR)** | 0.5 GB storage | $0.026 per GB/month | **<$1 / month** |

---

## 4. Example Weekly Cost Scenarios

Here’s how the hourly costs translate into practical weekly estimates.

### Scenario A: Light PoC Testing
- **Active Testing:** 2 hours per day, 5 days a week (10 hours total)
- **Idle Time:** Remaining 158 hours of the week

- **Active Cost:** 10 hours * $0.20/hr = $2.00
- **Idle Cost:** 158 hours * $0.01/hr = $1.58
- **Estimated Weekly Total: ~$3.58**

### Scenario B: Heavy PoC Development & Testing
- **Active Testing:** 8 hours per day, 5 days a week (40 hours total)
- **Idle Time:** Remaining 128 hours of the week

- **Active Cost:** 40 hours * $0.20/hr = $8.00
- **Idle Cost:** 128 hours * $0.01/hr = $1.28
- **Estimated Weekly Total: ~$9.28**

---

## 5. Conclusion

By implementing the `start-poc.sh` and `stop-poc.sh` workflow, the Kronos EAM Proof of Concept can be run for **less than $10 per week**, even with heavy daily usage.

The key to cost control is the disciplined use of the stop script to ensure that the primary cost-incurring resources (Compute Engine, Cloud SQL, and Memorystore) are not left running when idle. The serverless nature of Cloud Run and the API-based services ensures that you truly only pay for what you use during active testing.

---

## 6. Architectural Comparison: GKE vs. Vertex AI Serverless

As the project moves from PoC to production, a key decision is how to host the advanced AI and RPA workloads. This section compares two primary approaches: self-managing them on Google Kubernetes Engine (GKE) versus using Google's fully-managed serverless solutions.

### Approach 1: Self-Managed on Google Kubernetes Engine (GKE)

In this model, you run all your backend components—including the LangGraph agents, RPA workers (Celery/Playwright), and the Qdrant vector database—as containers within a GKE cluster.

- **Pros:**
    - **Maximum Flexibility & Control:** You have complete control over the hardware (including GPUs), networking, and specific versions of all your software.
    - **Cost-Effective at High, Constant Load:** For workloads that are always busy, paying for dedicated nodes on GKE can be cheaper than the per-request cost of serverless solutions.
    - **Unified Environment:** All backend components live in one cluster, which can simplify internal networking and observability.

- **Cons:**
    - **High Operational Overhead:** You are responsible for managing the GKE cluster, including node provisioning, scaling, security, and Kubernetes upgrades. This requires significant DevOps/SRE expertise.
    - **No Scale-to-Zero for the Cluster:** The GKE control plane and the nodes themselves have an hourly cost, even if your application is idle. This makes it expensive for intermittent or low-traffic workloads.
    - **Complex Configuration:** Setting up autoscaling, monitoring, and logging for a production-grade GKE cluster is a complex task.

### Approach 2: Managed GCP Serverless Solutions (Vertex AI & Cloud Run)

In this model, you leverage Google's specialized, fully-managed services for each part of your workload.

- **Vertex AI Pipelines & Prediction:** Instead of running LangGraph agents on a VM, you would use Vertex AI Pipelines to orchestrate the AI workflow and Vertex AI Prediction endpoints to serve the models.
- **Cloud Run Jobs:** For RPA tasks that are triggered and run to completion, you can use Cloud Run Jobs, which is a serverless way to run non-HTTP workloads.
- **Vertex AI Vector Search:** Instead of self-hosting Qdrant on GKE, you would use Google's managed vector database solution.

- **Pros:**
    - **Zero Operational Overhead:** Google manages the entire underlying infrastructure. You never have to patch a server, manage a cluster, or worry about node pools.
    - **Automatic Scaling (Including to Zero):** Services scale automatically based on demand and, most importantly, scale to zero when not in use, which is extremely cost-effective for spiky or unpredictable traffic.
    - **Simplified Development:** You can focus entirely on your application code (the AI logic, the RPA script) instead of on infrastructure management.

- **Cons:**
    - **Less Flexibility:** You have less control over the underlying environment. You are limited to the machine types, runtimes, and configurations offered by the managed service.
    - **Potential for Higher Cost at High, Constant Load:** For a service that is processing requests 24/7, the per-request/per-minute cost of a managed service can sometimes be higher than paying for a dedicated, fully-utilized VM on GKE.
    - **Vendor Lock-in:** This approach ties your application more tightly to GCP's specific services and APIs.

### Recommendation

| Phase | Recommended Approach | Justification |
| :--- | :--- | :--- |
| **PoC & Initial Production** | **GCP Serverless (Vertex AI, Cloud Run)** | The benefits of zero operational overhead and pay-per-use pricing are ideal for the early stages. It allows for rapid development and cost control when traffic is low and unpredictable. |
| **Growth & Scale** | **Hybrid Approach** | As the application matures, a hybrid model is often best. Keep using Vertex AI for its powerful managed ML capabilities. For the RPA and other background workers that become high-volume and constant, migrate them to a **GKE Autopilot** cluster. GKE Autopilot is a managed Kubernetes experience that automates cluster management and still allows for scaling to zero, providing a middle ground between full control and full serverless. |