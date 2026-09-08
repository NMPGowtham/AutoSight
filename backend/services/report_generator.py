from pathlib import Path
from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
)

from models.report import Report


REPORT_DIR = Path("reports")


def generate_validation_report(
    db,
    validation,
    current_user,
):
    REPORT_DIR.mkdir(parents=True, exist_ok=True)

    validation_dir = REPORT_DIR / str(validation.validation_id)
    validation_dir.mkdir(parents=True, exist_ok=True)

    filename = (
        f"validation_{validation.validation_id}.pdf"
    )

    pdf_path = validation_dir / filename

    styles = getSampleStyleSheet()

    title_style = styles["Title"]
    heading_style = styles["Heading2"]
    normal_style = styles["BodyText"]

    doc = SimpleDocTemplate(
        str(pdf_path),
        pagesize=A4,
        rightMargin=18 * mm,
        leftMargin=18 * mm,
        topMargin=18 * mm,
        bottomMargin=18 * mm,
    )

    elements = []

    # --------------------------------------------------
    # HEADER
    # --------------------------------------------------

    elements.append(
        Paragraph(
            "LEGAL METROLOGY",
            title_style,
        )
    )

    elements.append(
        Paragraph(
            "Official Inspection Report",
            heading_style,
        )
    )

    elements.append(Spacer(1, 8))

    elements.append(
        Paragraph(
            f"<b>Validation ID:</b> "
            f"{validation.validation_id}",
            normal_style,
        )
    )

    elements.append(
        Paragraph(
            f"<b>Generated:</b> "
            f"{datetime.now().strftime('%d %b %Y %H:%M')}",
            normal_style,
        )
    )

    elements.append(Spacer(1, 15))

    # --------------------------------------------------
    # OVERALL RESULT
    # --------------------------------------------------

    elements.append(
        Paragraph(
            "Overall Assessment",
            heading_style,
        )
    )

    score = float(validation.validation_score or 0)

    summary = [
        ["Status", validation.overall_status or "REVIEW"],
        ["Compliance Score", f"{score:.2f}%"],
    ]

    table = Table(
        summary,
        colWidths=[55 * mm, 90 * mm],
    )

    table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (0, -1), colors.lightgrey),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
            ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
            ("PADDING", (0, 0), (-1, -1), 6),
        ])
    )

    elements.append(table)
    elements.append(Spacer(1, 15))

    # --------------------------------------------------
    # PACKAGE CONTEXT
    # --------------------------------------------------

    context = validation.package_context

    if context:
        elements.append(
            Paragraph(
                "Package Information",
                heading_style,
            )
        )

        package_data = [
            ["Product Category", context.product_category or "N/A"],
            ["Package Type", context.package_type or "N/A"],
            ["Consumer Type", context.consumer_type or "N/A"],
            ["Imported", str(context.is_imported)],
            [
                "Net Quantity",
                f"{context.net_quantity_value or 'N/A'} "
                f"{context.net_quantity_unit or ''}",
            ],
        ]

        table = Table(
            package_data,
            colWidths=[55 * mm, 90 * mm],
        )

        table.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (0, -1), colors.lightgrey),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("PADDING", (0, 0), (-1, -1), 6),
            ])
        )

        elements.append(table)
        elements.append(Spacer(1, 15))

    # --------------------------------------------------
    # VALIDATION RESULTS
    # --------------------------------------------------

    elements.append(
        Paragraph(
            "Compliance Rule Evaluation",
            heading_style,
        )
    )

    result_rows = [
        ["Rule", "Field", "Status", "Confidence", "Reason"]
    ]

    for result in validation.validation_results:

        result_rows.append([
            str(result.rule_id or "N/A"),
            str(result.field or "N/A"),
            str(result.status or "REVIEW"),
            (
                f"{float(result.confidence) * 100:.1f}%"
                if result.confidence is not None
                else "N/A"
            ),
            str(result.reason or ""),
        ])

    if len(result_rows) == 1:
        result_rows.append([
            "N/A",
            "N/A",
            "NO RULES",
            "N/A",
            "No compliance rules were evaluated.",
        ])

    table = Table(
        result_rows,
        repeatRows=1,
        colWidths=[
            25 * mm,
            28 * mm,
            22 * mm,
            25 * mm,
            65 * mm,
        ],
    )

    table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e5e7eb")),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("GRID", (0, 0), (-1, -1), 0.4, colors.grey),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("FONTSIZE", (0, 0), (-1, -1), 7),
            ("PADDING", (0, 0), (-1, -1), 5),
        ])
    )

    elements.append(table)

    # --------------------------------------------------
    # MANUAL REVIEW
    # --------------------------------------------------

    reviewed_results = [
        result
        for result in validation.validation_results
        if result.reviewed_at is not None
    ]

    if reviewed_results:

        elements.append(Spacer(1, 15))

        elements.append(
            Paragraph(
                "Manual Review Decisions",
                heading_style,
            )
        )

        review_rows = [
            [
                "Rule",
                "Decision",
                "Reviewer",
                "Comment",
            ]
        ]

        for result in reviewed_results:
            review_rows.append([
                str(result.rule_id or "N/A"),
                str(result.status),
                str(result.reviewed_by or "N/A"),
                str(result.review_comment or ""),
            ])

        table = Table(
            review_rows,
            repeatRows=1,
            colWidths=[
                30 * mm,
                25 * mm,
                35 * mm,
                75 * mm,
            ],
        )

        table.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("GRID", (0, 0), (-1, -1), 0.4, colors.grey),
                ("FONTSIZE", (0, 0), (-1, -1), 7),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("PADDING", (0, 0), (-1, -1), 5),
            ])
        )

        elements.append(table)

    # --------------------------------------------------
    # FINAL CONCLUSION
    # --------------------------------------------------

    elements.append(Spacer(1, 20))

    elements.append(
        Paragraph(
            "Final Conclusion",
            heading_style,
        )
    )

    status = validation.overall_status or "REVIEW"

    if status == "PASS":
        conclusion = (
            "The inspection passed the evaluated compliance checks."
        )
    elif status == "FAIL":
        conclusion = (
            "Potential non-compliance was identified. "
            "The failed requirements are listed above."
        )
    else:
        conclusion = (
            "The inspection requires manual review before "
            "a final compliance determination can be made."
        )

    elements.append(
        Paragraph(
            conclusion,
            normal_style,
        )
    )

    doc.build(elements)

    return pdf_path