# Finance Tracker with On-Device AI Categorization 🚀

A full-stack personal finance tracking application enhanced with local on-device AI transaction categorization powered by sentence embeddings and ONNX Runtime.

---

## 🌟 Quick Start (Single Command)

You can launch all 3 parts of the application (Python AI Service, Express Backend, and React Frontend) simultaneously using a single command from the project root:

```bash
npm start
```

*Or run the PowerShell script on Windows:*
```powershell
.\start-all.ps1
```

---

## 🏗️ Architecture & System Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           APPLICATION SYSTEM                            │
│                                                                         │
│  ┌────────────────────────┐         ┌────────────────────────┐          │
│  │   React Frontend       │         │    Express Backend     │          │
│  │   (Vite / Port 5173)   │────────>│   (Node.js / Port 5000)│          │
│  └────────────────────────┘         └───────────┬────────────┘          │
│              │                                  │                       │
│      onBlur Description                POST /api/transactions/categorize │
│       Auto-Categorize                           │                       │
│                                                 ▼                       │
│                                     ┌────────────────────────┐          │
│                                     │   Python AI Service    │          │
│                                     │  (FastAPI / Port 8000) │          │
│                                     └───────────┬────────────┘          │
│                                                 │                       │
│                                      ONNX Runtime (all-MiniLM-L6-v2)    │
│                                                 ▼                       │
│                                     ┌────────────────────────┐          │
│                                     │ Local ONNX & Tokenizer │          │
│                                     └────────────────────────┘          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🧠 AI Categorization Feature

The transaction categorization pipeline uses **local sentence embeddings (`all-MiniLM-L6-v2`)** exported to ONNX format to automatically suggest category labels based on natural language descriptions (e.g., `"swiggy 340"`, `"monthly metro pass"`, `"amazon shopping"`).

### Key Features:
1. **`onBlur` Triggering**: Auto-fills category as soon as the user exits the description/name field.
2. **Visual UI Badge**: Highlights suggested categories with a `"✨ Suggested by on-device AI"` badge.
3. **User Manual Override**: Users can freely select any other category from the dropdown at any time.
4. **Resilient Fallback**: If the Python service is offline or unreachable, the Express backend falls back to `"Other"` within 3 seconds without throwing errors or crashing.
5. **Zero Data Leakage**: Inferences run 100% locally on-device (`local_files_only=True`).

### UI Workflow & Screenshots

```
+-------------------------------------------------------------+
| Add transaction                                           × |
|-------------------------------------------------------------|
| Type: [ Income ]  [ *Expense* ]                             |
|                                                             |
| Name:  [ swiggy 340                           ]             |
|                                                             |
| Amount (₹): [ 340                             ]             |
|                                                             |
| Category                                   Categorizing...  |
| [ Food                                            ▼ ]       |
| ✨ Suggested by on-device AI                                |
|                                                             |
| Date: [ 2026-09-21                            ]             |
|                                                             |
| [               Add transaction               ]             |
+-------------------------------------------------------------+
```

---

## 🛠️ Manual Startup (Starting Components Separately)

If you prefer to start each service in separate terminal windows:

### 1. Python AI Service (Port 8000)
```bash
cd ai-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Express Backend (Port 5000)
```bash
cd server
npm install
npm run dev
```

### 3. React Frontend (Port 5173)
```bash
cd finance-tracker
npm install
npm run dev
```

---

## ⚡ Snapdragon X NPU Optimization

For ARM64 Copilot+ PCs (e.g., HP OmniBook X powered by Snapdragon X Elite / X Plus), the model can be compiled for Hexagon NPU hardware acceleration:

```bash
python ai-service/compile_for_snapdragon.py
```

See [Snapdragon Optimization Plan](docs/snapdragon-plan.md) for full benchmarks and deployment details.

---

## 🧪 Running Tests

To run the backend test suite (29 unit & integration tests covering auth, transactions, and AI fallback mocks):

```bash
cd server
npm test
```
