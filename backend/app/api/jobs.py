"""
CC — Career Craft
Jobs API: Discover opportunities using free public APIs + search links.

Sources:
1. Arbeitnow API (free, no key required) — remote tech jobs globally
2. Adzuna API (free tier, requires app_id + app_key) — broad job index
3. Fallback: Transparent search links to LinkedIn, Internshala, Indeed, Naukri
"""
import os
import logging
import requests
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app import db
from app.models import SavedJob, User

jobs_bp = Blueprint("jobs", __name__)
logger = logging.getLogger(__name__)

ARBEITNOW_URL = "https://www.arbeitnow.com/api/job-board-api"
ADZUNA_BASE = "https://api.adzuna.com/v1/api/jobs"

# Reliable Indian job portals for search-link fallback (no API needed)
SEARCH_PORTALS = [
    {
        "name": "LinkedIn Jobs",
        "url_template": "https://www.linkedin.com/jobs/search/?keywords={query}&location={location}",
        "description": "Global professional network with millions of listings",
        "type": "link",
    },
    {
        "name": "Internshala",
        "url_template": "https://internshala.com/internships/{query}-internship/",
        "description": "India's #1 platform for internships and fresher jobs",
        "type": "link",
    },
    {
        "name": "Naukri.com",
        "url_template": "https://www.naukri.com/{query}-jobs?experience=0",
        "description": "India's largest job portal for freshers",
        "type": "link",
    },
    {
        "name": "Indeed India",
        "url_template": "https://in.indeed.com/jobs?q={query}&l={location}&explvl=entry_level",
        "description": "Large job index with filtering by experience level",
        "type": "link",
    },
    {
        "name": "Unstop (D2C)",
        "url_template": "https://unstop.com/jobs?search={query}",
        "description": "Competitions, hackathons, and fresher jobs",
        "type": "link",
    },
    {
        "name": "Wellfound (AngelList)",
        "url_template": "https://wellfound.com/jobs?role={query}",
        "description": "Startup jobs globally — great for freshers",
        "type": "link",
    },
]


@jobs_bp.route("/search", methods=["GET"])
@jwt_required()
def search_jobs():
    """
    Search for jobs using available free sources.
    Query params: q, location, page
    """
    user_id = int(get_jwt_identity())
    q = (request.args.get("q") or "").strip()
    location = (request.args.get("location") or "India").strip()
    page = max(1, int(request.args.get("page", 1)))

    if not q:
        # Auto-fill from user profile
        user = db.session.get(User, user_id)
        if user and user.target_role:
            q = user.target_role
        else:
            q = "software engineer"

    results = []
    sources_used = []
    errors = []

    # ── Source 1: Arbeitnow (no API key, free) ────────────────────────────────
    try:
        arbeitnow_jobs = _fetch_arbeitnow(q, page)
        if arbeitnow_jobs:
            results.extend(arbeitnow_jobs)
            sources_used.append("Arbeitnow")
    except Exception as e:
        logger.warning(f"Arbeitnow fetch failed: {e}")
        errors.append("Arbeitnow API temporarily unavailable")

    # ── Source 2: Adzuna (optional — requires API key) ────────────────────────
    adzuna_id = os.getenv("ADZUNA_APP_ID")
    adzuna_key = os.getenv("ADZUNA_APP_KEY")
    if adzuna_id and adzuna_key:
        try:
            adzuna_jobs = _fetch_adzuna(q, location, page, adzuna_id, adzuna_key)
            if adzuna_jobs:
                results.extend(adzuna_jobs)
                sources_used.append("Adzuna")
        except Exception as e:
            logger.warning(f"Adzuna fetch failed: {e}")
            errors.append("Adzuna API temporarily unavailable")

    # ── Search portal links (always provided) ─────────────────────────────────
    search_links = _build_search_links(q, location)

    return jsonify({
        "query": q,
        "location": location,
        "page": page,
        "jobs": results[:20],
        "total_found": len(results),
        "search_links": search_links,
        "sources_used": sources_used,
        "errors": errors,
        "note": "Live job data from free public sources. Always verify listings on the official source before applying.",
    }), 200


@jobs_bp.route("/save", methods=["POST"])
@jwt_required()
def save_job():
    """Save a job listing to the user's saved jobs."""
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}

    job = SavedJob(
        user_id=user_id,
        job_title=data.get("job_title", "")[:300],
        company=data.get("company", "")[:300],
        location=data.get("location", "")[:200],
        url=data.get("url", "")[:1000],
        description=data.get("description", "")[:2000],
        source=data.get("source", "manual")[:100],
    )
    db.session.add(job)
    db.session.commit()

    return jsonify({"message": "Job saved", "job": job.to_dict()}), 201


@jobs_bp.route("/saved", methods=["GET"])
@jwt_required()
def get_saved_jobs():
    """Get all saved jobs for the current user."""
    user_id = int(get_jwt_identity())
    jobs = (
        SavedJob.query.filter_by(user_id=user_id)
        .order_by(SavedJob.saved_at.desc())
        .all()
    )
    return jsonify({"jobs": [j.to_dict() for j in jobs], "total": len(jobs)}), 200


@jobs_bp.route("/saved/<int:job_id>", methods=["DELETE"])
@jwt_required()
def unsave_job(job_id: int):
    """Remove a job from saved jobs."""
    user_id = int(get_jwt_identity())
    job = SavedJob.query.filter_by(id=job_id, user_id=user_id).first()
    if not job:
        return jsonify({"error": "Saved job not found"}), 404
    db.session.delete(job)
    db.session.commit()
    return jsonify({"message": "Job removed from saved"}), 200


def _fetch_arbeitnow(query: str, page: int) -> list:
    """Fetch jobs from Arbeitnow free API (no auth required)."""
    resp = requests.get(
        ARBEITNOW_URL,
        params={"search": query, "page": page},
        timeout=8,
    )
    resp.raise_for_status()
    data = resp.json()
    jobs = data.get("data", [])

    results = []
    for job in jobs[:15]:
        results.append({
            "id": job.get("slug", ""),
            "title": job.get("title", ""),
            "company": job.get("company_name", ""),
            "location": job.get("location", "Remote"),
            "url": job.get("url", ""),
            "description": (job.get("description") or "")[:500],
            "tags": job.get("tags", [])[:8],
            "remote": job.get("remote", False),
            "source": "Arbeitnow",
            "posted_at": job.get("created_at", ""),
        })
    return results


def _fetch_adzuna(query: str, location: str, page: int, app_id: str, app_key: str) -> list:
    """Fetch jobs from Adzuna API (free tier)."""
    country = "in"  # India
    url = f"{ADZUNA_BASE}/{country}/search/{page}"
    params = {
        "app_id": app_id,
        "app_key": app_key,
        "results_per_page": 10,
        "what": query,
        "where": location,
        "sort_by": "date",
        "content-type": "application/json",
    }
    resp = requests.get(url, params=params, timeout=8)
    resp.raise_for_status()
    data = resp.json()
    jobs = data.get("results", [])

    results = []
    for job in jobs:
        results.append({
            "id": job.get("id", ""),
            "title": job.get("title", ""),
            "company": job.get("company", {}).get("display_name", ""),
            "location": job.get("location", {}).get("display_name", ""),
            "url": job.get("redirect_url", ""),
            "description": (job.get("description") or "")[:500],
            "salary_min": job.get("salary_min"),
            "salary_max": job.get("salary_max"),
            "source": "Adzuna",
            "posted_at": job.get("created", ""),
        })
    return results


def _build_search_links(query: str, location: str) -> list:
    """Build search links for manual job discovery."""
    import urllib.parse
    links = []
    q_encoded = urllib.parse.quote(query)
    loc_encoded = urllib.parse.quote(location)

    for portal in SEARCH_PORTALS:
        url = portal["url_template"].format(
            query=q_encoded,
            location=loc_encoded,
        )
        links.append({
            "name": portal["name"],
            "url": url,
            "description": portal["description"],
        })
    return links
