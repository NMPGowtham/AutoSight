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