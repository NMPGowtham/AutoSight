import uuid

from sqlalchemy import (
    String,
    Boolean,
    Numeric,
    DateTime,
    ForeignKey
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from db.base import Base


class PackageContext(Base):
    __tablename__ = "package_context"

    context_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    validation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "validations.validation_id",
            ondelete="CASCADE"
        ),
        unique=True,
        nullable=False
    )

    product_category: Mapped[str] = mapped_column(
        String(255),
        nullable=True
    )

    package_type: Mapped[str] = mapped_column(
        String(50),
        nullable=True
    )

    is_imported: Mapped[bool] = mapped_column(
        Boolean,
        default=False
    )

    consumer_type: Mapped[str] = mapped_column(
        String(50),
        nullable=True
    )

    is_industrial: Mapped[bool] = mapped_column(
        Boolean,
        default=False
    )

    is_institutional: Mapped[bool] = mapped_column(
        Boolean,
        default=False
    )

    net_quantity_value: Mapped[float] = mapped_column(
        Numeric(12, 3),
        nullable=True
    )

    net_quantity_unit: Mapped[str] = mapped_column(
        String(20),
        nullable=True
    )

    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    validation = relationship(
        "Validation",
        back_populates="package_context"
    )