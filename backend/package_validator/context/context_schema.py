from typing import Literal, Optional

from pydantic import BaseModel, Field


ProductCategory = Literal[
    "food",
    "pharmaceutical",
    "cosmetic",
    "consumer_goods",
    "other",
]

PackageType = Literal[
    "retail",
    "wholesale",
]

ConsumerType = Literal[
    "individual",
    "industrial",
    "institutional",
]


class ContextField(BaseModel):
    value: Optional[str] = None
    confidence: float = Field(ge=0.0, le=1.0)
    evidence: list[str] = Field(default_factory=list)


class BooleanContextField(BaseModel):
    value: bool = False
    confidence: float = Field(ge=0.0, le=1.0)
    evidence: list[str] = Field(default_factory=list)


class PackageContext(BaseModel):
    product_category: ContextField
    package_type: ContextField
    is_imported: BooleanContextField
    consumer_type: ContextField
    is_industrial: BooleanContextField
    is_institutional: BooleanContextField
    net_quantity_value: Optional[float] = None
    net_quantity_unit: Optional[str] = None