import json
import cv2

from validation.validator import validate_image
from annotation.annotator import annotate_image


IMAGE_PATH = "test_images/image.png"
OUTPUT_PATH = "test_images/image_validated.png"


def main():

    print("Sending image to validation LLM...")

    result = validate_image(IMAGE_PATH)

    print("\nLLM RESULT:")

    print(
        json.dumps(
            result.model_dump(),
            indent=2,
            ensure_ascii=False
        )
    )

    # Save JSON
    with open(
        "validation_result.json",
        "w",
        encoding="utf-8"
    ) as f:

        json.dump(
            result.model_dump(),
            f,
            indent=2,
            ensure_ascii=False
        )

    # Draw boxes
    output = annotate_image(
        IMAGE_PATH,
        result.model_dump(),
        OUTPUT_PATH
    )

    print(
        f"\nAnnotated image saved to: {output}"
    )

    # Display result
    image = cv2.imread(output)

    cv2.imshow(
        "Package Validation Result",
        image
    )

    cv2.waitKey(0)
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()