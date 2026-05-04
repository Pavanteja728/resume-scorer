# Resume Match Scorer — AI-Powered

Paste a resume and job description → get a semantic match score, missing keyword analysis, section checklist, AI improvement suggestions, and an AI-rewritten professional summary.

**Tech stack:** React + TypeScript + Python (FastAPI) + HuggingFace sentence-transformers + Groq LLM (free)

---

## Quick Start

### Backend

```bash
cd backend

# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python -m venv venv
source venv/bin/activate

pip install -r requirements.txt

# Add your free Groq API key (get from console.groq.com)
copy .env.example .env    # Windows
cp .env.example .env      # Mac/Linux
# Open .env and paste your key

uvicorn main:app --reload
# API live at http://localhost:8000
# Swagger docs at http://localhost:8000/docs
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# App live at http://localhost:5173
```

---

## How It Works

1. **Embedding** — Resume and JD are each converted to a 384-dimension vector using `all-MiniLM-L6-v2` (a fast, lightweight sentence-transformer model)
2. **Cosine similarity** — The angle between the two vectors is measured. Closer vectors = higher match
3. **Keyword gap analysis** — Simple set difference between resume and JD words, prioritising technical keywords
4. **Section detection** — Regex heuristics detect whether key resume sections exist
5. **AI suggestions** — Groq's `llama-3.1-8b-instant` generates specific, actionable improvements
6. **Summary rewrite** — Same LLM rewrites the professional summary to match the JD better

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/score` | Compute match score + keyword analysis |
| POST | `/suggestions` | Get 3 AI improvement suggestions |
| POST | `/rewrite-summary` | Get AI-rewritten professional summary |

All POST endpoints accept: `{ "resume": "...", "job_description": "..." }`

---

## Deploying (Free)

### Backend → Render.com
1. Push `backend/` to GitHub (venv excluded via .gitignore)
2. render.com → New Web Service → connect repo
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Environment variable: `GROQ_API_KEY=your_key`
6. After deploy: add your Vercel URL to `allow_origins` in `main.py`, push again

### Frontend → Vercel.com
1. Push `frontend/` to GitHub
2. vercel.com → Import Project
3. Environment variable: `VITE_API_URL=https://your-backend.onrender.com`
4. Deploy

