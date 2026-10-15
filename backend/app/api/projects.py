"""
CC — Career Craft
Projects API: Recommend portfolio projects based on skills and target role.
"""
import json
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app import db
from app.models import User, Resume

projects_bp = Blueprint("projects", __name__)

# ── Project Recommendations Database ─────────────────────────────────────────
PROJECT_BANK = {
    "software_engineer": [
        {
            "title": "Task Management REST API",
            "difficulty": "beginner",
            "description": "Build a full CRUD REST API for task management with user authentication, database persistence, and proper error handling.",
            "skills_required": ["Python", "Flask or Django", "SQL", "REST API", "JWT"],
            "skills_gained": ["API design", "authentication", "database modeling", "HTTP methods"],
            "technologies": ["Python", "Flask", "SQLite/PostgreSQL", "JWT", "Postman"],
            "milestones": [
                "Set up Flask app with database models",
                "Implement user registration and login with JWT",
                "Build CRUD endpoints for tasks",
                "Add input validation and error handling",
                "Write unit tests",
                "Deploy to Render/Railway (free tier)",
            ],
            "deliverables": ["GitHub repo with README", "Deployed API URL", "Postman collection"],
            "impact": "Demonstrates backend fundamentals, API design, and database skills",
            "estimated_hours": 20,
        },
        {
            "title": "Real-time Chat Application",
            "difficulty": "intermediate",
            "description": "Build a real-time chat app with rooms, WebSocket communication, user presence, and message history.",
            "skills_required": ["JavaScript", "Node.js", "WebSockets", "React"],
            "skills_gained": ["WebSocket protocol", "real-time systems", "state management", "socket.io"],
            "technologies": ["Node.js", "Socket.IO", "React", "MongoDB", "Redis"],
            "milestones": [
                "Set up Express server with Socket.IO",
                "Build React frontend with chat UI",
                "Implement room-based messaging",
                "Add user authentication",
                "Store message history in MongoDB",
                "Add typing indicators and online status",
            ],
            "deliverables": ["GitHub repo", "Live deployment URL", "Demo video"],
            "impact": "Shows real-time systems expertise — highly valued in tech interviews",
            "estimated_hours": 35,
        },
        {
            "title": "Distributed Key-Value Cache",
            "difficulty": "advanced",
            "description": "Implement a distributed in-memory key-value store with LRU eviction, TTL support, and a simple TCP protocol.",
            "skills_required": ["Python or Go", "Networking", "Algorithms", "Data Structures"],
            "skills_gained": ["System design", "networking", "concurrent programming", "cache algorithms"],
            "technologies": ["Python/Go", "asyncio", "pytest", "Docker"],
            "milestones": [
                "Design the TCP protocol",
                "Implement in-memory hashmap with LRU eviction",
                "Add TTL expiration",
                "Build async connection handling",
                "Write comprehensive tests",
                "Dockerize and document",
            ],
            "deliverables": ["GitHub repo with benchmarks", "Technical blog post/README"],
            "impact": "Demonstrates systems programming and deep CS knowledge",
            "estimated_hours": 60,
        },
    ],
    "data_scientist": [
        {
            "title": "Sentiment Analysis Web App",
            "difficulty": "beginner",
            "description": "Train a sentiment classifier on product reviews and build a web interface to analyze new text.",
            "skills_required": ["Python", "scikit-learn", "NLP", "Flask"],
            "skills_gained": ["text preprocessing", "TF-IDF", "classification", "model deployment"],
            "technologies": ["Python", "scikit-learn", "NLTK", "Flask", "Render"],
            "milestones": [
                "Collect and preprocess dataset (IMDB/Amazon reviews)",
                "Build and evaluate multiple classifiers",
                "Tune hyperparameters with cross-validation",
                "Build Flask API for predictions",
                "Create simple frontend",
                "Deploy model with Flask to Render",
            ],
            "deliverables": ["Jupyter notebook with analysis", "Deployed web app", "GitHub repo"],
            "impact": "Demonstrates full ML pipeline from data to deployment",
            "estimated_hours": 25,
        },
        {
            "title": "House Price Prediction Dashboard",
            "difficulty": "intermediate",
            "description": "Build an interactive dashboard that predicts house prices with feature importance visualization and model explainability.",
            "skills_required": ["Python", "scikit-learn", "Pandas", "Streamlit"],
            "skills_gained": ["regression", "feature engineering", "SHAP explainability", "Streamlit"],
            "technologies": ["Python", "scikit-learn", "XGBoost", "SHAP", "Streamlit"],
            "milestones": [
                "Exploratory data analysis and visualization",
                "Feature engineering and preprocessing pipeline",
                "Train and compare 5+ models",
                "Add SHAP value explainability",
                "Build Streamlit dashboard",
                "Deploy to Streamlit Cloud (free)",
            ],
            "deliverables": ["Streamlit app URL", "GitHub repo", "Analysis report"],
            "impact": "Shows ML explainability skills — increasingly required in industry",
            "estimated_hours": 40,
        },
    ],
    "web_developer": [
        {
            "title": "Full Stack E-Commerce App",
            "difficulty": "intermediate",
            "description": "Build a full-stack e-commerce platform with product listings, cart, checkout, and user accounts.",
            "skills_required": ["React", "Node.js", "PostgreSQL", "REST API"],
            "skills_gained": ["full stack architecture", "state management", "database relationships", "auth"],
            "technologies": ["React", "Node.js", "Express", "PostgreSQL", "Stripe (test mode)"],
            "milestones": [
                "Design database schema for products, users, orders",
                "Build Express API with auth middleware",
                "Create React frontend with routing",
                "Implement cart and checkout flow",
                "Add admin dashboard for products",
                "Deploy frontend (Vercel) and backend (Railway)",
            ],
            "deliverables": ["Live app URL", "GitHub repo", "Demo video"],
            "impact": "Demonstrates production-level full stack skills",
            "estimated_hours": 50,
        },
        {
            "title": "Personal Portfolio with Blog",
            "difficulty": "beginner",
            "description": "Build a personal portfolio site with an integrated blog using markdown files.",
            "skills_required": ["React or Next.js", "CSS", "Markdown"],
            "skills_gained": ["Next.js SSG", "SEO", "responsive design", "dark mode"],
            "technologies": ["Next.js", "Tailwind CSS", "MDX", "Vercel"],
            "milestones": [
                "Design portfolio layout and color scheme",
                "Build projects section with filtering",
                "Add blog with markdown support",
                "Implement dark mode toggle",
                "Optimize for SEO and performance",
                "Deploy to Vercel",
            ],
            "deliverables": ["Live portfolio URL (yourname.vercel.app)", "GitHub repo"],
            "impact": "Essential professional asset for any web developer",
            "estimated_hours": 15,
        },
    ],
    "devops_engineer": [
        {
            "title": "Kubernetes Deployment Pipeline",
            "difficulty": "intermediate",
            "description": "Set up a complete CI/CD pipeline deploying a containerized app to a local Kubernetes cluster.",
            "skills_required": ["Docker", "Kubernetes", "GitHub Actions", "YAML"],
            "skills_gained": ["k8s manifests", "CI/CD pipeline", "containerization", "monitoring"],
            "technologies": ["Docker", "Kubernetes (minikube)", "GitHub Actions", "Prometheus", "Grafana"],
            "milestones": [
                "Containerize a sample web app with Docker",
                "Write Kubernetes manifests (Deployment, Service, Ingress)",
                "Set up GitHub Actions workflow",
                "Configure rolling updates",
                "Add Prometheus/Grafana monitoring",
                "Document architecture",
            ],
            "deliverables": ["GitHub repo with complete pipeline", "Architecture diagram"],
            "impact": "Directly demonstrates the core skills needed for DevOps roles",
            "estimated_hours": 40,
        },
    ],
}

ROLE_TO_PROJECTS = {
    "software engineer": "software_engineer",
    "backend": "software_engineer",
    "data scientist": "data_scientist",
    "ml engineer": "data_scientist",
    "data analyst": "data_scientist",
    "web developer": "web_developer",
    "frontend": "web_developer",
    "full stack": "web_developer",
    "devops": "devops_engineer",
}


@projects_bp.route("/recommend", methods=["POST", "GET"])
@jwt_required()
def recommend_projects():
    """Recommend projects based on skills and target role."""
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    if request.method == "POST":
        data = request.get_json(silent=True) or {}
    else:
        data = {}

    target_role = (data.get("target_role") or user.target_role or "Software Engineer").strip()
    difficulty = data.get("difficulty")  # None = all levels
    current_skills = data.get("skills", [])

    # Get skills from resume if not provided
    if not current_skills:
        latest_resume = (
            Resume.query.filter_by(user_id=user_id)
            .order_by(Resume.created_at.desc())
            .first()
        )
        if latest_resume and latest_resume.analysis:
            current_skills = json.loads(latest_resume.analysis.skills_technical or "[]")

    # Get projects for role
    role_key = _map_role(target_role)
    projects = PROJECT_BANK.get(role_key, PROJECT_BANK["software_engineer"])

    # Filter by difficulty
    if difficulty:
        projects = [p for p in projects if p.get("difficulty") == difficulty]

    # Score each project by skill match
    current_lower = set(s.lower() for s in current_skills)
    for p in projects:
        req_skills = [s.lower() for s in p.get("skills_required", [])]
        matched = sum(1 for s in req_skills if any(cs in s or s in cs for cs in current_lower))
        p["skill_match_score"] = round(matched / len(req_skills) * 100 if req_skills else 50, 1)

    # Sort: prioritize projects where they have 50-80% of skills (appropriate challenge)
    projects.sort(key=lambda p: abs(p["skill_match_score"] - 65))

    return jsonify({
        "target_role": target_role,
        "projects": projects,
        "total": len(projects),
        "note": "Projects ordered by appropriate skill challenge level for your current skills.",
    }), 200


def _map_role(target_role: str) -> str:
    role_lower = (target_role or "").lower()
    for key, val in ROLE_TO_PROJECTS.items():
        if key in role_lower:
            return val
    return "software_engineer"
