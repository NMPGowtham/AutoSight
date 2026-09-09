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

from pathlib import Path

from db.session import get_db
from models.validation import Validation
from models.validation_result import ValidationResult
from models.user import User

from api.v1.auth import get_current_user
from schemas.validation import (
    ValidationCreate,
    ValidationUpdate,
    ValidationResponse,
)
from services.validation_pipeline import run_validation_pipeline
from package_validator.annotation.annotator import annotate_image

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

@router.post("/{validation_id}/generate-processed-image")
def generate_existing_processed_image(
    validation_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generate the processed/annotated package image using
    validation results already stored in PostgreSQL.

    This does NOT call Gemini.
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

    stored_results = (
        db.query(ValidationResult)
        .filter(
            ValidationResult.validation_id == validation_id
        )
        .all()
    )

    if not stored_results:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No stored validation results found. Run the validation pipeline first.",
        )

    processed_images = []

    for image in validation.images:

        image_path = Path(image.file_path)

        if not image_path.exists():
            continue

        # Convert PostgreSQL ValidationResult rows
        # into the format expected by annotator.py.
        annotation_results = []

        for result in stored_results:

            bbox = None

            if (
                result.x1 is not None
                and result.y1 is not None
                and result.x2 is not None
                and result.y2 is not None
            ):
                bbox = [
                    int(result.x1),
                    int(result.y1),
                    int(result.x2),
                    int(result.y2),
                ]

            annotation_results.append({
                "field": result.field or "Evidence",
                "status": result.status,
                "reason": result.reason or "",
                "bbox": bbox,
            })

        # Create processed directory
        processed_dir = image_path.parent / "processed"
        processed_dir.mkdir(
            parents=True,
            exist_ok=True,
        )

        processed_path = processed_dir / image_path.name

        # Use the project's existing annotator
        annotate_image(
            image_path=str(image_path),
            validation_result={
                "results": annotation_results
            },
            output_path=str(processed_path),
        )

        # Convert filesystem path to browser URL
        relative_path = str(processed_path).replace("\\", "/")

        if not relative_path.startswith("/"):
            relative_path = "/" + relative_path

        processed_images.append({
            "image_id": str(image.image_id),
            "file_name": image.file_name,
            "processed_url": relative_path,
        })

    if not processed_images:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to generate processed images.",
        )

    return {
        "validation_id": str(validation_id),
        "processed_images": processed_images,
    }

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