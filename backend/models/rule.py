from sqlalchemy import (
    String,
    Text,
    Boolean,
    DateTime,
    Date
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from db.base import Base


class Rule(Base):
    __tablename__ = "rules"

    rule_id: Mapped[str] = mapped_column(
        String(50),
        primary_key=True
    )

    source: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    section: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    section_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    description: Mapped[str] = mapped_column(
        Text,
        nullable=True
    )

    validation_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    field: Mapped[str] = mapped_column(
        String(100),
        nullable=True
    )

    severity: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="MEDIUM"
    )

    rule_text: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    parameters: Mapped[dict] = mapped_column(
        JSONB,
        nullable=True
    )

    active: Mapped[bool] = mapped_column(
        Boolean,
        default=True
    )

    effective_from: Mapped[Date] = mapped_column(
        Date,
        nullable=True
    )

    effective_to: Mapped[Date] = mapped_column(
        Date,
        nullable=True
    )

    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )