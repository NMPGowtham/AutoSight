import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class ValidationCreate(BaseModel):
    pass


class ValidationUpdate(BaseModel):
    overall_status: str | None = None
    validation_score: Decimal | None = None


class ValidationResponse(BaseModel):
    validation_id: uuid.UUID
    user_id: uuid.UUID
    overall_status: str
    validation_score: Decimal | None
    created_at: datetime
    completed_at: datetime | None

    model_config = ConfigDict(from_attributes=True)