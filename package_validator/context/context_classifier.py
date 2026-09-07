import json
import os

from dotenv import load_dotenv
from openai import OpenAI

from context.context_schema import PackageContext


load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

MODEL = os.getenv("CONTEXT_MODEL", "gpt-4o")


SYSTEM_PROMPT = """
You are the Context Classification component of a packaged-product
legal compliance system.

Your job is ONLY to determine factual package context from the supplied
OCR and object-detection evidence.

Do NOT determine legal compliance.
Do NOT select legal rules.
Do NOT invent information.

You must classify:

1. product_category
2. package_type
3. is_imported
4. consumer_type
5. is_industrial
6. is_institutional

Possible uncertainty:
If the supplied evidence is insufficient, return null for the value
and explain why in the evidence field.

Important:
- Do not infer imported status merely because a brand is foreign.
- Do not infer industrial use merely because a product is large.
- Use explicit package evidence whenever possible.
- MRP, small consumer quantities and consumer-facing declarations can
  support retail-package classification.
- Explicit phrases such as "FOR INDUSTRIAL USE ONLY" can support
  industrial classification.
- "Country of Origin", "Imported by", etc. can support imported status.
- Manufacturer location alone should not be treated as absolute proof
  of import status.

Return only data matching the supplied schema.
"""


def classify_context(ocr_data: dict, yolo_data: dict | None = None) -> PackageContext:

    evidence = {
        "ocr": ocr_data,
        "yolo": yolo_data or {}
    }

    response = client.responses.parse(
        model=MODEL,
        instructions=SYSTEM_PROMPT,
        input=[
            {
                "role": "user",
                "content": json.dumps(evidence, indent=2)
            }
        ],
        text_format=PackageContext,
    )

    if response.output_parsed is None:
        raise RuntimeError("Context classifier returned no structured output.")

    return response.output_parsed