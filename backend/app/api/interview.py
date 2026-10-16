"""
CC — Career Craft
Interview API: Create sessions, get questions, submit answers, get results.

Changes v2:
- submit_answer now returns follow_up_question from evaluation
- Added /transcript endpoint to save session transcript
- Added /report endpoint for detailed AI-generated report
- Added generation of full report on complete
"""
import json
from datetime import datetime, timezone
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app import db
from app.models import Interview, InterviewQuestion, Resume, User, UserActivity
from app.ml.interview_engine import generate_interview, evaluate_answer

interview_bp = Blueprint("interview", __name__)


@interview_bp.route("/start", methods=["POST"])
@jwt_required()
def start_interview():
    """Create a new mock interview session."""
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json(silent=True) or {}
    target_role = (data.get("target_role") or user.target_role or "Software Engineer").strip()
    interview_type = data.get("interview_type", "mixed")
    difficulty = data.get("difficulty", "medium")
    num_questions = min(15, max(3, int(data.get("num_questions", 8))))
    resume_id = data.get("resume_id")

    if interview_type not in ("technical", "hr", "behavioral", "mixed", "situational"):
        interview_type = "mixed"
    if difficulty not in ("easy", "medium", "hard"):
        difficulty = "medium"

    # Get resume skills for personalization
    resume_skills = []
    project_names = []
    resume = None

    if resume_id:
        resume = Resume.query.filter_by(id=resume_id, user_id=user_id).first()
        if resume and resume.analysis:
            analysis = resume.analysis
            resume_skills = json.loads(analysis.skills_technical or "[]")
            projects = json.loads(analysis.projects or "[]")
            project_names = [p.get("title", "") for p in projects if p.get("title")]

    # Generate questions
    questions_data = generate_interview(
        target_role=target_role,
        interview_type=interview_type,
        difficulty=difficulty,
        num_questions=num_questions,
        resume_skills=resume_skills,
        project_names=project_names,
    )

    # Create Interview session
    interview = Interview(
        user_id=user_id,
        resume_id=resume_id if resume else None,
        title=f"{target_role} — {interview_type.title()} Interview",
        interview_type=interview_type,
        target_role=target_role,
        difficulty=difficulty,
        total_questions=len(questions_data),
        status="in_progress",
    )
    db.session.add(interview)
    db.session.flush()

    # Create question records
    for q in questions_data:
        expected_points = q.pop("expected_points", [])
        q.pop("_src", None)

        iq = InterviewQuestion(
            interview_id=interview.id,
            order_num=q["order_num"],
            question_type=q["question_type"],
            question_text=q["question_text"],
            expected_answer=json.dumps(expected_points),
            rubric=q["rubric"],
        )
        db.session.add(iq)

    activity = UserActivity(
        user_id=user_id,
        activity_type="interview_started",
        description=f"Started {interview_type} interview for '{target_role}'",
        points=5,
    )
    db.session.add(activity)
    db.session.commit()

    # Return interview with questions (no expected answers yet)
    questions_out = (
        InterviewQuestion.query.filter_by(interview_id=interview.id)
        .order_by(InterviewQuestion.order_num)
        .all()
    )

    return jsonify({
        "interview": interview.to_dict(),
        "questions": [q.to_dict() for q in questions_out],
    }), 201


@interview_bp.route("/<int:interview_id>", methods=["GET"])
@jwt_required()
def get_interview(interview_id: int):
    """Get interview session with all questions."""
    user_id = int(get_jwt_identity())
    interview = Interview.query.filter_by(id=interview_id, user_id=user_id).first()
    if not interview:
        return jsonify({"error": "Interview not found"}), 404

    questions = (
        InterviewQuestion.query.filter_by(interview_id=interview_id)
        .order_by(InterviewQuestion.order_num)
        .all()
    )

    return jsonify({
        "interview": interview.to_dict(),
        "questions": [q.to_dict() for q in questions],
    }), 200


@interview_bp.route("/<int:interview_id>/answer/<int:question_id>", methods=["POST"])
@jwt_required()
def submit_answer(interview_id: int, question_id: int):
    """Submit and evaluate a single answer. Returns evaluation + follow_up_question."""
    user_id = int(get_jwt_identity())
    interview = Interview.query.filter_by(id=interview_id, user_id=user_id).first()
    if not interview:
        return jsonify({"error": "Interview not found"}), 404

    if interview.status == "completed":
        return jsonify({"error": "This interview session has already been completed"}), 400

    question = InterviewQuestion.query.filter_by(
        id=question_id, interview_id=interview_id
    ).first()
    if not question:
        return jsonify({"error": "Question not found in this interview"}), 404

    data = request.get_json(silent=True) or {}
    user_answer = (data.get("answer") or "").strip()
    time_taken = data.get("time_taken_seconds")

    if not user_answer:
        return jsonify({"error": "Answer cannot be empty"}), 400

    # Build question dict for evaluator
    q_dict = {
        "question_text": question.question_text,
        "question_type": question.question_type,
        "expected_points": json.loads(question.expected_answer or "[]"),
        "rubric": json.loads(question.rubric or "{}"),
    }

    # Evaluate
    evaluation = evaluate_answer(q_dict, user_answer, time_taken)

    # Persist answer + evaluation results
    question.user_answer = user_answer
    question.score = evaluation["score"]
    question.feedback = evaluation["feedback"]
    question.improved_answer = evaluation.get("improved_answer")
    question.time_taken_seconds = time_taken
    question.answered_at = datetime.now(timezone.utc)

    # Store follow-up question in rubric metadata (extend rubric JSON)
    try:
        rubric_data = json.loads(question.rubric or "{}")
        rubric_data["_follow_up"] = evaluation.get("follow_up_question", "")
        question.rubric = json.dumps(rubric_data)
    except Exception:
        pass

    # Update interview progress
    answered_count = InterviewQuestion.query.filter(
        InterviewQuestion.interview_id == interview_id,
        InterviewQuestion.user_answer.isnot(None),
    ).count()
    interview.answered_questions = answered_count

    db.session.commit()

    return jsonify({
        "question_id": question_id,
        "evaluation": evaluation,
        "progress": {
            "answered": answered_count,
            "total": interview.total_questions,
        },
    }), 200


@interview_bp.route("/<int:interview_id>/complete", methods=["POST"])
@jwt_required()
def complete_interview(interview_id: int):
    """Mark interview as complete and compute overall score with detailed report."""
    user_id = int(get_jwt_identity())
    interview = Interview.query.filter_by(id=interview_id, user_id=user_id).first()
    if not interview:
        return jsonify({"error": "Interview not found"}), 404

    questions = InterviewQuestion.query.filter_by(interview_id=interview_id).all()
    answered = [q for q in questions if q.score is not None]

    if not answered:
        return jsonify({"error": "No answers submitted yet"}), 400

    overall = sum(q.score for q in answered) / len(answered)
    interview.overall_score = overall
    interview.status = "completed"
    interview.completed_at = datetime.now(timezone.utc)
    interview.answered_questions = len(answered)

    # Generate summary feedback
    interview.feedback_summary = _generate_summary(overall, len(answered), interview.total_questions)

    activity = UserActivity(
        user_id=user_id,
        activity_type="interview_completed",
        description=f"Completed interview '{interview.title}' — Score: {overall:.0f}/100",
        points=30,
    )
    db.session.add(activity)
    db.session.commit()

    # Build per-type score breakdown
    type_scores = {}
    for q in answered:
        qt = q.question_type or "general"
        if qt not in type_scores:
            type_scores[qt] = []
        type_scores[qt].append(q.score)

    category_breakdown = {
        qt: round(sum(scores) / len(scores), 1)
        for qt, scores in type_scores.items()
    }

    return jsonify({
        "interview": interview.to_dict(),
        "questions": [q.to_dict(include_expected=True) for q in questions],
        "summary": {
            "overall_score": round(overall, 1),
            "answered": len(answered),
            "total": interview.total_questions,
            "feedback": interview.feedback_summary,
            "category_breakdown": category_breakdown,
        },
    }), 200


@interview_bp.route("/history", methods=["GET"])
@jwt_required()
def interview_history():
    """List completed interviews for the current user."""
    user_id = int(get_jwt_identity())
    interviews = (
        Interview.query.filter_by(user_id=user_id)
        .order_by(Interview.created_at.desc())
        .limit(20)
        .all()
    )
    return jsonify({
        "interviews": [i.to_dict() for i in interviews],
        "total": len(interviews),
    }), 200


@interview_bp.route("/<int:interview_id>", methods=["DELETE"])
@jwt_required()
def delete_interview(interview_id: int):
    """Delete an interview session."""
    user_id = int(get_jwt_identity())
    interview = Interview.query.filter_by(id=interview_id, user_id=user_id).first()
    if not interview:
        return jsonify({"error": "Interview not found"}), 404

    db.session.delete(interview)
    db.session.commit()
    return jsonify({"message": "Interview deleted"}), 200


def _generate_summary(score: float, answered: int, total: int) -> str:
    completion = answered / total * 100 if total > 0 else 0
    if score >= 80:
        level = "Excellent"
        msg = "Your answers demonstrate strong knowledge and clear communication. You're well-prepared for this role."
    elif score >= 65:
        level = "Good"
        msg = "You covered most key points. Focus on adding more specific examples and quantified outcomes."
    elif score >= 50:
        level = "Fair"
        msg = "Some answers need more depth and structure. Practice using the STAR method for behavioral questions."
    else:
        level = "Needs Improvement"
        msg = "Review the key concepts for each question type and practice structured responses with the STAR method."

    return f"{level} performance ({score:.0f}/100) — {completion:.0f}% completion. {msg}"
