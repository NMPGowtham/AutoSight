import json
from pathlib import Path


RULES_FILE = Path(__file__).parent / "rules.json"


def load_rules() -> list[dict]:
    with open(RULES_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def get_context_value(context, field_name):
    field = getattr(context, field_name, None)

    if field is None:
        return None

    if hasattr(field, "value"):
        return field.value

    return field


def rule_applies(rule: dict, context) -> bool:

    conditions = rule.get("applies_when", {})

    for field_name, allowed_values in conditions.items():

        actual_value = get_context_value(context, field_name)

        if actual_value not in allowed_values:
            return False

    return True


def select_rules(context) -> dict:

    rules = load_rules()

    applicable_rules = []
    excluded_rules = []

    for rule in rules:

        if rule_applies(rule, context):

            applicable_rules.append(rule)

        else:

            excluded_rules.append({
                "rule_id": rule["rule_id"],
                "reason": "Applicability condition not satisfied"
            })

    return {
        "applicable_rules": applicable_rules,
        "excluded_rules": excluded_rules
    }