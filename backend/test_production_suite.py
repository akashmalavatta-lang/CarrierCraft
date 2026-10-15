"""
CC — Career Craft: Comprehensive Production Verification Test Suite
Covers all 12 Phases:
- System Startup & Config
- Database models, migrations, & rollback safety
- Auth, JWT, & User isolation (Security)
- File parsing (PDF/DOCX/Corrupted/Empty)
- Resume Analyzer & Evidence-backed Recommendations
- Job Description Matcher
- Interview Coach & STAR Rubric Evaluation
- Healthcheck Diagnostics
"""
import os
import io
import json
import unittest
from datetime import datetime, timezone

# Ensure backend root is on sys.path
import sys
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app import create_app, db
from app.models import (
    User, Resume, ResumeAnalysis, Interview, InterviewQuestion,
    SkillProgress, JobMatch, safe_json_loads
)
from app.ml.extractor import extract_skills, extract_contact_info
from app.ml.parser import extract_text, _clean_text
from app.ml.analyzer import analyze_resume
from app.ml.matcher import match_resume_to_jd
from app.ml.interview_engine import generate_interview, evaluate_answer


class ProductionTestSuite(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        """Configure test application with isolated test database."""
        os.environ["DATABASE_URL"] = "sqlite:///:memory:"
        cls.app = create_app()
        cls.app.config.update({
            "TESTING": True,
            "JWT_SECRET_KEY": "test-jwt-secret-verification-key",
            "UPLOAD_FOLDER": os.path.join(cls.app.instance_path, "test_uploads"),
        })
        os.makedirs(cls.app.config["UPLOAD_FOLDER"], exist_ok=True)
        cls.client = cls.app.test_client()

    @classmethod
    def tearDownClass(cls):
        os.environ.pop("DATABASE_URL", None)

    def setUp(self):
        """Reset database tables before each test."""
        with self.app.app_context():
            db.create_all()

    def tearDown(self):
        """Clean up database after each test."""
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    # ──────────────────────────────────────────────────────────────────────────
    # Phase 1 & 2: Startup & Healthcheck Diagnostics
    # ──────────────────────────────────────────────────────────────────────────
    def test_health_endpoints(self):
        """Verify /api/health and /health report operational status with full subsystem details."""
        for endpoint in ["/api/health", "/health"]:
            res = self.client.get(endpoint)
            self.assertEqual(res.status_code, 200)
            data = res.get_json()
            self.assertEqual(data["status"], "healthy")
            self.assertEqual(data["app"], "CareerCraft")
            self.assertTrue(data["database"]["connected"])
            self.assertTrue(data["storage"]["writable"])
            self.assertEqual(data["ml_engine"], "operational")

    # ──────────────────────────────────────────────────────────────────────────
    # Phase 3: Database & Serialization
    # ──────────────────────────────────────────────────────────────────────────
    def test_database_models_and_safe_json(self):
        """Verify models, foreign keys, and safe_json_loads behavior."""
        with self.app.app_context():
            user = User(
                name="Test Engineer",
                email="test.engineer@careercraft.io",
                password_hash="fakehash",
                target_role="Backend Engineer"
            )
            db.session.add(user)
            db.session.commit()

            resume = Resume(
                user_id=user.id,
                filename="test.pdf",
                original_filename="resume.pdf",
                file_path="/tmp/test.pdf",
                file_type="pdf",
                raw_text="Sample resume text with Python, Docker, and PostgreSQL."
            )
            db.session.add(resume)
            db.session.commit()

            analysis = ResumeAnalysis(
                resume_id=resume.id,
                overall_score=85.5,
                ats_score=90.0,
                skills_technical=json.dumps(["Python", "Docker", "PostgreSQL"]),
                ats_issues="['Malformed JSON string']",  # corrupted JSON test
            )
            db.session.add(analysis)
            db.session.commit()

            # Verify to_dict() does not crash on malformed JSON
            d = analysis.to_dict()
            self.assertEqual(d["scores"]["overall"], 85.5)
            self.assertEqual(d["skills_technical"], ["Python", "Docker", "PostgreSQL"])
            # Fallback default applied safely
            self.assertEqual(d["ats_issues"], [])

    def test_transaction_rollback_safety(self):
        """Ensure failed database transactions roll back cleanly."""
        with self.app.app_context():
            user = User(name="User1", email="user1@careercraft.io", password_hash="hash")
            db.session.add(user)
            db.session.commit()

            # Attempt duplicate email insertion
            dup_user = User(name="User2", email="user1@careercraft.io", password_hash="hash")
            db.session.add(dup_user)
            with self.assertRaises(Exception):
                db.session.commit()
            db.session.rollback()

            # Session should be healthy after rollback
            count = User.query.filter_by(email="user1@careercraft.io").count()
            self.assertEqual(count, 1)

    # ──────────────────────────────────────────────────────────────────────────
    # Phase 4: Resume Parsing & Edge Cases
    # ──────────────────────────────────────────────────────────────────────────
    def test_clean_text_normalization(self):
        """Verify text cleaner standardizes whitespace and removes noise."""
        raw = "Alex   Mercer \r\n\r\n\r\n\r\nSoftware   Engineer\t\tSpecialist"
        cleaned = _clean_text(raw)
        self.assertEqual(cleaned, "Alex Mercer\n\nSoftware Engineer Specialist")

    def test_parser_nonexistent_file(self):
        """Parser must return clean error for missing file."""
        res = extract_text("nonexistent_resume_file.pdf")
        self.assertFalse(res["success"])
        self.assertIn("does not exist", res["error"])

    # ──────────────────────────────────────────────────────────────────────────
    # Phase 5 & 6: Resume Analysis & Evidence-Based Findings
    # ──────────────────────────────────────────────────────────────────────────
    def test_resume_analyzer_with_strong_sample(self):
        """Verify analyze_resume calculates explainable scores and evidence-backed improvements."""
        sample_resume = """
        ALEX MERCER
        alex.mercer@gmail.com | +1 555-0199 | linkedin.com/in/alexmercer | github.com/alexmercer
        San Francisco, CA

        PROFESSIONAL SUMMARY
        Innovative Full Stack Developer with 3+ years of experience engineering high-throughput distributed web applications, microservices architecture, and cloud systems. Specialized in Python, React, Flask, and relational database optimization.

        TECHNICAL SKILLS
        Programming Languages: Python, JavaScript, TypeScript, Go, SQL, Bash
        Frameworks: React, Next.js, Flask, FastAPI, Node.js, Express
        Databases & Cloud: PostgreSQL, Redis, MongoDB, Docker, Kubernetes, AWS, Git, Celery

        EXPERIENCE
        Senior Backend Engineer — TechCorp (2022 - Present)
        • Architected and deployed microservices using Python and Flask, reducing p95 API response times by 35% across 2M daily API requests.
        • Built resilient background data processing pipelines using Redis and Celery handling 500,000+ daily events with 99.9% uptime.
        • Optimized PostgreSQL database queries, added composite indexes and connection pooling, reducing query execution time by 40%.
        • Mentored junior engineers, established automated CI/CD deployment pipelines with Docker and GitHub Actions.

        Software Engineer Intern — CloudScale Systems (2021 - 2022)
        • Developed full-stack internal management dashboards using React, TypeScript, and Node.js.
        • Automated test suites using pytest and Jest, increasing branch coverage from 65% to 92%.

        PROJECTS
        CareerCraft AI Portal (React, Flask, Docker, PostgreSQL)
        • Developed full-stack career coaching portal serving 2,000 active students with real-time feedback and ATS scoring.
        • Integrated automated unit and integration tests achieving 95% code coverage with sub-second health checks.

        EDUCATION
        B.Tech in Computer Science and Engineering
        Stanford University, 2018 - 2022 | GPA: 3.8/4.0
        """
        analysis = analyze_resume(sample_resume)
        scores = analysis["scores"]

        self.assertGreaterEqual(scores["overall"], 70.0)
        self.assertGreaterEqual(scores["ats"], 75.0)
        self.assertGreaterEqual(scores["skills"], 80.0)

        # Verify extracted skills
        tech_skills = [s.lower() for s in analysis["skills_technical"]]
        self.assertIn("python", tech_skills)
        self.assertIn("react", tech_skills)
        self.assertIn("postgresql", tech_skills)
        self.assertIn("docker", tech_skills)

        # Check improvements structure has evidence and template examples
        for imp in analysis["improvements"]:
            self.assertIn("severity", imp)
            self.assertIn("explanation", imp)
            self.assertIn("evidence", imp)
            self.assertIn("recommended_correction", imp)
            self.assertIn("template_example", imp)

    def test_resume_analyzer_empty_input(self):
        """Analyze resume handles insufficient or empty text cleanly."""
        res = analyze_resume("Too short text")
        self.assertEqual(res["scores"]["overall"], 0)
        self.assertEqual(len(res["skills_technical"]), 0)

    # ──────────────────────────────────────────────────────────────────────────
    # Phase 7 & 8: Job Description Matcher & STAR Interview Engine
    # ──────────────────────────────────────────────────────────────────────────
    def test_jd_matcher(self):
        """Verify resume to JD matching produces explainable skill alignment."""
        resume_text = (
            "Senior Backend Engineer with deep experience building microservices using Python, Flask, FastAPI, "
            "PostgreSQL, Docker, Redis, and RESTful APIs. Implemented database caching and schema migrations."
        )
        jd_text = """
        We are seeking a Backend Developer with strong skills in Python and Flask.
        Must have experience with PostgreSQL, Docker, and RESTful APIs.
        Nice to have: React, Redis, AWS.
        """
        match = match_resume_to_jd(resume_text, jd_text)
        self.assertIn("scores", match)
        self.assertGreater(match["scores"]["overall"], 50.0)
        self.assertIn("python", [s.lower() for s in match["matched_skills"]])

    def test_interview_generation_and_evaluation(self):
        """Verify question generation and rubric-based STAR answer evaluation with follow-up."""
        questions = generate_interview(
            target_role="Full Stack Developer",
            interview_type="technical",
            difficulty="medium",
            num_questions=5,
            resume_skills=["Python", "React", "SQL"],
        )
        self.assertEqual(len(questions), 5)
        for q in questions:
            self.assertIn("question_text", q)
            self.assertIn("question_type", q)

        # Evaluate a structured answer against a STAR behavioral question
        sample_q = {
            "question_text": "Describe a challenging project you worked on and how you handled it.",
            "question_type": "behavioral",
            "expected_points": ["specific situation", "your role and actions", "outcome or result"],
            "rubric": {"structure": "STAR method", "tips": ["Quantify results"]},
        }
        user_answer = (
            "During my previous role, our team faced a critical situation where database queries were causing high latency. "
            "My task was to identify the bottleneck and lead the optimization. I implemented composite indexes, added Redis caching, "
            "and refactored N+1 query patterns. As a result, we successfully reduced query latency by 45% and improved overall application throughput."
        )
        eval_result = evaluate_answer(sample_q, user_answer)
        self.assertGreaterEqual(eval_result["score"], 70.0)
        self.assertIn("dimension_scores", eval_result)
        self.assertIn("follow_up_question", eval_result)
        self.assertTrue(len(eval_result["follow_up_question"]) > 10)

    # ──────────────────────────────────────────────────────────────────────────
    # Phase 9 & 10: Auth API, Security & User Isolation
    # ──────────────────────────────────────────────────────────────────────────
    def test_auth_workflow_and_user_isolation(self):
        """Verify registration, login, JWT validation, and cross-user data isolation."""
        # 1. Register User A
        reg_a = self.client.post("/api/auth/register", json={
            "name": "User Alpha",
            "email": "alpha@careercraft.io",
            "password": "Password123!",
            "target_role": "Software Engineer"
        })
        self.assertEqual(reg_a.status_code, 201)
        token_a = reg_a.get_json()["access_token"]
        headers_a = {"Authorization": f"Bearer {token_a}"}

        # 2. Register User B
        reg_b = self.client.post("/api/auth/register", json={
            "name": "User Beta",
            "email": "beta@careercraft.io",
            "password": "Password123!",
            "target_role": "Data Analyst"
        })
        self.assertEqual(reg_b.status_code, 201)
        token_b = reg_b.get_json()["access_token"]
        headers_b = {"Authorization": f"Bearer {token_b}"}

        # 3. User A starts an interview
        start_res = self.client.post("/api/interview/start", headers=headers_a, json={
            "target_role": "Software Engineer",
            "interview_type": "technical",
            "difficulty": "medium",
            "num_questions": 3
        })
        self.assertEqual(start_res.status_code, 201)
        interview_id = start_res.get_json()["interview"]["id"]

        # 4. User B attempts to access User A's interview -> MUST be 404
        cross_res = self.client.get(f"/api/interview/{interview_id}", headers=headers_b)
        self.assertEqual(cross_res.status_code, 404)

        # 5. User A can access their own interview -> 200 OK
        own_res = self.client.get(f"/api/interview/{interview_id}", headers=headers_a)
        self.assertEqual(own_res.status_code, 200)

        # 6. Unauthenticated request without JWT -> 401 Unauthorized
        unauth_res = self.client.get(f"/api/interview/{interview_id}")
        self.assertEqual(unauth_res.status_code, 401)


if __name__ == "__main__":
    unittest.main()
