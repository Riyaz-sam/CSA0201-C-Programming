/**
 * MEDIVIGIL - Intelligent Emergency Resource Command Center
 * Data Model & Default Datasets
 * Academic C-Mapping: Represents struct Resource resources[MAX_RESOURCES] and static lookup tables.
 */

const DEPARTMENTS = [
  'Emergency',
  'ICU',
  'Pharmacy',
  'Operation Theatre',
  'Pediatrics',
  'General Ward',
  'Laboratory',
  'Blood Bank'
];

const CATEGORIES = [
  'Medicine',
  'Equipment',
  'Beds',
  'Supplies'
];

const PRIORITIES = [
  'CRITICAL',
  'HIGH',
  'MEDIUM',
  'LOW'
];

const UNITS = [
  'Units',
  'Boxes',
  'Vials',
  'Cylinders',
  'Kits',
  'Bags',
  'Beds',
  'Packs'
];

// Baseline Initial Resources (37 realistic items covering all 8 departments and 4 categories)
// Includes intentional duplicate records for duplicate scanner demonstration
const INITIAL_RESOURCES = [
  {
    id: "RES-001",
    name: "Oxygen Cylinder (40L)",
    category: "Equipment",
    department: "Emergency",
    quantity: 48,
    minThreshold: 30,
    criticalThreshold: 15,
    priority: "CRITICAL",
    unit: "Cylinders",
    status: "SAFE",
    lastUpdated: "2026-09-01 08:30"
  },
  {
    id: "RES-002",
    name: "Mechanical Ventilator ICU",
    category: "Equipment",
    department: "ICU",
    quantity: 14,
    minThreshold: 10,
    criticalThreshold: 5,
    priority: "CRITICAL",
    unit: "Units",
    status: "SAFE",
    lastUpdated: "2026-09-01 08:15"
  },
  {
    id: "RES-003",
    name: "Emergency ICU Bed",
    category: "Beds",
    department: "ICU",
    quantity: 6,
    minThreshold: 8,
    criticalThreshold: 3,
    priority: "CRITICAL",
    unit: "Beds",
    status: "LOW",
    lastUpdated: "2026-09-01 08:00"
  },
  {
    id: "RES-004",
    name: "Trauma Resuscitation Bed",
    category: "Beds",
    department: "Emergency",
    quantity: 2,
    minThreshold: 10,
    criticalThreshold: 4,
    priority: "CRITICAL",
    unit: "Beds",
    status: "CRITICAL",
    lastUpdated: "2026-09-01 07:45"
  },
  {
    id: "RES-005",
    name: "Paracetamol 500mg IV",
    category: "Medicine",
    department: "Pharmacy",
    quantity: 450,
    minThreshold: 200,
    criticalThreshold: 80,
    priority: "MEDIUM",
    unit: "Vials",
    status: "SAFE",
    lastUpdated: "2026-09-01 06:30"
  },
  {
    id: "RES-006",
    name: "Human Regular Insulin (100 IU/ml)",
    category: "Medicine",
    department: "Pharmacy",
    quantity: 42,
    minThreshold: 60,
    criticalThreshold: 25,
    priority: "HIGH",
    unit: "Vials",
    status: "LOW",
    lastUpdated: "2026-09-01 07:10"
  },
  {
    id: "RES-007",
    name: "Epinephrine 1mg/ml (Adrenaline)",
    category: "Medicine",
    department: "Emergency",
    quantity: 12,
    minThreshold: 20,
    criticalThreshold: 8,
    priority: "CRITICAL",
    unit: "Vials",
    status: "LOW",
    lastUpdated: "2026-09-01 08:20"
  },
  {
    id: "RES-008",
    name: "Surgical Gloves (Size 7.5 Sterilized)",
    category: "Supplies",
    department: "Operation Theatre",
    quantity: 850,
    minThreshold: 300,
    criticalThreshold: 100,
    priority: "MEDIUM",
    unit: "Boxes",
    status: "SAFE",
    lastUpdated: "2026-09-01 05:50"
  },
  {
    id: "RES-009",
    name: "Blood Bag O-Negative (Universal PRBC)",
    category: "Supplies",
    department: "Blood Bank",
    quantity: 3,
    minThreshold: 15,
    criticalThreshold: 5,
    priority: "CRITICAL",
    unit: "Bags",
    status: "CRITICAL",
    lastUpdated: "2026-09-01 08:35"
  },
  {
    id: "RES-010",
    name: "Blood Bag A-Positive",
    category: "Supplies",
    department: "Blood Bank",
    quantity: 28,
    minThreshold: 20,
    criticalThreshold: 8,
    priority: "HIGH",
    unit: "Bags",
    status: "SAFE",
    lastUpdated: "2026-09-01 08:00"
  },
  {
    id: "RES-011",
    name: "Automated External Defibrillator (AED)",
    category: "Equipment",
    department: "Emergency",
    quantity: 5,
    minThreshold: 4,
    criticalThreshold: 2,
    priority: "CRITICAL",
    unit: "Units",
    status: "SAFE",
    lastUpdated: "2026-09-01 07:00"
  },
  {
    id: "RES-012",
    name: "Syringe Infusion Pump",
    category: "Equipment",
    department: "ICU",
    quantity: 18,
    minThreshold: 12,
    criticalThreshold: 6,
    priority: "HIGH",
    unit: "Units",
    status: "SAFE",
    lastUpdated: "2026-09-01 06:15"
  },
  {
    id: "RES-013",
    name: "Broad Spectrum Antibiotic (Meropenem 1g)",
    category: "Medicine",
    department: "Pharmacy",
    quantity: 0,
    minThreshold: 50,
    criticalThreshold: 20,
    priority: "CRITICAL",
    unit: "Vials",
    status: "OUT OF STOCK",
    lastUpdated: "2026-09-01 08:40"
  },
  {
    id: "RES-014",
    name: "Ceftriaxone 1g Injection",
    category: "Medicine",
    department: "Emergency",
    quantity: 35,
    minThreshold: 40,
    criticalThreshold: 15,
    priority: "HIGH",
    unit: "Vials",
    status: "LOW",
    lastUpdated: "2026-09-01 07:55"
  },
  {
    id: "RES-015",
    name: "Multiparameter Patient Monitor",
    category: "Equipment",
    department: "Operation Theatre",
    quantity: 8,
    minThreshold: 6,
    criticalThreshold: 3,
    priority: "HIGH",
    unit: "Units",
    status: "SAFE",
    lastUpdated: "2026-09-01 06:40"
  },
  {
    id: "RES-016",
    name: "Anesthesia Workstation Unit",
    category: "Equipment",
    department: "Operation Theatre",
    quantity: 4,
    minThreshold: 4,
    criticalThreshold: 2,
    priority: "CRITICAL",
    unit: "Units",
    status: "SAFE",
    lastUpdated: "2026-09-01 06:45"
  },
  {
    id: "RES-017",
    name: "Pediatric Incubator ISO-100",
    category: "Equipment",
    department: "Pediatrics",
    quantity: 7,
    minThreshold: 6,
    criticalThreshold: 3,
    priority: "CRITICAL",
    unit: "Units",
    status: "SAFE",
    lastUpdated: "2026-09-01 07:20"
  },
  {
    id: "RES-018",
    name: "Pediatric Emergency Bed",
    category: "Beds",
    department: "Pediatrics",
    quantity: 12,
    minThreshold: 10,
    criticalThreshold: 4,
    priority: "HIGH",
    unit: "Beds",
    status: "SAFE",
    lastUpdated: "2026-09-01 07:25"
  },
  {
    id: "RES-019",
    name: "Amoxicillin Syrup 250mg",
    category: "Medicine",
    department: "Pediatrics",
    quantity: 65,
    minThreshold: 40,
    criticalThreshold: 15,
    priority: "MEDIUM",
    unit: "Bottles",
    status: "SAFE",
    lastUpdated: "2026-09-01 07:30"
  },
  {
    id: "RES-020",
    name: "General Inpatient Hospital Bed",
    category: "Beds",
    department: "General Ward",
    quantity: 45,
    minThreshold: 50,
    criticalThreshold: 20,
    priority: "MEDIUM",
    unit: "Beds",
    status: "LOW",
    lastUpdated: "2026-09-01 06:10"
  },
  {
    id: "RES-021",
    name: "IV Saline 0.9% Normal Saline 500ml",
    category: "Supplies",
    department: "General Ward",
    quantity: 320,
    minThreshold: 150,
    criticalThreshold: 60,
    priority: "HIGH",
    unit: "Bags",
    status: "SAFE",
    lastUpdated: "2026-09-01 06:05"
  },
  {
    id: "RES-022",
    name: "Disposable Syringes 5ml (Luer Lock)",
    category: "Supplies",
    department: "General Ward",
    quantity: 1200,
    minThreshold: 500,
    criticalThreshold: 200,
    priority: "LOW",
    unit: "Units",
    status: "SAFE",
    lastUpdated: "2026-09-01 05:40"
  },
  {
    id: "RES-023",
    name: "Arterial Blood Gas (ABG) Analyzer Cartridges",
    category: "Supplies",
    department: "Laboratory",
    quantity: 18,
    minThreshold: 25,
    criticalThreshold: 10,
    priority: "HIGH",
    unit: "Kits",
    status: "LOW",
    lastUpdated: "2026-09-01 07:05"
  },
  {
    id: "RES-024",
    name: "Centrifuge Blood Separator",
    category: "Equipment",
    department: "Laboratory",
    quantity: 3,
    minThreshold: 2,
    criticalThreshold: 1,
    priority: "HIGH",
    unit: "Units",
    status: "SAFE",
    lastUpdated: "2026-09-01 06:50"
  },
  {
    id: "RES-025",
    name: "Rapid Cardiac Troponin-I Test Kits",
    category: "Supplies",
    department: "Laboratory",
    quantity: 5,
    minThreshold: 30,
    criticalThreshold: 12,
    priority: "CRITICAL",
    unit: "Kits",
    status: "CRITICAL",
    lastUpdated: "2026-09-01 08:10"
  },
  {
    id: "RES-026",
    name: "Fresh Frozen Plasma (FFP)",
    category: "Supplies",
    department: "Blood Bank",
    quantity: 15,
    minThreshold: 12,
    criticalThreshold: 5,
    priority: "HIGH",
    unit: "Bags",
    status: "SAFE",
    lastUpdated: "2026-09-01 07:50"
  },
  {
    id: "RES-027",
    name: "Platelet Concentrate Units",
    category: "Supplies",
    department: "Blood Bank",
    quantity: 2,
    minThreshold: 10,
    criticalThreshold: 4,
    priority: "CRITICAL",
    unit: "Bags",
    status: "CRITICAL",
    lastUpdated: "2026-09-01 08:45"
  },
  {
    id: "RES-028",
    name: "High-Flow Oxygen Nasal Cannula Mask",
    category: "Supplies",
    department: "Emergency",
    quantity: 110,
    minThreshold: 60,
    criticalThreshold: 25,
    priority: "HIGH",
    unit: "Units",
    status: "SAFE",
    lastUpdated: "2026-09-01 07:15"
  },
  {
    id: "RES-029",
    name: "Endotracheal Tube Size 7.5 Cuffed",
    category: "Supplies",
    department: "Emergency",
    quantity: 0,
    minThreshold: 20,
    criticalThreshold: 8,
    priority: "CRITICAL",
    unit: "Units",
    status: "OUT OF STOCK",
    lastUpdated: "2026-09-01 08:42"
  },
  {
    id: "RES-030",
    name: "Transport Wheelchair HD",
    category: "Equipment",
    department: "General Ward",
    quantity: 12,
    minThreshold: 10,
    criticalThreshold: 4,
    priority: "LOW",
    unit: "Units",
    status: "SAFE",
    lastUpdated: "2026-09-01 06:00"
  },
  {
    id: "RES-031",
    name: "Laparoscopic Surgical Set",
    category: "Equipment",
    department: "Operation Theatre",
    quantity: 3,
    minThreshold: 3,
    criticalThreshold: 1,
    priority: "HIGH",
    unit: "Kits",
    status: "SAFE",
    lastUpdated: "2026-09-01 06:35"
  },
  {
    id: "RES-032",
    name: "Morphine Sulfate 10mg/ml Injection",
    category: "Medicine",
    department: "ICU",
    quantity: 14,
    minThreshold: 25,
    criticalThreshold: 10,
    priority: "HIGH",
    unit: "Vials",
    status: "LOW",
    lastUpdated: "2026-09-01 07:40"
  },
  {
    id: "RES-033",
    name: "Electrolyte Solution Ringer Lactate 500ml",
    category: "Supplies",
    department: "Emergency",
    quantity: 280,
    minThreshold: 120,
    criticalThreshold: 50,
    priority: "MEDIUM",
    unit: "Bags",
    status: "SAFE",
    lastUpdated: "2026-09-01 06:20"
  },
  {
    id: "RES-034",
    name: "N95 Particulate Respirator Surgical Masks",
    category: "Supplies",
    department: "Pharmacy",
    quantity: 950,
    minThreshold: 400,
    criticalThreshold: 150,
    priority: "MEDIUM",
    unit: "Boxes",
    status: "SAFE",
    lastUpdated: "2026-09-01 05:30"
  },
  // Intentional Duplicates for Duplicate Scanner Demonstration:
  // Duplicate 1: Oxygen Cylinder (40L) in ICU (matches RES-035 and RES-036)
  {
    id: "RES-035",
    name: "Oxygen Cylinder (40L)",
    category: "Equipment",
    department: "ICU",
    quantity: 16,
    minThreshold: 20,
    criticalThreshold: 8,
    priority: "CRITICAL",
    unit: "Cylinders",
    status: "LOW",
    lastUpdated: "2026-09-01 08:10"
  },
  {
    id: "RES-036",
    name: "Oxygen Cylinder (40L)",
    category: "Equipment",
    department: "ICU",
    quantity: 9,
    minThreshold: 20,
    criticalThreshold: 8,
    priority: "CRITICAL",
    unit: "Cylinders",
    status: "CRITICAL",
    lastUpdated: "2026-09-01 08:25"
  },
  // Duplicate 2: Paracetamol 500mg IV in Pharmacy (matches RES-005 and RES-037)
  {
    id: "RES-037",
    name: "Paracetamol 500mg IV",
    category: "Medicine",
    department: "Pharmacy",
    quantity: 120,
    minThreshold: 200,
    criticalThreshold: 80,
    priority: "MEDIUM",
    unit: "Vials",
    status: "LOW",
    lastUpdated: "2026-09-01 08:18"
  }
];

// Baseline Bed Capacity Metrics
const INITIAL_BED_DATA = {
  total: 120,
  occupied: 94,
  available: 21,
  reserved: 5,
  breakdown: [
    { department: "Emergency", total: 25, occupied: 23, reserved: 2, criticalCare: true },
    { department: "ICU", total: 20, occupied: 18, reserved: 1, criticalCare: true },
    { department: "Pediatrics", total: 15, occupied: 11, reserved: 1, criticalCare: false },
    { department: "General Ward", total: 50, occupied: 36, reserved: 1, criticalCare: false },
    { department: "Operation Theatre", total: 10, occupied: 6, reserved: 0, criticalCare: true }
  ]
};

// 5-Day Historical Consumption Trend for Analytical Simulation
const CONSUMPTION_TRENDS = {
  "Oxygen Cylinder (40L)": [
    { day: "Day -4", quantity: 95, demandRate: "Normal", dailyUsage: 12 },
    { day: "Day -3", quantity: 82, demandRate: "Normal", dailyUsage: 13 },
    { day: "Day -2", quantity: 68, demandRate: "Elevated", dailyUsage: 14 },
    { day: "Day -1", quantity: 52, demandRate: "High", dailyUsage: 16 },
    { day: "Today (Day 0)", quantity: 38, demandRate: "Crisis Surge", dailyUsage: 14 }
  ],
  "Human Regular Insulin (100 IU/ml)": [
    { day: "Day -4", quantity: 90, demandRate: "Normal", dailyUsage: 10 },
    { day: "Day -3", quantity: 78, demandRate: "Normal", dailyUsage: 12 },
    { day: "Day -2", quantity: 65, demandRate: "Normal", dailyUsage: 13 },
    { day: "Day -1", quantity: 52, demandRate: "Elevated", dailyUsage: 13 },
    { day: "Today (Day 0)", quantity: 42, demandRate: "Elevated", dailyUsage: 10 }
  ],
  "Blood Bag O-Negative (Universal PRBC)": [
    { day: "Day -4", quantity: 24, demandRate: "Normal", dailyUsage: 4 },
    { day: "Day -3", quantity: 18, demandRate: "Normal", dailyUsage: 6 },
    { day: "Day -2", quantity: 11, demandRate: "High", dailyUsage: 7 },
    { day: "Day -1", quantity: 6, demandRate: "Emergency", dailyUsage: 5 },
    { day: "Today (Day 0)", quantity: 3, demandRate: "Critical Shortage", dailyUsage: 3 }
  ],
  "Mechanical Ventilator ICU": [
    { day: "Day -4", quantity: 20, demandRate: "Normal", dailyUsage: 1 },
    { day: "Day -3", quantity: 18, demandRate: "Normal", dailyUsage: 2 },
    { day: "Day -2", quantity: 16, demandRate: "Elevated", dailyUsage: 2 },
    { day: "Day -1", quantity: 15, demandRate: "Elevated", dailyUsage: 1 },
    { day: "Today (Day 0)", quantity: 14, demandRate: "High Load", dailyUsage: 1 }
  ]
};

// Test Cases Definition (TC01 to TC20) for the Interactive Test Suite
const TEST_CASES_SPECS = [
  { id: "TC01", name: "Add Valid Resource", category: "CRUD", input: "ID: RES-999, Name: Defib Pads, Dept: Emergency, Qty: 20, Min: 10, Crit: 5", expected: "Resource added with SAFE status" },
  { id: "TC02", name: "Add Duplicate ID", category: "Validation", input: "ID: RES-001 (already exists)", expected: "Validation error: Duplicate ID rejected" },
  { id: "TC03", name: "Negative Quantity Rejection", category: "Validation", input: "Qty: -5", expected: "Validation error: Non-negative number required" },
  { id: "TC04", name: "Invalid Inverted Threshold", category: "Validation", input: "Critical (30) > Minimum (15)", expected: "Validation error: Critical must be <= Minimum" },
  { id: "TC05", name: "Search by ID", category: "Searching", input: "Query: 'RES-001'", expected: "Matches Oxygen Cylinder in Emergency" },
  { id: "TC06", name: "Search by Name Keyword", category: "Searching", input: "Query: 'oxygen'", expected: "Returns all Oxygen cylinders, masks, and related items" },
  { id: "TC07", name: "Search by Category", category: "Filtering", input: "Filter: 'Equipment'", expected: "Filters only Equipment resources" },
  { id: "TC08", name: "Search by Department", category: "Filtering", input: "Filter: 'ICU'", expected: "Filters only ICU departmental assets" },
  { id: "TC09", name: "Sort Quantity Ascending", category: "Sorting", input: "Field: quantity, Order: ASC", expected: "Out-of-stock (0) first, then ascending values" },
  { id: "TC10", name: "Sort Priority Descending", category: "Sorting", input: "Field: priority, Order: DESC", expected: "CRITICAL -> HIGH -> MEDIUM -> LOW" },
  { id: "TC11", name: "Detect Duplicate Records", category: "Duplicates", input: "Scan dataset for identical (Name + Dept + Category)", expected: "Flags ICU Oxygen Cylinders and Pharmacy Paracetamol" },
  { id: "TC12", name: "Merge Duplicate Resources", category: "Merging", input: "Merge RES-035 (16) and RES-036 (9)", expected: "Single record created with combined qty (25)" },
  { id: "TC13", name: "Department Consolidation", category: "Merging", input: "Merge Emergency -> ICU resources", expected: "Consolidated department inventory recalculated" },
  { id: "TC14", name: "Inter-Department Transfer", category: "Transfer", input: "Transfer 5 Oxygen Cylinders: Emergency -> ICU", expected: "Emergency decreases by 5, ICU increases by 5" },
  { id: "TC15", name: "Detect Critical Shortage", category: "Alerts", input: "Resource qty <= Critical Threshold", expected: "CRITICAL status badge and high-priority alert generated" },
  { id: "TC16", name: "Detect Out-Of-Stock", category: "Alerts", input: "Resource qty == 0", expected: "OUT OF STOCK status and procurement action required" },
  { id: "TC17", name: "Persist Data to Storage", category: "File Handling", input: "saveRecords() to localStorage", expected: "Data successfully written and verified in browser storage" },
  { id: "TC18", name: "Load Persisted Records", category: "File Handling", input: "loadRecords() from localStorage", expected: "Active state restored from stored records" },
  { id: "TC19", name: "Generate Consolidated Report", category: "Reporting", input: "generateReport()", expected: "Readiness score, bed summary, critical alerts compiled" },
  { id: "TC20", name: "Activate Crisis Mode Demo", category: "Simulation", input: "Emergency trigger button clicked", expected: "Readiness drops, stock depletes, crisis alert banner triggers" }
];
