import uuid

from sqlalchemy import String, Text, Integer, Numeric, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from db.base import Base


class ValidationResult(Base):
    __tablename__ = "validation_results"

    result_id: Mapped[uuid.UUID] = mapped_column(
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

    rule_id: Mapped[str] = mapped_column(
        String(50),
        ForeignKey("rules.rule_id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )

    field: Mapped[str] = mapped_column(
        String(100),
        nullable=True
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    reason: Mapped[str] = mapped_column(
        Text,
        nullable=True
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
        back_populates="validation_results"
    )

    rule = relationship("Rule")