import uuid

from sqlalchemy import String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from db.base import Base


class SelectedRule(Base):
    __tablename__ = "selected_rules"

    selected_rule_id: Mapped[uuid.UUID] = mapped_column(
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
        ForeignKey("rules.rule_id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    selection_status: Mapped[str] = mapped_column(
        String(30),
        nullable=False
    )

    exclusion_reason: Mapped[str] = mapped_column(
        Text,
        nullable=True
    )

    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    validation = relationship(
        "Validation",
        back_populates="selected_rules"
    )

    rule = relationship("Rule")