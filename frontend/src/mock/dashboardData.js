const dashboardData = {
  overview: {
    totalInspections: 1248,
    passed: 982,
    underReview: 156,
    violations: 110,
    complianceRate: 78.7,
  },

  myActivity: {
    totalInspections: 24,
    passed: 19,
    underReview: 3,
    violations: 2,
    complianceRate: 79.2,
  },

  recentInspections: [
    {
      id: "LM-001248",
      product: "Basmati Rice",
      category: "Food",
      inspector: "Ravi Kumar",
      date: "08 Sep 2026",
      score: 96,
      status: "PASS",
    },
    {
      id: "LM-001247",
      product: "Sunflower Oil",
      category: "Edible Oil",
      inspector: "Sathvik",
      date: "08 Sep 2026",
      score: 82,
      status: "REVIEW",
    },
    {
      id: "LM-001246",
      product: "Premium Biscuits",
      category: "Food",
      inspector: "Anil Sharma",
      date: "07 Sep 2026",
      score: 91,
      status: "PASS",
    },
    {
      id: "LM-001245",
      product: "Detergent Powder",
      category: "Household",
      inspector: "Sathvik",
      date: "07 Sep 2026",
      score: 64,
      status: "FAIL",
    },
    {
      id: "LM-001244",
      product: "Bath Soap",
      category: "Personal Care",
      inspector: "Priya Reddy",
      date: "06 Sep 2026",
      score: 88,
      status: "PASS",
    },
  ],

  violationTrend: [
    { month: "Apr", violations: 18 },
    { month: "May", violations: 24 },
    { month: "Jun", violations: 17 },
    { month: "Jul", violations: 29 },
    { month: "Aug", violations: 22 },
    { month: "Sep", violations: 16 },
  ],
};

export default dashboardData;
