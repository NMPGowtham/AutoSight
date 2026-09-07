import os

# IMPORTANT:
# These must be set BEFORE importing paddle / paddleocr.
os.environ["FLAGS_enable_pir_api"] = "0"
os.environ["FLAGS_use_mkldnn"] = "0"

import paddle
from paddleocr import PaddleOCR


class OCREngine:
    def __init__(self):

        # Explicitly disable MKLDNN / oneDNN
        paddle.set_flags({
            "FLAGS_use_mkldnn": False
        })

        self.ocr = PaddleOCR(
            lang="en",

            # Disable unnecessary pipeline components
            use_doc_orientation_classify=False,
            use_doc_unwarping=False,
            use_textline_orientation=False,

            # Disable oneDNN
            enable_mkldnn=False
        )

    def process(self, image_path: str) -> dict:

        result = self.ocr.predict(image_path)

        raw_text = []

        for page in result:

            data = page.json

            if isinstance(data, str):
                import json
                data = json.loads(data)

            ocr_data = data.get("res", data)

            texts = ocr_data.get("rec_texts", [])
            scores = ocr_data.get("rec_scores", [])
            boxes = ocr_data.get("rec_polys", [])

            for i, text in enumerate(texts):

                confidence = (
                    float(scores[i])
                    if i < len(scores)
                    else 0.0
                )

                bbox = None

                if i < len(boxes):

                    polygon = boxes[i]

                    xs = [
                        int(point[0])
                        for point in polygon
                    ]

                    ys = [
                        int(point[1])
                        for point in polygon
                    ]

                    bbox = [
                        min(xs),
                        min(ys),
                        max(xs),
                        max(ys)
                    ]

                raw_text.append({
                    "text": text,
                    "confidence": confidence,
                    "bbox": bbox
                })

        return {
            "raw_text": raw_text,
            "fields": {}
        }   