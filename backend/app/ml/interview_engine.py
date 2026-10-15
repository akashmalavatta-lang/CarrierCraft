"""
CC — Career Craft
Interview Engine: Generates role-specific questions and evaluates answers.

Design:
- Question bank organized by role, type, and difficulty.
- Rubric-based evaluation: technical correctness, relevance, clarity, structure, completeness.
- No LLM dependency — fully functional with rule-based evaluation.
- Optional Gemini API for richer feedback (graceful fallback).
"""
import re
import json
import logging
from typing import Dict, List, Optional, Tuple
from collections import Counter

logger = logging.getLogger(__name__)

# ── Question Bank ─────────────────────────────────────────────────────────────
# Organized: role_category -> question_type -> difficulty -> list of questions

BEHAVIORAL_QUESTIONS = [
    {
        "question": "Tell me about yourself.",
        "type": "hr",
        "difficulty": "easy",
        "rubric": {
            "structure": "Past → Present → Future format",
            "content": "Relevant skills, experience, and career goal",
            "length": "60–90 seconds spoken (150–200 words written)",
            "tips": ["Start with education", "Mention top 2–3 skills", "End with why this company"],
        },
        "expected_points": ["educational background", "relevant skills", "key project or experience", "career goal"],
    },
    {
        "question": "Why do you want to work for our company?",
        "type": "hr",
        "difficulty": "easy",
        "rubric": {
            "content": "Company-specific reasons, not generic statements",
            "tips": ["Research the company's products and culture", "Connect their mission to your goals"],
        },
        "expected_points": ["company-specific reason", "personal connection to role or mission"],
    },
    {
        "question": "Describe a challenging project you worked on and how you handled it.",
        "type": "behavioral",
        "difficulty": "medium",
        "rubric": {
            "structure": "STAR method (Situation, Task, Action, Result)",
            "content": "Specific challenge, your role, actions taken, measurable outcome",
            "tips": ["Use a real project", "Quantify the result if possible"],
        },
        "expected_points": ["specific situation", "your role and actions", "outcome or result", "lesson learned"],
    },
    {
        "question": "Where do you see yourself in 5 years?",
        "type": "hr",
        "difficulty": "easy",
        "rubric": {
            "content": "Realistic, role-relevant career growth",
            "tips": ["Align with the role's career path", "Show ambition but not overreach"],
        },
        "expected_points": ["career direction", "skill development plan", "relevance to current role"],
    },
    {
        "question": "Tell me about a time you worked in a team and faced a conflict. How did you resolve it?",
        "type": "behavioral",
        "difficulty": "medium",
        "rubric": {
            "structure": "STAR method",
            "content": "Specific conflict, your approach, resolution, team outcome",
        },
        "expected_points": ["conflict description", "your specific actions", "resolution", "positive outcome"],
    },
    {
        "question": "What are your greatest strengths?",
        "type": "hr",
        "difficulty": "easy",
        "rubric": {
            "content": "2–3 specific, role-relevant strengths with brief evidence",
            "tips": ["Avoid generic answers like 'hardworking'", "Give brief examples"],
        },
        "expected_points": ["specific strength", "brief supporting example"],
    },
    {
        "question": "What is your biggest weakness and how are you working to improve it?",
        "type": "hr",
        "difficulty": "medium",
        "rubric": {
            "content": "Honest, professional weakness with active improvement plan",
            "tips": ["Don't say 'I work too hard'", "Show self-awareness and growth mindset"],
        },
        "expected_points": ["genuine weakness", "active improvement actions", "growth mindset"],
    },
    {
        "question": "Describe a time you had to learn a new technology quickly. How did you approach it?",
        "type": "behavioral",
        "difficulty": "medium",
        "rubric": {
            "structure": "STAR method",
            "content": "Specific technology, your learning approach, application, result",
        },
        "expected_points": ["specific technology", "learning resources used", "application", "outcome"],
    },
    {
        "question": "How do you prioritize your work when you have multiple deadlines?",
        "type": "situational",
        "difficulty": "medium",
        "rubric": {
            "content": "Time management strategy, prioritization framework",
            "tips": ["Mention tools like Kanban/Jira", "Describe a real scenario"],
        },
        "expected_points": ["prioritization method", "communication with stakeholders", "outcome"],
    },
    {
        "question": "Why are you the best candidate for this role?",
        "type": "hr",
        "difficulty": "medium",
        "rubric": {
            "content": "Match between your skills/experience and job requirements",
            "tips": ["Be specific, not generic", "Tie your answer to the job description"],
        },
        "expected_points": ["specific skills match", "relevant experience", "unique value"],
    },
]

TECHNICAL_QUESTIONS = {
    "software_engineer": [
        {
            "question": "Explain the difference between a process and a thread.",
            "type": "technical",
            "difficulty": "medium",
            "expected_points": [
                "process has own memory space",
                "threads share memory within process",
                "process isolation vs thread efficiency",
                "context switching overhead",
            ],
            "ideal_answer_points": "A process is an independent program with its own memory space. A thread is a lightweight unit of execution within a process, sharing the process's memory. Threads are faster to create and switch between, but share memory creates risks of race conditions requiring synchronization.",
        },
        {
            "question": "What is the difference between stack and heap memory?",
            "type": "technical",
            "difficulty": "easy",
            "expected_points": [
                "stack: LIFO, automatic management, function call frames",
                "heap: dynamic allocation, manual or GC management",
                "stack size is limited",
                "heap is larger but slower",
            ],
            "ideal_answer_points": "Stack memory is managed automatically, stores local variables and function call info in LIFO order, and is fast but limited in size. Heap memory is for dynamically allocated data, persists until explicitly freed (or GC collects it), is larger but slightly slower.",
        },
        {
            "question": "Explain the concept of time complexity. What is Big-O notation?",
            "type": "technical",
            "difficulty": "easy",
            "expected_points": [
                "describes algorithm performance as input grows",
                "O(1), O(n), O(log n), O(n^2) examples",
                "ignores constants and lower-order terms",
                "worst-case analysis",
            ],
        },
        {
            "question": "What is Object-Oriented Programming? Explain its four pillars.",
            "type": "technical",
            "difficulty": "easy",
            "expected_points": [
                "encapsulation: bundling data and methods",
                "inheritance: child class inherits from parent",
                "polymorphism: same interface, different implementations",
                "abstraction: hiding implementation details",
            ],
        },
        {
            "question": "Explain the difference between SQL and NoSQL databases.",
            "type": "technical",
            "difficulty": "medium",
            "expected_points": [
                "SQL: structured, relational, ACID, fixed schema",
                "NoSQL: flexible schema, horizontal scaling, BASE",
                "use cases: SQL for transactions, NoSQL for large unstructured data",
                "examples: PostgreSQL vs MongoDB",
            ],
        },
        {
            "question": "What is REST? What are the key HTTP methods and their meanings?",
            "type": "technical",
            "difficulty": "easy",
            "expected_points": [
                "stateless architecture",
                "GET, POST, PUT, PATCH, DELETE",
                "status codes: 200, 201, 400, 401, 404, 500",
                "URL represents resources",
            ],
        },
        {
            "question": "Explain the concept of recursion with an example.",
            "type": "technical",
            "difficulty": "easy",
            "expected_points": [
                "function calls itself",
                "base case to stop recursion",
                "example: factorial or fibonacci",
                "stack memory usage consideration",
            ],
        },
        {
            "question": "What are the SOLID principles?",
            "type": "technical",
            "difficulty": "hard",
            "expected_points": [
                "Single Responsibility Principle",
                "Open/Closed Principle",
                "Liskov Substitution Principle",
                "Interface Segregation Principle",
                "Dependency Inversion Principle",
            ],
        },
        {
            "question": "Describe how you would design a URL shortening service.",
            "type": "technical",
            "difficulty": "hard",
            "expected_points": [
                "hash or encode long URL to short key",
                "store mapping in database",
                "handle collisions",
                "redirects: 301 vs 302",
                "analytics tracking",
                "scalability consideration",
            ],
        },
        {
            "question": "What is a deadlock? How can you prevent it?",
            "type": "technical",
            "difficulty": "hard",
            "expected_points": [
                "circular dependency on shared resources",
                "four conditions: mutual exclusion, hold-and-wait, no preemption, circular wait",
                "prevention: resource ordering, timeout, lock hierarchy",
            ],
        },
    ],
    "data_scientist": [
        {
            "question": "Explain the bias-variance tradeoff.",
            "type": "technical",
            "difficulty": "medium",
            "expected_points": [
                "high bias: underfitting, too simple model",
                "high variance: overfitting, too complex model",
                "need to balance both",
                "regularization, cross-validation strategies",
            ],
        },
        {
            "question": "What is overfitting and how do you prevent it?",
            "type": "technical",
            "difficulty": "easy",
            "expected_points": [
                "model learns training noise, fails on test data",
                "regularization (L1, L2)",
                "dropout (neural networks)",
                "cross-validation",
                "more training data",
                "feature selection",
            ],
        },
        {
            "question": "Explain the difference between supervised and unsupervised learning.",
            "type": "technical",
            "difficulty": "easy",
            "expected_points": [
                "supervised: labeled data, classification/regression",
                "unsupervised: unlabeled, clustering/dimensionality reduction",
                "examples of each",
            ],
        },
        {
            "question": "What evaluation metrics would you use for a classification problem with imbalanced classes?",
            "type": "technical",
            "difficulty": "hard",
            "expected_points": [
                "avoid accuracy alone",
                "precision, recall, F1-score",
                "ROC-AUC",
                "confusion matrix analysis",
                "class-weighted metrics",
            ],
        },
    ],
    "web_developer": [
        {
            "question": "Explain the difference between == and === in JavaScript.",
            "type": "technical",
            "difficulty": "easy",
            "expected_points": [
                "== does type coercion",
                "=== strict equality, no coercion",
                "example: '5' == 5 is true, '5' === 5 is false",
                "always prefer === for predictability",
            ],
        },
        {
            "question": "What is the event loop in JavaScript?",
            "type": "technical",
            "difficulty": "medium",
            "expected_points": [
                "single-threaded",
                "call stack, web APIs, callback queue",
                "event loop processes callbacks when stack is empty",
                "microtasks queue (Promises) vs macrotasks",
            ],
        },
        {
            "question": "Explain the difference between async/await and Promises in JavaScript.",
            "type": "technical",
            "difficulty": "medium",
            "expected_points": [
                "async/await is syntactic sugar over Promises",
                "cleaner syntax, easier error handling with try/catch",
                "both are non-blocking",
                "async functions always return Promises",
            ],
        },
        {
            "question": "What is the virtual DOM in React and why is it used?",
            "type": "technical",
            "difficulty": "medium",
            "expected_points": [
                "lightweight in-memory representation of real DOM",
                "React updates virtual DOM first, diffs with previous",
                "only necessary real DOM updates applied",
                "performance optimization",
            ],
        },
        {
            "question": "Explain CSS Box Model.",
            "type": "technical",
            "difficulty": "easy",
            "expected_points": [
                "content, padding, border, margin",
                "box-sizing: content-box vs border-box",
                "how dimensions are calculated",
            ],
        },
    ],
    "devops_engineer": [
        {
            "question": "Explain the difference between Docker containers and virtual machines.",
            "type": "technical",
            "difficulty": "medium",
            "expected_points": [
                "VMs: full OS, hypervisor, heavyweight",
                "containers: share host OS kernel, lightweight",
                "containers start faster, use less memory",
                "VMs provide stronger isolation",
            ],
        },
        {
            "question": "What is a CI/CD pipeline? Describe the stages.",
            "type": "technical",
            "difficulty": "easy",
            "expected_points": [
                "code commit → build → test → deploy",
                "continuous integration: automated builds and tests",
                "continuous delivery/deployment: automated deployment",
                "tools: Jenkins, GitHub Actions, GitLab CI",
            ],
        },
    ],
}

# Project-explanation questions (personalized from resume)
PROJECT_QUESTION_TEMPLATES = [
    "Walk me through your {project} project. What was the problem you solved?",
    "In your {project} project, what was the most challenging technical decision you made?",
    "How did you test and ensure the quality of your {project} project?",
    "If you could redo your {project} project, what would you do differently?",
    "What did you learn from building {project}?",
]

# Role-to-question-bank mapping
ROLE_MAPPING = {
    "software engineer": "software_engineer",
    "swe": "software_engineer",
    "backend developer": "software_engineer",
    "backend engineer": "software_engineer",
    "frontend developer": "web_developer",
    "frontend engineer": "web_developer",
    "full stack developer": "web_developer",
    "full stack engineer": "web_developer",
    "web developer": "web_developer",
    "data scientist": "data_scientist",
    "ml engineer": "data_scientist",
    "data analyst": "data_scientist",
    "ai engineer": "data_scientist",
    "devops engineer": "devops_engineer",
    "sre": "devops_engineer",
    "cloud engineer": "devops_engineer",
}


def generate_interview(
    target_role: str,
    interview_type: str,
    difficulty: str,
    num_questions: int,
    resume_skills: List[str] = None,
    project_names: List[str] = None,
) -> List[Dict]:
    """
    Generate a set of interview questions for the given role and type.
    Returns list of question dicts with rubric.
    """
    questions = []
    role_key = _map_role(target_role)

    # Always include behavioral/HR questions
    behavioral_pool = [q for q in BEHAVIORAL_QUESTIONS if q["difficulty"] in _difficulty_levels(difficulty)]
    import random
    random.shuffle(behavioral_pool)

    # Determine question distribution
    if interview_type == "technical":
        tech_count = max(6, num_questions - 2)
        behavioral_count = min(2, num_questions - tech_count)
    elif interview_type == "hr":
        behavioral_count = num_questions
        tech_count = 0
    elif interview_type == "behavioral":
        behavioral_count = num_questions
        tech_count = 0
    else:  # mixed
        tech_count = num_questions // 2
        behavioral_count = num_questions - tech_count

    # Add technical questions
    if tech_count > 0:
        tech_pool = TECHNICAL_QUESTIONS.get(role_key, TECHNICAL_QUESTIONS["software_engineer"])
        tech_filtered = [q for q in tech_pool if q["difficulty"] in _difficulty_levels(difficulty)]
        random.shuffle(tech_filtered)
        for q in tech_filtered[:tech_count]:
            questions.append(_format_question(q, len(questions) + 1))

    # Add project-based questions if projects available
    if project_names and len(questions) < num_questions:
        proj = random.choice(project_names)
        template = random.choice(PROJECT_QUESTION_TEMPLATES)
        proj_q = {
            "question": template.format(project=proj),
            "type": "project",
            "difficulty": difficulty,
            "rubric": {
                "structure": "Problem → Solution → Tech choices → Result → Learnings",
                "tips": ["Be specific about your role", "Mention technologies used"],
            },
            "expected_points": ["problem statement", "your approach", "technical decisions", "outcome", "learnings"],
        }
        questions.append(_format_question(proj_q, len(questions) + 1))

    # Add behavioral questions
    for q in behavioral_pool[:behavioral_count]:
        questions.append(_format_question(q, len(questions) + 1))

    # Ensure we have requested number
    if len(questions) < num_questions:
        remaining = [q for q in behavioral_pool if q not in [x.get("_src") for x in questions]]
        for q in remaining[:num_questions - len(questions)]:
            questions.append(_format_question(q, len(questions) + 1))

    return questions[:num_questions]


def evaluate_answer(
    question: Dict,
    user_answer: str,
    time_taken: Optional[int] = None,
) -> Dict:
    """
    Evaluate a user's answer against the rubric.
    Returns score (0-100), dimension scores, feedback, and improved answer suggestion.
    """
    if not user_answer or len(user_answer.strip()) < 10:
        return {
            "score": 0,
            "dimension_scores": {},
            "feedback": "No answer provided. Please type your response to receive evaluation.",
            "improved_answer": None,
            "strengths": [],
            "areas_for_improvement": ["Provide a complete answer"],
        }

    answer_lower = user_answer.lower()
    expected_points = question.get("expected_points", [])
    if isinstance(expected_points, str):
        try:
            expected_points = json.loads(expected_points)
        except Exception:
            expected_points = []

    rubric = question.get("rubric", {})
    if isinstance(rubric, str):
        try:
            rubric = json.loads(rubric)
        except Exception:
            rubric = {}
    elif not isinstance(rubric, dict):
        rubric = {}

    q_type = question.get("question_type", "behavioral")
    word_count = len(user_answer.split())

    scores = {}
    feedback_parts = []
    strengths = []
    improvements = []

    # ── Relevance Score (0-30) ───────────────────────────────────────────────
    relevance = _score_relevance(answer_lower, question.get("question_text", ""), expected_points)
    scores["relevance"] = relevance
    if relevance >= 25:
        strengths.append("Answer directly addresses the question")
    elif relevance >= 15:
        feedback_parts.append("Your answer is partially relevant — focus more on the specific question asked")
    else:
        improvements.append("Ensure your answer directly addresses what was asked")

    # ── Completeness Score (0-25) ─────────────────────────────────────────────
    completeness = _score_completeness(answer_lower, expected_points)
    scores["completeness"] = completeness
    covered = _count_covered_points(answer_lower, expected_points)
    if covered >= len(expected_points) * 0.7:
        strengths.append(f"Covered {covered}/{len(expected_points)} key points")
    elif expected_points:
        missed = _find_missed_points(answer_lower, expected_points)
        if missed:
            improvements.append(f"Missing key points: {', '.join(missed[:3])}")

    # ── Clarity Score (0-20) ──────────────────────────────────────────────────
    clarity = _score_clarity(user_answer, word_count)
    scores["clarity"] = clarity
    if word_count < 30:
        improvements.append("Answer is too brief — expand with more detail and examples")
    elif word_count > 500:
        feedback_parts.append("Answer is quite long — aim for concise, focused responses")
    else:
        strengths.append("Good answer length and clarity")

    # ── Structure Score (0-15) ────────────────────────────────────────────────
    structure = _score_structure(user_answer, q_type, rubric)
    scores["structure"] = structure
    if structure >= 12:
        strengths.append("Well-structured response")
    elif q_type in ("behavioral", "situational") and "situation" not in answer_lower and "task" not in answer_lower:
        improvements.append("Use the STAR method: Situation → Task → Action → Result")

    # ── Technical Accuracy Score (0-10) for technical questions ──────────────
    tech_score = 0
    if q_type == "technical" and expected_points:
        tech_score = min(10, int(completeness / 2.5))
    scores["technical"] = tech_score

    # ── Overall score ─────────────────────────────────────────────────────────
    total = scores["relevance"] + scores["completeness"] + scores["clarity"] + scores["structure"] + scores["technical"]
    # Normalize to 0-100
    max_possible = 30 + 25 + 20 + 15 + 10
    overall_score = (total / max_possible) * 100

    # ── Generate improved answer suggestion ──────────────────────────────────
    improved = _generate_improved_answer(question, user_answer, expected_points)
    follow_up = _generate_follow_up_question(q_type, question.get("question_text", ""), overall_score)

    feedback_text = _build_feedback(overall_score, strengths, improvements, feedback_parts, q_type, rubric)

    return {
        "score": round(overall_score, 1),
        "dimension_scores": {k: round(v, 1) for k, v in scores.items()},
        "feedback": feedback_text,
        "improved_answer": improved,
        "follow_up_question": follow_up,
        "strengths": strengths[:4],
        "areas_for_improvement": improvements[:4],
        "word_count": word_count,
    }


def _generate_follow_up_question(q_type: str, question_text: str, score: float) -> str:
    """Generate a targeted follow-up question based on answer quality and question domain."""
    q_text_lower = question_text.lower()
    if "deadlock" in q_text_lower:
        return "How would you diagnose and recover from a deadlock in a production database without taking the entire service offline?"
    if "solid" in q_text_lower:
        return "Can you share an example where violating the Single Responsibility Principle caused significant maintainability bottlenecks in a real project?"
    if "bias-variance" in q_text_lower or "overfitting" in q_text_lower:
        return "How do you systematically decide whether to collect more training samples versus applying stronger regularization or pruning features?"
    if "url shortening" in q_text_lower:
        return "How would you ensure sub-10ms redirect latency and handle cache invalidation if this URL shortening service receives 50,000 reads/sec?"

    if q_type == "technical":
        return "What are the performance or security trade-offs of this approach, and how would you monitor it in production?"
    elif q_type in ("behavioral", "situational"):
        return "Looking back, what key takeaway or process change would you apply if you faced an identical situation today?"
    else:
        return "Can you provide a concrete example where this approach or philosophy directly benefited a team you worked with?"



def _score_relevance(answer: str, question: str, expected_points: list) -> float:
    """Score how relevant the answer is to the question."""
    if not expected_points:
        # Rough relevance based on question keywords
        q_words = set(re.findall(r"[a-zA-Z]{4,}", question.lower()))
        a_words = set(re.findall(r"[a-zA-Z]{4,}", answer.lower()))
        overlap = len(q_words & a_words)
        return min(30, overlap * 3)

    covered = sum(1 for p in expected_points if _point_covered(answer, p))
    ratio = covered / len(expected_points) if expected_points else 0
    return ratio * 30


def _score_completeness(answer: str, expected_points: list) -> float:
    """Score completeness based on expected key points."""
    if not expected_points:
        wc = len(answer.split())
        return min(25, wc / 10)  # proxy: longer = more complete (capped)

    covered = sum(1 for p in expected_points if _point_covered(answer, p))
    ratio = covered / len(expected_points)
    return ratio * 25


def _score_clarity(answer: str, word_count: int) -> float:
    """Score answer clarity based on length and sentence structure."""
    if word_count < 20:
        return 5.0
    elif 50 <= word_count <= 300:
        return 20.0
    elif 20 <= word_count < 50:
        return 12.0
    elif word_count <= 400:
        return 17.0
    else:
        return 14.0  # too long, slight penalty


def _score_structure(answer: str, q_type: str, rubric: dict) -> float:
    """Score answer structure."""
    answer_lower = answer.lower()
    score = 10.0  # base

    if q_type in ("behavioral", "situational"):
        # STAR method signals
        star_signals = {
            "situation": ["when", "at", "during", "while", "situation", "time when"],
            "task": ["task", "goal", "objective", "responsible", "needed to"],
            "action": ["i did", "i implemented", "i created", "i led", "i took", "i decided", "i worked"],
            "result": ["result", "outcome", "achieved", "successfully", "improved", "reduced", "increased", "%"],
        }
        components_found = sum(
            1 for signals in star_signals.values()
            if any(s in answer_lower for s in signals)
        )
        score = min(15, components_found * 3.75)

    elif q_type == "technical":
        # Technical answer: definition + explanation + example
        has_example = any(w in answer_lower for w in ["example", "for instance", "such as", "e.g.", "like"])
        score = 10 + (5 if has_example else 0)

    return score


def _point_covered(answer: str, expected_point: str) -> bool:
    """Check if an expected point is covered in the answer."""
    point_words = re.findall(r"[a-zA-Z]{3,}", expected_point.lower())
    if not point_words:
        return False
    covered = sum(1 for w in point_words if w in answer)
    return covered >= max(1, len(point_words) * 0.5)


def _count_covered_points(answer: str, expected_points: list) -> int:
    return sum(1 for p in expected_points if _point_covered(answer, p))


def _find_missed_points(answer: str, expected_points: list) -> list:
    return [p for p in expected_points if not _point_covered(answer, p)]


def _generate_improved_answer(question: Dict, user_answer: str, expected_points: list) -> str:
    """Generate a hint toward a better answer."""
    q_type = question.get("question_type", "behavioral")
    q_text = question.get("question_text", "")
    ideal = question.get("ideal_answer_points", "")

    if ideal:
        return f"**Model answer guidance:**\n{ideal}"

    if expected_points:
        points_str = "\n".join(f"• {p}" for p in expected_points)
        if q_type in ("behavioral", "situational"):
            return (
                f"**Structured approach (STAR method):**\n"
                f"**Situation:** Describe the specific context.\n"
                f"**Task:** Explain your responsibility.\n"
                f"**Action:** Detail exactly what you did.\n"
                f"**Result:** Share the measurable outcome.\n\n"
                f"**Key points to cover:**\n{points_str}"
            )
        else:
            return f"**Key points your answer should cover:**\n{points_str}"

    return "Ensure your answer is specific, uses examples, and addresses all parts of the question."


def _build_feedback(
    score: float, strengths: list, improvements: list, extra: list, q_type: str, rubric: dict
) -> str:
    """Build a structured feedback string."""
    parts = []

    if score >= 80:
        parts.append(f"✅ **Excellent answer** ({score:.0f}/100)")
    elif score >= 60:
        parts.append(f"👍 **Good answer** ({score:.0f}/100) — a few areas to refine")
    elif score >= 40:
        parts.append(f"⚠️ **Fair answer** ({score:.0f}/100) — needs more depth and structure")
    else:
        parts.append(f"❌ **Needs significant improvement** ({score:.0f}/100)")

    if strengths:
        parts.append("\n**Strengths:**")
        parts.extend(f"• {s}" for s in strengths)

    if improvements:
        parts.append("\n**Areas to improve:**")
        parts.extend(f"• {i}" for i in improvements)

    if extra:
        parts.extend(extra)

    if rubric.get("tips"):
        parts.append("\n**Tips:**")
        parts.extend(f"• {t}" for t in rubric["tips"][:3])

    return "\n".join(parts)


def _difficulty_levels(difficulty: str) -> List[str]:
    """Return which difficulty levels to include."""
    if difficulty == "easy":
        return ["easy"]
    elif difficulty == "medium":
        return ["easy", "medium"]
    else:
        return ["easy", "medium", "hard"]


def _map_role(target_role: str) -> str:
    """Map free-form role to question bank key."""
    role_lower = (target_role or "").lower().strip()
    for key, val in ROLE_MAPPING.items():
        if key in role_lower:
            return val
    return "software_engineer"  # default fallback


def _format_question(q: Dict, order: int) -> Dict:
    """Format a question dict for storage."""
    return {
        "order_num": order,
        "question_type": q.get("type", "behavioral"),
        "question_text": q.get("question", ""),
        "expected_points": q.get("expected_points", []),
        "rubric": json.dumps(q.get("rubric", {})),
        "difficulty": q.get("difficulty", "medium"),
        "_src": q,
    }
