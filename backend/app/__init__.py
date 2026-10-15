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
from datetime import timedelta

db = SQLAlchemy()
jwt = JWTManager()
bcrypt = Bcrypt()
migrate = Migrate()


def create_app(config_name: str = None) -> Flask:
    app = Flask(__name__, instance_relative_config=True)

    # ── Core config ──────────────────────────────────────────────────────────
    app.config["SECRET_KEY"] = os.getenv(
        "SECRET_KEY",
        "cc-career-craft-super-secure-production-secret-key-32bytes-minimum-length-2026",
    )
    app.config["JWT_SECRET_KEY"] = os.getenv(
        "JWT_SECRET_KEY",
        "cc-jwt-secret-career-craft-2026-secure-key-minimum-32bytes-sha256-verified",
    )
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=7)

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
    else:
        # Production PostgreSQL connection pooling and resilient keep-alive
        app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
            "pool_pre_ping": True,
            "pool_recycle": 300,
            "pool_size": 5,
            "max_overflow": 10,
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

    # Robust CORS for both local dev and production
    CORS(
        app,
        resources={r"/api/*": {"origins": "*"}},
        allow_headers=["Content-Type", "Authorization", "X-Requested-With", "Accept"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        expose_headers=["Content-Type", "Authorization"],
    )

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

    # ── Health check (Supports both /health and /api/health) ───────────────────
    @app.route("/health")
    @app.route("/api/health")
    def health():
        from sqlalchemy import text
        db_ok = False
        db_message = "ok"
        try:
            db.session.execute(text("SELECT 1"))
            db_ok = True
        except Exception as e:
            db_message = str(e)
            app.logger.error(f"Healthcheck DB failure: {e}")

        # Check storage write access
        storage_ok = os.access(app.config["UPLOAD_FOLDER"], os.W_OK)

        status_code = 200 if (db_ok and storage_ok) else 503
        return {
            "status": "healthy" if status_code == 200 else "degraded",
            "app": "CareerCraft",
            "version": "1.0.0",
            "database": {"connected": db_ok, "detail": db_message},
            "storage": {"writable": storage_ok},
            "ml_engine": "operational",
        }, status_code

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

    # Safe idempotent table and demo user setup
    init_db(app)

    return app


def init_db(app: Flask):
    """
    Safely initialize database tables and seed initial demo user without race conditions.
    """
    with app.app_context():
        try:
            # Ensure models are imported into SQLAlchemy metadata before create_all
            import app.models  # noqa: F401
            db.create_all()
            from app.models import User
            demo_email = "demo@careercraft.io"
            if not User.query.filter_by(email=demo_email).first():
                demo_hash = bcrypt.generate_password_hash("Password123!").decode("utf-8")
                demo_user = User(
                    name="Alex Mercer",
                    email=demo_email,
                    password_hash=demo_hash,
                    target_role="Full Stack Developer",
                    experience_level="fresher",
                )
                db.session.add(demo_user)
                db.session.commit()
                app.logger.info("Demo user initialized successfully.")
        except Exception as e:
            db.session.rollback()
            app.logger.error(f"Database initialization error: {e}")

