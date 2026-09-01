/**
 * MEDIVIGIL - Intelligent Emergency Resource Command Center
 * Hierarchical Recursive Traversal Engine
 * Academic C-Mapping: Demonstrates Tree/Hierarchy recursion:
 * void traverseHierarchy(struct Node* node, int depth, struct AuditSummary* stats);
 */

const RecursionManager = {
  /**
   * Build an in-memory N-ary tree from flat resource array:
   * Hospital -> Department -> Category -> Resource
   */
  buildHierarchyTree(resources = []) {
    const root = {
      name: "CENTRAL COMMAND HOSPITAL",
      type: "HOSPITAL",
      children: {}
    };

    resources.forEach(r => {
      // Level 1: Department
      if (!root.children[r.department]) {
        root.children[r.department] = {
          name: r.department,
          type: "DEPARTMENT",
          children: {}
        };
      }

      // Level 2: Category
      const deptNode = root.children[r.department];
      if (!deptNode.children[r.category]) {
        deptNode.children[r.category] = {
          name: r.category,
          type: "CATEGORY",
          children: []
        };
      }

      // Level 3: Leaf Resource
      const catNode = deptNode.children[r.category];
      catNode.children.push({
        id: r.id,
        name: r.name,
        type: "RESOURCE",
        quantity: r.quantity,
        minThreshold: r.minThreshold,
        criticalThreshold: r.criticalThreshold,
        status: r.status,
        unit: r.unit,
        priority: r.priority
      });
    });

    return root;
  },

  /**
   * Recursive Traversal Function
   * Recursively audits all nodes from root to leaves and calculates aggregated stats
   * Academic Concept: Direct recursive descent with base case (Leaf / Empty Children)
   */
  runRecursiveAudit(node, depth = 0, results = null) {
    if (!results) {
      results = {
        departmentsTraversed: 0,
        categoriesTraversed: 0,
        resourcesTraversed: 0,
        criticalCount: 0,
        outOfStockCount: 0,
        totalQuantity: 0,
        callStackLog: [],
        treeMarkup: ""
      };
    }

    const indent = "  ".repeat(depth);
    const prefix = depth === 0 ? "🏥 " : depth === 1 ? "🏢 " : depth === 2 ? "📦 " : "💊 ";

    if (node.type === "HOSPITAL") {
      results.callStackLog.push({
        level: depth,
        scope: "Hospital Root",
        message: `CALL traverseHierarchy(Hospital="${node.name}", depth=${depth})`
      });

      const depts = Object.values(node.children);
      for (let i = 0; i < depts.length; i++) {
        this.runRecursiveAudit(depts[i], depth + 1, results);
      }

      results.callStackLog.push({
        level: depth,
        scope: "Hospital Root",
        message: `RETURN from Hospital="${node.name}". Complete hospital audit finalized.`
      });

    } else if (node.type === "DEPARTMENT") {
      results.departmentsTraversed++;
      results.callStackLog.push({
        level: depth,
        scope: `Dept: ${node.name}`,
        message: `${indent}CALL traverseHierarchy(Department="${node.name}", depth=${depth})`
      });

      const categories = Object.values(node.children);
      for (let i = 0; i < categories.length; i++) {
        this.runRecursiveAudit(categories[i], depth + 1, results);
      }

      results.callStackLog.push({
        level: depth,
        scope: `Dept: ${node.name}`,
        message: `${indent}RETURN from Department="${node.name}". Categories in ${node.name} reconciled.`
      });

    } else if (node.type === "CATEGORY") {
      results.categoriesTraversed++;
      results.callStackLog.push({
        level: depth,
        scope: `Category: ${node.name}`,
        message: `${indent}CALL traverseHierarchy(Category="${node.name}", depth=${depth})`
      });

      const resources = node.children;
      for (let i = 0; i < resources.length; i++) {
        this.runRecursiveAudit(resources[i], depth + 1, results);
      }

      results.callStackLog.push({
        level: depth,
        scope: `Category: ${node.name}`,
        message: `${indent}RETURN from Category="${node.name}".`
      });

    } else if (node.type === "RESOURCE") {
      // Base Case: Leaf Resource Node
      results.resourcesTraversed++;
      results.totalQuantity += Number(node.quantity) || 0;

      if (node.status === "CRITICAL") {
        results.criticalCount++;
      } else if (node.status === "OUT OF STOCK") {
        results.outOfStockCount++;
      }

      results.callStackLog.push({
        level: depth,
        scope: `Resource: ${node.name}`,
        message: `${indent}BASE CASE: Reached Leaf ${node.id} (${node.name}, Qty: ${node.quantity} ${node.unit}, Status: ${node.status})`
      });
    }

    return results;
  }
};
