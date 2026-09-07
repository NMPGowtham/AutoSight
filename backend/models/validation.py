import uuid

from sqlalchemy import String, Numeric, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from db.base import Base


class Validation(Base):
    __tablename__ = "validations"

    validation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.user_id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    overall_status: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    validation_score: Mapped[float] = mapped_column(
        Numeric(5, 2),
        nullable=True
    )

    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    completed_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    user = relationship(
        "User",
        back_populates="validations"
    )

    images = relationship(
        "Image",
        back_populates="validation",
        cascade="all, delete-orphan"
    )

    package_context = relationship(
        "PackageContext",
        back_populates="validation",
        uselist=False,
        cascade="all, delete-orphan"
    )

    ocr_results = relationship(
        "OCRResult",
        back_populates="validation",
        cascade="all, delete-orphan"
    )

    detection_results = relationship(
        "DetectionResult",
        back_populates="validation",
        cascade="all, delete-orphan"
    )

    selected_rules = relationship(
        "SelectedRule",
        back_populates="validation",
        cascade="all, delete-orphan"
    )

    validation_results = relationship(
        "ValidationResult",
        back_populates="validation",
        cascade="all, delete-orphan"
    )

    reports = relationship(
        "Report",
        back_populates="validation",
        cascade="all, delete-orphan"
    )