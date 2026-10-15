"""
CC — Career Craft Database Models
Defines all SQLAlchemy ORM models for the application.
"""
from datetime import datetime, timezone
from app import db


def utcnow():
    return datetime.now(timezone.utc)


# ── User ─────────────────────────────────────────────────────────────────────
class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    target_role = db.Column(db.String(200))
    experience_level = db.Column(db.String(50), default="fresher")  # fresher/junior/mid
    location = db.Column(db.String(200))
    phone = db.Column(db.String(30))
    avatar_url = db.Column(db.String(500))
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=utcnow)
    updated_at = db.Column(db.DateTime, default=utcnow, onupdate=utcnow)
    last_login = db.Column(db.DateTime)

    # Relationships
    resumes = db.relationship("Resume", backref="user", lazy="dynamic", cascade="all, delete-orphan")
    interviews = db.relationship("Interview", backref="user", lazy="dynamic", cascade="all, delete-orphan")
    skill_progress = db.relationship("SkillProgress", backref="user", lazy="dynamic", cascade="all, delete-orphan")
    roadmaps = db.relationship("LearningRoadmap", backref="user", lazy="dynamic", cascade="all, delete-orphan")
    saved_jobs = db.relationship("SavedJob", backref="user", lazy="dynamic", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "target_role": self.target_role,
            "experience_level": self.experience_level,
            "location": self.location,
            "phone": self.phone,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


# ── Resume ────────────────────────────────────────────────────────────────────
class Resume(db.Model):
    __tablename__ = "resumes"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    filename = db.Column(db.String(300), nullable=False)
    original_filename = db.Column(db.String(300), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    file_type = db.Column(db.String(10))  # pdf / docx
    raw_text = db.Column(db.Text)
    is_active = db.Column(db.Boolean, default=True)
    version = db.Column(db.Integer, default=1)
    label = db.Column(db.String(200))  # e.g. "SWE Resume v2"
    created_at = db.Column(db.DateTime, default=utcnow)

    # Analysis results (stored as JSON-encoded text)
    analysis = db.relationship("ResumeAnalysis", backref="resume", uselist=False, cascade="all, delete-orphan")

    def to_dict(self, include_text=False):
        d = {
            "id": self.id,
            "original_filename": self.original_filename,
            "file_type": self.file_type,
            "label": self.label,
            "version": self.version,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "has_analysis": self.analysis is not None,
        }
        if include_text:
            d["raw_text"] = self.raw_text
        return d


# ── ResumeAnalysis ────────────────────────────────────────────────────────────
class ResumeAnalysis(db.Model):
    __tablename__ = "resume_analyses"

    id = db.Column(db.Integer, primary_key=True)
    resume_id = db.Column(db.Integer, db.ForeignKey("resumes.id"), nullable=False, unique=True, index=True)

    # Scores (0-100)
    overall_score = db.Column(db.Float, default=0)
    ats_score = db.Column(db.Float, default=0)
    content_score = db.Column(db.Float, default=0)
    format_score = db.Column(db.Float, default=0)
    skills_score = db.Column(db.Float, default=0)
    experience_score = db.Column(db.Float, default=0)
    education_score = db.Column(db.Float, default=0)

    # Extracted info (JSON strings)
    skills_technical = db.Column(db.Text, default="[]")
    skills_soft = db.Column(db.Text, default="[]")
    education = db.Column(db.Text, default="[]")
    experience = db.Column(db.Text, default="[]")
    projects = db.Column(db.Text, default="[]")
    certifications = db.Column(db.Text, default="[]")
    achievements = db.Column(db.Text, default="[]")
    contact_info = db.Column(db.Text, default="{}")

    # Analysis
    strengths = db.Column(db.Text, default="[]")
    weaknesses = db.Column(db.Text, default="[]")
    improvements = db.Column(db.Text, default="[]")
    ats_issues = db.Column(db.Text, default="[]")
    missing_sections = db.Column(db.Text, default="[]")
    keywords = db.Column(db.Text, default="[]")

    analyzed_at = db.Column(db.DateTime, default=utcnow)
    model_used = db.Column(db.String(100), default="rule-based+spacy")

    def to_dict(self):
        import json
        return {
            "id": self.id,
            "resume_id": self.resume_id,
            "scores": {
                "overall": round(self.overall_score, 1),
                "ats": round(self.ats_score, 1),
                "content": round(self.content_score, 1),
                "format": round(self.format_score, 1),
                "skills": round(self.skills_score, 1),
                "experience": round(self.experience_score, 1),
                "education": round(self.education_score, 1),
            },
            "skills_technical": json.loads(self.skills_technical or "[]"),
            "skills_soft": json.loads(self.skills_soft or "[]"),
            "education": json.loads(self.education or "[]"),
            "experience": json.loads(self.experience or "[]"),
            "projects": json.loads(self.projects or "[]"),
            "certifications": json.loads(self.certifications or "[]"),
            "achievements": json.loads(self.achievements or "[]"),
            "contact_info": json.loads(self.contact_info or "{}"),
            "strengths": json.loads(self.strengths or "[]"),
            "weaknesses": json.loads(self.weaknesses or "[]"),
            "improvements": json.loads(self.improvements or "[]"),
            "ats_issues": json.loads(self.ats_issues or "[]"),
            "missing_sections": json.loads(self.missing_sections or "[]"),
            "keywords": json.loads(self.keywords or "[]"),
            "model_used": self.model_used,
            "analyzed_at": self.analyzed_at.isoformat() if self.analyzed_at else None,
        }


# ── JobMatch ──────────────────────────────────────────────────────────────────
class JobMatch(db.Model):
    __tablename__ = "job_matches"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    resume_id = db.Column(db.Integer, db.ForeignKey("resumes.id"), nullable=False)
    job_title = db.Column(db.String(300))
    job_description = db.Column(db.Text)
    company_name = db.Column(db.String(300))

    match_score = db.Column(db.Float, default=0)
    keyword_score = db.Column(db.Float, default=0)
    semantic_score = db.Column(db.Float, default=0)
    skills_score = db.Column(db.Float, default=0)

    matched_skills = db.Column(db.Text, default="[]")
    missing_skills = db.Column(db.Text, default="[]")
    matched_keywords = db.Column(db.Text, default="[]")
    missing_keywords = db.Column(db.Text, default="[]")
    recommendations = db.Column(db.Text, default="[]")
    mandatory_requirements = db.Column(db.Text, default="[]")
    preferred_requirements = db.Column(db.Text, default="[]")

    created_at = db.Column(db.DateTime, default=utcnow)

    def to_dict(self):
        import json
        return {
            "id": self.id,
            "job_title": self.job_title,
            "company_name": self.company_name,
            "scores": {
                "overall": round(self.match_score, 1),
                "keyword": round(self.keyword_score, 1),
                "semantic": round(self.semantic_score, 1),
                "skills": round(self.skills_score, 1),
            },
            "matched_skills": json.loads(self.matched_skills or "[]"),
            "missing_skills": json.loads(self.missing_skills or "[]"),
            "matched_keywords": json.loads(self.matched_keywords or "[]"),
            "missing_keywords": json.loads(self.missing_keywords or "[]"),
            "recommendations": json.loads(self.recommendations or "[]"),
            "mandatory_requirements": json.loads(self.mandatory_requirements or "[]"),
            "preferred_requirements": json.loads(self.preferred_requirements or "[]"),
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


# ── Interview ─────────────────────────────────────────────────────────────────
class Interview(db.Model):
    __tablename__ = "interviews"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    resume_id = db.Column(db.Integer, db.ForeignKey("resumes.id"))
    title = db.Column(db.String(300))
    interview_type = db.Column(db.String(50))  # technical/hr/behavioral/mixed
    target_role = db.Column(db.String(200))
    difficulty = db.Column(db.String(30), default="medium")  # easy/medium/hard
    status = db.Column(db.String(30), default="in_progress")  # in_progress/completed/abandoned
    total_questions = db.Column(db.Integer, default=0)
    answered_questions = db.Column(db.Integer, default=0)
    overall_score = db.Column(db.Float)
    feedback_summary = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=utcnow)
    completed_at = db.Column(db.DateTime)

    questions = db.relationship("InterviewQuestion", backref="interview", lazy="dynamic", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "interview_type": self.interview_type,
            "target_role": self.target_role,
            "difficulty": self.difficulty,
            "status": self.status,
            "total_questions": self.total_questions,
            "answered_questions": self.answered_questions,
            "overall_score": round(self.overall_score, 1) if self.overall_score else None,
            "feedback_summary": self.feedback_summary,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
        }


# ── InterviewQuestion ─────────────────────────────────────────────────────────
class InterviewQuestion(db.Model):
    __tablename__ = "interview_questions"

    id = db.Column(db.Integer, primary_key=True)
    interview_id = db.Column(db.Integer, db.ForeignKey("interviews.id"), nullable=False, index=True)
    order_num = db.Column(db.Integer, default=0)
    question_type = db.Column(db.String(50))  # technical/hr/behavioral/situational
    question_text = db.Column(db.Text, nullable=False)
    expected_answer = db.Column(db.Text)
    rubric = db.Column(db.Text, default="{}")  # JSON rubric criteria
    user_answer = db.Column(db.Text)
    score = db.Column(db.Float)
    feedback = db.Column(db.Text)
    improved_answer = db.Column(db.Text)
    time_taken_seconds = db.Column(db.Integer)
    answered_at = db.Column(db.DateTime)

    def to_dict(self, include_expected=False):
        import json
        d = {
            "id": self.id,
            "order_num": self.order_num,
            "question_type": self.question_type,
            "question_text": self.question_text,
            "rubric": json.loads(self.rubric or "{}"),
            "user_answer": self.user_answer,
            "score": round(self.score, 1) if self.score is not None else None,
            "feedback": self.feedback,
            "improved_answer": self.improved_answer,
            "time_taken_seconds": self.time_taken_seconds,
            "is_answered": self.user_answer is not None,
        }
        if include_expected:
            d["expected_answer"] = self.expected_answer
        return d


# ── SkillProgress ─────────────────────────────────────────────────────────────
class SkillProgress(db.Model):
    __tablename__ = "skill_progress"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    skill_name = db.Column(db.String(150), nullable=False)
    category = db.Column(db.String(100))  # programming/framework/tool/soft/etc.
    proficiency = db.Column(db.Float, default=0)  # 0-100
    is_current = db.Column(db.Boolean, default=True)  # present in resume
    is_target = db.Column(db.Boolean, default=False)  # required by target job
    gap = db.Column(db.Float, default=0)  # target - current (positive = gap)
    updated_at = db.Column(db.DateTime, default=utcnow)

    __table_args__ = (db.UniqueConstraint("user_id", "skill_name", name="uq_user_skill"),)

    def to_dict(self):
        return {
            "id": self.id,
            "skill_name": self.skill_name,
            "category": self.category,
            "proficiency": round(self.proficiency, 1),
            "is_current": self.is_current,
            "is_target": self.is_target,
            "gap": round(self.gap, 1),
        }


# ── LearningRoadmap ────────────────────────────────────────────────────────────
class LearningRoadmap(db.Model):
    __tablename__ = "learning_roadmaps"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    target_role = db.Column(db.String(200))
    roadmap_data = db.Column(db.Text)  # JSON — full roadmap with milestones
    created_at = db.Column(db.DateTime, default=utcnow)
    updated_at = db.Column(db.DateTime, default=utcnow, onupdate=utcnow)

    def to_dict(self):
        import json
        return {
            "id": self.id,
            "target_role": self.target_role,
            "roadmap_data": json.loads(self.roadmap_data or "{}"),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


# ── SavedJob ───────────────────────────────────────────────────────────────────
class SavedJob(db.Model):
    __tablename__ = "saved_jobs"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    job_title = db.Column(db.String(300))
    company = db.Column(db.String(300))
    location = db.Column(db.String(200))
    url = db.Column(db.String(1000))
    description = db.Column(db.Text)
    source = db.Column(db.String(100))  # adzuna / arbeitnow / manual
    saved_at = db.Column(db.DateTime, default=utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "job_title": self.job_title,
            "company": self.company,
            "location": self.location,
            "url": self.url,
            "description": self.description,
            "source": self.source,
            "saved_at": self.saved_at.isoformat() if self.saved_at else None,
        }


# ── UserActivity ───────────────────────────────────────────────────────────────
class UserActivity(db.Model):
    __tablename__ = "user_activities"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    activity_type = db.Column(db.String(100))  # resume_upload / interview_completed / etc.
    description = db.Column(db.String(500))
    points = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "activity_type": self.activity_type,
            "description": self.description,
            "points": self.points,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
