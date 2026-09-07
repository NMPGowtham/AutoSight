import cv2


COLORS = {
    "PASS": (0, 255, 0),
    "FAIL": (0, 0, 255),
    "REVIEW": (0, 255, 255)
}


def annotate_image(image_path, validation_result, output_path):

    image = cv2.imread(image_path)

    if image is None:
        raise FileNotFoundError(image_path)

    height, width = image.shape[:2]

    missing_failures = []

    for result in validation_result["results"]:

        status = result["status"]
        field = result["field"]
        reason = result["reason"]
        bbox = result.get("bbox")

        color = COLORS.get(
            status,
            (255, 255, 255)
        )

        # ==========================================
        # CASE 1: RESULT HAS A BOUNDING BOX
        # ==========================================

        if bbox is not None:

            x1, y1, x2, y2 = bbox

            # Keep coordinates inside image
            x1 = max(0, min(x1, width - 1))
            y1 = max(0, min(y1, height - 1))
            x2 = max(0, min(x2, width - 1))
            y2 = max(0, min(y2, height - 1))

            # Draw box
            cv2.rectangle(
                image,
                (x1, y1),
                (x2, y2),
                color,
                3
            )

            label = f"{status}: {field}"

            # Text size
            (text_width, text_height), _ = cv2.getTextSize(
                label,
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                2
            )

            text_y = max(y1 - 10, text_height + 5)

            # Label background
            cv2.rectangle(
                image,
                (x1, text_y - text_height - 5),
                (x1 + text_width + 8, text_y + 5),
                color,
                -1
            )

            # Label text
            cv2.putText(
                image,
                label,
                (x1 + 3, text_y),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                (0, 0, 0),
                2
            )

        # ==========================================
        # CASE 2: FAIL BUT NO BOUNDING BOX
        # ==========================================

        else:

            if status == "FAIL":
                missing_failures.append(field)

    # ==========================================
    # DISPLAY MISSING FAILURES
    # ==========================================

    if missing_failures:

        y = 40

        for field in missing_failures:

            label = f"FAIL - MISSING: {field}"

            (text_width, text_height), _ = cv2.getTextSize(
                label,
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                2
            )

            # Red background
            cv2.rectangle(
                image,
                (10, y - text_height - 10),
                (20 + text_width, y + 10),
                COLORS["FAIL"],
                -1
            )

            # White text
            cv2.putText(
                image,
                label,
                (15, y),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (255, 255, 255),
                2
            )

            y += 50

    # ==========================================
    # SAVE
    # ==========================================

    cv2.imwrite(
        output_path,
        image
    )

    return output_path