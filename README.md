# VLSI Copilot

AI-powered RTL engineering assistant for Verilog designs.

Upload RTL, parse structure, detect bugs, score quality, chat with your design, optimize code, generate testbenches, and download PDF reports.

---

## Features

- Upload Verilog / SystemVerilog (`.v` / `.sv`)
- Syntax & structural checks
- Design metrics and RTL graph
- Gemini AI review, quality score, and bug detection
- RTL chat assistant
- AI optimizer with side-by-side + diff view
- Auto-generated testbench
- Per-upload PDF engineering reports

---

## Architecture

```text
React (Vite)  →  FastAPI
                 ├─ parsers / analyzers / graph
                 ├─ Gemini AI (review, score, bugs, chat, optimize)
                 └─ services (testbench, PDF)
```

- Landing page: `/`
- Analysis workspace: `/analyze`
- API: `http://127.0.0.1:8000`

---

## Tech Stack

| Layer | Stack |
|-------|--------|
| Frontend | React 19, Vite, Tailwind CSS 4, React Router, React Flow, Framer Motion |
| Backend | FastAPI, Uvicorn, python-dotenv, ReportLab |
| AI | Google Gemini (`google-genai`) |

---

## Setup

### 1. Backend

```powershell
cd VLSI_COPILOT
python -m pip install -r requirements.txt
```

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_key_here
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Start the API:

```powershell
python -m uvicorn backend.main:app --reload
```

- API docs: http://127.0.0.1:8000/docs
- Health: http://127.0.0.1:8000/health

### 2. Frontend

```powershell
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

Optional: set `VITE_API_URL` if the API is not on `http://127.0.0.1:8000`.

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Welcome |
| GET | `/health` | Health check |
| POST | `/upload` | Analyze RTL file |
| POST | `/chat` | Ask about uploaded RTL |
| POST | `/optimize` | Optimize RTL |
| GET | `/download-report/{report_id}` | Download PDF |

---

## Project Structure

```text
backend/
  ai/           Gemini helpers
  analyzers/    Syntax, metrics, design checks
  core/         Logging, exceptions, responses
  graph/        RTL graph builder
  parsers/      Verilog parser
  reports/      Generated PDFs
  routers/      upload, chat, optimize
  services/     PDF, testbench, report
frontend/
  src/
    components/ UI + result cards
    hooks/      analysis / chat / optimize
    pages/      Home, Analyze
    services/   API client
```

---

## Screenshots

Add product screenshots under `images/` and link them here after demo captures.

---

## Author

Narendran Sannamuri
ECE Student · Aspiring VLSI Physical Design Engineer
