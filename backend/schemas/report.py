from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class ReportField(BaseModel):
    field: str
    value: str | None
    confidence: float | None
    bbox: list[int] | None


class ReportRule(BaseModel):
    rule_id: str | None
    field: str | None
    status: str
    severity: str | None
    message: str | None
    confidence: float | None
    bbox: list[int] | None
    actual_value: str | None
    expected_value: str | None


class ReportSummary(BaseModel):
    passed: int
    review: int
    failed: int


class ReportProduct(BaseModel):
    name: str | None
    category: str | None
    is_imported: bool | None


class ReportImage(BaseModel):
    image_id: UUID
    image_url: str
    width: int | None
    height: int | None


class ReportResponse(BaseModel):
    inspection_id: UUID

    image_url: str | None
    image_width: int | None
    image_height: int | None

    product: ReportProduct

    status: str
    score: float

    summary: ReportSummary

    fields: list[ReportField]
    rules: list[ReportRule]

    images: list[ReportImage]

    inspector: str | None
    created_at: datetime | None
    completed_at: datetime | None