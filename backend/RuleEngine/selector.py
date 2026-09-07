from sqlalchemy.orm import Session

from models.rule import Rule


def get_context_value(context, field_name: str):
    """
    Extract the actual value from the AI PackageContext.

    Teammate's context uses:
        ContextField(value=..., confidence=..., evidence=...)

    while some contexts may contain primitive values directly.
    """

    field = getattr(context, field_name, None)

    if field is None:
        return None

    if hasattr(field, "value"):
        return field.value

    return field


def rule_applies(rule: Rule, context) -> bool:
    """
    Determine whether a database rule applies to the detected package context.

    Expected Rule.parameters format:

    {
        "applies_when": {
            "package_type": ["retail"]
        }
    }
    """

    parameters = rule.parameters or {}
    conditions = parameters.get("applies_when", {})

    if not conditions:
        return True

    for field_name, allowed_values in conditions.items():

        actual_value = get_context_value(
            context,
            field_name
        )

        if actual_value is None:
            return False

        # Normalize values for safer comparison
        actual_value = str(actual_value).strip().lower()

        normalized_allowed = [
            str(value).strip().lower()
            for value in allowed_values
        ]

        if actual_value not in normalized_allowed:
            return False

    return True


def select_rules(
    db: Session,
    context
):
    """
    Select active legal metrology rules from PostgreSQL.

    Returns:
        {
            "applicable_rules": [...],
            "excluded_rules": [...]
        }
    """

    rules = (
        db.query(Rule)
        .filter(Rule.active.is_(True))
        .all()
    )

    applicable_rules = []
    excluded_rules = []

    for rule in rules:

        if rule_applies(rule, context):
            applicable_rules.append(rule)
        else:
            excluded_rules.append(rule)

    return {
        "applicable_rules": applicable_rules,
        "excluded_rules": excluded_rules
    }