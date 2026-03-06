export const mockData = {
  user: {
    id: 1,
    name: "Rohan V.",
    mobile: "+91 98765 43210",
    abhaId: "ABHA123456789",
    email: "rohan@example.com"
  },

  stats: {
    totalRecords: 42,
    activeConditions: 3,
    monthlySavings: 2450,
    activeReminders: 2
  },

  records: [
    {
      id: 1,
      date: "2024-02-20",
      condition: "Type 2 Diabetes",
      doctor: "Dr. Mehta",
      status: "Ongoing",
      hospital: "Apollo Hospital"
    },
    {
      id: 2,
      date: "2024-02-15",
      condition: "Hypertension",
      doctor: "Dr. Sharma",
      status: "Controlled",
      hospital: "Fortis Hospital"
    },
    {
      id: 3,
      date: "2024-02-10",
      condition: "High Cholesterol",
      doctor: "Dr. Patel",
      status: "Improving",
      hospital: "Max Hospital"
    },
    {
      id: 4,
      date: "2024-02-05",
      condition: "Vitamin D Deficiency",
      doctor: "Dr. Kumar",
      status: "Resolved",
      hospital: "AIIMS"
    }
  ],

  labResults: [
    {
      id: 1,
      parameter: "HbA1c",
      value: 8.5,
      unit: "%",
      normalRange: "< 7.0",
      status: "High",
      date: "2024-02-20"
    },
    {
      id: 2,
      parameter: "Cholesterol",
      value: 240,
      unit: "mg/dL",
      normalRange: "< 200",
      status: "High",
      date: "2024-02-20"
    },
    {
      id: 3,
      parameter: "Blood Pressure",
      value: "140/90",
      unit: "mmHg",
      normalRange: "< 120/80",
      status: "High",
      date: "2024-02-18"
    },
    {
      id: 4,
      parameter: "Vitamin D",
      value: 35,
      unit: "ng/mL",
      normalRange: "30-100",
      status: "Normal",
      date: "2024-02-15"
    }
  ],

  medications: [
    {
      id: 1,
      name: "Metformin",
      dosage: "500mg",
      frequency: "Twice daily",
      brandPrice: 120,
      janAushadhiPrice: 35,
      savings: 85,
      time: ["09:00", "21:00"],
      enabled: true
    },
    {
      id: 2,
      name: "Atorvastatin",
      dosage: "10mg",
      frequency: "Once daily (Night)",
      brandPrice: 180,
      janAushadhiPrice: 45,
      savings: 135,
      time: ["22:00"],
      enabled: true
    },
    {
      id: 3,
      name: "Amlodipine",
      dosage: "5mg",
      frequency: "Once daily (Morning)",
      brandPrice: 80,
      janAushadhiPrice: 20,
      savings: 60,
      time: ["08:00"],
      enabled: false
    }
  ],

  reminders: [
    {
      id: 1,
      medication: "Metformin",
      time: "09:00 AM",
      enabled: true,
      frequency: "Daily"
    },
    {
      id: 2,
      medication: "Metformin",
      time: "09:00 PM",
      enabled: true,
      frequency: "Daily"
    },
    {
      id: 3,
      medication: "Atorvastatin",
      time: "10:00 PM",
      enabled: true,
      frequency: "Daily"
    },
    {
      id: 4,
      medication: "Blood Sugar Check",
      time: "07:00 AM",
      enabled: false,
      frequency: "Daily"
    }
  ],

  savings: {
    totalSavings: 280,
    monthlySavings: 2450,
    yearlyProjected: 29400,
    medicineBreakdown: [
      { name: "Metformin", savings: 85, percentage: 71 },
      { name: "Atorvastatin", savings: 135, percentage: 75 },
      { name: "Amlodipine", savings: 60, percentage: 75 }
    ]
  },

  chartData: {
    hba1cTrend: [
      { month: "Oct", value: 9.2 },
      { month: "Nov", value: 8.8 },
      { month: "Dec", value: 8.5 },
      { month: "Jan", value: 8.2 },
      { month: "Feb", value: 8.5 }
    ],
    savingsTrend: [
      { month: "Oct", savings: 1800 },
      { month: "Nov", savings: 2100 },
      { month: "Dec", savings: 2300 },
      { month: "Jan", savings: 2200 },
      { month: "Feb", savings: 2450 }
    ]
  },

  timeline: [
    {
      id: 1,
      date: "2024-02-20",
      type: "Lab Report",
      condition: "Type 2 Diabetes",
      doctor: "Dr. Mehta",
      hospital: "Apollo Hospital",
      summary: "HbA1c: 8.5%, Cholesterol: 240 mg/dL",
      status: "Reviewed"
    },
    {
      id: 2,
      date: "2024-02-15",
      type: "Prescription",
      condition: "Hypertension",
      doctor: "Dr. Sharma",
      hospital: "Fortis Hospital",
      summary: "Added Amlodipine 5mg, BP monitoring advised",
      status: "Active"
    },
    {
      id: 3,
      date: "2024-02-10",
      type: "Consultation",
      condition: "High Cholesterol",
      doctor: "Dr. Patel",
      hospital: "Max Hospital",
      summary: "Diet counseling, continue Atorvastatin",
      status: "Completed"
    },
    {
      id: 4,
      date: "2024-01-25",
      type: "Lab Report",
      condition: "Vitamin D Deficiency",
      doctor: "Dr. Kumar",
      hospital: "AIIMS",
      summary: "Vitamin D: 35 ng/mL (Improved)",
      status: "Resolved"
    }
  ],

  settings: {
    language: "English",
    notifications: true,
    darkMode: false,
    autoUpload: true,
    reminderSound: true
  },

  explanations: {
    hba1c: {
      value: 8.5,
      status: "moderate",
      explanation: "Your HbA1c level of 8.5% indicates that your average blood sugar has been higher than recommended over the past 2-3 months. The target for most adults with diabetes is below 7%. This suggests your diabetes management plan may need adjustment.",
      recommendations: [
        "Discuss medication adjustments with your doctor",
        "Monitor blood sugar more frequently",
        "Review your diet and exercise plan",
        "Schedule follow-up in 4-6 weeks"
      ]
    },
    cholesterol: {
      value: 240,
      status: "high",
      explanation: "Your total cholesterol level of 240 mg/dL is above the recommended range (less than 200 mg/dL). High cholesterol increases your risk of heart disease and stroke.",
      recommendations: [
        "Continue taking Atorvastatin as prescribed",
        "Reduce saturated fat intake",
        "Increase fiber-rich foods",
        "Regular exercise for 30 minutes daily"
      ]
    }
  }
};