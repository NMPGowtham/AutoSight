import base64
import os
from typing import Literal, Optional

import cv2
from dotenv import load_dotenv
from pydantic import BaseModel

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage


load_dotenv()


# -----------------------------
# Gemini model
# -----------------------------

llm = ChatGoogleGenerativeAI(
    model="gemini-3.6-flash",
    temperature=0,
    google_api_key=os.getenv("GEMINI_API_KEY")
)


# -----------------------------
# Structured output schema
# -----------------------------

class ValidationResult(BaseModel):
    field: str
    status: Literal["PASS", "FAIL", "REVIEW"]
    reason: str
    bbox: Optional[list[int]] = None


class ValidationResponse(BaseModel):
    overall_status: Literal["PASS", "FAIL", "REVIEW"]
    results: list[ValidationResult]


# -----------------------------
# Structured LLM
# -----------------------------

structured_llm = llm.with_structured_output(
    ValidationResponse
)


# -----------------------------
# LLM instructions
# -----------------------------

SYSTEM_PROMPT = """
You are a packaged-product compliance validator.

Analyze the supplied package image.

Your job is to visually inspect the package and report the presence,
absence, readability, and visible evidence of the following declarations.

You MUST return exactly one result for EACH of these seven fields:

1. manufacturer
2. product_name
3. net_quantity
4. mrp
5. manufacture_date
6. expiry_date
7. fssai_license

IMPORTANT:
The field value MUST be exactly one of:

- "manufacturer"
- "product_name"
- "net_quantity"
- "mrp"
- "manufacture_date"
- "expiry_date"
- "fssai_license"

Do NOT return descriptive field names such as:

- "Manufacturer / Packer / Importer"
- "MRP / Retail Sale Price"
- "Manufacturing / Packing date"
- "Product name"
- "Net quantity"
- "Use-by / Expiry date"
- "FSSAI license number"

Use ONLY the standardized field identifiers above.

--------------------------------------------------
STATUS
--------------------------------------------------

PASS:
The declaration is clearly present and readable.

FAIL:
The declaration is clearly missing from the supplied package image.

REVIEW:
The declaration appears to be present but is unreadable,
ambiguous, partially visible, or there is insufficient evidence
to determine its status reliably.

Do not assume that something is missing merely because it is not
visible in one particular region of the image.

--------------------------------------------------
FIELD DEFINITIONS
--------------------------------------------------

manufacturer:

Look for manufacturer, packer, importer, manufactured by,
manufactured for, packed by, imported by, marketed by, or similar
manufacturer/packer/importer information.

product_name:

Look for the generic, common, or product name.

net_quantity:

Look for declarations such as:

- 750 g
- 750g
- 1 kg
- 500 ml
- 90 capsules

mrp:

Look for:

- MRP
- Maximum Retail Price
- Retail Sale Price

manufacture_date:

Look for:

- Manufacturing Date
- Mfg Date
- Packed Date
- Packing Date
- relevant batch/packing date declarations

expiry_date:

Look for:

- Expiry
- Expiry Date
- Use By
- Use-by
- Best Before

fssai_license:

Look for an FSSAI licence or registration number.

--------------------------------------------------
BOUNDING BOX
--------------------------------------------------

For every result, return the bounding box of the relevant declaration
when it is visibly identifiable.

Format:

[x1, y1, x2, y2]

Coordinates MUST correspond to the original image dimensions
provided by the user.

If the declaration is missing and there is no relevant location:

"bbox": null

Do not invent bounding boxes.

--------------------------------------------------
EVIDENCE
--------------------------------------------------

The reason must describe only information actually visible in the
image.

Do not invent text.

Examples:

manufacturer:
"Manufacturer details 'MANUFACTURED FOR: ABC LTD' are clearly visible."

mrp:
"MRP '₹199' is clearly visible."

net_quantity:
"Net quantity '90 CAPSULES' is clearly visible."

If missing:

"MRP / Retail Sale Price declaration is not visible on the supplied package image."

--------------------------------------------------
IMPORTANT
--------------------------------------------------

Return exactly seven results.

Every result must have:

- field
- status
- reason
- bbox

Do not omit any field.

Do not add additional fields.

Do not determine which Legal Metrology rules apply.

Do not calculate the final legal compliance score.

Do not make legal conclusions.

Your responsibility is ONLY visual declaration evidence.

Return only data matching the supplied schema.
"""


# -----------------------------
# Validation function
# -----------------------------

def validate_image(image_path: str):

    image = cv2.imread(image_path)

    if image is None:
        raise FileNotFoundError(
            f"Could not read image: {image_path}"
        )

    height, width = image.shape[:2]

    print(f"Image dimensions: {width} x {height}")

    # -----------------------------
    # Convert image to base64
    # -----------------------------

    with open(image_path, "rb") as f:
        image_base64 = base64.b64encode(
            f.read()
        ).decode("utf-8")

    # -----------------------------
    # Create LangChain messages
    # -----------------------------

    messages = [
        SystemMessage(
            content=SYSTEM_PROMPT
        ),

        HumanMessage(
            content=[
                {
                    "type": "text",
                    "text": f"""
Validate this package image.

Original image dimensions:

Width: {width}
Height: {height}

All bounding boxes must use these exact
original image coordinates.
"""
                },
                {
                    "type": "image_url",
                    "image_url": (
                        f"data:image/jpeg;base64,"
                        f"{image_base64}"
                    )
                }
            ]
        )
    ]

    # -----------------------------
    # Call Gemini through LangChain
    # -----------------------------

    response = structured_llm.invoke(messages)

    if response is None:
        raise RuntimeError(
            "Gemini returned no validation result."
        )

    return response