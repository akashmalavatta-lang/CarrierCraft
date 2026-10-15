"""
CC — Career Craft
Learning Roadmap Generator: Builds personalized skill-to-role roadmaps.

Data: Role-specific skill tracks with free verified resources.
Algorithm: Gap analysis → Priority ordering → Milestone sequencing.
"""
import json
import logging
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)

# ── Role Roadmap Definitions ──────────────────────────────────────────────────
# Each phase: {name, description, skills, resources, duration_weeks, milestone}

ROADMAPS = {
    "software_engineer": {
        "title": "Software Engineer Roadmap",
        "description": "From fundamentals to job-ready software engineer",
        "phases": [
            {
                "phase": 1,
                "name": "Programming Foundation",
                "duration_weeks": 6,
                "skills": ["Python or Java", "Data Structures", "Algorithms", "Git"],
                "resources": [
                    {"title": "CS50 Introduction to Programming", "url": "https://cs50.harvard.edu/python/", "platform": "Harvard/edX", "free": True, "type": "course"},
                    {"title": "Python Official Tutorial", "url": "https://docs.python.org/3/tutorial/", "platform": "Python.org", "free": True, "type": "documentation"},
                    {"title": "LeetCode Easy Problems (Top 50)", "url": "https://leetcode.com/studyplan/top-interview-150/", "platform": "LeetCode", "free": True, "type": "practice"},
                    {"title": "Git Documentation", "url": "https://git-scm.com/doc", "platform": "Git SCM", "free": True, "type": "documentation"},
                ],
                "milestone": "Solve 30 LeetCode Easy problems, complete Python/Java basics",
                "projects": ["Build a CLI task manager", "Write sorting algorithm implementations"],
            },
            {
                "phase": 2,
                "name": "Data Structures & Algorithms",
                "duration_weeks": 8,
                "skills": ["Arrays", "Linked Lists", "Trees", "Graphs", "Dynamic Programming", "System Design Basics"],
                "resources": [
                    {"title": "Algorithms by Stanford (Coursera, audit free)", "url": "https://www.coursera.org/specializations/algorithms", "platform": "Coursera", "free": True, "type": "course"},
                    {"title": "NeetCode 150", "url": "https://neetcode.io/practice", "platform": "NeetCode", "free": True, "type": "practice"},
                    {"title": "Visualgo — Algorithm Visualizations", "url": "https://visualgo.net/en", "platform": "Visualgo", "free": True, "type": "tool"},
                ],
                "milestone": "Solve 150 LeetCode problems (Easy+Medium), understand all core data structures",
                "projects": ["Implement a mini search engine", "Graph pathfinding visualizer"],
            },
            {
                "phase": 3,
                "name": "Backend Development",
                "duration_weeks": 8,
                "skills": ["REST APIs", "Flask or Django or Node.js/Express", "SQL/PostgreSQL", "Authentication/JWT"],
                "resources": [
                    {"title": "Flask Official Tutorial", "url": "https://flask.palletsprojects.com/en/latest/tutorial/", "platform": "Flask", "free": True, "type": "documentation"},
                    {"title": "The Odin Project (Web Dev)", "url": "https://www.theodinproject.com/", "platform": "The Odin Project", "free": True, "type": "course"},
                    {"title": "PostgreSQL Tutorial", "url": "https://www.postgresqltutorial.com/", "platform": "PostgreSQL Tutorial", "free": True, "type": "tutorial"},
                    {"title": "SQLZoo", "url": "https://sqlzoo.net/", "platform": "SQLZoo", "free": True, "type": "practice"},
                ],
                "milestone": "Build a full CRUD REST API with authentication and a database",
                "projects": ["URL shortener API", "Blog backend with user authentication"],
            },
            {
                "phase": 4,
                "name": "System Design & DevOps",
                "duration_weeks": 6,
                "skills": ["System Design Patterns", "Docker", "CI/CD", "Cloud Basics (AWS/GCP free tier)"],
                "resources": [
                    {"title": "System Design Primer (GitHub)", "url": "https://github.com/donnemartin/system-design-primer", "platform": "GitHub", "free": True, "type": "tutorial"},
                    {"title": "Docker Official Get Started", "url": "https://docs.docker.com/get-started/", "platform": "Docker", "free": True, "type": "documentation"},
                    {"title": "AWS Free Tier Documentation", "url": "https://aws.amazon.com/free/", "platform": "AWS", "free": True, "type": "documentation"},
                    {"title": "GitHub Actions Documentation", "url": "https://docs.github.com/en/actions", "platform": "GitHub", "free": True, "type": "documentation"},
                ],
                "milestone": "Deploy a personal project with Docker and a basic CI/CD pipeline",
                "projects": ["Containerize an existing project", "Set up automated testing pipeline"],
            },
        ],
    },
    "data_scientist": {
        "title": "Data Scientist Roadmap",
        "description": "From statistics to production ML models",
        "phases": [
            {
                "phase": 1,
                "name": "Python & Statistics Foundation",
                "duration_weeks": 6,
                "skills": ["Python", "NumPy", "Pandas", "Statistics", "Probability", "Data Visualization"],
                "resources": [
                    {"title": "Python for Data Analysis (Wes McKinney)", "url": "https://wesmckinney.com/book/", "platform": "Open Book", "free": True, "type": "book"},
                    {"title": "Khan Academy Statistics", "url": "https://www.khanacademy.org/math/statistics-probability", "platform": "Khan Academy", "free": True, "type": "course"},
                    {"title": "Kaggle Python Course", "url": "https://www.kaggle.com/learn/python", "platform": "Kaggle", "free": True, "type": "course"},
                ],
                "milestone": "Complete Pandas + visualization, understand hypothesis testing",
                "projects": ["Exploratory data analysis on a Kaggle dataset", "Statistical analysis report"],
            },
            {
                "phase": 2,
                "name": "Machine Learning Fundamentals",
                "duration_weeks": 8,
                "skills": ["scikit-learn", "Regression", "Classification", "Clustering", "Model Evaluation"],
                "resources": [
                    {"title": "ML Course by Andrew Ng (Coursera, audit free)", "url": "https://www.coursera.org/learn/machine-learning", "platform": "Coursera", "free": True, "type": "course"},
                    {"title": "Scikit-learn User Guide", "url": "https://scikit-learn.org/stable/user_guide.html", "platform": "scikit-learn", "free": True, "type": "documentation"},
                    {"title": "Kaggle ML Competitions", "url": "https://www.kaggle.com/competitions", "platform": "Kaggle", "free": True, "type": "practice"},
                ],
                "milestone": "Build and evaluate 5+ ML models, complete a Kaggle competition",
                "projects": ["House price prediction", "Titanic survival classification"],
            },
            {
                "phase": 3,
                "name": "Deep Learning & NLP",
                "duration_weeks": 10,
                "skills": ["TensorFlow or PyTorch", "Neural Networks", "CNNs", "RNNs", "NLP Basics", "Transformers"],
                "resources": [
                    {"title": "Deep Learning Specialization (Coursera, audit)", "url": "https://www.coursera.org/specializations/deep-learning", "platform": "Coursera", "free": True, "type": "course"},
                    {"title": "Hugging Face NLP Course", "url": "https://huggingface.co/learn/nlp-course/", "platform": "Hugging Face", "free": True, "type": "course"},
                    {"title": "Fast.ai Practical Deep Learning", "url": "https://course.fast.ai/", "platform": "Fast.ai", "free": True, "type": "course"},
                ],
                "milestone": "Build a text classifier and an image recognition model",
                "projects": ["Sentiment analysis model", "Image classification with transfer learning"],
            },
        ],
    },
    "web_developer": {
        "title": "Full Stack Web Developer Roadmap",
        "description": "Modern full stack development with React and Node.js",
        "phases": [
            {
                "phase": 1,
                "name": "HTML, CSS & JavaScript",
                "duration_weeks": 6,
                "skills": ["HTML5", "CSS3", "JavaScript ES6+", "DOM Manipulation", "Responsive Design"],
                "resources": [
                    {"title": "The Odin Project Foundations", "url": "https://www.theodinproject.com/paths/foundations/courses/foundations", "platform": "The Odin Project", "free": True, "type": "course"},
                    {"title": "MDN Web Docs", "url": "https://developer.mozilla.org/en-US/", "platform": "MDN", "free": True, "type": "documentation"},
                    {"title": "JavaScript.info", "url": "https://javascript.info/", "platform": "JavaScript.info", "free": True, "type": "tutorial"},
                    {"title": "CSS Grid Garden", "url": "https://cssgridgarden.com/", "platform": "Grid Garden", "free": True, "type": "practice"},
                ],
                "milestone": "Build 3 static websites with responsive design",
                "projects": ["Personal portfolio website", "Weather app using public API"],
            },
            {
                "phase": 2,
                "name": "React & Frontend Ecosystem",
                "duration_weeks": 8,
                "skills": ["React", "React Hooks", "React Router", "State Management", "API Integration"],
                "resources": [
                    {"title": "React Official Tutorial", "url": "https://react.dev/learn", "platform": "React.dev", "free": True, "type": "documentation"},
                    {"title": "The Odin Project React", "url": "https://www.theodinproject.com/paths/full-stack-javascript/courses/react", "platform": "The Odin Project", "free": True, "type": "course"},
                ],
                "milestone": "Build a full React app with routing, state management, and API calls",
                "projects": ["Movie search app", "E-commerce product listing with cart"],
            },
            {
                "phase": 3,
                "name": "Backend with Node.js & Databases",
                "duration_weeks": 8,
                "skills": ["Node.js", "Express.js", "PostgreSQL", "MongoDB", "REST API Design", "Authentication"],
                "resources": [
                    {"title": "Node.js Official Docs", "url": "https://nodejs.org/en/docs/", "platform": "Node.js", "free": True, "type": "documentation"},
                    {"title": "The Odin Project NodeJS", "url": "https://www.theodinproject.com/paths/full-stack-javascript/courses/nodejs", "platform": "The Odin Project", "free": True, "type": "course"},
                ],
                "milestone": "Build a full REST API with database, authentication, and deployment",
                "projects": ["Blog API with authentication", "Chat application backend"],
            },
        ],
    },
    "devops_engineer": {
        "title": "DevOps Engineer Roadmap",
        "description": "From Linux basics to cloud-native DevOps",
        "phases": [
            {
                "phase": 1,
                "name": "Linux & Scripting",
                "duration_weeks": 5,
                "skills": ["Linux CLI", "Bash Scripting", "Networking Basics", "Git"],
                "resources": [
                    {"title": "Linux Journey", "url": "https://linuxjourney.com/", "platform": "Linux Journey", "free": True, "type": "course"},
                    {"title": "Bash Scripting Tutorial", "url": "https://www.shellscript.sh/", "platform": "Shell Script", "free": True, "type": "tutorial"},
                    {"title": "The Missing Semester (MIT)", "url": "https://missing.csail.mit.edu/", "platform": "MIT", "free": True, "type": "course"},
                ],
                "milestone": "Write automation scripts, comfortable with Linux CLI",
            },
            {
                "phase": 2,
                "name": "Containers & Orchestration",
                "duration_weeks": 6,
                "skills": ["Docker", "Docker Compose", "Kubernetes basics", "Container Registry"],
                "resources": [
                    {"title": "Docker Get Started", "url": "https://docs.docker.com/get-started/", "platform": "Docker", "free": True, "type": "documentation"},
                    {"title": "Kubernetes Official Tutorial", "url": "https://kubernetes.io/docs/tutorials/", "platform": "Kubernetes", "free": True, "type": "documentation"},
                    {"title": "Play with Docker", "url": "https://labs.play-with-docker.com/", "platform": "Play with Docker", "free": True, "type": "practice"},
                ],
                "milestone": "Containerize an application and deploy with Docker Compose",
            },
        ],
    },
    "default": {
        "title": "General Tech Career Roadmap",
        "description": "Broad foundation for any tech role",
        "phases": [
            {
                "phase": 1,
                "name": "Programming Fundamentals",
                "duration_weeks": 8,
                "skills": ["Python or JavaScript", "Basic Algorithms", "Version Control (Git)"],
                "resources": [
                    {"title": "CS50 Introduction to Computer Science", "url": "https://cs50.harvard.edu/x/", "platform": "Harvard/edX", "free": True, "type": "course"},
                    {"title": "freeCodeCamp", "url": "https://www.freecodecamp.org/", "platform": "freeCodeCamp", "free": True, "type": "course"},
                    {"title": "The Odin Project", "url": "https://www.theodinproject.com/", "platform": "The Odin Project", "free": True, "type": "course"},
                ],
                "milestone": "Build 2-3 personal projects and push them to GitHub",
            },
        ],
    },
}

ROLE_TO_ROADMAP = {
    "software engineer": "software_engineer",
    "swe": "software_engineer",
    "backend": "software_engineer",
    "data scientist": "data_scientist",
    "ml engineer": "data_scientist",
    "data analyst": "data_scientist",
    "web developer": "web_developer",
    "frontend": "web_developer",
    "full stack": "web_developer",
    "devops": "devops_engineer",
}


def generate_roadmap(
    target_role: str,
    current_skills: List[str],
    experience_level: str = "fresher",
) -> Dict:
    """
    Generate a personalized learning roadmap.
    Filters phases based on skills already present.
    """
    roadmap_key = _map_role_to_roadmap(target_role)
    roadmap_template = ROADMAPS.get(roadmap_key, ROADMAPS["default"]).copy()

    current_skills_lower = set(s.lower() for s in current_skills)

    phases = []
    for phase in roadmap_template["phases"]:
        phase_copy = phase.copy()
        phase_skills = [s.lower() for s in phase.get("skills", [])]

        # Skills user already has from this phase
        covered = [s for s in phase_skills if any(cs in s or s in cs for cs in current_skills_lower)]
        remaining = [s for s in phase.get("skills", []) if s.lower() not in [c.lower() for c in covered]]

        phase_copy["skills_covered"] = covered
        phase_copy["skills_to_learn"] = remaining
        phase_copy["completion_percentage"] = int(
            len(covered) / len(phase_skills) * 100 if phase_skills else 0
        )
        phases.append(phase_copy)

    return {
        "role": target_role,
        "roadmap_key": roadmap_key,
        "title": roadmap_template["title"],
        "description": roadmap_template["description"],
        "experience_level": experience_level,
        "total_weeks": sum(p.get("duration_weeks", 0) for p in phases),
        "phases": phases,
        "overall_completion": int(
            sum(p["completion_percentage"] for p in phases) / len(phases)
            if phases else 0
        ),
    }


def _map_role_to_roadmap(target_role: str) -> str:
    role_lower = (target_role or "").lower()
    for key, val in ROLE_TO_ROADMAP.items():
        if key in role_lower:
            return val
    return "default"
