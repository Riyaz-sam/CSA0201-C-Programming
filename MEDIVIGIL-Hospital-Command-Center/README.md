# MEDIVIGIL – Intelligent Emergency Resource Command Center

> *"Know your resources before the emergency knows you."*

---

## 🏥 1. Project Overview & Problem Statement

In high-demand clinical environments, disaster scenarios, and mass-casualty incidents, hospital administrators and triage coordinators face severe information fragmentation. Critical emergency assets—such as high-flow oxygen cylinders, mechanical ICU ventilators, adrenaline/epinephrine ampoules, universal O-negative blood bags, and trauma beds—are distributed across disconnected departments (Emergency, ICU, Pharmacy, Operation Theatre, Pediatrics, General Ward, Laboratory, and Blood Bank). 

**MEDIVIGIL** is an intelligent Hospital Emergency Operations Command Center designed to monitor, classify, reconcile, transfer, and optimize emergency medical resources in real time.

While presented with a modern, high-tech Emergency Command Center interface, **MEDIVIGIL is fundamentally designed as an academic C Programming Capstone Project showcase**, rigorously implementing and demonstrating:
1. **Operators & Arithmetic Clamping** (Readiness formulas, load factors, percentages)
2. **Decision-Making Ladders** (Status classification rules, threshold triggers)
3. **Menu-Driven Programming** (Structured multi-view navigation)
4. **Loops & Dynamic Arrays** (Inventory iteration, statistical frequencies)
5. **Strings & Multi-Attribute Searching** (Linear search $O(N)$ and binary search $O(\log N)$)
6. **Sorting Algorithms** (Bubble Sort, Insertion Sort, and Priority Rank Sort)
7. **2-Way Merging & Duplicate Reconciliation** (Consolidating departmental structures)
8. **Modular Function Architecture** (Separation of concerns)
9. **Hierarchical Recursion** (Tree traversal: Hospital $\rightarrow$ Department $\rightarrow$ Category $\rightarrow$ Resource)
10. **Memory Architecture & Pointer Dereferencing Simulation** (`struct Resource* ptr`)
11. **Persistent File Handling** (Browser `localStorage`, CSV manifest export, JSON backup vs C `fopen`/`fread`/`fwrite`/`fprintf`)
12. **Automated Verification & Test Suite** (TC01 to TC20 built-in test harness)

---

## ⚡ 2. Technology Stack

* **Markup:** HTML5 (Semantic Structure, Modals, Accessible UI)
* **Styling:** CSS3 (Dark Glassmorphic Command Center theme, SVG graphics, responsive media queries, CSS Grid & Flexbox, print stylesheets)
* **Logic:** Vanilla JavaScript (ES6+ Modular Architecture)
* **Persistence:** Browser `localStorage`, Dynamic CSV spreadsheet generation, JSON backup/restore
* **Audio Telemetry:** HTML5 Web Audio API (Synthesized bleeps and crisis alarms—zero external asset files required)
* **Zero Dependencies:** Pure vanilla client-side implementation. Runs directly in any modern browser or via VS Code Live Server without Node.js, Python, or backend server installation.

---

## 📁 3. Project Structure & File Organization

```
medivigil/
├── index.html              # Central Single-Page Application (Login terminal, Command Center, Views, Modals)
├── css/
│   ├── style.css           # Dark command-center styling, glassmorphism, glowing badges, gauges, heatmaps
│   └── responsive.css      # Adaptive layouts for desktops, laptops, tablets, and mobile smartphones
├── js/
│   ├── data.js             # Initial 37+ realistic medical resources, departments, bed telemetry, trends, test specs
│   ├── storage.js          # LocalStorage manager, CSV/JSON import & export, reset routines, activity logging
│   ├── resources.js        # Core Status Engine, CRUD operations, health scoring, readiness scoring, duplicate grouping
│   ├── search.js           # Multi-attribute instant search, combined filters, binary search demonstration
│   ├── sorting.js          # Dynamic multi-column sorting (Bubble Sort, Insertion Sort, Priority Urgency Ranking)
│   ├── merge.js            # Department Merge Center, Inter-Department Resource Transfer, Duplicate Resolver
│   ├── analytics.js        # SVG Donut & Bar Charts, 8x4 Department/Category Heatmap, 5-Day Consumption Burn-Down
│   ├── alerts.js           # Real-time Alert Center, Rule-Based Recommendation Engine, Emergency Surge Simulator
│   ├── recursion.js        # N-Ary Tree builder and recursive Depth-First Traversal with stack tracer
│   ├── reports.js          # Consolidated Emergency Operations Manifest generator & print controller
│   └── app.js              # Application orchestrator, login authentication, view router, test runner, audio bleeps
└── README.md               # Complete academic documentation, C-mapping, algorithm analysis, and testing guide
```

---

## ⚙️ 4. System Architecture & Algorithms

### 4.1 Resource Status Engine (Decision Ladder)
Every resource record contains:
* `id` (Unique alphanumeric code, e.g. `RES-001`)
* `name` (Resource descriptor, e.g. `Oxygen Cylinder (40L)`)
* `category` (`Medicine` | `Equipment` | `Beds` | `Supplies`)
* `department` (One of 8 clinical units)
* `quantity` (Current physical count)
* `minThreshold` (Standard safety buffer)
* `criticalThreshold` (Emergency shortage trigger boundary)
* `priority` (`CRITICAL` | `HIGH` | `MEDIUM` | `LOW`)
* `unit` (`Cylinders`, `Vials`, `Beds`, `Boxes`, `Kits`, `Bags`, `Units`)
* `status` (Computed dynamically)

**Rule-Based Decision Logic:**
$$\text{Status} = \begin{cases} 
\text{OUT OF STOCK} & \text{if } \text{quantity} = 0 \\ 
\text{CRITICAL} & \text{if } 0 < \text{quantity} \le \text{criticalThreshold} \\ 
\text{LOW} & \text{if } \text{criticalThreshold} < \text{quantity} \le \text{minThreshold} \\ 
\text{SAFE} & \text{if } \text{quantity} > \text{minThreshold} 
\end{cases}$$

$$\text{Health Score} = \min\left(100, \left\lfloor \frac{\text{quantity}}{\text{minThreshold}} \times 100 \right\rfloor\right)$$

---

### 4.2 Dynamic Emergency Readiness Score Formula
The system computes an overall hospital readiness score between $0$ and $100$:
$$\text{Readiness} = 0.75 \times \left( \frac{N_{\text{safe}}}{N} \times 100 + \frac{N_{\text{low}}}{N} \times 60 + \frac{N_{\text{crit}}}{N} \times 20 - \text{Penalty}_{\text{high-priority}} \right) + 0.25 \times \text{Score}_{\text{bed}}$$

* **90 – 100:** 🟢 **EXCELLENT**
* **75 – 89:** 🔵 **STABLE**
* **50 – 74:** 🟡 **AT RISK**
* **0 – 49:** 🔴 **CRITICAL**

---

### 4.3 Hierarchical Recursive Traversal ($O(N)$)
The hospital structure is modeled as an in-memory N-ary tree:
```
Central Command Hospital (Root)
 ├── Emergency (Department Node)
 │    ├── Equipment (Category Node)
 │    │    └── Oxygen Cylinder (Leaf Resource)
 │    └── Medicine (Category Node)
 ├── ICU (Department Node)
 └── Pharmacy (Department Node)
```
The recursive descent algorithm executes Depth-First Search (DFS) with recursive calls at each hierarchy level, compiling statistics on visited nodes and aggregating stock units.

---

### 4.4 C Memory Pointer Simulation
In the **C Concepts & Pointers** tab, selecting any resource generates a live view of its memory layout:
```c
struct Resource* ptr = &resources[i];
printf("Memory Address: %p\n", (void*)ptr);
printf("Resource ID: %s (Offset +0 bytes)\n", ptr->id);
printf("Resource Name: %s (Offset +16 bytes)\n", ptr->name);
printf("Stock Quantity: %d (Offset +112 bytes)\n", ptr->quantity);

/* Modifying through pointer dereferencing: */
ptr->quantity = new_quantity;
```

---

## 🔄 5. Key Showcase Workflow: Crisis Mode & Recovery

The standout demonstration feature of MEDIVIGIL is the end-to-end Emergency Incident workflow:

```
[1. Baseline State: Normal]
Readiness: 88% (STABLE) • All critical items within safe buffers
          │
          ▼ Click "🚨 ACTIVATE DEMO EMERGENCY"
[2. Crisis Mode Active]
• Mass Casualty Incident declared
• Oxygen, Adrenaline, Blood Bags, and ICU Beds depleted
• Bed capacity surges to 98% occupancy
• Large flashing Red Alert Banner activates
• Readiness drops to 32% (CRITICAL)
• Live Shortage Alerts trigger with tactical directives
          │
          ▼ Click "Transfer Supplies" or "Merge Center"
[3. Tactical Mitigation]
• Admin transfers surplus supplies from Pharmacy/General Ward to Emergency/ICU
• Admin admits/discharges beds to balance load
• Admin merges duplicate records in Duplicate Scanner
          │
          ▼ Real-Time Recalculation
[4. Readiness Score Recovers]
• Status badges update to SAFE
• Alerts clear automatically
• Readiness score climbs back to STABLE / EXCELLENT
          │
          ▼ Click "↺ RESET DEMO"
[5. Return to Baseline Setup]
```

---

## 📊 6. C Academic Requirement Mapping Matrix

| C Programming Requirement | MEDIVIGIL Command Center Implementation | C Academic Mapping Explanation |
| :--- | :--- | :--- |
| **Operators** | Readiness score weights, Bed load %, Health Score `(qty/min)*100` | Arithmetic, logical, and relational operators in C calculations |
| **Decision Making** | Status engine (`SAFE`, `LOW`, `CRITICAL`, `OUT OF STOCK`), Bed alerts | `if-else if-else` ladder and ternary conditional expressions |
| **Switch / Case Logic** | View routing, Sorting algorithms, Priority urgency ranks | `switch(choice)` for console menus and sorting criterion |
| **Loops** | Array traversals for searching, filtering, aggregating stats | `for`, `while`, and `do-while` loops iterating structural arrays |
| **Arrays of Structures** | 37+ resource objects with metadata, thresholds, units | `struct Resource resources[MAX_RESOURCES];` |
| **Strings** | Resource names, IDs, departments, category comparisons | `strcmp()`, `strcasecmp()`, `strcpy()`, string manipulation |
| **Searching** | Instant multi-attribute search and binary search demo | Linear search $O(N)$ and Binary Search $O(\log N)$ on sorted ID index |
| **Sorting** | Bubble Sort, Insertion Sort, Quick Sort by quantity and priority | Classical $O(N^2)$ and $O(N \log N)$ sorting routines on struct fields |
| **Merging** | 2-Way Department consolidation & duplicate group summing | Combining two sorted/unsorted department sub-arrays |
| **Functions** | Modular JavaScript architecture across 10 specialized files | User-defined C functions with clear parameter passing |
| **Recursion** | Hierarchical Tree descent (Hospital $\rightarrow$ Dept $\rightarrow$ Cat $\rightarrow$ Leaf) | Recursive traversal function `traverseHierarchy(node, depth, stats)` |
| **Pointers** | Memory Address Visualizer & Struct Offset dereferencing | Passing `struct Resource* ptr` by reference to modify memory in-place |
| **File Handling** | LocalStorage persistence, CSV Export, JSON Backup/Import | C file operations `fopen()`, `fclose()`, `fprintf()`, `fscanf()`, `fread()`, `fwrite()` |
| **Menu-Driven Design** | Sidebar navigation panel with 12 specialized operational views | Structured console menu system with exit and selection handlers |

---

## 🧪 7. Automated Test Suite (TC01 to TC20)

MEDIVIGIL includes a built-in automated test harness accessible via the **Test Suite (TC01-20)** navigation item:

| Test ID | Test Case Name | Category | Input Conditions | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TC01** | Add Valid Resource | CRUD | ID: RES-999, Qty: 20, Min: 10, Crit: 5 | Resource added with SAFE status | `PASS` |
| **TC02** | Add Duplicate ID | Validation | ID: RES-001 (already in database) | Duplicate ID rejected with error | `PASS` |
| **TC03** | Negative Quantity Rejection | Validation | Quantity: -5 | Rejected: Non-negative number required | `PASS` |
| **TC04** | Inverted Threshold Rejection | Validation | Critical (25) > Minimum (10) | Rejected: Critical must be $\le$ Minimum | `PASS` |
| **TC05** | Search by ID | Searching | Query: `"RES-001"` | Matches Oxygen Cylinder in Emergency | `PASS` |
| **TC06** | Search by Name Keyword | Searching | Query: `"oxygen"` | Returns all Oxygen cylinders, masks, concentrators | `PASS` |
| **TC07** | Search by Category | Filtering | Filter: `"Equipment"` | Filters only Equipment resources | `PASS` |
| **TC08** | Search by Department | Filtering | Filter: `"ICU"` | Filters only ICU assets | `PASS` |
| **TC09** | Sort Quantity Ascending | Sorting | Field: `quantity`, Order: `ASC` | Out-of-stock (0) first, then ascending values | `PASS` |
| **TC10** | Sort Priority Descending | Sorting | Field: `priority`, Order: `DESC` | CRITICAL $\rightarrow$ HIGH $\rightarrow$ MEDIUM $\rightarrow$ LOW | `PASS` |
| **TC11** | Detect Duplicate Records | Duplicates | Identical (Name + Dept + Category) | Flags ICU Oxygen Cylinders & Pharmacy Paracetamol | `PASS` |
| **TC12** | Merge Duplicate Resources | Merging | Merge RES-035 (16) and RES-036 (9) | Single record created with combined qty (25) | `PASS` |
| **TC13** | Department Consolidation | Merging | Merge Pharmacy $\rightarrow$ Emergency | Consolidated department inventory recalculated | `PASS` |
| **TC14** | Inter-Department Transfer | Transfer | Transfer 5 units: Emergency $\rightarrow$ ICU | Source drops by 5, Target increases by 5 | `PASS` |
| **TC15** | Detect Critical Shortage | Alerts | Qty $\le$ Critical Threshold | CRITICAL status badge & alert generated | `PASS` |
| **TC16** | Detect Out-Of-Stock | Alerts | Quantity == 0 | OUT OF STOCK status & procurement action | `PASS` |
| **TC17** | Persist Data to Storage | Storage | `saveRecords()` to localStorage | Data written and verified in browser storage | `PASS` |
| **TC18** | Load Persisted Records | Storage | `loadRecords()` from localStorage | Active state restored from stored records | `PASS` |
| **TC19** | Generate Consolidated Report | Reporting | `generateReport()` | Readiness score, bed summary, critical alerts compiled | `PASS` |
| **TC20** | Activate Crisis Mode Demo | Simulation | Emergency trigger button clicked | Readiness drops, stock depletes, crisis alert banner triggers | `PASS` |

---

## 🚀 8. How to Run the Application

### Method 1: VS Code Live Server (Recommended)
1. Open the project folder `medivigil/` in **VS Code**.
2. Right-click on `index.html` and select **"Open with Live Server"**.
3. The browser will open at `http://127.0.0.1:5500/index.html`.

### Method 2: Direct Browser Launch
1. Navigate to the `medivigil/` folder on your computer.
2. Double-click `index.html` to open it in Google Chrome, Microsoft Edge, Firefox, or Safari.

### 🔐 Demo Credentials
* **Username:** `admin`
* **Password:** `admin123`

---

## 🔮 9. Limitations & Future Enhancements

* **Current Scope:** Browser-side client architecture utilizing `localStorage` and simulated C-pointer memory models for educational presentation and viva demonstration.
* **Future Enhancements:**
  * WebAssembly (Wasm) compiled direct C engine execution in the browser.
  * Real-time multi-hospital WebRTC mesh networking.
  * Barcode / RFID scanner integration for real-time ward consumption tracking.

---

## 🎓 10. Conclusion

**MEDIVIGIL** bridges the gap between academic programming requirements and real-world system design. It showcases how core C programming paradigms—data structures, recursion, pointers, searching, sorting, merging, and file persistence—can be translated into an intuitive, responsive, and visually striking Emergency Operations Command Center that administrators can rely on during crisis conditions.
