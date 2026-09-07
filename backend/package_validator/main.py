import json
from pathlib import Path

from package_validator.context.context_classifier import classify_context
from package_validator.rules.rule_selector import select_rules
from package_validator.validation.validator import validate_package


BASE_DIR = Path(__file__).parent

OCR_FILE = BASE_DIR / "sample_lays_ocr.json"


def load_ocr_data():

    with open(
        OCR_FILE,
        "r",
        encoding="utf-8"
    ) as f:

        return json.load(f)


def save_json(data, filename):

    path = BASE_DIR / filename

    with open(
        path,
        "w",
        encoding="utf-8"
    ) as f:

        json.dump(
            data,
            f,
            indent=2,
            ensure_ascii=False
        )

    return path


def main():

    print("\n==============================")
    print(" PACKAGE VALIDATION SYSTEM")
    print("==============================\n")

    # -----------------------------------
    # STEP 1 — Load OCR
    # -----------------------------------

    print("[1] Loading OCR evidence...")

    ocr_data = load_ocr_data()

    # -----------------------------------
    # STEP 2 — Context Classification
    # -----------------------------------

    print("[2] Running Context Classification LLM...")

    context = classify_context(
        ocr_data=ocr_data,
        yolo_data={}
    )

    print("\nPACKAGE CONTEXT:")
    print(
        json.dumps(
            context.model_dump(),
            indent=2
        )
    )

    save_json(
        context.model_dump(),
        "context_output.json"
    )

    # -----------------------------------
    # STEP 3 — Rule Selection
    # -----------------------------------

    print("\n[3] Selecting applicable rules...")

    selected = select_rules(
        context
    )

    print("\nAPPLICABLE RULES:")

    for rule in selected["applicable_rules"]:
        print(
            f"  ✓ {rule['rule_id']} "
            f"({rule['source']})"
        )

    print("\nEXCLUDED RULES:")

    for rule in selected["excluded_rules"]:
        print(
            f"  ✗ {rule['rule_id']} "
            f"- {rule['reason']}"
        )

    save_json(
        selected,
        "rule_selection_output.json"
    )

    # -----------------------------------
    # STEP 4 — LLM Validation
    # -----------------------------------

    print("\n[4] Running Validation LLM...")

    validation = validate_package(
        context=context,
        applicable_rules=selected["applicable_rules"],
        ocr_data=ocr_data,
        yolo_data={}
    )

    print("\nVALIDATION RESULT:")
    print(
        json.dumps(
            validation.model_dump(),
            indent=2,
            ensure_ascii=False
        )
    )

    save_json(
        validation.model_dump(),
        "validation_output.json"
    )

    # -----------------------------------
    # COMPLETE
    # -----------------------------------

    print("\n==============================")
    print(" PIPELINE COMPLETE")
    print("==============================\n")

    print(
        f"Overall Status: "
        f"{validation.overall_status}"
    )

    print(
        f"Score: "
        f"{validation.score}/100"
    )


if __name__ == "__main__":
    main()