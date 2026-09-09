from pathlib import Path
from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from db.session import get_db
from models.user import User
from models.validation import Validation
from models.report import Report
from api.v1.auth import get_current_user

from services.report_generator import (
    generate_validation_report,
)


router = APIRouter(
    prefix="/api/validation",
    tags=["Reports"],
)

@router.get("/{validation_id}/report-data")
def get_report_data(
    validation_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
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

    results = validation.validation_results or []

    passed = sum(
        1 for r in results
        if r.status.upper() == "PASS"
    )

    review = sum(
        1 for r in results
        if r.status.upper() == "REVIEW"
    )

    failed = sum(
        1 for r in results
        if r.status.upper() == "FAIL"
    )

    context = validation.package_context

    rules = []

    for result in results:
        rule = result.rule

        bbox = None

        if all(
            value is not None
            for value in (
                result.x1,
                result.y1,
                result.x2,
                result.y2,
            )
        ):
            bbox = [
                result.x1,
                result.y1,
                result.x2,
                result.y2,
            ]

        rules.append({
            "result_id": str(result.result_id),
            "rule_id": result.rule_id,
            "field": result.field,
            "status": result.status,
            "severity": (
                rule.severity
                if rule
                else None
            ),
            "description": (
                rule.description
                if rule
                else None
            ),
            "reason": result.reason,
            "confidence": (
                float(result.confidence)
                if result.confidence is not None
                else None
            ),
            "bbox": bbox,
            "actual_value": getattr(
                result,
                "actual_value",
                None,
            ),
            "expected_value": getattr(
                result,
                "expected_value",
                None,
            ),
            "reviewed_by": (
                str(result.reviewed_by)
                if result.reviewed_by
                else None
            ),
            "reviewed_at": result.reviewed_at,
            "review_comment": result.review_comment,
        })

    images = []

    for image in validation.images or []:
        images.append({
            "image_id": str(image.image_id),
            "file_name": image.file_name,
            "image_url": (
                f"/uploads/"
                f"{validation_id}/"
                f"{image.file_name}"
            ),
            "width": image.width,
            "height": image.height,
        })

    processed_images = []

    for image in validation.images or []:
        original_path = Path(image.file_path)

        processed_path = (
            original_path.parent
            / "processed"
            / original_path.name
        )

        if processed_path.exists():
            processed_images.append({
                "image_id": str(image.image_id),
                "file_name": image.file_name,
                "processed_path": str(processed_path).replace("\\", "/"),
                "processed_url": (
                    f"/uploads/"
                    f"{validation_id}/"
                    f"processed/"
                    f"{original_path.name}"
                ),
                "width": image.width,
                "height": image.height,
            })

    return {
        "inspection_id": str(validation.validation_id),

        "status": validation.overall_status or "REVIEW",

        "score": float(
            validation.validation_score or 0
        ),

        "summary": {
            "passed": passed,
            "review": review,
            "failed": failed,
        },

        "product": {
            "name": (
                context.product_category
                if context
                else None
            ),
            "category": (
                context.product_category
                if context
                else None
            ),
            "package_type": (
                context.package_type
                if context
                else None
            ),
            "consumer_type": (
                context.consumer_type
                if context
                else None
            ),
            "is_imported": (
                context.is_imported
                if context
                else None
            ),
            "is_industrial": (
                context.is_industrial
                if context
                else None
            ),
            "is_institutional": (
                context.is_institutional
                if context
                else None
            ),
            "net_quantity_value": (
                context.net_quantity_value
                if context
                else None
            ),
            "net_quantity_unit": (
                context.net_quantity_unit
                if context
                else None
            ),
        },

        "images": images,
        "processed_images": processed_images,

        "image_url": (
            images[0]["image_url"]
            if images
            else None
        ),

        "image_width": (
            images[0]["width"]
            if images
            else None
        ),

        "image_height": (
            images[0]["height"]
            if images
            else None
        ),

        "rules": rules,

        "inspector": {
            "user_id": str(current_user.user_id),
            "name": current_user.name,
            "email": current_user.email,
        },

        "created_at": validation.created_at,
        "completed_at": validation.completed_at,
    }

@router.post("/{validation_id}/report")
def generate_report(
    validation_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
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

    pdf_path = generate_validation_report(
        db=db,
        validation=validation,
        current_user=current_user,
    )

    report = Report(
        validation_id=validation.validation_id,
        report_name=pdf_path.name,
        report_type="PDF",
        file_path=str(pdf_path),
    )

    db.add(report)
    db.commit()
    db.refresh(report)

    return {
        "report_id": str(report.report_id),
        "validation_id": str(validation.validation_id),
        "report_name": report.report_name,
        "report_type": report.report_type,
        "file_path": report.file_path,
        "generated_at": report.generated_at,
    }


@router.get("/{validation_id}/report")
def download_report(
    validation_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
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

    report = (
        db.query(Report)
        .filter(
            Report.validation_id == validation_id
        )
        .order_by(Report.generated_at.desc())
        .first()
    )

    if report is None:
        raise HTTPException(
            status_code=404,
            detail="Report has not been generated yet",
        )

    path = Path(report.file_path)

    if not path.exists():
        raise HTTPException(
            status_code=404,
            detail="Report file not found",
        )

    return FileResponse(
        path=str(path),
        media_type="application/pdf",
        filename=report.report_name,
    )