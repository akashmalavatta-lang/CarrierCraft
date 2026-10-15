"""
CC — Career Craft
Roadmap API: Generate and save personalized learning roadmaps.
"""
import json
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app import db
from app.models import LearningRoadmap, Resume, User
from app.ml.roadmap_generator import generate_roadmap

roadmap_bp = Blueprint("roadmap", __name__)


@roadmap_bp.route("/generate", methods=["POST"])
@jwt_required()
def create_roadmap():
    """Generate a personalized learning roadmap."""
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json(silent=True) or {}
    target_role = (data.get("target_role") or user.target_role or "Software Engineer").strip()
    experience_level = data.get("experience_level") or user.experience_level or "fresher"

    # Get current skills from latest resume analysis
    current_skills = []
    latest_resume = (
        Resume.query.filter_by(user_id=user_id)
        .order_by(Resume.created_at.desc())
        .first()
    )
    if latest_resume and latest_resume.analysis:
        current_skills = json.loads(latest_resume.analysis.skills_technical or "[]")

    # Also accept manually provided skills
    manual_skills = data.get("current_skills", [])
    if manual_skills:
        current_skills.extend(manual_skills)
        current_skills = list(set(current_skills))

    roadmap_data = generate_roadmap(target_role, current_skills, experience_level)

    # Save or update roadmap
    existing = LearningRoadmap.query.filter_by(
        user_id=user_id, target_role=target_role
    ).first()

    if existing:
        existing.roadmap_data = json.dumps(roadmap_data)
        roadmap = existing
    else:
        roadmap = LearningRoadmap(
            user_id=user_id,
            target_role=target_role,
            roadmap_data=json.dumps(roadmap_data),
        )
        db.session.add(roadmap)

    db.session.commit()

    return jsonify({
        "roadmap_id": roadmap.id,
        "roadmap": roadmap_data,
    }), 200


@roadmap_bp.route("/", methods=["GET"])
@jwt_required()
def list_roadmaps():
    """List saved roadmaps for the current user."""
    user_id = int(get_jwt_identity())
    roadmaps = (
        LearningRoadmap.query.filter_by(user_id=user_id)
        .order_by(LearningRoadmap.updated_at.desc())
        .all()
    )
    return jsonify({
        "roadmaps": [r.to_dict() for r in roadmaps],
        "total": len(roadmaps),
    }), 200


@roadmap_bp.route("/<int:roadmap_id>", methods=["GET"])
@jwt_required()
def get_roadmap(roadmap_id: int):
    """Get a specific roadmap."""
    user_id = int(get_jwt_identity())
    roadmap = LearningRoadmap.query.filter_by(id=roadmap_id, user_id=user_id).first()
    if not roadmap:
        return jsonify({"error": "Roadmap not found"}), 404
    return jsonify({"roadmap": roadmap.to_dict()}), 200


@roadmap_bp.route("/<int:roadmap_id>", methods=["DELETE"])
@jwt_required()
def delete_roadmap(roadmap_id: int):
    """Delete a roadmap."""
    user_id = int(get_jwt_identity())
    roadmap = LearningRoadmap.query.filter_by(id=roadmap_id, user_id=user_id).first()
    if not roadmap:
        return jsonify({"error": "Roadmap not found"}), 404
    db.session.delete(roadmap)
    db.session.commit()
    return jsonify({"message": "Roadmap deleted"}), 200
