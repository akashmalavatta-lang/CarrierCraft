"""
CC — Career Craft Backend
Flask application factory with all extensions configured.
"""
import os
from flask import Flask, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_migrate import Migrate
from dotenv import load_dotenv

load_dotenv()

db = SQLAlchemy()
jwt = JWTManager()
bcrypt = Bcrypt()
migrate = Migrate()


def create_app(config_name: str = None) -> Flask:
    app = Flask(__name__, instance_relative_config=True)

    # ── Core config ──────────────────────────────────────────────────────────
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "cc-secret-career-craft-prod-key-2026-secure")
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "cc-jwt-secret-career-craft-2026-secure-key-32b")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = 60 * 60 * 24  # 24 hours (seconds)

    # Database configuration & path safety
    os.makedirs(app.instance_path, exist_ok=True)
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        sqlite_file = os.path.join(app.instance_path, "cc_careercraft.db")
        db_url = f"sqlite:///{sqlite_file}"
    elif db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)

    app.config["SQLALCHEMY_DATABASE_URI"] = db_url
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    if db_url.startswith("sqlite"):
        app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
            "connect_args": {
                "timeout": 30,
                "check_same_thread": False,
            }
        }

    # File uploads
    upload_folder = os.path.join(app.instance_path, "uploads")
    os.makedirs(upload_folder, exist_ok=True)
    app.config["UPLOAD_FOLDER"] = upload_folder
    app.config["MAX_CONTENT_LENGTH"] = int(
        os.getenv("MAX_CONTENT_LENGTH", 10 * 1024 * 1024)
    )
    app.config["ALLOWED_EXTENSIONS"] = {"pdf", "docx"}

    # ── Extensions ───────────────────────────────────────────────────────────
    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)
    migrate.init_app(app, db)

    raw_cors = os.getenv("CORS_ORIGINS", "*")
    if raw_cors == "*" or "*" in raw_cors.split(","):
        CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
    else:
        cors_origins = [o.strip() for o in raw_cors.split(",") if o.strip()]
        CORS(app, origins=cors_origins, supports_credentials=True)

    # ── Blueprints ────────────────────────────────────────────────────────────
    from app.api.auth import auth_bp
    from app.api.resume import resume_bp
    from app.api.jobs import jobs_bp
    from app.api.interview import interview_bp
    from app.api.dashboard import dashboard_bp
    from app.api.roadmap import roadmap_bp
    from app.api.linkedin import linkedin_bp
    from app.api.projects import projects_bp
    from app.api.profile import profile_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(resume_bp, url_prefix="/api/resume")
    app.register_blueprint(jobs_bp, url_prefix="/api/jobs")
    app.register_blueprint(interview_bp, url_prefix="/api/interview")
    app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")
    app.register_blueprint(roadmap_bp, url_prefix="/api/roadmap")
    app.register_blueprint(linkedin_bp, url_prefix="/api/linkedin")
    app.register_blueprint(projects_bp, url_prefix="/api/projects")
    app.register_blueprint(profile_bp, url_prefix="/api/profile")

    # ── Health check ──────────────────────────────────────────────────────────
    @app.route("/api/health")
    def health():
        return {"status": "ok", "app": "CC Career Craft", "version": "1.0.0"}

    # ── JWT error handlers ────────────────────────────────────────────────────
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return {"error": "Token has expired. Please login again."}, 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return {"error": "Invalid token."}, 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return {"error": "Authorization token required."}, 401

    # ── Optional: Serve production React build if dist exists ─────────────────
    frontend_dist = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "frontend", "dist"
    )
    if os.path.exists(frontend_dist):
        @app.route("/", defaults={"path": ""})
        @app.route("/<path:path>")
        def serve_frontend(path):
            if path and os.path.exists(os.path.join(frontend_dist, path)):
                return send_from_directory(frontend_dist, path)
            return send_from_directory(frontend_dist, "index.html")

    # Ensure tables exist safely
    try:
        with app.app_context():
            db.create_all()
    except Exception as e:
        app.logger.warning(f"Database initialization notice: {e}")

    return app
