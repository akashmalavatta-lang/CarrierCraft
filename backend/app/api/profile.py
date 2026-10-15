"""
CC — Career Craft
Profile API: View and update user profile.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import User

profile_bp = Blueprint("profile", __name__)

ALLOWED_EXPERIENCE_LEVELS = {"fresher", "junior", "mid", "senior"}


@profile_bp.route("/", methods=["GET"])
@jwt_required()
def get_profile():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"profile": user.to_dict()}), 200


@profile_bp.route("/", methods=["PUT"])
@jwt_required()
def update_profile():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json(silent=True) or {}

    if "name" in data:
        name = data["name"].strip()
        if not name or len(name) < 2:
            return jsonify({"error": "Name must be at least 2 characters"}), 422
        user.name = name[:120]

    if "target_role" in data:
        user.target_role = data["target_role"].strip()[:200]

    if "experience_level" in data:
        level = data["experience_level"].strip()
        if level in ALLOWED_EXPERIENCE_LEVELS:
            user.experience_level = level

    if "location" in data:
        user.location = data["location"].strip()[:200]

    if "phone" in data:
        user.phone = data["phone"].strip()[:30]

    db.session.commit()
    return jsonify({
        "message": "Profile updated",
        "profile": user.to_dict(),
    }), 200
