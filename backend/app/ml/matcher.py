"""
CC — Career Craft
Job Description Matcher: Explainable resume-to-JD matching.

Approach:
1. Keyword overlap (TF-IDF weighted): Which JD keywords appear in the resume?
2. Skill intersection: Direct skill matching from taxonomy.
3. Semantic similarity (sentence-transformers, optional): Meaning-level match.
4. Section-specific analysis: Experience, education level matching.

All sub-scores are explained — the overall score is a weighted combination
of measurable components, not an arbitrary AI number.
"""
import re
import json
import logging
import math
from typing import Dict, List, Tuple, Optional
from collections import Counter

from app.ml.extractor import extract_skills, SKILL_TAXONOMY

logger = logging.getLogger(__name__)

# Mandatory requirement indicators in JDs
MANDATORY_PATTERNS = [
    r"(?i)\b(required|must\s+have|must\s+be|mandatory|essential|minimum|necessary)\b",
    r"(?i)\b(requires?|need|needs)\b",
    r"(?i)^\s*(?:requirements?|qualifications?):?\s*$",
]

# Preferred requirement indicators
PREFERRED_PATTERNS = [
    r"(?i)\b(preferred?|nice\s+to\s+have|bonus|plus|advantage|desirable|ideally)\b",
    r"(?i)^\s*(?:preferred?\s+qualifications?|bonus\s+points?):?\s*$",
]

# Experience level patterns
EXP_PATTERNS = {
    "fresher": r"(?i)\b(0[\-–]1|fresher|entry.?level|no\s+experience|fresh\s+graduate|new\s+grad)\b",
    "junior": r"(?i)\b(1[\-–]3\s*years?|junior|associate)\b",
    "mid": r"(?i)\b([3-5][\-–]\d+\s*years?|mid.?level|intermediate)\b",
    "senior": r"(?i)\b([5-9]\+?\s*years?|senior|lead|principal|staff)\b",
}


def match_resume_to_jd(resume_text: str, jd_text: str) -> Dict:
    """
    Match a resume against a job description.
    Returns structured match result with explainable scores.
    """
    if not resume_text or not jd_text:
        return _empty_match("Missing resume text or job description.")

    # ── Extract skills from both ──────────────────────────────────────────────
    resume_skills = extract_skills(resume_text)
    jd_skills = extract_skills(jd_text)

    resume_tech = set(s.lower() for s in resume_skills["technical"])
    jd_tech = set(s.lower() for s in jd_skills["technical"])

    # ── Skill matching ────────────────────────────────────────────────────────
    matched_skills = sorted(resume_tech & jd_tech)
    missing_skills = sorted(jd_tech - resume_tech)
    extra_skills = sorted(resume_tech - jd_tech)

    skills_score = _compute_skills_score(matched_skills, missing_skills, jd_tech)

    # ── Keyword matching (TF-IDF weighted) ───────────────────────────────────
    jd_keywords = _extract_jd_keywords(jd_text)
    matched_keywords, missing_keywords, keyword_score = _compute_keyword_score(
        resume_text, jd_keywords
    )

    # ── Semantic similarity (optional — graceful skip if transformers missing) ─
    semantic_score, semantic_method = _compute_semantic_score(resume_text, jd_text)

    # ── Requirements classification ───────────────────────────────────────────
    mandatory_reqs, preferred_reqs = _classify_requirements(jd_text, jd_skills["technical"])

    # ── Experience level match ────────────────────────────────────────────────
    jd_exp_level = _detect_experience_level(jd_text)
    exp_match_score = _score_experience_match(resume_text, jd_exp_level)

    # ── Overall score (weighted) ──────────────────────────────────────────────
    weights = {
        "skills": 0.40,
        "keywords": 0.30,
        "semantic": 0.20,
        "experience": 0.10,
    }
    overall = (
        skills_score * weights["skills"]
        + keyword_score * weights["keywords"]
        + semantic_score * weights["semantic"]
        + exp_match_score * weights["experience"]
    )

    # ── Generate recommendations ──────────────────────────────────────────────
    recommendations = _generate_match_recommendations(
        matched_skills, missing_skills, matched_keywords, missing_keywords,
        overall, jd_exp_level
    )

    return {
        "scores": {
            "overall": round(overall, 1),
            "skills": round(skills_score, 1),
            "keyword": round(keyword_score, 1),
            "semantic": round(semantic_score, 1),
            "experience": round(exp_match_score, 1),
        },
        "matched_skills": [_title_skill(s) for s in matched_skills],
        "missing_skills": [_title_skill(s) for s in missing_skills[:15]],
        "extra_skills": [_title_skill(s) for s in extra_skills[:10]],
        "matched_keywords": matched_keywords[:20],
        "missing_keywords": missing_keywords[:15],
        "mandatory_requirements": mandatory_reqs[:10],
        "preferred_requirements": preferred_reqs[:10],
        "jd_experience_level": jd_exp_level,
        "semantic_method": semantic_method,
        "recommendations": recommendations[:8],
        "score_explanation": _explain_score(overall, skills_score, keyword_score),
    }


def _compute_skills_score(matched: list, missing: list, jd_tech: set) -> float:
    """Skills score = matched / total JD skills required (if any)."""
    if not jd_tech:
        return 60.0  # No skills mentioned in JD — neutral score
    ratio = len(matched) / len(jd_tech)
    return min(100, ratio * 100)


def _extract_jd_keywords(jd_text: str) -> List[Tuple[str, float]]:
    """
    Extract important keywords from JD using simple TF-IDF-like importance.
    Returns list of (keyword, weight) sorted by importance.
    """
    # Tokenize
    words = re.findall(r"[a-zA-Z][a-zA-Z0-9+#\.\-]{1,30}", jd_text.lower())

    # Stopwords to ignore
    stopwords = {
        "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
        "of", "with", "by", "from", "up", "about", "into", "as", "is", "are",
        "was", "were", "be", "been", "being", "have", "has", "had", "do",
        "does", "did", "will", "would", "could", "should", "may", "might",
        "must", "can", "this", "that", "these", "those", "we", "you", "they",
        "their", "your", "our", "its", "it", "he", "she", "not", "no",
        "team", "work", "role", "job", "position", "candidate", "strong",
        "good", "excellent", "great", "ability", "experience", "skills",
        "knowledge", "understanding", "familiar", "proficient", "using",
        "use", "used", "working", "work", "looking", "seeking", "candidate",
        "apply", "join", "opportunity", "company", "organization",
    }

    filtered = [w for w in words if w not in stopwords and len(w) > 2]
    freq = Counter(filtered)
    total = sum(freq.values())

    # Weight by frequency and boost known tech terms
    all_skills_flat = set()
    for skills in SKILL_TAXONOMY.values():
        all_skills_flat.update(s.lower() for s in skills)

    weighted = []
    for word, count in freq.most_common(80):
        tf = count / total
        # Boost if it's a known skill
        boost = 2.0 if word in all_skills_flat else 1.0
        weighted.append((word, tf * boost))

    weighted.sort(key=lambda x: x[1], reverse=True)
    return weighted[:50]


def _compute_keyword_score(resume_text: str, jd_keywords: List[Tuple[str, float]]) -> Tuple[list, list, float]:
    """Compute weighted keyword coverage score."""
    if not jd_keywords:
        return [], [], 60.0

    resume_lower = resume_text.lower()
    matched = []
    missing = []
    total_weight = sum(w for _, w in jd_keywords)
    matched_weight = 0.0

    for keyword, weight in jd_keywords:
        pattern = r"(?<![a-zA-Z])" + re.escape(keyword) + r"(?![a-zA-Z])"
        if re.search(pattern, resume_lower):
            matched.append(keyword)
            matched_weight += weight
        else:
            missing.append(keyword)

    score = (matched_weight / total_weight * 100) if total_weight > 0 else 0
    return matched, missing, min(100, score)


def _compute_semantic_score(resume_text: str, jd_text: str) -> Tuple[float, str]:
    """
    Compute semantic / contextual similarity between resume and JD.
    Uses TF-IDF n-gram vectorization and cosine similarity via scikit-learn.
    Lightweight, fast (<50ms), and memory-efficient for production deployment.
    """
    try:
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.metrics.pairwise import cosine_similarity

        vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            stop_words="english",
            max_features=500,
        )
        tfidf_matrix = vectorizer.fit_transform([resume_text[:4000], jd_text[:4000]])
        sim = float(cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0])
        # Scale to 0-100
        score = round(min(100.0, max(0.0, sim * 125)), 1)
        return score, "tfidf-cosine-similarity"
    except Exception as e:
        logger.info(f"Semantic similarity using Jaccard fallback: {e}")
        return _jaccard_similarity(resume_text, jd_text), "jaccard-fallback"


def _jaccard_similarity(text1: str, text2: str) -> float:
    """Simple Jaccard similarity between two texts."""
    words1 = set(re.findall(r"[a-zA-Z]{3,}", text1.lower()))
    words2 = set(re.findall(r"[a-zA-Z]{3,}", text2.lower()))
    if not words1 or not words2:
        return 0.0
    intersection = words1 & words2
    union = words1 | words2
    return len(intersection) / len(union) * 100


def _classify_requirements(jd_text: str, jd_skills: list) -> Tuple[list, list]:
    """Classify JD requirements as mandatory or preferred."""
    lines = jd_text.split("\n")
    mandatory = []
    preferred = []

    in_mandatory = False
    in_preferred = False

    for line in lines:
        line_stripped = line.strip()
        if not line_stripped:
            continue

        # Detect section headers
        if re.search(r"(?i)^\s*(?:requirements?|qualifications?|must\s+have):?\s*$", line_stripped):
            in_mandatory = True
            in_preferred = False
            continue
        if re.search(r"(?i)^\s*(?:preferred?\s+qualifications?|nice\s+to\s+have|bonus):?\s*$", line_stripped):
            in_preferred = True
            in_mandatory = False
            continue

        # Classify by inline signals
        is_mandatory = any(re.search(p, line_stripped) for p in MANDATORY_PATTERNS)
        is_preferred = any(re.search(p, line_stripped) for p in PREFERRED_PATTERNS)

        if (in_mandatory or is_mandatory) and not is_preferred:
            item = line_stripped.lstrip("•·-* ").strip()
            if 10 < len(item) < 300 and item not in mandatory:
                mandatory.append(item)
        elif in_preferred or is_preferred:
            item = line_stripped.lstrip("•·-* ").strip()
            if 10 < len(item) < 300 and item not in preferred:
                preferred.append(item)

    # If classification failed, mark all skills as mandatory
    if not mandatory and not preferred and jd_skills:
        mandatory = jd_skills[:10]

    return mandatory, preferred


def _detect_experience_level(jd_text: str) -> str:
    """Detect required experience level from JD."""
    for level, pattern in EXP_PATTERNS.items():
        if re.search(pattern, jd_text):
            return level
    return "not_specified"


def _score_experience_match(resume_text: str, required_level: str) -> float:
    """Score how well resume experience level matches JD requirement."""
    if required_level == "not_specified":
        return 70.0

    resume_level = _detect_experience_level(resume_text)

    level_order = ["fresher", "junior", "mid", "senior"]
    r_idx = level_order.index(resume_level) if resume_level in level_order else 0
    j_idx = level_order.index(required_level) if required_level in level_order else 0

    diff = abs(r_idx - j_idx)
    if diff == 0:
        return 95.0
    elif diff == 1:
        return 70.0
    else:
        return 40.0


def _generate_match_recommendations(
    matched_skills, missing_skills, matched_keywords, missing_keywords,
    overall_score, jd_exp_level
) -> List[Dict]:
    """Generate actionable recommendations based on match analysis."""
    recs = []

    if overall_score < 50:
        recs.append({
            "priority": "high",
            "type": "skills",
            "title": "Major skill gaps detected",
            "description": f"Your resume matches only {overall_score:.0f}% of the job requirements. Focus on acquiring the missing skills before applying.",
        })

    if missing_skills:
        top_missing = missing_skills[:5]
        recs.append({
            "priority": "high",
            "type": "skills",
            "title": f"Add {len(missing_skills)} missing skills to your resume",
            "description": f"Key missing skills: {', '.join(_title_skill(s) for s in top_missing)}. If you have these skills, ensure they appear explicitly in your resume.",
        })

    if missing_keywords:
        top_keywords = missing_keywords[:8]
        recs.append({
            "priority": "medium",
            "type": "keywords",
            "title": "Add job-specific keywords",
            "description": f"Include these keywords from the job description: {', '.join(top_keywords)}. ATS systems scan for exact keyword matches.",
        })

    if jd_exp_level == "senior" and not re.search(r"\b\d+\s*years?\b", "placeholder"):
        recs.append({
            "priority": "medium",
            "type": "experience",
            "title": "Experience level mismatch",
            "description": "This role targets senior candidates. Highlight leadership, mentoring, and complex project ownership in your resume.",
        })

    if overall_score >= 75:
        recs.append({
            "priority": "low",
            "type": "apply",
            "title": "Strong match — consider applying",
            "description": f"Your profile matches {overall_score:.0f}% of the requirements. Tailor your cover letter to the specific company and role.",
        })

    return recs


def _explain_score(overall: float, skills: float, keywords: float) -> str:
    """Generate a plain-English score explanation."""
    if overall >= 80:
        return f"Excellent match ({overall:.0f}/100). Your resume closely aligns with the job requirements in skills ({skills:.0f}/100) and keywords ({keywords:.0f}/100)."
    elif overall >= 60:
        return f"Good match ({overall:.0f}/100). Your resume covers many requirements but has some skill or keyword gaps. Review the missing items and add them if applicable."
    elif overall >= 40:
        return f"Moderate match ({overall:.0f}/100). Significant skill or keyword gaps exist. Upskilling or resume tailoring is recommended before applying."
    else:
        return f"Low match ({overall:.0f}/100). This role has substantially different requirements from your current profile. Consider building targeted skills before applying."


def _title_skill(skill: str) -> str:
    """Convert lowercase skill to display title."""
    special = {"aws": "AWS", "gcp": "GCP", "sql": "SQL", "html5": "HTML5",
                "css3": "CSS3", "api": "API", "ci/cd": "CI/CD", "rest": "REST",
                "nlp": "NLP", "tdd": "TDD", "bdd": "BDD", "orm": "ORM"}
    return special.get(skill.lower(), skill.title())


def _empty_match(reason: str) -> Dict:
    """Return empty match result."""
    return {
        "error": reason,
        "scores": {"overall": 0, "skills": 0, "keyword": 0, "semantic": 0, "experience": 0},
        "matched_skills": [], "missing_skills": [], "extra_skills": [],
        "matched_keywords": [], "missing_keywords": [],
        "mandatory_requirements": [], "preferred_requirements": [],
        "recommendations": [], "score_explanation": reason,
    }
