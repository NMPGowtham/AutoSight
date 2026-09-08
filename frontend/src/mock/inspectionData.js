const inspectionData = {
  inspection_id: "LM-00124",

  image_url:
    "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=1200&q=85",

  image_width: 1200,
  image_height: 1500,

  product: {
    name: "Basmati Rice",
    category: "Food",
    is_imported: false,
  },

  status: "REVIEW",
  score: 82,

  summary: {
    passed: 7,
    review: 1,
    failed: 2,
  },

  fields: [
    {
      field: "mrp",
      value: "₹620.00",
      confidence: 0.96,
      bbox: [420, 315, 530, 370],
    },
    {
      field: "net_quantity",
      value: "5 kg",
      confidence: 0.98,
      bbox: [120, 350, 280, 400],
    },
    {
      field: "manufacturer",
      value: "ABC Foods Pvt. Ltd.",
      confidence: 0.94,
      bbox: [210, 780, 590, 830],
    },
    {
      field: "consumer_care",
      value: "1800-123-4567",
      confidence: 0.91,
      bbox: [200, 900, 520, 945],
    },
  ],

  rules: [
    {
      rule_id: "LM-MRP-001",
      field: "mrp",
      status: "PASS",
      severity: "HIGH",
      message: "Valid MRP declaration",
      confidence: 0.96,
      bbox: [420, 315, 530, 370],
      actual_value: "₹620.00",
      expected_value: "Valid MRP declaration",
    },
    {
      rule_id: "LM-NQ-001",
      field: "net_quantity",
      status: "PASS",
      severity: "HIGH",
      message: "Net quantity declaration detected",
      confidence: 0.98,
      bbox: [120, 350, 280, 400],
      actual_value: "5 kg",
      expected_value: "Valid net quantity declaration",
    },
    {
      rule_id: "LM-MFG-001",
      field: "manufacturer",
      status: "PASS",
      severity: "MEDIUM",
      message: "Manufacturer details detected",
      confidence: 0.94,
      bbox: [210, 780, 590, 830],
      actual_value: "ABC Foods Pvt. Ltd.",
      expected_value: "Valid manufacturer declaration",
    },
    {
      rule_id: "LM-CC-001",
      field: "consumer_care",
      status: "REVIEW",
      severity: "MEDIUM",
      message: "Consumer care information requires verification",
      confidence: 0.91,
      bbox: [200, 900, 520, 945],
      actual_value: "1800-123-4567",
      expected_value: "Valid consumer care details",
    },
    {
      rule_id: "LM-PKG-001",
      field: "packaging",
      status: "FAIL",
      severity: "HIGH",
      message: "Required packaging declaration not detected",
      confidence: 0.94,
      bbox: null,
      actual_value: null,
      expected_value: "Valid packaging declaration",
    },
    {
      rule_id: "LM-IMP-001",
      field: "importer",
      status: "FAIL",
      severity: "HIGH",
      message: "Importer declaration not detected",
      confidence: 0.93,
      bbox: null,
      actual_value: null,
      expected_value: "Valid importer declaration",
    },
  ],
};

export default inspectionData;
