/**
 * MEDIVIGIL - Intelligent Emergency Resource Command Center
 * Resource Status Engine & Management Operations
 * Academic C-Mapping: Represents struct Resource manipulations, pointer modifications, and decision making (if/else/switch).
 */

const ResourceManager = {
  // Determine status based on quantity and threshold boundaries
  // Academic: Demonstrates decision-making if-else ladder
  calculateStatus(quantity, minThreshold, criticalThreshold) {
    const qty = Number(quantity);
    const min = Number(minThreshold);
    const crit = Number(criticalThreshold);

    if (isNaN(qty) || qty <= 0) {
      return "OUT OF STOCK";
    } else if (qty <= crit) {
      return "CRITICAL";
    } else if (qty <= min) {
      return "LOW";
    } else {
      return "SAFE";
    }
  },

  // Calculate Health Score % (quantity / minimum threshold * 100)
  // Academic: Demonstrates arithmetic operators and boundary clamping
  calculateHealthScore(quantity, minThreshold) {
    const qty = Number(quantity) || 0;
    const min = Number(minThreshold) || 1;
    if (qty <= 0) return 0;
    const score = Math.round((qty / min) * 100);
    return score;
  },

  // Dynamic Composite Emergency Readiness Score (0 - 100)
  // Evaluates resource stock levels, critical priorities, bed availability, and out-of-stock penalties
  calculateReadinessScore(resources = [], beds = null) {
    if (!resources || resources.length === 0) {
      return { score: 0, label: "CRITICAL", color: "#ef4444", breakdown: {} };
    }

    let safeCount = 0;
    let lowCount = 0;
    let criticalCount = 0;
    let outOfStockCount = 0;
    let highPriorityCriticals = 0;
    const total = resources.length;

    for (let i = 0; i < total; i++) {
      const r = resources[i];
      const status = this.calculateStatus(r.quantity, r.minThreshold, r.criticalThreshold);
      if (status === "SAFE") safeCount++;
      else if (status === "LOW") lowCount++;
      else if (status === "CRITICAL") {
        criticalCount++;
        if (r.priority === "CRITICAL" || r.priority === "HIGH") highPriorityCriticals++;
      } else if (status === "OUT OF STOCK") {
        outOfStockCount++;
        if (r.priority === "CRITICAL" || r.priority === "HIGH") highPriorityCriticals += 2;
      }
    }

    // Weight proportions
    const safeRatio = safeCount / total;
    const lowRatio = lowCount / total;
    const critRatio = criticalCount / total;
    const oosRatio = outOfStockCount / total;

    // Base score from resource health
    let resourceScore = (safeRatio * 100) + (lowRatio * 60) + (critRatio * 20) + (oosRatio * 0);

    // High priority shortage penalties
    const penalty = Math.min(30, highPriorityCriticals * 4);
    resourceScore = Math.max(0, resourceScore - penalty);

    // Bed capacity influence (if bed telemetry is provided)
    let bedScore = 85;
    if (beds && beds.total > 0) {
      const occRatio = (beds.occupied + (beds.reserved || 0)) / beds.total;
      if (occRatio > 0.95) bedScore = 30; // Critical load
      else if (occRatio > 0.85) bedScore = 55;
      else if (occRatio > 0.70) bedScore = 78;
      else bedScore = 95;
    }

    // Composite 75% inventory + 25% bed capacity
    let composite = Math.round((resourceScore * 0.75) + (bedScore * 0.25));
    composite = Math.max(0, Math.min(100, composite));

    let label = "EXCELLENT";
    let color = "#10b981"; // Emerald green

    if (composite >= 90) {
      label = "EXCELLENT";
      color = "#10b981";
    } else if (composite >= 75) {
      label = "STABLE";
      color = "#3b82f6"; // Cobalt blue
    } else if (composite >= 50) {
      label = "AT RISK";
      color = "#f59e0b"; // Amber warning
    } else {
      label = "CRITICAL";
      color = "#ef4444"; // Crimson alert
    }

    return {
      score: composite,
      label,
      color,
      breakdown: {
        total,
        safeCount,
        lowCount,
        criticalCount,
        outOfStockCount,
        highPriorityCriticals,
        resourceScore: Math.round(resourceScore),
        bedScore
      }
    };
  },

  // Resource Validation Engine
  // Academic: Input validation, boundary checks, and error prevention
  validateResource(data, existingResources = [], isEdit = false, currentId = null) {
    const errors = [];

    // ID Validation
    if (!data.id || !data.id.trim()) {
      errors.push("Resource ID is required.");
    } else {
      const trimmedId = data.id.trim().toUpperCase();
      const duplicate = existingResources.find(r => 
        r.id.toUpperCase() === trimmedId && (!isEdit || r.id.toUpperCase() !== (currentId || '').toUpperCase())
      );
      if (duplicate) {
        errors.push(`Resource ID '${trimmedId}' already exists in inventory (Resource: ${duplicate.name}).`);
      }
    }

    // Name Validation
    if (!data.name || !data.name.trim()) {
      errors.push("Resource Name is required.");
    }

    // Department Validation
    if (!data.department || !DEPARTMENTS.includes(data.department)) {
      errors.push(`Invalid department. Must be one of: ${DEPARTMENTS.join(', ')}.`);
    }

    // Category Validation
    if (!data.category || !CATEGORIES.includes(data.category)) {
      errors.push(`Invalid category. Must be one of: ${CATEGORIES.join(', ')}.`);
    }

    // Priority Validation
    if (!data.priority || !PRIORITIES.includes(data.priority)) {
      errors.push(`Invalid priority. Must be one of: ${PRIORITIES.join(', ')}.`);
    }

    // Numeric validations
    const qty = Number(data.quantity);
    if (isNaN(qty) || qty < 0 || !Number.isFinite(qty)) {
      errors.push("Quantity must be a valid non-negative number.");
    }

    const min = Number(data.minThreshold);
    if (isNaN(min) || min < 0 || !Number.isFinite(min)) {
      errors.push("Minimum Threshold must be a non-negative number.");
    }

    const crit = Number(data.criticalThreshold);
    if (isNaN(crit) || crit < 0 || !Number.isFinite(crit)) {
      errors.push("Critical Threshold must be a non-negative number.");
    }

    if (!isNaN(min) && !isNaN(crit) && crit > min) {
      errors.push(`Critical threshold (${crit}) cannot be greater than Minimum threshold (${min}).`);
    }

    if (!data.unit || !data.unit.trim()) {
      errors.push("Measurement unit is required.");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Create a new Resource Record
  addResource(resourceData) {
    const resources = StorageManager.loadResources();
    const validation = this.validateResource(resourceData, resources, false);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

    const newResource = {
      id: resourceData.id.trim().toUpperCase(),
      name: resourceData.name.trim(),
      category: resourceData.category,
      department: resourceData.department,
      quantity: Number(resourceData.quantity),
      minThreshold: Number(resourceData.minThreshold),
      criticalThreshold: Number(resourceData.criticalThreshold),
      priority: resourceData.priority,
      unit: resourceData.unit.trim(),
      status: this.calculateStatus(resourceData.quantity, resourceData.minThreshold, resourceData.criticalThreshold),
      lastUpdated: timestamp
    };

    resources.push(newResource);
    StorageManager.saveResources(resources);
    StorageManager.addActivity(
      'Resource Added',
      `Registered '${newResource.name}' (${newResource.id}) in ${newResource.department} with stock ${newResource.quantity} ${newResource.unit}.`,
      'success'
    );

    return { success: true, resource: newResource };
  },

  // Update existing resource
  updateResource(id, updatedData) {
    const resources = StorageManager.loadResources();
    const index = resources.findIndex(r => r.id.toUpperCase() === id.toUpperCase());
    if (index === -1) {
      return { success: false, errors: [`Resource with ID '${id}' not found.`] };
    }

    const validation = this.validateResource(updatedData, resources, true, id);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

    const updated = {
      ...resources[index],
      name: updatedData.name.trim(),
      category: updatedData.category,
      department: updatedData.department,
      quantity: Number(updatedData.quantity),
      minThreshold: Number(updatedData.minThreshold),
      criticalThreshold: Number(updatedData.criticalThreshold),
      priority: updatedData.priority,
      unit: updatedData.unit.trim(),
      status: this.calculateStatus(updatedData.quantity, updatedData.minThreshold, updatedData.criticalThreshold),
      lastUpdated: timestamp
    };

    resources[index] = updated;
    StorageManager.saveResources(resources);
    StorageManager.addActivity(
      'Resource Updated',
      `Updated '${updated.name}' (${updated.id}) in ${updated.department}. New stock: ${updated.quantity} ${updated.unit} (Status: ${updated.status}).`,
      'info'
    );

    return { success: true, resource: updated };
  },

  // Delete Resource
  deleteResource(id) {
    const resources = StorageManager.loadResources();
    const index = resources.findIndex(r => r.id.toUpperCase() === id.toUpperCase());
    if (index === -1) {
      return { success: false, error: `Resource with ID '${id}' not found.` };
    }

    const deleted = resources.splice(index, 1)[0];
    StorageManager.saveResources(resources);
    StorageManager.addActivity(
      'Resource Deleted',
      `Removed '${deleted.name}' (${deleted.id}) from ${deleted.department}.`,
      'warning'
    );

    return { success: true, resource: deleted };
  },

  // Get statistics summary
  getStatistics(resources = []) {
    let safe = 0;
    let low = 0;
    let critical = 0;
    let outOfStock = 0;
    let highPriority = 0;

    for (let i = 0; i < resources.length; i++) {
      const r = resources[i];
      const status = this.calculateStatus(r.quantity, r.minThreshold, r.criticalThreshold);
      if (status === "SAFE") safe++;
      else if (status === "LOW") low++;
      else if (status === "CRITICAL") critical++;
      else if (status === "OUT OF STOCK") outOfStock++;

      if (r.priority === "CRITICAL" || r.priority === "HIGH") {
        highPriority++;
      }
    }

    const beds = StorageManager.loadBeds();

    return {
      total: resources.length,
      safe,
      low,
      critical,
      outOfStock,
      highPriority,
      bedsAvailable: beds ? beds.available : 0,
      bedTotal: beds ? beds.total : 0,
      bedOccupied: beds ? beds.occupied : 0,
      bedReserved: beds ? beds.reserved : 0,
      occupancyRate: beds && beds.total > 0 ? Math.round((beds.occupied / beds.total) * 100) : 0
    };
  },

  // Scan and identify duplicate records
  // Definition: Matching Name (case-insensitive) + Category + Department
  findDuplicateGroups(resources = []) {
    const groups = {};

    resources.forEach(r => {
      // Normalize key
      const key = `${r.name.trim().toLowerCase()}|||${r.category.trim().toLowerCase()}|||${r.department.trim().toLowerCase()}`;
      if (!groups[key]) {
        groups[key] = {
          name: r.name,
          category: r.category,
          department: r.department,
          unit: r.unit,
          records: []
        };
      }
      groups[key].records.push(r);
    });

    // Filter to only groups having more than 1 record
    return Object.values(groups).filter(g => g.records.length > 1);
  }
};
