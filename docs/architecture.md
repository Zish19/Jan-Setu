# Jan-Setu Architecture

Jan-Setu is a monorepo application structured around a FastAPI backend and a Next.js (React) frontend. It prioritizes autonomous AI pipelines, real-time optimization, and seamless UI synchronization.

##  High-Level System Design

```mermaid
graph TD
    subgraph Client [Frontend Layer]
        A[Next.js Application]
        B[XState Demo Orchestrator]
        C[Zustand State Management]
        A <--> B
        A <--> C
    end

    subgraph API [Backend Layer]
        D[FastAPI REST API]
        E[Google Gemini Agent]
        F[OR-Tools CP-SAT Solver]
        D <--> E
        D <--> F
    end

    subgraph Data [Data Layer]
        G[(Firebase Firestore)]
        H[(Vector Embeddings)]
        D <--> G
        D <--> H
    end

    A <-->|Axios Interceptors| D
```

##  The AI Pipeline

The pipeline processes chaotic incoming reports into structured intelligence.

```mermaid
sequenceDiagram
    participant Citizen
    participant API as FastAPI
    participant LLM as Google Gemini
    participant DB as Firestore
    
    Citizen->>API: POST /signals (Image + Voice/Text)
    API->>LLM: Multimodal Prompt (Translation + Vision)
    LLM-->>API: Structured JSON (Category, Severity, Coordinates)
    API->>LLM: Generate Text Embedding
    LLM-->>API: Vector [1.2, 0.4, ...]
    API->>DB: Store Signal & Embedding
    API->>DB: Cluster with nearby vectors (Cos Sim > 0.8)
    DB-->>API: Created Project Cluster
```

##  Budget Optimization Flow

When the MP sets a budget in the dashboard, the OR-Tools solver takes over.

```mermaid
flowchart LR
    A[MP Sets Budget e.g. 5Cr] --> B[Fetch Open Clusters]
    B --> C{CP-SAT Solver}
    
    subgraph Constraints
    C -.-> D[Max 5Cr Total]
    C -.-> E[Max 30% per Category]
    C -.-> F[Maximize Total Severity Score]
    end
    
    C --> G[Selected Projects]
    C --> H[Rejected Projects w/ Reason]
    
    G --> I[Dashboard UI]
    H --> I
```

##  RAG Assistant (Ask Jan-Setu)

The RAG Assistant bridges the gap between the complex solver results and plain-english explainability.

1. MP asks: "Why wasn't the park in Ward 5 funded?"
2. FastAPI retrieves recent Optimization runs and the Ward 5 cluster details.
3. Gemini processes the constraints context.
4. Gemini responds: "Ward 5 Park (40L) was deferred because the Parks category reached its 15% budget cap. Funding it would violate the fairness constraint."
