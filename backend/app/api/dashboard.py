"""
CC — Career Craft
Dashboard API: Aggregated user stats, activity feed, skill gap chart data.
"""
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app import db
from app.models import User, Resume, ResumeAnalysis, Interview, SkillProgress, UserActivity, JobMatch

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.route("/", methods=["GET"])
@jwt_required()
def get_dashboard():
    """Get complete dashboard data for the current user."""
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    # ── Resume stats ──────────────────────────────────────────────────────────
    resumes = Resume.query.filter_by(user_id=user_id).order_by(Resume.created_at.desc()).all()
    latest_resume = resumes[0] if resumes else None
    latest_analysis = latest_resume.analysis if latest_resume else None

    # ── Interview stats ───────────────────────────────────────────────────────
    all_interviews = Interview.query.filter_by(user_id=user_id).all()
    completed_interviews = [i for i in all_interviews if i.status == "completed"]
    avg_interview_score = (
        sum(i.overall_score for i in completed_interviews if i.overall_score) /
        len(completed_interviews)
        if completed_interviews else None
    )

    # ── Skill gap data ────────────────────────────────────────────────────────
    skill_progress = SkillProgress.query.filter_by(user_id=user_id).all()
    current_skills = [s for s in skill_progress if s.is_current]
    target_skills = [s for s in skill_progress if s.is_target]
    gap_skills = [s for s in skill_progress if s.is_target and not s.is_current]

    # ── Recent activity ───────────────────────────────────────────────────────
    recent_activities = (
        UserActivity.query.filter_by(user_id=user_id)
        .order_by(UserActivity.created_at.desc())
        .limit(10)
        .all()
    )

    # ── Total points ──────────────────────────────────────────────────────────
    total_points = db.session.query(db.func.sum(UserActivity.points)).filter_by(user_id=user_id).scalar() or 0

    # ── Recent JD matches ─────────────────────────────────────────────────────
    recent_matches = (
        JobMatch.query.filter_by(user_id=user_id)
        .order_by(JobMatch.created_at.desc())
        .limit(3)
        .all()
    )

    # ── Preparation streak (days with at least one activity) ─────────────────
    streak = _calculate_streak(recent_activities)

    # ── Career readiness score ────────────────────────────────────────────────
    readiness = _calculate_readiness(
        latest_analysis=latest_analysis,
        avg_interview_score=avg_interview_score,
        current_skills_count=len(current_skills),
        completed_interviews_count=len(completed_interviews),
        has_projects=len(resumes) > 0,
    )

    return jsonify({
        "user": user.to_dict(),
        "resume_stats": {
            "total_resumes": len(resumes),
            "latest_resume": latest_resume.to_dict() if latest_resume else None,
            "latest_score": round(latest_analysis.overall_score, 1) if latest_analysis else None,
            "ats_score": round(latest_analysis.ats_score, 1) if latest_analysis else None,
        },
        "interview_stats": {
            "total_interviews": len(all_interviews),
            "completed": len(completed_interviews),
            "avg_score": round(avg_interview_score, 1) if avg_interview_score else None,
            "recent": [i.to_dict() for i in completed_interviews[-3:]],
        },
        "skill_stats": {
            "current_skills_count": len(current_skills),
            "target_skills_count": len(target_skills),
            "gap_skills_count": len(gap_skills),
            "current_skills": [s.to_dict() for s in current_skills[:10]],
            "gap_skills": [s.to_dict() for s in gap_skills[:8]],
        },
        "recent_activity": [a.to_dict() for a in recent_activities],
        "recent_matches": [m.to_dict() for m in recent_matches],
        "total_points": total_points,
        "streak_days": streak,
        "career_readiness": readiness,
    }), 200


@dashboard_bp.route("/skill-chart", methods=["GET"])
@jwt_required()
def skill_chart():
    """Return skill gap chart data (for radar/bar chart in frontend)."""
    user_id = int(get_jwt_identity())
    skill_progress = SkillProgress.query.filter_by(user_id=user_id).all()

    # Group by category for radar chart
    from app.ml.extractor import SKILL_TAXONOMY
    category_data = {}

    for sp in skill_progress:
        cat = sp.category or "other"
        if cat not in category_data:
            category_data[cat] = {"current": 0, "target": 0, "count": 0}
        category_data[cat]["count"] += 1
        if sp.is_current:
            category_data[cat]["current"] += sp.proficiency
        if sp.is_target:
            category_data[cat]["target"] += 100  # target = fully needed

    chart_data = []
    for cat, vals in category_data.items():
        if vals["count"] > 0:
            chart_data.append({
                "category": cat.replace("_", " ").title(),
                "current": round(vals["current"] / vals["count"], 1),
                "target": min(100, vals["target"]),
                "gap": max(0, vals["target"] - vals["current"]) / vals["count"],
            })

    return jsonify({"chart_data": chart_data}), 200


def _calculate_streak(activities: list) -> int:
    """Calculate consecutive days with activity."""
    if not activities:
        return 0

    from datetime import date, timedelta
    activity_dates = set()
    for a in activities:
        if a.created_at:
            activity_dates.add(a.created_at.date())

    today = date.today()
    streak = 0
    current = today
    while current in activity_dates:
        streak += 1
        current -= timedelta(days=1)

    return streak


def _calculate_readiness(
    latest_analysis, avg_interview_score, current_skills_count,
    completed_interviews_count, has_projects
) -> dict:
    """Calculate overall career readiness score with explanation."""
    components = {}
    total = 0

    # Resume quality (30%)
    if latest_analysis:
        resume_component = latest_analysis.overall_score * 0.30
        components["resume"] = round(latest_analysis.overall_score, 1)
    else:
        resume_component = 0
        components["resume"] = 0
    total += resume_component

    # Interview performance (30%)
    if avg_interview_score:
        interview_component = avg_interview_score * 0.30
        components["interview"] = round(avg_interview_score, 1)
    elif completed_interviews_count > 0:
        interview_component = 40 * 0.30
        components["interview"] = 40
    else:
        interview_component = 0
        components["interview"] = 0
    total += interview_component

    # Skills breadth (25%)
    skills_score = min(100, current_skills_count * 5)
    components["skills"] = skills_score
    total += skills_score * 0.25

    # Activity/engagement (15%)
    engagement = min(100, (completed_interviews_count * 15) + (20 if has_projects else 0))
    components["engagement"] = engagement
    total += engagement * 0.15

    overall = round(total, 1)

    if overall >= 75:
        label = "Job Ready"
        description = "Your profile is strong. Focus on targeted applications and networking."
    elif overall >= 55:
        label = "Nearly Ready"
        description = "Complete your resume optimization and practice more interviews."
    elif overall >= 35:
        label = "In Progress"
        description = "Upload your resume, take mock interviews, and fill skill gaps."
    else:
        label = "Getting Started"
        description = "Start by uploading your resume to get your first analysis."

    return {
        "overall": overall,
        "label": label,
        "description": description,
        "components": components,
    }
