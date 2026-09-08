from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from db.session import get_db
from models.user import User
from models.validation import Validation
from models.validation_result import ValidationResult
from api.v1.auth import get_current_user


router = APIRouter(
    prefix="/api/validation",
    tags=["Review"],
)


class ReviewRequest(BaseModel):
    result_id: UUID
    decision: str
    comment: str | None = None


@router.post("/{validation_id}/review")
def review_validation(
    validation_id: UUID,
    request: ReviewRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    decision = request.decision.upper()

    if decision not in {"ACCEPT", "REJECT"}:
        raise HTTPException(
            status_code=400,
            detail="Decision must be ACCEPT or REJECT",
        )

    validation = (
        db.query(Validation)
        .filter(
            Validation.validation_id == validation_id,
            Validation.user_id == current_user.user_id,
        )
        .first()
    )

    if validation is None:
        raise HTTPException(
            status_code=404,
            detail="Validation not found",
        )

    result = (
        db.query(ValidationResult)
        .filter(
            ValidationResult.result_id == request.result_id,
            ValidationResult.validation_id == validation_id,
        )
        .first()
    )

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Validation result not found",
        )

    if result.status.upper() != "REVIEW":
        raise HTTPException(
            status_code=400,
            detail="Only REVIEW results can be manually reviewed",
        )

    # Inspector decision
    if decision == "ACCEPT":
        result.status = "PASS"
    else:
        result.status = "FAIL"

    result.reviewed_by = current_user.user_id
    result.reviewed_at = datetime.now(timezone.utc)
    result.review_comment = request.comment

    # Recalculate overall validation
    results = (
        db.query(ValidationResult)
        .filter(
            ValidationResult.validation_id == validation_id
        )
        .all()
    )

    statuses = [r.status.upper() for r in results]

    if "FAIL" in statuses:
        validation.overall_status = "FAIL"
    elif "REVIEW" in statuses:
        validation.overall_status = "REVIEW"
    else:
        validation.overall_status = "PASS"

    # Calculate score
    if statuses:
        passed = sum(1 for s in statuses if s == "PASS")
        validation.validation_score = round(
            (passed / len(statuses)) * 100,
            2,
        )
    else:
        validation.validation_score = 0

    db.commit()
    db.refresh(result)
    db.refresh(validation)

    return {
        "validation_id": str(validation_id),
        "result_id": str(result.result_id),
        "decision": decision,
        "status": result.status,
        "overall_status": validation.overall_status,
        "score": float(validation.validation_score or 0),
        "reviewed_by": str(current_user.user_id),
        "reviewed_at": result.reviewed_at,
        "comment": result.review_comment,
    }