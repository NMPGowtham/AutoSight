import os
import uuid

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)
from sqlalchemy.orm import Session
from uuid import UUID

from db.session import get_db
from models.validation import Validation
from models.user import User

from api.v1.auth import get_current_user
from schemas.validation import (
    ValidationCreate,
    ValidationUpdate,
    ValidationResponse,
)
from services.validation_pipeline import run_validation_pipeline


router = APIRouter(
    prefix="/api/validation",
    tags=["Validation"]
)


@router.post(
    "/",
    response_model=ValidationResponse,
    status_code=status.HTTP_201_CREATED
)
def create_validation(
    request: ValidationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    validation = Validation(
        user_id=current_user.user_id,
        overall_status="PENDING"
    )

    db.add(validation)
    db.commit()
    db.refresh(validation)

    return validation


@router.get(
    "/",
    response_model=list[ValidationResponse]
)
def get_validations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    validations = db.query(Validation).filter(
        Validation.user_id == current_user.user_id
    ).order_by(
        Validation.created_at.desc()
    ).all()

    return validations


@router.get(
    "/{validation_id}",
    response_model=ValidationResponse
)
def get_validation(
    validation_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    validation = db.query(Validation).filter(
        Validation.validation_id == validation_id,
        Validation.user_id == current_user.user_id
    ).first()

    if not validation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Validation not found"
        )

    return validation


@router.put(
    "/{validation_id}",
    response_model=ValidationResponse
)
def update_validation(
    validation_id: uuid.UUID,
    request: ValidationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    validation = db.query(Validation).filter(
        Validation.validation_id == validation_id,
        Validation.user_id == current_user.user_id
    ).first()

    if not validation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Validation not found"
        )

    if request.overall_status is not None:
        validation.overall_status = request.overall_status

    if request.validation_score is not None:
        validation.validation_score = request.validation_score

    db.commit()
    db.refresh(validation)

    return validation

@router.post("/{validation_id}/process")
def process_validation(
    validation_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Run the complete AI + rule-engine validation pipeline.
    """

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
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Validation not found",
        )

    if not validation.images:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No images uploaded for this validation",
        )

    try:
        result = run_validation_pipeline(
            db=db,
            validation=validation,
        )

        return result

    except FileNotFoundError as exc:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    except Exception as exc:
        import traceback

        db.rollback()
        traceback.print_exc()
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Validation pipeline failed: {str(exc)}",
        )


@router.delete(
    "/{validation_id}"
)
def delete_validation(
    validation_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    validation = db.query(Validation).filter(
        Validation.validation_id == validation_id,
        Validation.user_id == current_user.user_id
    ).first()

    if not validation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Validation not found"
        )

    # Delete physical uploaded files
    for image in validation.images:
        if image.file_path and os.path.exists(image.file_path):
            os.remove(image.file_path)

    # SQLAlchemy cascade deletes related records
    db.delete(validation)
    db.commit()

    return {
        "message": "Validation deleted successfully",
        "validation_id": validation_id
    }