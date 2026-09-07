import os
import uuid

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
    status,
)
from sqlalchemy.orm import Session

from db.session import get_db
from models.image import Image
from models.validation import Validation
from models.user import User
from api.v1.auth import get_current_user


router = APIRouter(
    prefix="/api/validation",
    tags=["Images"]
)

UPLOAD_DIR = "uploads"

ALLOWED_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
}


def get_user_validation(
    validation_id: uuid.UUID,
    current_user: User,
    db: Session,
):
    validation = db.query(Validation).filter(
        Validation.validation_id == validation_id,
        Validation.user_id == current_user.user_id,
    ).first()

    if not validation:
        raise HTTPException(
            status_code=404,
            detail="Validation not found",
        )

    return validation


@router.post(
    "/{validation_id}/images",
    status_code=status.HTTP_201_CREATED,
)
async def upload_image(
    validation_id: uuid.UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_user_validation(validation_id, current_user, db)

    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Only JPEG, PNG and WebP images are allowed",
        )

    validation_dir = os.path.join(
        UPLOAD_DIR,
        str(validation_id),
    )

    os.makedirs(validation_dir, exist_ok=True)

    extension = os.path.splitext(file.filename or "")[1].lower()

    unique_filename = f"{uuid.uuid4()}{extension}"

    file_path = os.path.join(
        validation_dir,
        unique_filename,
    )

    contents = await file.read()

    with open(file_path, "wb") as buffer:
        buffer.write(contents)

    image = Image(
        validation_id=validation_id,
        image_type="package",
        file_name=file.filename,
        file_path=file_path,
        mime_type=file.content_type,
        file_size=len(contents),
    )

    db.add(image)
    db.commit()
    db.refresh(image)

    return {
        "message": "Image uploaded successfully",
        "image_id": image.image_id,
        "validation_id": validation_id,
        "file_name": image.file_name,
        "file_path": image.file_path,
        "mime_type": image.mime_type,
        "file_size": image.file_size,
    }


@router.get(
    "/{validation_id}/images",
)
def get_images(
    validation_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_user_validation(validation_id, current_user, db)

    images = db.query(Image).filter(
        Image.validation_id == validation_id
    ).order_by(
        Image.created_at.desc()
    ).all()

    return images


@router.get(
    "/{validation_id}/images/{image_id}",
)
def get_image(
    validation_id: uuid.UUID,
    image_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_user_validation(validation_id, current_user, db)

    image = db.query(Image).filter(
        Image.image_id == image_id,
        Image.validation_id == validation_id,
    ).first()

    if not image:
        raise HTTPException(
            status_code=404,
            detail="Image not found",
        )

    return image


@router.put(
    "/{validation_id}/images/{image_id}",
)
async def update_image(
    validation_id: uuid.UUID,
    image_id: uuid.UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_user_validation(validation_id, current_user, db)

    image = db.query(Image).filter(
        Image.image_id == image_id,
        Image.validation_id == validation_id,
    ).first()

    if not image:
        raise HTTPException(
            status_code=404,
            detail="Image not found",
        )

    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Only JPEG, PNG and WebP images are allowed",
        )

    # Delete old physical file
    if image.file_path and os.path.exists(image.file_path):
        os.remove(image.file_path)

    validation_dir = os.path.join(
        UPLOAD_DIR,
        str(validation_id),
    )

    os.makedirs(validation_dir, exist_ok=True)

    extension = os.path.splitext(file.filename or "")[1].lower()

    unique_filename = f"{uuid.uuid4()}{extension}"

    new_file_path = os.path.join(
        validation_dir,
        unique_filename,
    )

    contents = await file.read()

    with open(new_file_path, "wb") as buffer:
        buffer.write(contents)

    # Update DB metadata
    image.file_name = file.filename
    image.file_path = new_file_path
    image.mime_type = file.content_type
    image.file_size = len(contents)

    db.commit()
    db.refresh(image)

    return {
        "message": "Image updated successfully",
        "image_id": image.image_id,
        "validation_id": validation_id,
        "file_name": image.file_name,
        "file_path": image.file_path,
        "mime_type": image.mime_type,
        "file_size": image.file_size,
    }


@router.delete(
    "/{validation_id}/images/{image_id}",
)
def delete_image(
    validation_id: uuid.UUID,
    image_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_user_validation(validation_id, current_user, db)

    image = db.query(Image).filter(
        Image.image_id == image_id,
        Image.validation_id == validation_id,
    ).first()

    if not image:
        raise HTTPException(
            status_code=404,
            detail="Image not found",
        )

    # Delete physical file
    if image.file_path and os.path.exists(image.file_path):
        os.remove(image.file_path)

    # Delete DB record
    db.delete(image)
    db.commit()

    return {
        "message": "Image deleted successfully",
        "image_id": image_id,
    }