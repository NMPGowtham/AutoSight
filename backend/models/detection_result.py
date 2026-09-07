import uuid

from sqlalchemy import String, Integer, Numeric, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from db.base import Base


class DetectionResult(Base):
    __tablename__ = "detection_results"

    detection_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    validation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("validations.validation_id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    class_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    confidence: Mapped[float] = mapped_column(
        Numeric(5, 4),
        nullable=True
    )

    x1: Mapped[int] = mapped_column(Integer, nullable=True)
    y1: Mapped[int] = mapped_column(Integer, nullable=True)
    x2: Mapped[int] = mapped_column(Integer, nullable=True)
    y2: Mapped[int] = mapped_column(Integer, nullable=True)

    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    validation = relationship(
        "Validation",
        back_populates="detection_results"
    )