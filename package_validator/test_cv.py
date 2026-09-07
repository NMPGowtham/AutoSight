import cv2

from detection.yolo_detector import YOLODetector
from ocr.ocr_engine import OCREngine


IMAGE_PATH = "test_images/image.png"

YOLO_OUTPUT = "test_images/image_yolo.png"


def draw_yolo_results(
    image,
    detections
):

    for detection in detections:

        x1, y1, x2, y2 = detection["bbox"]

        label = (
            f"{detection['class']} "
            f"{detection['confidence']:.2f}"
        )

        cv2.rectangle(
            image,
            (x1, y1),
            (x2, y2),
            (0, 255, 0),
            2
        )

        cv2.putText(
            image,
            label,
            (x1, max(y1 - 10, 20)),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            (0, 255, 0),
            2
        )

    return image


def main():

    print("\n==============================")
    print(" COMPUTER VISION TEST")
    print("==============================\n")

    # ---------------------------------
    # Load image
    # ---------------------------------

    image = cv2.imread(
        IMAGE_PATH
    )

    if image is None:

        raise FileNotFoundError(
            f"Could not load {IMAGE_PATH}"
        )

    print(
        f"Image loaded: "
        f"{image.shape[1]} x {image.shape[0]}"
    )

    # ---------------------------------
    # YOLO
    # ---------------------------------

    print("\n[1] Running YOLO...")

    detector = YOLODetector()

    yolo_result = detector.detect(
        IMAGE_PATH
    )

    print(
        f"Detected "
        f"{len(yolo_result['detections'])} objects."
    )

    for detection in yolo_result["detections"]:

        print(
            f"  {detection['class']} "
            f"({detection['confidence']:.2f}) "
            f"{detection['bbox']}"
        )

    # ---------------------------------
    # Draw YOLO
    # ---------------------------------

    image = draw_yolo_results(
        image,
        yolo_result["detections"]
    )

    cv2.imwrite(
        YOLO_OUTPUT,
        image
    )

    print(
        f"\nYOLO image saved to: "
        f"{YOLO_OUTPUT}"
    )

    # ---------------------------------
    # OCR
    # ---------------------------------

    print("\n[2] Running OCR...")

    ocr_engine = OCREngine()

    ocr_result = ocr_engine.process(
        IMAGE_PATH
    )

    print("\nOCR TEXT:")

    for item in ocr_result["raw_text"]:

        print(
            f"  {item['text']} "
            f"(confidence="
            f"{item['confidence']:.2f})"
        )

    print("\n==============================")
    print(" CV TEST COMPLETE")
    print("==============================\n")


if __name__ == "__main__":
    main()