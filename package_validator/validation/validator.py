import base64
import os

import cv2
from dotenv import load_dotenv
from openai import OpenAI
from pydantic import BaseModel
from typing import Literal, Optional

load_dotenv()

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)

MODEL = os.getenv("VALIDATION_MODEL", "gpt-4o")


# -----------------------------
# Structured output schema
# -----------------------------

class ValidationResult(BaseModel):
    field: str
    status: Literal["PASS", "FAIL", "REVIEW"]
    reason: str
    bbox: Optional[list[int]]


class ValidationResponse(BaseModel):
    overall_status: Literal["PASS", "FAIL", "REVIEW"]
    results: list[ValidationResult]


# -----------------------------
# LLM instructions
# -----------------------------

SYSTEM_PROMPT = """
You are a packaged-product compliance validator.

Analyze the supplied package image.

Check these declarations:

1. Product name
2. Manufacturer / Packer / Importer
3. Net quantity
4. MRP / Retail Sale Price
5. Manufacturing / Packing date
6. Use-by / Expiry date
7. FSSAI license number

For every declaration:

PASS:
The declaration is clearly present and readable.

FAIL:
The declaration is visibly missing or clearly does not satisfy
the supplied requirement.

REVIEW:
The declaration is present but unreadable, ambiguous, or there
is insufficient visual evidence.

For every result, return the bounding box of the relevant text
or region.

Bounding box format:

[x1, y1, x2, y2]

Coordinates MUST correspond to the original image dimensions.

Do not invent text.

Do not invent bounding boxes.

If a required declaration is missing and therefore has no
location, return:

"bbox": null

Return one result for every field.
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

    # Convert image to base64
    with open(image_path, "rb") as f:
        image_base64 = base64.b64encode(
            f.read()
        ).decode("utf-8")

    response = client.responses.parse(

        model=MODEL,

        instructions=SYSTEM_PROMPT,

        input=[
            {
                "role": "user",
                "content": [

                    {
                        "type": "input_text",
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
                        "type": "input_image",
                        "image_url": (
                            f"data:image/jpeg;base64,"
                            f"{image_base64}"
                        )
                    }

                ]
            }
        ],

        text_format=ValidationResponse
    )

    if response.output_parsed is None:
        raise RuntimeError(
            "LLM returned no structured validation result."
        )

    return response.output_parsed