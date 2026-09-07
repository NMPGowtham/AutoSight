import uuid

from sqlalchemy import String, Text, BigInteger, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from db.base import Base


class Image(Base):
    __tablename__ = "images"

    image_id: Mapped[uuid.UUID] = mapped_column(
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

    image_type: Mapped[str] = mapped_column(
        String(50),
        nullable=True
    )

    file_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    file_path: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    mime_type: Mapped[str] = mapped_column(
        String(100),
        nullable=True
    )

    file_size: Mapped[int] = mapped_column(
        BigInteger,
        nullable=True
    )

    width: Mapped[int] = mapped_column(
        Integer,
        nullable=True
    )

    height: Mapped[int] = mapped_column(
        Integer,
        nullable=True
    )

    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    validation = relationship(
        "Validation",
        back_populates="images"
    )