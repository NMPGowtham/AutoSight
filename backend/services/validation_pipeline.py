from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy.orm import Session

from models.validation import Validation
from models.image import Image
from models.package_context import PackageContext
from models.ocr_result import OCRResult
from models.detection_result import DetectionResult
from models.selected_rule import SelectedRule
from models.validation_result import ValidationResult

from RuleEngine.selector import select_rules


def get_ocr_engine():
    from package_validator.ocr.ocr_engine import OCREngine
    return OCREngine()


def get_yolo_detector():
    from package_validator.detection.yolo_detector import YOLODetector
    return YOLODetector()


def get_context_classifier():
    from package_validator.context.context_classifier import classify_context
    return classify_context


def get_validator():
    from package_validator.validation.validator import validate_image
    return validate_image


# ---------------------------------------------------------
# HELPERS
# ---------------------------------------------------------

def _to_bool(value):
    """
    Convert Gemini's possible boolean representations
    into Python bool / None.
    """

    if value is None:
        return None

    if isinstance(value, bool):
        return value

    value = str(value).strip().lower()

    if value in {"true", "yes", "1"}:
        return True

    if value in {"false", "no", "0"}:
        return False

    return None


def _context_value(context, field_name):
    """
    Extract value from teammate's ContextField.
    """

    field = getattr(context, field_name, None)

    if field is None:
        return None

    if hasattr(field, "value"):
        return field.value

    return field


def save_ocr_results(
    db: Session,
    validation_id,
    ocr_data: dict
):
    """
    Save OCR detections into OCR_RESULTS.
    """

    for item in ocr_data.get("raw_text", []):

        bbox = item.get("bbox") or [None, None, None, None]

        result = OCRResult(
            validation_id=validation_id,
            text=item.get("text", ""),
            confidence=item.get("confidence"),
            x1=bbox[0],
            y1=bbox[1],
            x2=bbox[2],
            y2=bbox[3],
        )

        db.add(result)


def save_yolo_results(
    db: Session,
    validation_id,
    yolo_data: dict
):
    """
    Save YOLO detections into DETECTION_RESULTS.
    """

    for item in yolo_data.get("detections", []):

        bbox = item.get("bbox") or [None, None, None, None]

        result = DetectionResult(
            validation_id=validation_id,
            class_name=item.get("class", "unknown"),
            confidence=item.get("confidence"),
            x1=bbox[0],
            y1=bbox[1],
            x2=bbox[2],
            y2=bbox[3],
        )

        db.add(result)


def save_package_context(
    db: Session,
    validation_id,
    context
):
    """
    Convert teammate's nested Gemini PackageContext
    into our flat PostgreSQL PACKAGE_CONTEXT model.
    """

    existing = (
        db.query(PackageContext)
        .filter(
            PackageContext.validation_id == validation_id
        )
        .first()
    )

    values = {
        "product_category": _context_value(
            context,
            "product_category"
        ),

        "package_type": _context_value(
            context,
            "package_type"
        ),

        "is_imported": _to_bool(
            _context_value(
                context,
                "is_imported"
            )
        ),

        "consumer_type": _context_value(
            context,
            "consumer_type"
        ),

        "is_industrial": _to_bool(
            _context_value(
                context,
                "is_industrial"
            )
        ),

        "is_institutional": _to_bool(
            _context_value(
                context,
                "is_institutional"
            )
        ),

        "net_quantity_value": getattr(
            context,
            "net_quantity_value",
            None
        ),

        "net_quantity_unit": getattr(
            context,
            "net_quantity_unit",
            None
        ),
    }

    if existing:

        for key, value in values.items():
            setattr(existing, key, value)

        return existing

    package_context = PackageContext(
        validation_id=validation_id,
        **values
    )

    db.add(package_context)

    return package_context


def save_selected_rules(
    db: Session,
    validation_id,
    applicable_rules,
    excluded_rules
):
    """
    Persist both selected and excluded rules.
    """

    for rule in applicable_rules:

        db.add(
            SelectedRule(
                validation_id=validation_id,
                rule_id=rule.rule_id,
                selection_status="SELECTED",
                exclusion_reason=None,
            )
        )

    for rule in excluded_rules:

        db.add(
            SelectedRule(
                validation_id=validation_id,
                rule_id=rule.rule_id,
                selection_status="EXCLUDED",
                exclusion_reason="Rule conditions do not match package context",
            )
        )


def _find_field_result(
    validation_results,
    field
):
    """
    Find the Gemini validation result corresponding
    to a legal rule field.
    """

    if not field:
        return None

    aliases = {
        "manufacturer": [
            "manufacturer",
            "packer",
            "importer",
            "manufacturer/packer/importer",
        ],

        "product_name": [
            "product_name",
            "product name",
            "name",
        ],

        "net_quantity": [
            "net_quantity",
            "net quantity",
        ],

        "mrp": [
            "mrp",
            "retail sale price",
            "retail_sale_price",
        ],
    }

    wanted = aliases.get(
        field,
        [field]
    )

    for result in validation_results:

        result_field = (
            result.field
            .strip()
            .lower()
        )

        if result_field in {
            x.lower()
            for x in wanted
        }:
            return result

    return None


def convert_validation_results(
    db: Session,
    validation_id,
    applicable_rules,
    image_validation_results
):
    """
    Convert teammate's vision-validation output
    into our rule-based VALIDATION_RESULTS table.
    """

    saved_results = []

    for rule in applicable_rules:

        # -------------------------------------------------
        # Rules that directly map to a detected field
        # -------------------------------------------------

        if rule.validation_type in {
            "FIELD_REQUIRED",
            "NET_QUANTITY",
        }:

            field_result = _find_field_result(
                image_validation_results,
                rule.field
            )

            if field_result is None:

                status = "REVIEW"
                reason = (
                    "No validation evidence was returned "
                    "for this rule."
                )
                confidence = 0.0
                bbox = None

            else:

                status = field_result.status
                reason = field_result.reason
                confidence = getattr(
                    field_result,
                    "confidence",
                    0.0
                )
                bbox = field_result.bbox

        # -------------------------------------------------
        # Rules that the current teammate validator
        # does not explicitly evaluate
        # -------------------------------------------------

        else:

            status = "REVIEW"

            reason = (
                f"Rule '{rule.rule_id}' requires a "
                f"specialized evaluator for "
                f"{rule.validation_type}."
            )

            confidence = 0.0
            bbox = None

        x1 = y1 = x2 = y2 = None

        if bbox and len(bbox) == 4:
            x1, y1, x2, y2 = bbox

        db_result = ValidationResult(
            validation_id=validation_id,
            rule_id=rule.rule_id,
            field=rule.field,
            status=status,
            reason=reason,
            confidence=confidence,
            x1=x1,
            y1=y1,
            x2=x2,
            y2=y2,
        )

        db.add(db_result)

        saved_results.append({
            "rule_id": rule.rule_id,
            "status": status,
            "reason": reason,
        })

    return saved_results


def calculate_score(results):
    """
    Calculate a simple transparent score.

    PASS   = 1.0
    REVIEW = 0.5
    FAIL   = 0.0
    """

    if not results:
        return 0.0, "REVIEW"

    points = {
        "PASS": 1.0,
        "REVIEW": 0.5,
        "FAIL": 0.0,
    }

    total = sum(
        points.get(result["status"], 0.0)
        for result in results
    )

    score = (
        total / len(results)
    ) * 100

    statuses = {
        result["status"]
        for result in results
    }

    if "FAIL" in statuses:
        overall_status = "FAIL"

    elif "REVIEW" in statuses:
        overall_status = "REVIEW"

    else:
        overall_status = "PASS"

    return round(score, 2), overall_status


# ---------------------------------------------------------
# MAIN PIPELINE
# ---------------------------------------------------------

def run_validation_pipeline(
    db: Session,
    validation: Validation
):
    """
    Execute the complete package-validation pipeline.

    Flow:

        Images
          ↓
        OCR
          ↓
        YOLO
          ↓
        Gemini Context
          ↓
        PostgreSQL Rule Selection
          ↓
        Gemini Vision Validation
          ↓
        Rule Results
          ↓
        Overall Score
    """
    ocr_engine = get_ocr_engine()
    yolo_detector = get_yolo_detector()
    classify_context = get_context_classifier()
    validate_image = get_validator()

    if not validation.images:
        raise ValueError(
            "No images found for this validation."
        )

    # -----------------------------------------------------
    # 1. PROCESS IMAGES
    # -----------------------------------------------------

    all_ocr_text = []
    all_detections = []

    image_validation_results = []

    for image in validation.images:

        image_path = Path(
            image.file_path
        )

        if not image_path.exists():
            raise FileNotFoundError(
                f"Image not found: {image.file_path}"
            )

        # ---------------------------------------------
        # OCR
        # ---------------------------------------------

        ocr_data = ocr_engine.process(
            str(image_path)
        )

        save_ocr_results(
            db,
            validation.validation_id,
            ocr_data
        )

        all_ocr_text.extend(
            ocr_data.get(
                "raw_text",
                []
            )
        )

        # ---------------------------------------------
        # YOLO
        # ---------------------------------------------

        yolo_data = yolo_detector.detect(
            str(image_path)
        )

        save_yolo_results(
            db,
            validation.validation_id,
            yolo_data
        )

        all_detections.extend(
            yolo_data.get(
                "detections",
                []
            )
        )

        # ---------------------------------------------
        # Gemini vision validation
        # ---------------------------------------------

        result = validate_image(
            str(image_path)
        )

        image_validation_results.extend(
            result.results
        )

        # Update dimensions if missing
        if image.width is None or image.height is None:

            try:
                import cv2

                img = cv2.imread(
                    str(image_path)
                )

                if img is not None:

                    height, width = img.shape[:2]

                    image.width = width
                    image.height = height

            except Exception:
                pass

    # -----------------------------------------------------
    # 2. BUILD AI EVIDENCE
    # -----------------------------------------------------

    ocr_data = {
        "raw_text": all_ocr_text,
        "fields": {}
    }

    yolo_data = {
        "detections": all_detections
    }

    # -----------------------------------------------------
    # 3. CLASSIFY PACKAGE CONTEXT
    # -----------------------------------------------------

    context = classify_context(
        ocr_data=ocr_data,
        yolo_data=yolo_data
    )

    save_package_context(
        db,
        validation.validation_id,
        context
    )

    db.flush()

    # -----------------------------------------------------
    # 4. SELECT RULES FROM POSTGRESQL
    # -----------------------------------------------------

    selected = select_rules(
        db,
        context
    )

    applicable_rules = selected[
        "applicable_rules"
    ]

    excluded_rules = selected[
        "excluded_rules"
    ]

    save_selected_rules(
        db,
        validation.validation_id,
        applicable_rules,
        excluded_rules
    )

    db.flush()

    # -----------------------------------------------------
    # 5. EVALUATE SELECTED RULES
    # -----------------------------------------------------

    results = convert_validation_results(
        db=db,
        validation_id=validation.validation_id,
        applicable_rules=applicable_rules,
        image_validation_results=image_validation_results,
    )

    # -----------------------------------------------------
    # 6. CALCULATE FINAL STATUS
    # -----------------------------------------------------

    score, overall_status = calculate_score(
        results
    )

    validation.validation_score = score
    validation.overall_status = overall_status
    validation.completed_at = datetime.now(
        timezone.utc
    )

    db.commit()

    db.refresh(validation)

    return {
        "validation_id": str(
            validation.validation_id
        ),

        "overall_status": overall_status,

        "score": score,

        "context": {
            "product_category": _context_value(
                context,
                "product_category"
            ),
            "package_type": _context_value(
                context,
                "package_type"
            ),
            "is_imported": _context_value(
                context,
                "is_imported"
            ),
            "consumer_type": _context_value(
                context,
                "consumer_type"
            ),
            "is_industrial": _context_value(
                context,
                "is_industrial"
            ),
            "is_institutional": _context_value(
                context,
                "is_institutional"
            ),
            "net_quantity_value": getattr(
                context,
                "net_quantity_value",
                None
            ),
            "net_quantity_unit": getattr(
                context,
                "net_quantity_unit",
                None
            ),
        },

        "rules_selected": len(
            applicable_rules
        ),

        "rules_excluded": len(
            excluded_rules
        ),

        "results": results,
    }