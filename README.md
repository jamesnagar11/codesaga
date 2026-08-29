<div align="center">

# 🚀 CodeSaga — Next.js Client

**A production-grade, real-time competitive coding platform**  
*Multi-language code execution · Live results via WebSocket · Profiles, Rankings, Streaks & Friends*

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)](https://kubernetes.io/)

</div>

---

## 🗺️ Ecosystem Navigation — You Are Here

> This repository is **Module 1 of 5** in the **CodeSaga Distributed System**. Every module is an independent, deployable service. Navigate between them easily:

| Module | Repo | Role | Docker Image |
|--------|------|------|--------------|
| **① You are here** | [`codesaga`](https://github.com/jamesnagar11/codesaga) | Next.js Client — UI, Auth, Problem Pages | `jamesnagar/codesaga-client` |
| ② Socket Gateway | [`codesaga-websocket-server`](https://github.com/jamesnagar11/codesaga-websocket-server) | WebSocket server, Redis Streams producer, Pub/Sub subscriber | `jamesnagar/codesaga-ws` |
| ③ Execution Engine | [`codesaga-execution-engine`](https://github.com/jamesnagar11/codesaga-execution-engine) | Sandboxed code runner (Java, C++, Python) | `jamesnagar/codesaga-engine` |
| ④ Bulk DB Executor | [`codesaga-bulk-executor`](https://github.com/jamesnagar11/codesaga-bulk-executor) | Batches up to 100 DB writes in a single SQL statement | `jamesnagar/codesaga-bulk` |
| ⑤ Cron Sweeper | [`codesaga-bulk-master`](https://github.com/jamesnagar11/codesaga-bulk-master) | Auto-claims stale jobs, reconciles Redis memory | `jamesnagar/codesaga-cron` |
| ⚙️ GitOps Config | [`staging-ops`](https://github.com/jamesnagar11/staging-ops) | Kubernetes manifests managed by ArgoCD | — |

---

## 🏗️ Full System Architecture — Interactive Diagram

> **👉 [Open Full Interactive Diagram →](https://jamesnagar11.github.io/codesaga/diagram/)**
>
> *Pan, zoom, shift arrows, hover nodes for details — all 5 modules in one view*

<!-- INTERACTIVE DIAGRAM EMBED (GitHub Pages) -->
<div align="center">

[![Architecture Diagram](https://img.shields.io/badge/🔍_View_Interactive_Diagram-6366f1?style=for-the-badge&logoColor=white)](https://jamesnagar11.github.io/codesaga/diagram/)

</div>

---

### 📐 Architectural Overview

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                     ☸  Kubernetes Cluster (k8s)                             ║
║                                                                              ║
║  ┌──────────┐    ┌──────────────────────────────────────────────────────┐   ║
║  │  Users   │───►│         NGINX Ingress + Load Balancer                │   ║
║  │ 10k-200k │    └──────────────────────┬──────────────────┬───────────┘   ║
║  └──────────┘                           │ /                │ /socket.io     ║
║                                         │                  │                ║
║                            ┌────────────▼──┐   ┌──────────▼──────────────┐ ║
║                            │  ① Next.js    │   │  ② Socket Gateway       │ ║
║                            │  (this repo)  │   │  KEDA: 1 pod/10k users  │ ║
║                            └───────────────┘   └──────┬──────────────────┘ ║
║                                                        │                    ║
║                          ┌─────────────────────────────┼──────────────────┐ ║
║                          │             Redis            │                  │ ║
║                          │  ┌────────────────┐         │(produce)         │ ║
║                          │  │ Stream:events: │◄────────┘         ┌───────┐ ║
║                          │  │    code        │                   │Pub/Sub│ ║
║                          │  └───────┬────────┘  (publish)       │Channel│ ║
║                          │          │(consume)  ◄────────────────┤       │ ║
║                          │  ┌───────▼────────┐                  └───┬───┘ ║
║                          │  │ Stream:events: │      (subscribe)     │      ║
║                          │  │    db          │  ◄──────────────────┘       ║
║                          │  └───────┬────────┘                             ║
║                          └──────────┼──────────────────────────────────────┘ ║
║                                     │                                        ║
║  ┌──────────────────────────┐       │       ┌──────────────────────────┐     ║
║  │  ③ Execution Engine      │◄──────┘       │  ④ Bulk Executor Workers │     ║
║  │  KEDA lag ≥ 50           │               │  KEDA lag ≥ 200          │     ║
║  │  Java / C++ / Python     │               │  100 jobs / 20s batch    │     ║
║  └──────────────────────────┘               └──────────────┬───────────┘     ║
║                                                             │                 ║
║  ┌──────────────────────────┐               ┌──────────────▼───────────┐     ║
║  │  ⑤ Cron Sweeper (Janitor)│               │       PostgreSQL          │     ║
║  │  XAUTOCLAIM every 15s    │◄──────────────│                          │     ║
║  └──────────────────────────┘               └──────────────────────────┘     ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

### ✍️ Architect's Hand-Drawn Diagram

> The diagram below is the original hand-drawn architecture sketch by the author — showing the full flow across all 5 modules, Kubernetes pods, KEDA scaling, Redis Streams, Pub/Sub channels, and GitOps pipeline.

<div align="center">

![Hand-drawn architecture diagram](https://raw.githubusercontent.com/jamesnagar11/codesaga/main/diagram/handmade.png)

*Author's original architecture sketch — the blueprint behind the code*

</div>

---

## 📋 What This Module Does

**CodeSaga** is the **Next.js 15 frontend + BFF (Backend for Frontend)**. It is the entry point every user interacts with.

### Features
- 🔐 **Authentication** — Google & GitHub OAuth via NextAuth.js; session-based auth
- 📝 **Problems** — Browse, filter, and solve multi-language problems (Java, C++, Python)
- ⚡ **Real-time Judge** — Code is submitted over WebSocket; results stream back live — no page refresh needed
- 📊 **Dashboard** — Daily streaks, submission history, solved-problem stats with charts
- 👥 **Friends & Rankings** — Add friends, view global leaderboards
- 🖼️ **Profile** — Avatar uploads via Cloudinary, editable bio, language stats
- 🧠 **CodeMirror Editor** — VSCode-themed syntax-highlighted editor per language

### Role in the System
```
User writes code in CodeMirror Editor
      │
      │  emits 'codeRequestQueue' via Socket.IO
      ▼
codesaga-websocket-server  ──► Redis Streams ──► codesaga-execution-engine ──► Pub/Sub ──► codesaga-websocket-server ──► back to user
      │
      │  On result received: socket emits 'codeResponse' to the specific socket id
      ▼
UI updates: verdict (Accepted / WA / TLE / CE) displayed in real-time
```

---

## 📊 Performance & Scale Metrics

| Scenario | Without Scaling | With Scaling |
|----------|----------------|--------------|
| Concurrent socket users | ~1,000 (single node) | **100,000–200,000** (10k/server × up to 20 servers) |
| 1,000 simultaneous submissions | ~4–5 min (single core) | **~12 seconds** (50 workers via KEDA, 98% reduction) |
| DB write ops for 10,000 submissions | ~50,000 individual writes | **~20 bulk writes** (97% reduction) |
| Deployment | Manual SSH | **Zero-touch** via ArgoCD GitOps |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| State | Zustand |
| Auth | NextAuth.js (Google, GitHub OAuth) |
| DB ORM | Prisma + PostgreSQL |
| Realtime | Socket.IO Client |
| Editor | CodeMirror 6 |
| Charts | Recharts |
| Animations | Framer Motion |
| Images | Cloudinary |
| Container | Docker (node:22-alpine, multi-stage) |
| Orchestration | Kubernetes + NGINX Ingress |
| CI/CD | GitHub Actions → DockerHub → ArgoCD |

---

## ⚙️ Local Setup

### Prerequisites
- Node.js 22+
- PostgreSQL (local or cloud — [Aiven](https://aiven.io/) works great)
- Redis (local or cloud)
- A running instance of [`codesaga-websocket-server`](https://github.com/jamesnagar11/codesaga-websocket-server) (the socket server)

---

### Method 1 — Manual Installation

```bash
# 1. Clone the repository
git clone https://github.com/jamesnagar11/codesaga.git
cd codesaga

# 2. Install dependencies
npm install

# 3. Create your .env file
cp .env.example .env   # then fill in the values below

# 4. Run Prisma migrations
npx prisma migrate deploy
# or for dev
npx prisma db push

# 5. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

### Method 2 — Docker (Build Locally)

```bash
docker build \
  --build-arg DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require" \
  -t codesaga-client .

docker run -d -p 3000:3000 \
  -e NEXTAUTH_URL=http://localhost:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require" \
  -e NEXTAUTH_SECRET=your-secret-here \
  -e GOOGLE_CLIENT_ID=your-google-client-id \
  -e GOOGLE_CLIENT_SECRET=your-google-client-secret \
  -e GITHUB_ID=your-github-app-id \
  -e GITHUB_SECRET=your-github-app-secret \
  -e SOCKET_BACKEND_URL=http://localhost:9090 \
  -e NEXT_PUBLIC_PRESET_NAME=your-cloudinary-preset \
  -e NEXT_PUBLIC_CLOUDINARY_NAME=your-cloudinary-cloud-name \
  -e NEXT_PUBLIC_CLOUDINARY_BASE_URL=https://api.cloudinary.com/v1_1/YOUR_NAME/image/upload \
  -e SCHEDULER_SECRET=change-me-in-production \
  codesaga-client
```

---

### Method 3 — Docker (Pre-built Image from DockerHub) ⚡ Fastest

```bash
docker run -d -p 3000:3000 \
  -e NEXTAUTH_URL=http://localhost:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require" \
  -e NEXTAUTH_SECRET=your-secret-here \
  -e GOOGLE_CLIENT_ID=your-google-client-id \
  -e GOOGLE_CLIENT_SECRET=your-google-client-secret \
  -e GITHUB_ID=your-github-app-id \
  -e GITHUB_SECRET=your-github-app-secret \
  -e SOCKET_BACKEND_URL=http://localhost:9090 \
  -e NEXT_PUBLIC_PRESET_NAME=cloudinary_preset_name \
  -e NEXT_PUBLIC_CLOUDINARY_NAME=your-cloud-name \
  -e NEXT_PUBLIC_CLOUDINARY_BASE_URL=https://api.cloudinary.com/v1_1/YOUR_CLOUD/image/upload \
  -e SCHEDULER_SECRET=change-me-in-production \
  jamesnagar/codesaga-client:latest
```

---

### Method 4 — Run Full Platform (All 5 Services) with Docker Compose

Spin up the **entire CodeSaga platform** locally in one command:

```bash
# Create a docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: codesaga
      POSTGRES_PASSWORD: codesaga
      POSTGRES_DB: codesaga
    ports: ["5432:5432"]

  codesaga-client:
    image: jamesnagar/codesaga-client:latest
    ports: ["3000:3000"]
    environment:
      NEXTAUTH_URL: http://localhost:3000
      DATABASE_URL: postgresql://codesaga:codesaga@postgres:5432/codesaga?sslmode=disable
      NEXTAUTH_SECRET: local-dev-secret
      GOOGLE_CLIENT_ID: <your-google-client-id>
      GOOGLE_CLIENT_SECRET: <your-google-client-secret>
      GITHUB_ID: <your-github-app-id>
      GITHUB_SECRET: <your-github-app-secret>
      SOCKET_BACKEND_URL: http://codesaga-ws:9090
      SCHEDULER_SECRET: local-scheduler-secret
    depends_on: [redis, postgres]

  codesaga-ws:
    image: jamesnagar/codesaga-ws:latest
    ports: ["9090:9090"]
    environment:
      PORT: 9090
      NEXT_URL: http://localhost:3000
      REDIS_URL: redis://redis:6379
      STREAM_KEY: codesaga:events:code
      MAXLEN_APPROX: 10000
      CLAIM_MIN_IDLE_MS: 15000
      BULK_STREAM_KEY: codesaga:events:db
      BULK_MAXLEN_APPROX: 10000
      BULK_CLAIM_MIN_IDLE_MS: 15000
    depends_on: [redis]

  codesaga-engine:
    image: jamesnagar/codesaga-engine:latest
    environment:
      REDIS_URL: redis://redis:6379
      STREAM_KEY: codesaga:events:code
      CONSUMER_GROUP: india-1
    depends_on: [redis]

  bulk-executor:
    image: jamesnagar/codesaga-bulk:latest
    environment:
      DATABASE_URL: postgresql://codesaga:codesaga@postgres:5432/codesaga?sslmode=disable
      REDIS_URL: redis://redis:6379
      BULK_STREAM_KEY: codesaga:events:db
      BULK_CONSUMER_GROUP: india-1
      BULK_MAXLEN_APPROX: 10000
      BULK_CLAIM_MIN_IDLE_MS: 15000
    depends_on: [redis, postgres]

  bulk-executor-janitor:
    image: jamesnagar/codesaga-cron:latest
    environment:
      REDIS_URL: redis://redis:6379
      BULK_STREAM_KEY: codesaga:events:db
      BULK_CONSUMER_GROUP: india-1
      MIN_IDLE_TIME_MS: 60000
      BATCH_SIZE: 50
      MAX_RETRIES: 3
      SLEEP_INTERVAL_MS: 15000
    depends_on: [redis]
EOF

docker compose up -d
```

Visit [http://localhost:3000](http://localhost:3000) 🎉

---

## 🌍 Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXTAUTH_URL` | ✅ | Public URL of this app (e.g. `http://localhost:3000`) |
| `NEXTAUTH_SECRET` | ✅ | Random secret for NextAuth session signing |
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `GOOGLE_CLIENT_ID` | ✅ | Google OAuth App Client ID |
| `GOOGLE_CLIENT_SECRET` | ✅ | Google OAuth App Client Secret |
| `GITHUB_ID` | ✅ | GitHub OAuth App Client ID |
| `GITHUB_SECRET` | ✅ | GitHub OAuth App Client Secret |
| `SOCKET_BACKEND_URL` | ✅ | URL to the `codesaga-websocket-server` socket server |
| `NEXT_PUBLIC_PRESET_NAME` | ✅ | Cloudinary upload preset name |
| `NEXT_PUBLIC_CLOUDINARY_NAME` | ✅ | Cloudinary cloud name |
| `NEXT_PUBLIC_CLOUDINARY_BASE_URL` | ✅ | Cloudinary base upload URL |
| `SCHEDULER_SECRET` | ✅ | Protects the `/api/schedular` internal endpoint |

---

## 🚀 Kubernetes / GitOps Deployment

This project uses a **fully declarative GitOps workflow**:

1. Push to `main` → GitHub Actions builds & pushes Docker image to DockerHub with the commit SHA as tag
2. GitHub Actions then patches `staging-ops/staging/codesaga/client/manifest.yaml` with the new image tag
3. ArgoCD detects the change in [`staging-ops`](https://github.com/jamesnagar11/staging-ops) and auto-syncs to the Kubernetes cluster — **zero manual steps**

To explore Kubernetes manifests, KEDA ScaledObjects, Prometheus ServiceMonitors, and ArgoCD Applications:

> 👉 **[staging-ops repo →](https://github.com/jamesnagar11/staging-ops)**

---

## 🤝 Contributing

Pull requests are welcome! Please open an issue first for major changes.

---

<div align="center">

**Built with ❤️ by [James Nagar](https://github.com/jamesnagar11)**  
*Part of the CodeSaga distributed platform — 5 microservices, 1 mission*

</div>
