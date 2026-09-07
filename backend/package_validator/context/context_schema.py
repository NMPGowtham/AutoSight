from typing import Literal, Optional
from pydantic import BaseModel, Field


class ContextField(BaseModel):
    value: Optional[str] = None
    confidence: float = Field(ge=0.0, le=1.0)
    evidence: list[str] = []


class PackageContext(BaseModel):
    product_category: ContextField
    package_type: ContextField
    is_imported: ContextField
    consumer_type: ContextField
    is_industrial: ContextField
    is_institutional: ContextField
    net_quantity_value: Optional[float] = None
    net_quantity_unit: Optional[str] = None