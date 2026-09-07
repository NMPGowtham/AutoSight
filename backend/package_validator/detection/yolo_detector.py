from ultralytics import YOLO


class YOLODetector:

    def __init__(
        self,
        model_path="yolo11n.pt"
    ):

        self.model = YOLO(
            model_path
        )

    def detect(
        self,
        image_path: str
    ) -> dict:

        results = self.model(
            image_path
        )

        detections = []

        for result in results:

            if result.boxes is None:
                continue

            for box in result.boxes:

                xyxy = box.xyxy[0].tolist()

                confidence = float(
                    box.conf[0]
                )

                class_id = int(
                    box.cls[0]
                )

                class_name = (
                    self.model.names[class_id]
                )

                detections.append({
                    "class": class_name,
                    "confidence": confidence,
                    "bbox": [
                        int(xyxy[0]),
                        int(xyxy[1]),
                        int(xyxy[2]),
                        int(xyxy[3])
                    ]
                })

        return {
            "detections": detections
        }