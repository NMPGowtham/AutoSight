from typing import Literal, Optional

from pydantic import BaseModel, Field


class ValidationResult(BaseModel):
    rule_id: str
    field: Optional[str] = None

    status: Literal["PASS", "FAIL", "REVIEW"]

    reason: str

    confidence: float = Field(
        ge=0.0,
        le=1.0
    )

    bbox: Optional[list[int]] = None


class ValidationResponse(BaseModel):

    overall_status: Literal[
        "PASS",
        "FAIL",
        "REVIEW"
    ]

    score: float = Field(
        ge=0.0,
        le=100.0
    )

    results: list[ValidationResult]