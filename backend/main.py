from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, validator
from scorer import compute_score, get_suggestions, get_rewritten_summary
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(title="Resume Job Match Scorer API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:4173",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class MatchRequest(BaseModel):
    resume: str
    job_description: str

    @validator("resume")
    def resume_not_empty(cls, v):
        if len(v.strip()) < 50:
            raise ValueError("Resume must be at least 50 characters.")
        return v.strip()

    @validator("job_description")
    def jd_not_empty(cls, v):
        if len(v.strip()) < 50:
            raise ValueError("Job description must be at least 50 characters.")
        return v.strip()


@app.get("/")
def root():
    return {"status": "running", "message": "Resume Scorer API is live"}


@app.post("/score")
def score(req: MatchRequest):
    try:
        return compute_score(req.resume, req.job_description)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/suggestions")
def suggestions(req: MatchRequest):
    try:
        result = compute_score(req.resume, req.job_description)
        text = get_suggestions(
            req.resume,
            req.job_description,
            result["missing_keywords"]
        )
        return {"suggestions": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/rewrite-summary")
def rewrite_summary(req: MatchRequest):
    try:
        text = get_rewritten_summary(req.resume, req.job_description)
        return {"summary": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
