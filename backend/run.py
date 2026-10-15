"""
CC — Career Craft
WSGI entry point for the Flask backend.
"""
from app import create_app, db
from app.models import (
    User, Resume, ResumeAnalysis, Interview, InterviewQuestion,
    SkillProgress, LearningRoadmap, SavedJob, UserActivity, JobMatch
)

app = create_app()


@app.shell_context_processor
def make_shell_context():
    """Make objects available in 'flask shell' for debugging."""
    return {
        "db": db,
        "User": User,
        "Resume": Resume,
        "ResumeAnalysis": ResumeAnalysis,
        "Interview": Interview,
        "InterviewQuestion": InterviewQuestion,
        "SkillProgress": SkillProgress,
        "LearningRoadmap": LearningRoadmap,
        "SavedJob": SavedJob,
        "UserActivity": UserActivity,
        "JobMatch": JobMatch,
    }


import os

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    port = int(os.environ.get("PORT", 5000))
    debug_mode = os.environ.get("FLASK_DEBUG", "false").lower() in ("true", "1", "yes")
    app.run(debug=debug_mode, host="0.0.0.0", port=port)
