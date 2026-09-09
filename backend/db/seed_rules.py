from db.session import SessionLocal
from models.rule import Rule


RULES = [
    {
        "rule_id": "LM-6-MFG",
        "source": "The Legal Metrology (Packaged Commodities) Rules, 2011",
        "section": "Rule 6(1)(a)",
        "section_name": "Manufacturer, Packer and Importer Declaration",
        "description": (
            "The package must declare the name and address of the "
            "manufacturer, packer or importer, as applicable."
        ),
        "validation_type": "FIELD_REQUIRED",
        "field": "manufacturer",
        "severity": "HIGH",
        "rule_text": (
            "Every package shall bear the name and address of the "
            "manufacturer, or where the manufacturer is not the packer, "
            "the name and address of the manufacturer and packer, and in "
            "case of imported packages the name and address of the importer."
        ),
        "parameters": {
            "applies_when": {
                "package_type": ["retail"]
            }
        },
        "active": True,
    },

    {
        "rule_id": "LM-6-NAME",
        "source": "The Legal Metrology (Packaged Commodities) Rules, 2011",
        "section": "Rule 6(1)(b)",
        "section_name": "Commodity Name Declaration",
        "description": (
            "The common or generic name of the commodity must be declared."
        ),
        "validation_type": "FIELD_REQUIRED",
        "field": "product_name",
        "severity": "HIGH",
        "rule_text": (
            "The common or generic names of the commodity contained in "
            "the package shall be mentioned on the package."
        ),
        "parameters": {
            "applies_when": {
                "package_type": ["retail"]
            }
        },
        "active": True,
    },

    {
        "rule_id": "LM-6-NQ",
        "source": "The Legal Metrology (Packaged Commodities) Rules, 2011",
        "section": "Rule 6(1)(c)",
        "section_name": "Net Quantity Declaration",
        "description": (
            "The package must declare the net quantity of the commodity."
        ),
        "validation_type": "NET_QUANTITY",
        "field": "net_quantity",
        "severity": "HIGH",
        "rule_text": (
            "The net quantity, in terms of the standard unit of weight "
            "or measure, of the commodity contained in the package or, "
            "where the commodity is packed or sold by number, the number "
            "of the commodity contained in the package shall be mentioned."
        ),
        "parameters": {
            "applies_when": {
                "package_type": ["retail"]
            }
        },
        "active": True,
    },

    {
        "rule_id": "LM-6-DATE",
        "source": "The Legal Metrology (Packaged Commodities) Rules, 2011",
        "section": "Rule 6(1)(d)",
        "section_name": "Manufacture / Packing / Import Date",
        "description": (
            "The month and year of manufacture, pre-packing or import "
            "must be declared where applicable."
        ),
        "validation_type": "FIELD_REQUIRED",
        "field": "manufacture_date",
        "severity": "MEDIUM",
        "rule_text": (
            "The month and year in which the commodity is manufactured "
            "or pre-packed or imported shall be mentioned in the package."
        ),
        "parameters": {
            "applies_when": {
                "package_type": ["retail"]
            }
        },
        "active": True,
    },

    {
        "rule_id": "LM-6-MRP",
        "source": "The Legal Metrology (Packaged Commodities) Rules, 2011",
        "section": "Rule 6(1)(e)",
        "section_name": "Retail Sale Price",
        "description": (
            "The retail sale price / MRP must be declared where applicable."
        ),
        "validation_type": "FIELD_REQUIRED",
        "field": "mrp",
        "severity": "HIGH",
        "rule_text": (
            "The retail sale price of the package shall be declared."
        ),
        "parameters": {
            "applies_when": {
                "package_type": ["retail"]
            }
        },
        "active": True,
    },

    {
        "rule_id": "LM-9",
        "source": "The Legal Metrology (Packaged Commodities) Rules, 2011",
        "section": "Rule 9(1)",
        "section_name": "Manner of Declaration",
        "description": (
            "Declarations required under the rules must be legible "
            "and prominent."
        ),
        "validation_type": "DECLARATION_PRESENTATION",
        "field": None,
        "severity": "MEDIUM",
        "rule_text": (
            "Every declaration which is required to be made on a package "
            "under these rules shall be legible and prominent."
        ),
        "parameters": {
            "applies_when": {
                "package_type": ["retail"]
            }
        },
        "active": True,
    },

    {
        "rule_id": "LM-24",
        "source": "The Legal Metrology (Packaged Commodities) Rules, 2011",
        "section": "Rule 24",
        "section_name": "Wholesale Package Declarations",
        "description": (
            "Wholesale packages must declare manufacturer/importer/packer "
            "details, commodity identity and quantity or number of retail "
            "packages."
        ),
        "validation_type": "WHOLESALE_DECLARATIONS",
        "field": None,
        "severity": "HIGH",
        "rule_text": (
            "Every wholesale package shall bear a legible, definite, "
            "plain and conspicuous declaration as to the name and address "
            "of the manufacturer or importer or packer, the identity of "
            "the commodity, and the total number of retail packages or "
            "the net quantity in standard units."
        ),
        "parameters": {
            "applies_when": {
                "package_type": ["wholesale"]
            }
        },
        "active": True,
    },
]


def seed_rules():
    db = SessionLocal()

    try:
        inserted = 0
        updated = 0

        for rule_data in RULES:

            rule = (
                db.query(Rule)
                .filter(Rule.rule_id == rule_data["rule_id"])
                .first()
            )

            if rule:
                for key, value in rule_data.items():
                    setattr(rule, key, value)

                updated += 1

            else:
                rule = Rule(**rule_data)
                db.add(rule)
                inserted += 1

        db.commit()

        print(
            f"Rules seeded successfully: "
            f"{inserted} inserted, {updated} updated."
        )

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_rules()