"""
CC — Career Craft
LinkedIn Optimizer API: Analyze and improve LinkedIn profiles.
Uses manual input (no scraping — respects platform TOS).
"""
import re
import json
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

linkedin_bp = Blueprint("linkedin", __name__)

SECTION_WEIGHTS = {
    "headline": 20,
    "summary": 20,
    "experience": 25,
    "skills": 15,
    "education": 10,
    "projects": 10,
}

HEADLINE_KEYWORDS = [
    "engineer", "developer", "analyst", "scientist", "designer", "manager",
    "architect", "lead", "intern", "student", "fresher",
]


@linkedin_bp.route("/analyze", methods=["POST"])
@jwt_required()
def analyze_linkedin():
    """Analyze LinkedIn profile info and return optimization suggestions."""
    data = request.get_json(silent=True) or {}

    profile = {
        "headline": (data.get("headline") or "").strip(),
        "summary": (data.get("summary") or "").strip(),
        "experience": data.get("experience", []),
        "skills": data.get("skills", []),
        "education": data.get("education", []),
        "projects": data.get("projects", []),
        "certifications": data.get("certifications", []),
        "linkedin_url": (data.get("linkedin_url") or "").strip(),
        "target_role": (data.get("target_role") or "").strip(),
    }

    scores = {}
    suggestions = []
    optimized = {}

    # ── Headline ──────────────────────────────────────────────────────────────
    hl = profile["headline"]
    if not hl:
        scores["headline"] = 0
        suggestions.append({
            "section": "Headline",
            "priority": "high",
            "issue": "No headline found",
            "suggestion": "Add a compelling headline (120 chars max)",
            "example": f"{'Aspiring ' if not profile['target_role'] else ''}{profile.get('target_role', 'Software Engineer')} | Python • React • Machine Learning | B.Tech CSE",
        })
    elif len(hl) < 30:
        scores["headline"] = 40
        suggestions.append({
            "section": "Headline",
            "priority": "high",
            "issue": "Headline is too short",
            "suggestion": "Expand your headline to include your role, key skills, and value proposition",
            "example": f"{hl} | {profile.get('target_role', 'Software Engineer')} | Add your top 2-3 skills",
        })
    else:
        scores["headline"] = 80 if any(kw in hl.lower() for kw in HEADLINE_KEYWORDS) else 60
        if len(hl) < 80:
            suggestions.append({
                "section": "Headline",
                "priority": "low",
                "issue": "Headline could be more detailed",
                "suggestion": "Add specific skills or a brief value proposition",
                "example": f"{hl} | Specializing in {profile.get('target_role', 'Full Stack Development')}",
            })

    optimized["headline"] = _optimize_headline(profile)

    # ── Summary (About section) ───────────────────────────────────────────────
    summary = profile["summary"]
    if not summary:
        scores["summary"] = 0
        suggestions.append({
            "section": "About (Summary)",
            "priority": "high",
            "issue": "No About/Summary section",
            "suggestion": "Add a 3-5 sentence summary covering who you are, your skills, and what you're looking for",
        })
    elif len(summary.split()) < 50:
        scores["summary"] = 40
        suggestions.append({
            "section": "About (Summary)",
            "priority": "high",
            "issue": "Summary is too brief",
            "suggestion": "Expand to 150-300 words covering your background, key skills, notable projects, and career goal",
        })
    else:
        scores["summary"] = 80
        if not re.search(r"\b(looking for|seeking|open to|interested in)\b", summary, re.I):
            suggestions.append({
                "section": "About (Summary)",
                "priority": "low",
                "issue": "Summary lacks a call to action or career intent statement",
                "suggestion": "End with: 'Currently seeking [role] opportunities where I can [contribution]'",
            })

    optimized["summary"] = _optimize_summary(profile)

    # ── Skills ────────────────────────────────────────────────────────────────
    skills = profile["skills"]
    if len(skills) < 5:
        scores["skills"] = 30
        suggestions.append({
            "section": "Skills",
            "priority": "high",
            "issue": f"Only {len(skills)} skills listed",
            "suggestion": "LinkedIn allows up to 50 skills. Add all relevant technical and soft skills.",
        })
    elif len(skills) < 15:
        scores["skills"] = 60
        suggestions.append({
            "section": "Skills",
            "priority": "medium",
            "issue": f"Only {len(skills)} skills — can add more",
            "suggestion": "Add 15-30 relevant skills to improve keyword visibility in recruiter searches",
        })
    else:
        scores["skills"] = 90

    # ── Experience ────────────────────────────────────────────────────────────
    experience = profile["experience"]
    if not experience:
        scores["experience"] = 20
        suggestions.append({
            "section": "Experience",
            "priority": "high",
            "issue": "No experience listed",
            "suggestion": "Add all internships, part-time work, freelance projects, and volunteer work",
        })
    else:
        scores["experience"] = 70
        for exp in experience:
            desc = (exp.get("description") or "")
            if len(desc.split()) < 20:
                suggestions.append({
                    "section": "Experience",
                    "priority": "medium",
                    "issue": f"Experience entry '{exp.get('title', '')}' has little description",
                    "suggestion": "Add 3-5 bullet points with specific achievements and technologies used",
                })
                break

    # ── Overall ───────────────────────────────────────────────────────────────
    overall = sum(
        scores.get(k, 0) * (SECTION_WEIGHTS.get(k, 10) / 100)
        for k in SECTION_WEIGHTS
    )

    return jsonify({
        "overall_score": round(overall * 10, 1),  # scale to 0-100
        "section_scores": scores,
        "suggestions": suggestions,
        "optimized_content": optimized,
        "note": "Profile analyzed from manually entered information. LinkedIn scraping is not performed.",
        "tips": [
            "Get at least 3 recommendations from colleagues, professors, or managers",
            "Engage with posts in your target industry — recruiters check your activity",
            "Use LinkedIn's 'Open to Work' feature with specific role preferences",
            "Customize your LinkedIn URL (e.g., linkedin.com/in/yourname)",
            "Follow companies you want to work for and engage with their content",
        ],
    }), 200


def _optimize_headline(profile: dict) -> str:
    role = profile.get("target_role") or "Software Engineer"
    skills = profile.get("skills", [])
    top_skills = " • ".join(skills[:3]) if skills else "Python • React • SQL"
    edu = ""
    if profile.get("education"):
        edu = " | " + (profile["education"][0].get("degree", "") or "")
    return f"{role} | {top_skills}{edu}"


def _optimize_summary(profile: dict) -> str:
    role = profile.get("target_role") or "Software Engineer"
    skills = profile.get("skills", [])
    skill_str = ", ".join(skills[:5]) if skills else "Python, React, SQL"
    name_hint = "I"

    return (
        f"{name_hint} am an aspiring {role} with a passion for building impactful technology solutions. "
        f"My technical foundation spans {skill_str}, and I have hands-on experience through academic projects "
        f"and internships where I developed and deployed production-quality software. "
        f"I thrive in collaborative environments, enjoy solving complex problems, and am committed to continuous learning. "
        f"Currently seeking {role} opportunities where I can contribute meaningfully from day one. "
        f"Feel free to connect or reach out!"
    )
