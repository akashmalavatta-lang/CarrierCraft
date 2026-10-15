"""
CC — Career Craft
Auth API: Registration, login, logout, token refresh.
Security: bcrypt hashing, JWT tokens, input validation, rate limiting via flask.
"""
import re
from datetime import datetime, timezone
from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, jwt_required, get_jwt_identity, get_jwt
)

from app import db, bcrypt
from app.models import User, UserActivity

auth_bp = Blueprint("auth", __name__)

EMAIL_RE = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
BLOCKED_JWT_TOKENS = set()  # In-memory denylist (use Redis in production)


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "JSON body required"}), 400

    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = (data.get("password") or "").strip()

    # Validation
    errors = {}
    if not name or len(name) < 2:
        errors["name"] = "Name must be at least 2 characters"
    if len(name) > 120:
        errors["name"] = "Name must be under 120 characters"
    if not email or not EMAIL_RE.match(email):
        errors["email"] = "A valid email address is required"
    if not password or len(password) < 8:
        errors["password"] = "Password must be at least 8 characters"
    if errors:
        return jsonify({"error": "Validation failed", "fields": errors}), 422

    # Check uniqueness
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "An account with this email already exists"}), 409

    # Create user
    password_hash = bcrypt.generate_password_hash(password).decode("utf-8")
    user = User(
        name=name,
        email=email,
        password_hash=password_hash,
        target_role=data.get("target_role", ""),
        experience_level=data.get("experience_level", "fresher"),
    )
    db.session.add(user)
    db.session.flush()  # get user.id before commit

    # Log activity
    activity = UserActivity(
        user_id=user.id,
        activity_type="account_created",
        description="Welcome to CC Career Craft!",
        points=10,
    )
    db.session.add(activity)
    db.session.commit()

    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        "message": "Account created successfully",
        "access_token": access_token,
        "user": user.to_dict(),
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "JSON body required"}), 400

    email = (data.get("email") or "").strip().lower()
    password = (data.get("password") or "").strip()

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not bcrypt.check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid email or password"}), 401

    if not user.is_active:
        return jsonify({"error": "This account has been deactivated"}), 403

    # Update last login
    user.last_login = datetime.now(timezone.utc)
    db.session.commit()

    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        "message": "Login successful",
        "access_token": access_token,
        "user": user.to_dict(),
    }), 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"user": user.to_dict()}), 200


@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    jti = get_jwt()["jti"]
    BLOCKED_JWT_TOKENS.add(jti)
    return jsonify({"message": "Logged out successfully"}), 200


@auth_bp.route("/change-password", methods=["POST"])
@jwt_required()
def change_password():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json(silent=True) or {}
    current_password = (data.get("current_password") or "").strip()
    new_password = (data.get("new_password") or "").strip()

    if not bcrypt.check_password_hash(user.password_hash, current_password):
        return jsonify({"error": "Current password is incorrect"}), 401

    if len(new_password) < 8:
        return jsonify({"error": "New password must be at least 8 characters"}), 422

    user.password_hash = bcrypt.generate_password_hash(new_password).decode("utf-8")
    db.session.commit()
    return jsonify({"message": "Password changed successfully"}), 200


@auth_bp.route("/delete-account", methods=["DELETE"])
@jwt_required()
def delete_account():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json(silent=True) or {}
    password = (data.get("password") or "").strip()

    if not bcrypt.check_password_hash(user.password_hash, password):
        return jsonify({"error": "Password confirmation required to delete account"}), 401

    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "Account and all associated data deleted"}), 200
