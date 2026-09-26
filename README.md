# Finance Tracker with On-Device AI Categorization 

A full-stack personal finance tracking application enhanced with local
on-device AI transaction categorization powered by sentence embeddings
and ONNX Runtime — compiled and verified for the Qualcomm Snapdragon
Hexagon NPU via Qualcomm AI Hub.

**Live Demo:** https://finance-tracker-rosy-nu.vercel.app
*(Note: the hosted frontend/backend work fully, but AI categorization
runs only on-device — see "Why the AI doesn't run on the live site"
below. Clone and run locally to see the full AI feature.)*

**Demo Video:** [add your YouTube link here once recorded]

---

## Quick Start

### Step 0: One-time model setup (needs internet)

The AI model files are not included in this repo (they're ~90 MB and
excluded via `.gitignore`). Before running for the first time:

```bash
cd ai-service
pip install -r requirements.txt
python export_model.py
```

This downloads `all-MiniLM-L6-v2` once and saves it locally in ONNX
format. After this, the AI service runs 100% offline.

### Then launch everything

From the project root:

```bash
npm install
npm start
```

Or run each part separately in three terminals:

```bash
# Terminal 1 — AI service
cd ai-service
python -m uvicorn main:app --reload --port 8000

# Terminal 2 — Backend
cd server
npm run dev

# Terminal 3 — Frontend
cd finance-tracker
npm run dev
```

Then open:
- Frontend: http://localhost:5173
- Backend health check: http://localhost:5000
- AI service docs: http://localhost:8000/docs

---

##  Architecture & System Flow

```
React Frontend (Vite / Port 5173)
        │
        │  onBlur on transaction name field
        ▼
Express Backend (Node.js / Port 5000)
        │  POST /api/transactions/categorize
        ▼
Python AI Service (FastAPI / Port 8000)
        │  ONNX Runtime — all-MiniLM-L6-v2
        ▼
Local ONNX model + tokenizer
(loaded once at startup, fully offline thereafter)
```

**Environment variables needed:**

`server/.env`
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
AI_SERVICE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
```

`finance-tracker/.env` (optional locally; required when deployed)
```
VITE_API_URL=http://localhost:5000
```

---

## AI Categorization Feature

The transaction categorization pipeline uses local sentence embeddings
(`all-MiniLM-L6-v2`, exported to ONNX) to automatically suggest a
category from a plain-language transaction name — e.g. "swiggy 340",
"monthly metro pass", "amazon shopping".

**Categories:** Rent, Food, Transport, Shopping, Entertainment, Health,
Education, Other (matches the app's existing dropdown exactly).

**Key features:**

- **onBlur triggering** — auto-fills the category as soon as the user
  leaves the transaction name field
- **Visual badge** — " Suggested by on-device AI" appears whenever
  the AI successfully provides a category
- **Manual override** — the user can freely change the suggested
  category at any time
- **Resilient fallback** — if the AI service is offline, unreachable,
  or slow (>3 seconds), the backend falls back to "Other" without
  throwing an error or crashing the app
- **Zero data leakage** — inference runs 100% locally
  (`local_files_only=True`); no transaction text is ever sent over
  the network

### Screenshot

![AI categorization badge](docs/screenshots/ai-badge.png)

*(Add a real screenshot here — e.g. "swiggy order" auto-categorized as
Food, with the "Suggested by on-device AI" badge visible.)*

---

## Snapdragon NPU Optimization — Verified

The categorization model was compiled for the Qualcomm Hexagon NPU
using Qualcomm AI Hub, targeting Snapdragon X Elite — the same chip
family used in HP Omnibook Snapdragon-powered PCs referenced in this
challenge.

- **Job status:** Results Ready 
  ([view live job](https://workbench.aihub.qualcomm.com/jobs/jp3z73ox5/))
- **Target device:** Snapdragon X Elite CRD (SC8380XP, Windows 11)
- **Input specs:** `input_ids`, `attention_mask`, `token_type_ids` —
  each `int64[1, 128]`
- **Compile options:** `--target_runtime qnn_dlc --truncate_64bit_io`
- **Output:** `model_snapdragon.onnx.dlc` (86.2 MB, QNN format)

Full details, including a note on the on-device profiling attempt, are
in [`docs/snapdragon-plan.md`](docs/snapdragon-plan.md).

Run it yourself (requires a free Qualcomm AI Hub account and API token):

```bash
cd ai-service
python compile_for_snapdragon.py
```

---

##  Running Tests

```bash
cd server
npm test
```

29 unit & integration tests covering auth, transactions, and the AI
categorization fallback — all passing.

---

## Why the AI doesn't run on the live site

Vercel hosts the React frontend and Render hosts the Express backend,
but neither can run the Python AI model on their free tiers. The
hosted app therefore falls back to "Other" for categories — the same
graceful fallback shown when the AI service is stopped locally. Clone
the repo and follow **Step 0** above to see full on-device AI
categorization, including working completely offline.

---

## Tech Stack

React (Vite) · Node.js/Express · MongoDB · FastAPI · ONNX Runtime ·
all-MiniLM-L6-v2 · Qualcomm AI Hub


**Demo Video Link:** [https://drive.usercontent.google.com/download?id=1hKaUdX0ZVpuZfezJusd7ehJd52UOKDI5&export=download&authuser=0]