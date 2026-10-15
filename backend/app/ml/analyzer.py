"""
CC — Career Craft
Resume Analyzer: Calculates explainable scores for resume quality.

Scoring methodology:
- ATS Score: Keyword density, section presence, formatting signals
- Content Score: Quantified achievements, action verbs, specificity
- Format Score: Length, structure, readability
- Skills Score: Breadth and relevance of technical skills
- Experience Score: Work experience presence and quality
- Education Score: Degree level and completeness

All weights are documented and scores are explainable.
"""
import re
import json
import logging
from typing import Dict, List, Any

from app.ml.extractor import (
    extract_skills, extract_contact_info, extract_education,
    extract_experience, extract_projects, extract_certifications,
    extract_achievements, SECTION_PATTERNS,
)

logger = logging.getLogger(__name__)

# ATS-unfriendly signals
ATS_BAD_SIGNALS = [
    ("tables", r"<table|FORMTEXT", "Avoid tables — ATS parsers may skip table content"),
    ("headers_footers", r"Page \d+ of \d+", "Remove page headers/footers"),
    ("special_bullets", r"[◆◇●○▶►▸✓✔✗✘★☆]", "Use standard bullet characters (• or -)"),
    ("photos", r"photo|picture|image|jpg|jpeg|png", "Do not embed photos in resume"),
    ("columns", r"\s{5,}[A-Z][a-z]+\s{5,}", "Multi-column layouts confuse ATS"),
]

# Action verbs that signal impactful bullet points
ACTION_VERBS = {
    "developed", "designed", "implemented", "built", "created", "led", "managed",
    "architected", "deployed", "optimized", "improved", "reduced", "increased",
    "delivered", "launched", "spearheaded", "collaborated", "mentored", "trained",
    "automated", "integrated", "migrated", "refactored", "debugged", "resolved",
    "analyzed", "researched", "presented", "published", "authored", "contributed",
    "coordinated", "supervised", "established", "streamlined", "enhanced",
}

# Required ATS sections
REQUIRED_SECTIONS = ["contact", "education", "skills", "experience"]
RECOMMENDED_SECTIONS = ["summary", "projects", "certifications", "achievements"]

# Degree weights for education score
DEGREE_WEIGHTS = {
    "PhD": 100, "M.Tech": 90, "ME": 90, "MSc": 85, "MBA": 85, "MCA": 85,
    "B.Tech": 80, "BE": 80, "BSc": 75, "BCA": 70, "BBA": 70, "BCom": 65,
    "Diploma": 60, "HSC/12th": 40, "SSC/10th": 20,
}


def analyze_resume(text: str) -> Dict[str, Any]:
    """
    Full resume analysis pipeline.
    Returns structured analysis dict with scores, strengths, weaknesses, improvements.
    """
    if not text or len(text.strip()) < 50:
        return _empty_analysis("Insufficient text to analyze.")

    text_lower = text.lower()
    word_count = len(text.split())
    char_count = len(text)

    # ── Extract all components ────────────────────────────────────────────────
    skills_data = extract_skills(text)
    contact_info = extract_contact_info(text)
    education = extract_education(text)
    experience = extract_experience(text)
    projects = extract_projects(text)
    certifications = extract_certifications(text)
    achievements = extract_achievements(text)
    present_sections = _detect_sections(text)

    # ── Score each dimension ──────────────────────────────────────────────────
    ats_score, ats_issues, ats_strengths = _score_ats(
        text, present_sections, skills_data, word_count
    )
    content_score, content_strengths, content_weaknesses = _score_content(
        text, achievements, experience, projects, action_verb_count=_count_action_verbs(text)
    )
    format_score, format_issues = _score_format(text, word_count, char_count)
    skills_score, skills_strengths, skills_weaknesses = _score_skills(skills_data)
    experience_score, exp_strengths, exp_weaknesses = _score_experience(
        experience, text, word_count
    )
    education_score, edu_strengths = _score_education(education)

    # ── Overall score (weighted average) ─────────────────────────────────────
    weights = {
        "ats": 0.20,
        "content": 0.25,
        "format": 0.15,
        "skills": 0.20,
        "experience": 0.15,
        "education": 0.05,
    }
    overall = (
        ats_score * weights["ats"]
        + content_score * weights["content"]
        + format_score * weights["format"]
        + skills_score * weights["skills"]
        + experience_score * weights["experience"]
        + education_score * weights["education"]
    )

    # ── Aggregate feedback ────────────────────────────────────────────────────
    strengths = (ats_strengths + content_strengths + skills_strengths + exp_strengths + edu_strengths)
    weaknesses = (content_weaknesses + skills_weaknesses + exp_weaknesses + format_issues)
    improvements = _generate_improvements(
        present_sections, skills_data, ats_issues, format_issues,
        word_count, achievements, experience, projects
    )
    missing_sections = _find_missing_sections(present_sections)
    keywords = _extract_keywords(text, skills_data)

    return {
        "scores": {
            "overall": round(overall, 1),
            "ats": round(ats_score, 1),
            "content": round(content_score, 1),
            "format": round(format_score, 1),
            "skills": round(skills_score, 1),
            "experience": round(experience_score, 1),
            "education": round(education_score, 1),
        },
        "skills_technical": skills_data["technical"],
        "skills_soft": skills_data["soft"],
        "education": education,
        "experience": experience,
        "projects": projects,
        "certifications": certifications,
        "achievements": achievements,
        "contact_info": contact_info,
        "strengths": strengths[:8],
        "weaknesses": weaknesses[:8],
        "improvements": improvements[:10],
        "ats_issues": ats_issues[:8],
        "missing_sections": missing_sections,
        "keywords": keywords[:30],
        "present_sections": list(present_sections),
        "word_count": word_count,
    }


def _detect_sections(text: str) -> set:
    """Detect which standard sections are present in the resume."""
    present = set()
    for section_name, pattern in SECTION_PATTERNS.items():
        if re.search(pattern, text, re.IGNORECASE | re.MULTILINE):
            present.add(section_name)
    return present


def _score_ats(text: str, sections: set, skills_data: dict, word_count: int) -> tuple:
    """Score ATS compatibility (0-100)."""
    score = 100.0
    issues = []
    strengths = []

    # Required sections presence (40 points)
    section_score = 0
    for s in REQUIRED_SECTIONS:
        if s in sections:
            section_score += 10
        else:
            issues.append(f"Missing '{s}' section — ATS requires clearly labeled sections")
    score = score - (40 - section_score)

    # Keywords / skills presence (20 points)
    total_skills = len(skills_data["technical"]) + len(skills_data["soft"])
    if total_skills >= 15:
        strengths.append(f"Strong skills presence ({total_skills} skills detected)")
    elif total_skills >= 8:
        skill_score = 15
        score -= 5
    else:
        score -= 20
        issues.append(f"Only {total_skills} skills detected — ATS needs more relevant keywords")

    # Word count (ideal 400–700 words)
    if 400 <= word_count <= 700:
        strengths.append("Resume length is optimal (400–700 words) for ATS processing")
    elif word_count < 200:
        score -= 15
        issues.append("Resume is too short — add more detail to experience and projects")
    elif word_count > 1000:
        score -= 10
        issues.append("Resume may be too long — keep to 1 page for freshers, 2 for experienced")

    # ATS bad signals
    for signal_name, pattern, message in ATS_BAD_SIGNALS:
        if re.search(pattern, text, re.IGNORECASE):
            score -= 5
            issues.append(message)

    # Contact info
    if re.search(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", text):
        strengths.append("Email address found — ATS can identify candidate")
    else:
        score -= 10
        issues.append("No email address found — include contact information")

    if re.search(r"linkedin\.com", text, re.I):
        strengths.append("LinkedIn profile link found")

    if re.search(r"github\.com", text, re.I):
        strengths.append("GitHub profile link found — great for technical roles")

    return max(0, min(100, score)), issues, strengths


def _score_content(text: str, achievements: list, experience: list, projects: list, action_verb_count: int) -> tuple:
    """Score content quality (0-100)."""
    score = 50.0
    strengths = []
    weaknesses = []

    # Quantified achievements
    quant_count = len(re.findall(
        r"\d+\s*%|\d+\s+(?:users?|clients?|customers?|projects?|percent|hours?|days?|weeks?|months?|\$)",
        text, re.I
    ))
    if quant_count >= 5:
        score += 20
        strengths.append(f"Excellent use of quantified achievements ({quant_count} metrics found)")
    elif quant_count >= 2:
        score += 10
        strengths.append(f"Some quantified achievements ({quant_count} found) — add more")
    else:
        weaknesses.append("Add quantified achievements (e.g., 'Reduced load time by 40%')")

    # Action verbs
    if action_verb_count >= 8:
        score += 15
        strengths.append(f"Strong use of action verbs ({action_verb_count} found)")
    elif action_verb_count >= 4:
        score += 8
    else:
        weaknesses.append("Use strong action verbs (Led, Built, Optimized, Reduced)")

    # Projects
    if len(projects) >= 3:
        score += 10
        strengths.append(f"{len(projects)} projects listed — strong portfolio signal")
    elif len(projects) >= 1:
        score += 5
    else:
        weaknesses.append("Add portfolio projects — essential for freshers and career changers")

    # Experience
    if len(experience) >= 2:
        score += 5

    # Summary/objective
    if re.search(SECTION_PATTERNS["summary"], text, re.I):
        score += 5
        strengths.append("Professional summary/objective found")
    else:
        weaknesses.append("Add a professional summary (2–3 sentences about your value proposition)")

    return max(0, min(100, score)), strengths, weaknesses


def _score_format(text: str, word_count: int, char_count: int) -> tuple:
    """Score formatting quality (0-100)."""
    score = 80.0
    issues = []

    # Length checks
    if word_count < 150:
        score -= 30
        issues.append("Resume is very short — expand with more detail")
    elif word_count > 1200:
        score -= 15
        issues.append("Resume is too long — trim to 1-2 pages")

    # All caps overuse
    caps_words = len(re.findall(r"\b[A-Z]{4,}\b", text))
    total_words = len(text.split())
    if total_words > 0 and caps_words / total_words > 0.15:
        score -= 10
        issues.append("Excessive use of all-caps text — use title case for headers")

    # Special characters / encoding issues
    garbage_chars = len(re.findall(r"[^\x20-\x7E\u00A0-\u024F\n\t]", text))
    if garbage_chars > 20:
        score -= 10
        issues.append("Encoding issues detected — some characters may not render correctly")

    return max(0, min(100, score)), issues


def _score_skills(skills_data: dict) -> tuple:
    """Score skills breadth and depth (0-100)."""
    tech_skills = skills_data["technical"]
    soft_skills = skills_data["soft"]
    by_category = skills_data.get("by_category", {})
    strengths = []
    weaknesses = []

    # Number of unique technical skills
    tech_count = len(tech_skills)
    if tech_count >= 20:
        tech_score = 90
        strengths.append(f"Excellent technical breadth ({tech_count} technical skills)")
    elif tech_count >= 12:
        tech_score = 75
        strengths.append(f"Good range of technical skills ({tech_count} found)")
    elif tech_count >= 6:
        tech_score = 60
    elif tech_count >= 2:
        tech_score = 40
        weaknesses.append("Add more relevant technical skills to your resume")
    else:
        tech_score = 20
        weaknesses.append("Very few technical skills detected — this is critical")

    # Category diversity
    cat_count = len(by_category)
    if cat_count >= 5:
        strengths.append(f"Skills span {cat_count} categories — shows versatility")
        cat_bonus = 10
    elif cat_count >= 3:
        cat_bonus = 5
    else:
        cat_bonus = 0
        weaknesses.append("Diversify skills across more categories (e.g., tools, cloud, testing)")

    # Soft skills
    soft_count = len(soft_skills)
    if soft_count >= 4:
        strengths.append(f"{soft_count} soft skills listed")
    elif soft_count == 0:
        weaknesses.append("Include relevant soft skills (teamwork, problem-solving, communication)")

    score = min(100, tech_score + cat_bonus)
    return score, strengths, weaknesses


def _score_experience(experience: list, text: str, word_count: int) -> tuple:
    """Score work experience quality (0-100)."""
    strengths = []
    weaknesses = []

    internship = re.search(r"(?i)\b(intern|internship|trainee)\b", text)
    full_time = re.search(r"(?i)\b(engineer|developer|analyst|manager|associate|consultant)\b", text)

    if len(experience) >= 3 or (full_time and len(experience) >= 1):
        score = 85
        strengths.append(f"Work experience found ({len(experience)} entries detected)")
    elif internship:
        score = 65
        strengths.append("Internship experience found — relevant for entry-level roles")
    elif re.search(r"(?i)\b(project|hackathon|open.?source|freelanc)\b", text):
        score = 50
        strengths.append("Project/freelance experience compensates for limited formal experience")
        weaknesses.append("Seek internship or part-time experience to strengthen your profile")
    else:
        score = 30
        weaknesses.append("No clear work experience — list internships, projects, or freelance work")

    # Action verbs in experience
    if _count_action_verbs(text) >= 5:
        score = min(100, score + 10)
        strengths.append("Experience bullets use strong action verbs")

    return score, strengths, weaknesses


def _score_education(education: list) -> tuple:
    """Score education section (0-100)."""
    strengths = []
    if not education:
        return 30, []

    best_score = 30
    for entry in education:
        degree = entry.get("degree", "")
        d_score = DEGREE_WEIGHTS.get(degree, 50)
        if d_score > best_score:
            best_score = d_score
            strengths.append(f"{degree} detected")

    if entry.get("gpa"):
        strengths.append(f"GPA/percentage listed ({entry['gpa']})")

    return min(100, best_score), strengths


def _count_action_verbs(text: str) -> int:
    """Count distinct action verbs in text."""
    text_lower = text.lower()
    count = 0
    for verb in ACTION_VERBS:
        if re.search(r"\b" + verb + r"\b", text_lower):
            count += 1
    return count


def _generate_improvements(sections, skills_data, ats_issues, format_issues,
                           word_count, achievements, experience, projects) -> List[Dict]:
    """
    Generate evidence-backed, actionable improvement suggestions.
    Guarantees no fabricated achievements or invented credentials.
    """
    improvements = []

    # Missing required sections
    for section in REQUIRED_SECTIONS:
        if section not in sections:
            improvements.append({
                "severity": "high",
                "priority": "high",
                "category": "structure",
                "issue": f"Missing '{section.title()}' Section",
                "explanation": f"The parser did not detect a standard heading for '{section.title()}'. Most ATS parsers categorize text by section headers.",
                "evidence": f"Detected sections: {', '.join(sorted(sections)) if sections else 'None'}",
                "why_it_matters": "Applicant Tracking Systems may fail to categorize your qualifications without standard headers, lowering parse accuracy.",
                "recommended_correction": f"Add a clearly labeled '{section.title()}' section at the top level of your resume.",
                "template_example": f"## {section.title()}\n- [Add your verified {section} details here]",
            })

    # Missing recommended sections
    for section in RECOMMENDED_SECTIONS:
        if section not in sections:
            improvements.append({
                "severity": "medium",
                "priority": "medium",
                "category": "structure",
                "issue": f"No '{section.title()}' Section Found",
                "explanation": f"Including a '{section.title()}' section provides valuable evidence of practical hands-on capability.",
                "evidence": f"Sections present: {len(sections)}",
                "why_it_matters": "Recruiters and hiring managers look for tangible evidence of skills applied in practice.",
                "recommended_correction": f"Consider adding a '{section.title()}' section highlighting 2–3 relevant items.",
                "template_example": f"## {section.title()}\n- [Item Name]: [Technical contribution and verified outcome]",
            })

    # Technical skills breadth
    tech_count = len(skills_data.get("technical", []))
    if tech_count < 8:
        improvements.append({
            "severity": "high",
            "priority": "high",
            "category": "skills",
            "issue": f"Limited Technical Keywords ({tech_count} detected)",
            "explanation": "Modern ATS filters parse resumes for explicit skill keywords required by job descriptions.",
            "evidence": f"Found skills: {', '.join(skills_data.get('technical', [])[:5]) if tech_count else 'None'}",
            "why_it_matters": "Without explicit keywords, automated resume screenings may filter out your profile before human review.",
            "recommended_correction": "List all technologies, frameworks, libraries, databases, and developer tools you have actually worked with in a dedicated Skills section.",
            "template_example": "Languages: Python, JavaScript | Frameworks: React, Flask | Databases: PostgreSQL | Tools: Git, Docker",
        })

    # Measurable outcomes / quantification
    quant_count = len(achievements)
    if quant_count < 2:
        improvements.append({
            "severity": "high",
            "priority": "high",
            "category": "content",
            "issue": "Few Quantifiable Outcomes Detected",
            "explanation": "Bullet points describe responsibilities rather than measurable business or engineering impact.",
            "evidence": f"Detected {quant_count} quantified metric patterns in resume text.",
            "why_it_matters": "Hiring managers prioritize candidates who demonstrate concrete, verifiable results over generic duty lists.",
            "recommended_correction": "Revise bullet points using the formula: Action Verb + Technical Contribution + Context + Verified Metric. Do not fabricate metrics; specify real measurements (e.g. users served, speedup %, test coverage, queries optimized).",
            "template_example": "Engineered [feature/service] using [Tech Stack], optimizing [database/API latency] by [your metric, e.g. 25%] across [user count/requests].",
        })

    # Project portfolio
    proj_count = len(projects)
    if proj_count < 2:
        improvements.append({
            "severity": "high",
            "priority": "high",
            "category": "projects",
            "issue": "Project Evidence is Limited",
            "explanation": f"Found {proj_count} project entries. Strong technical resumes feature 2–3 in-depth projects with architecture details.",
            "evidence": f"Detected projects: {proj_count}",
            "why_it_matters": "For students and early career engineers, personal and academic projects serve as primary proof of software engineering competency.",
            "recommended_correction": "Add 2–3 comprehensive technical projects detailing: problem solved, architectural choices, stack used, and live demo / GitHub link.",
            "template_example": "[Project Name] | [Tech Stack: e.g. React, Flask, PostgreSQL]\n• Architected [feature] using [tool] to solve [problem], handling [metric, e.g. 500+ records/sec].",
        })

    # Word count and layout density
    if word_count < 300:
        improvements.append({
            "severity": "medium",
            "priority": "medium",
            "category": "format",
            "issue": f"Resume Text is Brief ({word_count} words)",
            "explanation": "The document contains under 300 words, leaving insufficient depth for ATS parsing and recruiter evaluation.",
            "evidence": f"Current word count: {word_count} words (optimal range: 450–700 words).",
            "why_it_matters": "Brief resumes frequently miss keyword variations and lack the context required to validate competency.",
            "recommended_correction": "Flesh out experience and project descriptions with specific technical contributions, tools, and methodologies.",
            "template_example": "Target 3–4 bullet points per significant project or role, each 1–2 lines in length.",
        })

    return improvements


def _find_missing_sections(present_sections: set) -> List[str]:
    """Identify which important sections are missing."""
    all_important = set(REQUIRED_SECTIONS + RECOMMENDED_SECTIONS)
    return [s.title() for s in all_important - present_sections]


def _extract_keywords(text: str, skills_data: dict) -> List[str]:
    """Extract top keywords from resume text."""
    keywords = []
    keywords.extend(skills_data["technical"][:20])
    keywords.extend(skills_data["soft"][:10])

    # Also extract capitalized noun phrases
    caps_phrases = re.findall(r"\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2}\b", text)
    for phrase in caps_phrases:
        if phrase not in keywords and len(phrase) > 3:
            keywords.append(phrase)

    return list(dict.fromkeys(keywords))[:30]


def _empty_analysis(reason: str) -> Dict:
    """Return empty analysis result with error."""
    return {
        "error": reason,
        "scores": {k: 0 for k in ["overall", "ats", "content", "format", "skills", "experience", "education"]},
        "skills_technical": [], "skills_soft": [], "education": [], "experience": [],
        "projects": [], "certifications": [], "achievements": [], "contact_info": {},
        "strengths": [], "weaknesses": [reason], "improvements": [],
        "ats_issues": [], "missing_sections": [], "keywords": [],
        "present_sections": [], "word_count": 0,
    }
