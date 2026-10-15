"""
CC — Career Craft
Resume API: Upload, parse, analyze, list, compare, delete resumes.
"""
import os
import uuid
import json
import bleach
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename

from app import db
from app.models import Resume, ResumeAnalysis, User, UserActivity, SkillProgress, JobMatch
from app.ml.parser import extract_text
from app.ml.analyzer import analyze_resume
from app.ml.matcher import match_resume_to_jd

resume_bp = Blueprint("resume", __name__)

ALLOWED_EXT = {"pdf", "docx"}


def _allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXT


def _get_user_or_404(user_id: int):
    user = db.session.get(User, user_id)
    if not user:
        return None, jsonify({"error": "User not found"}), 404
    return user, None, None


@resume_bp.route("/upload", methods=["POST"])
@jwt_required()
def upload_resume():
    """Upload and immediately analyze a resume file (PDF or DOCX)."""
    user_id = int(get_jwt_identity())
    user, err_resp, code = _get_user_or_404(user_id)
    if err_resp:
        return err_resp, code

    if "file" not in request.files:
        return jsonify({"error": "No file provided. Use multipart/form-data with field 'file'"}), 400

    file = request.files["file"]
    if not file.filename:
        return jsonify({"error": "No file selected"}), 400

    if not _allowed_file(file.filename):
        return jsonify({"error": "Only PDF and DOCX files are supported"}), 415

    # Check file size (redundant safety check beyond Flask config)
    file.seek(0, 2)
    file_size = file.tell()
    file.seek(0)
    if file_size > 10 * 1024 * 1024:
        return jsonify({"error": "File size exceeds 10MB limit"}), 413

    label = (request.form.get("label") or "").strip() or None

    # Save file with unique name to prevent collisions
    ext = file.filename.rsplit(".", 1)[1].lower()
    unique_name = f"{user_id}_{uuid.uuid4().hex}.{ext}"
    safe_original = secure_filename(file.filename)
    upload_dir = current_app.config["UPLOAD_FOLDER"]
    user_dir = os.path.join(upload_dir, str(user_id))
    os.makedirs(user_dir, exist_ok=True)
    file_path = os.path.join(user_dir, unique_name)
    file.save(file_path)

    # Count existing resumes for versioning
    existing_count = Resume.query.filter_by(user_id=user_id).count()

    # Create Resume record
    resume = Resume(
        user_id=user_id,
        filename=unique_name,
        original_filename=safe_original,
        file_path=file_path,
        file_type=ext,
        label=label,
        version=existing_count + 1,
    )
    db.session.add(resume)
    db.session.flush()

    # Extract text
    extract_result = extract_text(file_path)
    if not extract_result["success"]:
        # Store resume record even if extraction failed
        db.session.commit()
        return jsonify({
            "error": f"File saved but text extraction failed: {extract_result['error']}",
            "resume_id": resume.id,
        }), 422

    resume.raw_text = extract_result["text"]

    # Analyze resume
    analysis_data = analyze_resume(extract_result["text"])

    analysis = ResumeAnalysis(
        resume_id=resume.id,
        overall_score=analysis_data["scores"]["overall"],
        ats_score=analysis_data["scores"]["ats"],
        content_score=analysis_data["scores"]["content"],
        format_score=analysis_data["scores"]["format"],
        skills_score=analysis_data["scores"]["skills"],
        experience_score=analysis_data["scores"]["experience"],
        education_score=analysis_data["scores"]["education"],
        skills_technical=json.dumps(analysis_data["skills_technical"]),
        skills_soft=json.dumps(analysis_data["skills_soft"]),
        education=json.dumps(analysis_data["education"]),
        experience=json.dumps(analysis_data["experience"]),
        projects=json.dumps(analysis_data["projects"]),
        certifications=json.dumps(analysis_data["certifications"]),
        achievements=json.dumps(analysis_data["achievements"]),
        contact_info=json.dumps(analysis_data["contact_info"]),
        strengths=json.dumps(analysis_data["strengths"]),
        weaknesses=json.dumps(analysis_data["weaknesses"]),
        improvements=json.dumps(analysis_data["improvements"]),
        ats_issues=json.dumps(analysis_data["ats_issues"]),
        missing_sections=json.dumps(analysis_data["missing_sections"]),
        keywords=json.dumps(analysis_data["keywords"]),
    )
    db.session.add(analysis)

    # Update skill progress records for the user
    _update_skill_progress(user_id, analysis_data["skills_technical"], user.target_role or "")

    # Log activity
    activity = UserActivity(
        user_id=user_id,
        activity_type="resume_upload",
        description=f"Uploaded and analyzed '{safe_original}'",
        points=20,
    )
    db.session.add(activity)
    db.session.commit()

    return jsonify({
        "message": "Resume uploaded and analyzed successfully",
        "resume": resume.to_dict(),
        "analysis": analysis.to_dict(),
    }), 201


@resume_bp.route("/list", methods=["GET"])
@jwt_required()
def list_resumes():
    """List all resumes for the current user."""
    user_id = int(get_jwt_identity())
    resumes = (
        Resume.query.filter_by(user_id=user_id)
        .order_by(Resume.created_at.desc())
        .all()
    )
    return jsonify({
        "resumes": [r.to_dict() for r in resumes],
        "total": len(resumes),
    }), 200


@resume_bp.route("/<int:resume_id>", methods=["GET"])
@jwt_required()
def get_resume(resume_id: int):
    """Get a specific resume with its full analysis."""
    user_id = int(get_jwt_identity())
    resume = Resume.query.filter_by(id=resume_id, user_id=user_id).first()
    if not resume:
        return jsonify({"error": "Resume not found"}), 404

    result = resume.to_dict()
    if resume.analysis:
        result["analysis"] = resume.analysis.to_dict()

    return jsonify(result), 200


@resume_bp.route("/<int:resume_id>/match", methods=["POST"])
@jwt_required()
def match_jd(resume_id: int):
    """Match a resume against a pasted job description."""
    user_id = int(get_jwt_identity())
    resume = Resume.query.filter_by(id=resume_id, user_id=user_id).first()
    if not resume:
        return jsonify({"error": "Resume not found"}), 404

    if not resume.raw_text:
        return jsonify({"error": "Resume text not extracted — please re-upload the file"}), 422

    data = request.get_json(silent=True) or {}
    jd_text = (data.get("job_description") or "").strip()
    job_title = bleach.clean((data.get("job_title") or ""), strip=True)
    company_name = bleach.clean((data.get("company_name") or ""), strip=True)

    if not jd_text or len(jd_text) < 50:
        return jsonify({"error": "Job description must be at least 50 characters"}), 400

    match_data = match_resume_to_jd(resume.raw_text, jd_text)

    # Persist match result
    job_match = JobMatch(
        user_id=user_id,
        resume_id=resume_id,
        job_title=job_title or "Unknown Role",
        job_description=jd_text[:5000],
        company_name=company_name,
        match_score=match_data["scores"]["overall"],
        keyword_score=match_data["scores"]["keyword"],
        semantic_score=match_data["scores"]["semantic"],
        skills_score=match_data["scores"]["skills"],
        matched_skills=json.dumps(match_data["matched_skills"]),
        missing_skills=json.dumps(match_data["missing_skills"]),
        matched_keywords=json.dumps(match_data["matched_keywords"]),
        missing_keywords=json.dumps(match_data["missing_keywords"]),
        recommendations=json.dumps(match_data["recommendations"]),
        mandatory_requirements=json.dumps(match_data["mandatory_requirements"]),
        preferred_requirements=json.dumps(match_data["preferred_requirements"]),
    )
    db.session.add(job_match)

    activity = UserActivity(
        user_id=user_id,
        activity_type="jd_match",
        description=f"Matched resume against '{job_title or 'a job description'}'",
        points=10,
    )
    db.session.add(activity)
    db.session.commit()

    return jsonify({
        "match_id": job_match.id,
        **match_data,
    }), 200


@resume_bp.route("/<int:resume_id>", methods=["DELETE"])
@jwt_required()
def delete_resume(resume_id: int):
    """Delete a resume and its associated file."""
    user_id = int(get_jwt_identity())
    resume = Resume.query.filter_by(id=resume_id, user_id=user_id).first()
    if not resume:
        return jsonify({"error": "Resume not found"}), 404

    # Delete file from disk
    try:
        if os.path.exists(resume.file_path):
            os.remove(resume.file_path)
    except Exception as e:
        current_app.logger.warning(f"Could not delete file {resume.file_path}: {e}")

    db.session.delete(resume)
    db.session.commit()
    return jsonify({"message": "Resume deleted successfully"}), 200


@resume_bp.route("/matches", methods=["GET"])
@jwt_required()
def list_matches():
    """List all JD matches for the current user."""
    user_id = int(get_jwt_identity())
    matches = (
        JobMatch.query.filter_by(user_id=user_id)
        .order_by(JobMatch.created_at.desc())
        .limit(20)
        .all()
    )
    return jsonify({
        "matches": [m.to_dict() for m in matches],
        "total": len(matches),
    }), 200


def _update_skill_progress(user_id: int, technical_skills: list, target_role: str):
    """Upsert skill progress records for extracted skills."""
    for skill_name in technical_skills:
        existing = SkillProgress.query.filter_by(user_id=user_id, skill_name=skill_name).first()
        if existing:
            existing.is_current = True
        else:
            sp = SkillProgress(
                user_id=user_id,
                skill_name=skill_name,
                proficiency=60.0,  # default proficiency for listed skills
                is_current=True,
                is_target=False,
            )
            db.session.add(sp)
