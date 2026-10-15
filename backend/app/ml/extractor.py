"""
CC — Career Craft
Skill Extractor: NLP-powered skill identification from resume text.

Approach:
1. Curated skill taxonomy (O*NET-derived, tech-community sourced) — deterministic, fast.
2. spaCy NER for entity extraction (Person, ORG, etc.) to find certifications & companies.
3. Pattern-based section detection for structured resume parsing.
4. Optional sentence-transformers for semantic matching of unlisted skills.

All rules are explainable — no black-box scoring.
"""
import re
import json
import logging
from typing import Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)

# ── Skill Taxonomy ─────────────────────────────────────────────────────────────
# Organized by category — lowercase for matching
SKILL_TAXONOMY = {
    "programming_languages": [
        "python", "java", "javascript", "typescript", "c", "c++", "c#", "go",
        "rust", "swift", "kotlin", "ruby", "php", "r", "matlab", "scala",
        "perl", "dart", "lua", "haskell", "elixir", "clojure", "groovy",
        "fortran", "cobol", "assembly", "bash", "shell", "powershell",
        "objective-c", "vba", "sql", "plsql", "tsql",
    ],
    "web_frontend": [
        "react", "react.js", "vue", "vue.js", "angular", "svelte", "next.js",
        "nuxt.js", "gatsby", "html", "html5", "css", "css3", "sass", "scss",
        "less", "bootstrap", "tailwind", "tailwindcss", "material-ui", "mui",
        "chakra-ui", "jquery", "webpack", "vite", "babel", "eslint", "prettier",
        "redux", "zustand", "mobx", "recoil", "graphql", "apollo",
        "websocket", "web components", "pwa",
    ],
    "web_backend": [
        "node.js", "express", "express.js", "django", "flask", "fastapi",
        "spring", "spring boot", "rails", "ruby on rails", "laravel", "symfony",
        "asp.net", ".net", ".net core", "nestjs", "gin", "fiber",
        "rest", "rest api", "restful", "microservices", "graphql",
        "grpc", "soap", "oauth", "jwt", "session management",
    ],
    "databases": [
        "mysql", "postgresql", "postgres", "sqlite", "mongodb", "redis",
        "elasticsearch", "cassandra", "dynamodb", "firebase", "supabase",
        "oracle", "mssql", "mariadb", "neo4j", "influxdb", "cockroachdb",
        "prisma", "sequelize", "hibernate", "sqlalchemy", "mongoose",
        "sql", "nosql", "acid", "orm", "database design", "normalization",
    ],
    "cloud_devops": [
        "aws", "amazon web services", "gcp", "google cloud", "azure",
        "docker", "kubernetes", "k8s", "terraform", "ansible", "jenkins",
        "ci/cd", "github actions", "gitlab ci", "circleci", "travis ci",
        "nginx", "apache", "linux", "ubuntu", "centos", "unix",
        "heroku", "vercel", "netlify", "digitalocean", "cloudflare",
        "helm", "prometheus", "grafana", "elk stack", "datadog",
    ],
    "ai_ml": [
        "machine learning", "deep learning", "neural networks", "nlp",
        "natural language processing", "computer vision", "reinforcement learning",
        "tensorflow", "pytorch", "keras", "scikit-learn", "sklearn",
        "pandas", "numpy", "scipy", "matplotlib", "seaborn", "plotly",
        "hugging face", "transformers", "bert", "gpt", "llm",
        "opencv", "yolo", "cnn", "rnn", "lstm", "transformer",
        "xgboost", "lightgbm", "catboost", "random forest",
        "data science", "data analysis", "data visualization",
        "feature engineering", "model deployment", "mlops",
        "langchain", "llamaindex", "vector database", "embeddings",
        "a/b testing", "statistical modeling", "regression", "classification",
        "clustering", "dimensionality reduction", "pca",
    ],
    "mobile": [
        "android", "ios", "react native", "flutter", "dart",
        "swift", "objective-c", "kotlin", "xamarin", "ionic",
        "cordova", "capacitor", "expo", "xcode", "android studio",
    ],
    "tools_platforms": [
        "git", "github", "gitlab", "bitbucket", "jira", "confluence",
        "slack", "trello", "figma", "adobe xd", "sketch", "invision",
        "postman", "insomnia", "swagger", "openapi", "sonarqube",
        "vs code", "intellij", "pycharm", "eclipse", "vim", "emacs",
        "linux", "bash", "powershell", "make", "cmake", "gradle", "maven",
    ],
    "security": [
        "cybersecurity", "penetration testing", "ethical hacking",
        "owasp", "ssl", "tls", "cryptography", "authentication",
        "authorization", "rbac", "sso", "saml", "oidc",
        "vulnerability assessment", "siem", "firewall", "ids/ips",
        "iso 27001", "soc 2", "gdpr", "compliance",
    ],
    "soft_skills": [
        "communication", "teamwork", "leadership", "problem solving",
        "critical thinking", "time management", "adaptability",
        "creativity", "collaboration", "presentation", "public speaking",
        "project management", "agile", "scrum", "kanban",
        "mentoring", "documentation", "research", "analytical thinking",
        "attention to detail", "initiative", "self-motivated",
    ],
    "data_engineering": [
        "apache spark", "spark", "hadoop", "kafka", "airflow",
        "dbt", "etl", "data pipeline", "data warehouse",
        "snowflake", "redshift", "bigquery", "databricks",
        "tableau", "power bi", "looker", "metabase",
    ],
    "testing": [
        "unit testing", "integration testing", "e2e testing",
        "pytest", "jest", "mocha", "chai", "selenium",
        "cypress", "playwright", "testng", "junit",
        "tdd", "bdd", "qa", "quality assurance",
    ],
}

# Section header patterns
SECTION_PATTERNS = {
    "contact": r"(?i)(contact|personal\s+info|personal\s+details)",
    "education": r"(?i)(education|academic|qualification|degree|university|college)",
    "experience": r"(?i)(experience|work\s+history|employment|professional\s+background|career)",
    "skills": r"(?i)(skills|technical\s+skills|competencies|expertise|proficiencies|technologies)",
    "projects": r"(?i)(projects|portfolio|personal\s+projects|academic\s+projects|work\s+samples)",
    "certifications": r"(?i)(certif|license|credential|accreditation|course)",
    "achievements": r"(?i)(achievement|award|honor|recognition|accomplishment)",
    "summary": r"(?i)(summary|objective|profile|about|overview|bio)",
    "publications": r"(?i)(publication|research|paper|journal|conference)",
    "languages": r"(?i)(language|spoken|linguistic)",
    "interests": r"(?i)(interest|hobby|hobbies|activities|extracurricular)",
    "references": r"(?i)(reference|referee)",
    "volunteer": r"(?i)(volunteer|community|social\s+work)",
}

# Education degree patterns
DEGREE_PATTERNS = [
    (r"(?i)\b(ph\.?d|doctor\s+of\s+philosophy)\b", "PhD"),
    (r"(?i)\b(m\.?tech|master\s+of\s+technology)\b", "M.Tech"),
    (r"(?i)\b(m\.?e\.?|master\s+of\s+engineering)\b", "ME"),
    (r"(?i)\b(m\.?sc\.?|master\s+of\s+science)\b", "MSc"),
    (r"(?i)\b(m\.?b\.?a\.?|master\s+of\s+business)\b", "MBA"),
    (r"(?i)\b(m\.?c\.?a\.?|master\s+of\s+computer)\b", "MCA"),
    (r"(?i)\b(b\.?tech|bachelor\s+of\s+technology)\b", "B.Tech"),
    (r"(?i)\b(b\.?e\.?|bachelor\s+of\s+engineering)\b", "BE"),
    (r"(?i)\b(b\.?sc\.?|bachelor\s+of\s+science)\b", "BSc"),
    (r"(?i)\b(b\.?c\.?a\.?|bachelor\s+of\s+computer)\b", "BCA"),
    (r"(?i)\b(b\.?b\.?a\.?|bachelor\s+of\s+business)\b", "BBA"),
    (r"(?i)\b(b\.?com\.?|bachelor\s+of\s+commerce)\b", "BCom"),
    (r"(?i)\b(10\+2|class\s+12|hsc|higher\s+secondary)\b", "HSC/12th"),
    (r"(?i)\b(10th|sslc|class\s+10|secondary)\b", "SSC/10th"),
    (r"(?i)\b(diploma)\b", "Diploma"),
]

# Contact info patterns
EMAIL_PATTERN = r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
PHONE_PATTERN = r"(?:\+91[\s\-]?)?(?:\d{5}[\s\-]?\d{5}|\d{3}[\s\-]?\d{3}[\s\-]?\d{4}|\(\d{3}\)\s*\d{3}[\s\-]\d{4})"
LINKEDIN_PATTERN = r"(?:linkedin\.com/in/|linkedin\.com/pub/)([a-zA-Z0-9\-]+)"
GITHUB_PATTERN = r"(?:github\.com/)([a-zA-Z0-9\-]+)"


def extract_skills(text: str) -> Dict[str, List[str]]:
    """
    Extract technical and soft skills from resume text.
    Returns dict with 'technical' and 'soft' lists.
    Each skill is a canonical name from the taxonomy.
    """
    text_lower = text.lower()
    found_technical = []
    found_soft = []
    found_categories = {}

    for category, skills in SKILL_TAXONOMY.items():
        matched_in_category = []
        for skill in skills:
            # Word-boundary matching for short skills, substring for longer ones
            if len(skill) <= 3:
                pattern = r"(?<![a-zA-Z])" + re.escape(skill) + r"(?![a-zA-Z])"
            else:
                pattern = r"(?i)\b" + re.escape(skill) + r"\b"

            if re.search(pattern, text_lower):
                canonical = _canonicalize_skill(skill)
                if canonical not in matched_in_category:
                    matched_in_category.append(canonical)

        if matched_in_category:
            found_categories[category] = matched_in_category
            if category == "soft_skills":
                found_soft.extend(matched_in_category)
            else:
                found_technical.extend(matched_in_category)

    # Deduplicate preserving order
    found_technical = list(dict.fromkeys(found_technical))
    found_soft = list(dict.fromkeys(found_soft))

    return {
        "technical": found_technical,
        "soft": found_soft,
        "by_category": found_categories,
    }


def extract_contact_info(text: str) -> Dict:
    """Extract contact information from resume text."""
    contact = {}

    emails = re.findall(EMAIL_PATTERN, text)
    if emails:
        contact["email"] = emails[0]

    phones = re.findall(PHONE_PATTERN, text)
    if phones:
        contact["phone"] = phones[0].strip()

    linkedin = re.findall(LINKEDIN_PATTERN, text, re.IGNORECASE)
    if linkedin:
        contact["linkedin"] = f"linkedin.com/in/{linkedin[0]}"

    github = re.findall(GITHUB_PATTERN, text, re.IGNORECASE)
    if github:
        contact["github"] = f"github.com/{github[0]}"

    # Extract name — first non-empty line that looks like a name
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    for line in lines[:5]:
        if 2 <= len(line.split()) <= 5 and re.match(r"^[A-Za-z\s\.\-']+$", line):
            contact["name"] = line
            break

    return contact


def extract_education(text: str) -> List[Dict]:
    """Extract education entries from resume text."""
    education = []
    lines = text.split("\n")
    section_text = _extract_section(text, "education")
    if not section_text:
        section_text = text  # fallback: scan full text

    # Detect degree mentions
    for pattern, degree_name in DEGREE_PATTERNS:
        matches = re.finditer(pattern, section_text)
        for match in matches:
            # Grab surrounding context (2 lines before and after)
            start = max(0, match.start() - 200)
            end = min(len(section_text), match.end() + 200)
            context = section_text[start:end]

            entry = {
                "degree": degree_name,
                "raw_context": context.strip()[:300],
            }

            # Try to extract year
            year = re.search(r"\b(19|20)\d{2}\b", context)
            if year:
                entry["year"] = year.group(0)

            # Try to extract GPA/percentage/CGPA
            gpa = re.search(r"(?:cgpa|gpa|grade|percentage|marks)[:\s]*([0-9.]+)", context, re.I)
            if gpa:
                entry["gpa"] = gpa.group(1)

            if not any(e.get("degree") == degree_name for e in education):
                education.append(entry)

    return education


def extract_experience(text: str) -> List[Dict]:
    """Extract work experience entries from resume text."""
    section_text = _extract_section(text, "experience")
    if not section_text:
        return []

    entries = []
    lines = [l.strip() for l in section_text.split("\n") if l.strip()]
    current_entry = {}

    for line in lines:
        # Duration pattern (e.g., "Jan 2022 - Present", "2021 - 2023")
        duration = re.search(
            r"(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[\s,]*\d{4}\s*[-–—to]+\s*"
            r"(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)?[\s,]*\d{4}|"
            r"(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[\s,]*\d{4}\s*[-–—to]+\s*Present|"
            r"\d{4}\s*[-–—to]+\s*\d{4}|\d{4}\s*[-–—to]+\s*Present",
            line, re.I
        )

        if duration and not current_entry.get("title"):
            current_entry["duration"] = duration.group(0)
        elif len(line) < 100 and not any(
            x in line.lower() for x in ["•", "·", "-", "worked", "developed", "built", "created", "managed"]
        ):
            if not current_entry.get("title") or not current_entry.get("duration"):
                if current_entry and current_entry.get("title"):
                    entries.append(current_entry)
                    current_entry = {}
                if not current_entry.get("title"):
                    current_entry["title"] = line

    if current_entry:
        entries.append(current_entry)

    # Simple fallback — just return raw lines if complex parsing fails
    if not entries and lines:
        entries = [{"raw": "\n".join(lines[:20])}]

    return entries[:10]  # Cap at 10 entries


def extract_projects(text: str) -> List[Dict]:
    """Extract project entries from resume text."""
    section_text = _extract_section(text, "projects")
    if not section_text:
        return []

    projects = []
    lines = [l.strip() for l in section_text.split("\n") if l.strip()]
    current_project = {}

    for line in lines:
        # Project title — usually a short, non-bullet line
        if len(line) < 100 and not line.startswith(("•", "·", "-", "*", "◦")):
            if current_project:
                projects.append(current_project)
            current_project = {"title": line, "description": []}
        elif current_project:
            current_project.setdefault("description", []).append(line.lstrip("•·-* "))

    if current_project:
        projects.append(current_project)

    # Flatten descriptions
    for p in projects:
        if isinstance(p.get("description"), list):
            p["description"] = " ".join(p["description"])[:500]

    return projects[:8]


def extract_certifications(text: str) -> List[str]:
    """Extract certification names from resume text."""
    section_text = _extract_section(text, "certifications")
    if not section_text:
        section_text = text

    certs = []
    # Common cert patterns
    cert_patterns = [
        r"(?i)(aws\s+certified[^\n,]{0,60})",
        r"(?i)(google\s+(?:cloud\s+)?certified[^\n,]{0,60})",
        r"(?i)(microsoft\s+(?:azure\s+)?certified[^\n,]{0,60})",
        r"(?i)(oracle\s+certified[^\n,]{0,60})",
        r"(?i)(cisco\s+(?:ccna|ccnp|ccie)[^\n,]{0,60})",
        r"(?i)(certified\s+(?:ethical\s+hacker|penetration|security)[^\n,]{0,60})",
        r"(?i)(pmp|prince2|agile|scrum\s+master|safe[^\n,]{0,40})",
        r"(?i)(coursera|udemy|edx|nptel|linkedin\s+learning)[^\n]{0,100}",
        r"(?i)(machine\s+learning\s+(?:certification|specialization)[^\n,]{0,60})",
        r"(?i)(full\s+stack[^\n,]{0,60}certification[^\n,]{0,40})",
        r"(?i)(data\s+science[^\n,]{0,60}certification[^\n,]{0,40})",
    ]

    for pattern in cert_patterns:
        matches = re.findall(pattern, section_text)
        for m in matches:
            cert = m.strip()
            if cert and cert not in certs:
                certs.append(cert)

    # Also grab bullet lines in certifications section
    if section_text != text:
        for line in section_text.split("\n"):
            line = line.strip().lstrip("•·-* ")
            if 10 < len(line) < 150 and line not in certs:
                certs.append(line)

    return certs[:15]


def extract_achievements(text: str) -> List[str]:
    """Extract achievements from resume text."""
    section_text = _extract_section(text, "achievements")
    achievements = []

    # Quantified achievements (numbers, %, $)
    quant_pattern = r"[^.\n]*(?:\d+%|\$\d+|\d+\s+(?:users?|clients?|customers?|projects?|team|members?|percent))[^.\n]*"
    matches = re.findall(quant_pattern, text, re.I)
    for m in matches[:10]:
        m = m.strip().lstrip("•·-* ")
        if 20 < len(m) < 300:
            achievements.append(m)

    if section_text:
        for line in section_text.split("\n"):
            line = line.strip().lstrip("•·-* ")
            if 15 < len(line) < 250 and line not in achievements:
                achievements.append(line)

    return list(dict.fromkeys(achievements))[:10]


def _extract_section(text: str, section_name: str) -> Optional[str]:
    """Extract a named section's text from resume."""
    pattern = SECTION_PATTERNS.get(section_name, "")
    if not pattern:
        return None

    # Find section start
    start_match = re.search(pattern, text)
    if not start_match:
        return None

    section_start = start_match.end()

    # Find next section start
    other_patterns = [v for k, v in SECTION_PATTERNS.items() if k != section_name]
    combined = "|".join(f"({p})" for p in other_patterns)
    next_section = re.search(combined, text[section_start:])

    if next_section:
        return text[section_start : section_start + next_section.start()]
    else:
        return text[section_start:]


def _canonicalize_skill(skill: str) -> str:
    """Normalize skill name to a canonical display form."""
    aliases = {
        "react.js": "React",
        "react": "React",
        "vue.js": "Vue.js",
        "vue": "Vue.js",
        "node.js": "Node.js",
        "python": "Python",
        "javascript": "JavaScript",
        "typescript": "TypeScript",
        "c++": "C++",
        "c#": "C#",
        "html5": "HTML5",
        "css3": "CSS3",
        "sql": "SQL",
        "aws": "AWS",
        "gcp": "GCP",
        "git": "Git",
        "docker": "Docker",
        "kubernetes": "Kubernetes",
        "k8s": "Kubernetes",
        "scikit-learn": "scikit-learn",
        "sklearn": "scikit-learn",
        "tensorflow": "TensorFlow",
        "pytorch": "PyTorch",
        "next.js": "Next.js",
        "spring boot": "Spring Boot",
        "express.js": "Express.js",
        "express": "Express.js",
    }
    return aliases.get(skill.lower(), skill.title())
