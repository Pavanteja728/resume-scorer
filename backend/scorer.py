from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from langchain_groq import ChatGroq
from dotenv import load_dotenv
import re
import os

load_dotenv()

# Load once at startup — ~90MB download on first run
model = SentenceTransformer("all-MiniLM-L6-v2")

STOPWORDS = {
    "the", "and", "for", "with", "that", "this", "are", "you", "have",
    "will", "your", "from", "they", "our", "was", "has", "been", "were",
    "all", "can", "its", "not", "but", "who", "what", "how", "when",
    "which", "use", "used", "using", "able", "well", "also", "work",
    "team", "help", "both", "each", "more", "their", "than", "any",
    "such", "may", "new", "per", "set", "get", "one", "two", "three"
}

TECH_BOOSTS = {
    "python", "react", "typescript", "javascript", "java", "sql", "aws",
    "docker", "kubernetes", "fastapi", "django", "flask", "postgresql",
    "mongodb", "redis", "graphql", "restful", "api", "llm", "langchain",
    "machine", "learning", "deep", "tensorflow", "pytorch", "scikit",
    "agile", "scrum", "devops", "cicd", "microservices", "git", "linux",
    "node", "angular", "vue", "css", "html", "tailwind", "figma",
    "spark", "kafka", "airflow", "azure", "gcp", "terraform", "ansible"
}


def extract_keywords(text: str) -> set:
    words = set(re.findall(r'\b[a-zA-Z][a-zA-Z0-9+#.]{2,}\b', text.lower()))
    return words - STOPWORDS


def compute_score(resume: str, jd: str) -> dict:
    # Compute semantic similarity via embeddings
    emb_resume = model.encode([resume])
    emb_jd = model.encode([jd])
    raw_score = float(cosine_similarity(emb_resume, emb_jd)[0][0])

    # Scale: cosine similarity for text usually ranges 0.3-0.95
    # Remap to 0-100 more intuitively
    scaled = min(100.0, max(0.0, (raw_score - 0.2) / 0.75 * 100))
    score_pct = round(scaled, 1)

    # Keyword gap analysis
    resume_kws = extract_keywords(resume)
    jd_kws = extract_keywords(jd)
    missing = jd_kws - resume_kws

    # Prioritise tech keywords
    tech_missing = sorted([k for k in missing if k in TECH_BOOSTS])
    other_missing = sorted([k for k in missing if k not in TECH_BOOSTS])
    top_missing = (tech_missing + other_missing)[:20]

    # Matching keywords (present in both)
    matched = sorted(resume_kws & jd_kws & TECH_BOOSTS)[:15]

    # Section scores (simple heuristics)
    sections = analyse_sections(resume, jd)

    return {
        "score": score_pct,
        "raw_score": round(raw_score, 4),
        "verdict": get_verdict(score_pct),
        "missing_keywords": top_missing,
        "matched_keywords": matched,
        "sections": sections,
        "resume_word_count": len(resume.split()),
        "jd_word_count": len(jd.split()),
    }


def get_verdict(score: float) -> str:
    if score >= 80:
        return "Strong match"
    if score >= 60:
        return "Good match"
    if score >= 40:
        return "Partial match"
    return "Weak match"


def analyse_sections(resume: str, jd: str) -> dict:
    resume_lower = resume.lower()
    jd_lower = jd.lower()

    def section_score(keywords: list) -> int:
        hits = sum(1 for k in keywords if k in resume_lower)
        return round((hits / len(keywords)) * 100)

    # Check for key resume sections
    has_summary = any(w in resume_lower for w in ["summary", "objective", "profile", "about"])
    has_experience = any(w in resume_lower for w in ["experience", "worked", "developed", "built", "led"])
    has_education = any(w in resume_lower for w in ["education", "university", "bachelor", "master", "degree", "b.tech", "b.e"])
    has_skills = any(w in resume_lower for w in ["skills", "technologies", "proficient", "expertise"])
    has_projects = any(w in resume_lower for w in ["projects", "github", "deployed", "built"])
    has_metrics = bool(re.search(r'\d+%|\d+x|\$\d+|\d+ (million|billion|users|clients)', resume_lower))

    return {
        "summary": has_summary,
        "experience": has_experience,
        "education": has_education,
        "skills": has_skills,
        "projects": has_projects,
        "quantified_metrics": has_metrics,
    }


def get_suggestions(resume: str, jd: str, missing: list) -> str:
    if not os.getenv("GROQ_API_KEY"):
        return "GROQ_API_KEY not set. Add it to your .env file."

    llm = ChatGroq(model="llama-3.1-8b-instant", temperature=0.3)

    prompt = f"""You are an expert resume coach helping a software engineer improve their resume for a specific job.

JOB DESCRIPTION:
{jd[:2000]}

RESUME:
{resume[:2000]}

TOP MISSING KEYWORDS: {", ".join(missing[:12])}

Give exactly 3 specific, actionable improvements. Format as:
• [Section name]: [Specific change to make and why]

Be concrete — reference actual content from the resume and JD. Max 2 sentences per point."""

    response = llm.invoke(prompt)
    return response.content


def get_rewritten_summary(resume: str, jd: str) -> str:
    if not os.getenv("GROQ_API_KEY"):
        return "GROQ_API_KEY not set."

    llm = ChatGroq(model="llama-3.1-8b-instant", temperature=0.4)

    prompt = f"""You are an expert resume writer. Rewrite the professional summary section of this resume to better match the job description.

JOB DESCRIPTION:
{jd[:1500]}

CURRENT RESUME SUMMARY (or full resume if no summary exists):
{resume[:1500]}

Write a new 3-4 sentence professional summary that:
1. Uses keywords from the job description naturally
2. Highlights the most relevant experience
3. Starts with a strong action phrase (not "I am" or "Results-driven")
4. Sounds human and specific, not generic

Return ONLY the summary text, no labels or headings."""

    response = llm.invoke(prompt)
    return response.content
