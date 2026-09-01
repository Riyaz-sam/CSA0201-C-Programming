/**
 * MEDIVIGIL - Intelligent Emergency Resource Command Center
 * Department Merge & Emergency Resource Transfer Engine
 * Academic C-Mapping: Represents 2-Way Merging of structures, array restructuring, and memory re-allocation.
 */

const MergeManager = {
  /**
   * Generate a comparison and preview table before merging two departments
   * @param {string} sourceDept - Department giving up resources
   * @param {string} targetDept - Department receiving consolidated resources
   */
  generateMergePreview(sourceDept, targetDept) {
    if (!sourceDept || !targetDept || sourceDept === targetDept) {
      return { valid: false, error: "Please select two distinct departments to merge." };
    }

    const resources = StorageManager.loadResources();
    const sourceResources = resources.filter(r => r.department === sourceDept);
    const targetResources = resources.filter(r => r.department === targetDept);

    if (sourceResources.length === 0) {
      return { valid: false, error: `Source department '${sourceDept}' has no resources to merge.` };
    }

    const previewItems = [];
    const targetMap = new Map();

    // Map existing target resources by normalized name + category
    targetResources.forEach(tr => {
      const key = `${tr.name.trim().toLowerCase()}|||${tr.category.trim().toLowerCase()}`;
      targetMap.set(key, tr);
    });

    sourceResources.forEach(sr => {
      const key = `${sr.name.trim().toLowerCase()}|||${sr.category.trim().toLowerCase()}`;
      const existingTarget = targetMap.get(key);

      if (existingTarget) {
        const mergedQty = existingTarget.quantity + sr.quantity;
        const newStatus = ResourceManager.calculateStatus(mergedQty, existingTarget.minThreshold, existingTarget.criticalThreshold);
        previewItems.push({
          name: sr.name,
          category: sr.category,
          unit: sr.unit,
          sourceId: sr.id,
          targetId: existingTarget.id,
          sourceQty: sr.quantity,
          targetQty: existingTarget.quantity,
          mergedQty: mergedQty,
          action: 'COMBINE',
          oldTargetStatus: existingTarget.status,
          newTargetStatus: newStatus
        });
      } else {
        const newStatus = ResourceManager.calculateStatus(sr.quantity, sr.minThreshold, sr.criticalThreshold);
        previewItems.push({
          name: sr.name,
          category: sr.category,
          unit: sr.unit,
          sourceId: sr.id,
          targetId: `NEW (${targetDept})`,
          sourceQty: sr.quantity,
          targetQty: 0,
          mergedQty: sr.quantity,
          action: 'TRANSFER_NEW',
          oldTargetStatus: 'N/A',
          newTargetStatus: newStatus
        });
      }
    });

    return {
      valid: true,
      sourceDept,
      targetDept,
      sourceCount: sourceResources.length,
      targetCount: targetResources.length,
      previewItems
    };
  },

  /**
   * Execute department merge
   * Merges all resources from sourceDept into targetDept
   */
  executeDepartmentMerge(sourceDept, targetDept) {
    const preview = this.generateMergePreview(sourceDept, targetDept);
    if (!preview.valid) return { success: false, error: preview.error };

    let resources = StorageManager.loadResources();
    const sourceItems = resources.filter(r => r.department === sourceDept);
    let combinedCount = 0;
    let newTransferCount = 0;

    sourceItems.forEach(sr => {
      // Find matching item in target department
      const targetIndex = resources.findIndex(r => 
        r.department === targetDept &&
        r.name.trim().toLowerCase() === sr.name.trim().toLowerCase() &&
        r.category.trim().toLowerCase() === sr.category.trim().toLowerCase()
      );

      if (targetIndex !== -1) {
        // Combine quantity into target record
        resources[targetIndex].quantity += sr.quantity;
        resources[targetIndex].status = ResourceManager.calculateStatus(
          resources[targetIndex].quantity,
          resources[targetIndex].minThreshold,
          resources[targetIndex].criticalThreshold
        );
        resources[targetIndex].lastUpdated = new Date().toISOString().replace('T', ' ').slice(0, 16);
        combinedCount++;
      } else {
        // Relocate item to target department
        const newId = `RES-${Math.floor(100 + Math.random() * 900)}`;
        resources.push({
          ...sr,
          id: newId,
          department: targetDept,
          lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 16)
        });
        newTransferCount++;
      }
    });

    // Remove merged items from source department
    resources = resources.filter(r => r.department !== sourceDept);

    StorageManager.saveResources(resources);
    StorageManager.addActivity(
      'Department Consolidated',
      `Merged ${sourceDept} into ${targetDept}. Combined ${combinedCount} existing lines, migrated ${newTransferCount} items.`,
      'success'
    );

    return {
      success: true,
      sourceDept,
      targetDept,
      combinedCount,
      newTransferCount,
      totalTransferred: sourceItems.length
    };
  },

  /**
   * Emergency Inter-Department Resource Transfer
   * Transfers a specific quantity of a designated resource from one department to another
   */
  transferResource(fromDept, toDept, resourceName, quantity) {
    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) {
      return { success: false, error: "Transfer quantity must be a positive number." };
    }
    if (fromDept === toDept) {
      return { success: false, error: "Source and target departments cannot be identical." };
    }

    let resources = StorageManager.loadResources();
    
    // Locate source resource
    const sourceRes = resources.find(r => 
      r.department === fromDept && 
      r.name.toLowerCase() === resourceName.toLowerCase()
    );

    if (!sourceRes) {
      return { success: false, error: `Resource '${resourceName}' is not available in ${fromDept}.` };
    }

    if (sourceRes.quantity < qty) {
      return { 
        success: false, 
        error: `Insufficient stock in ${fromDept}. Available: ${sourceRes.quantity} ${sourceRes.unit}, Requested: ${qty} ${sourceRes.unit}.` 
      };
    }

    // Deduct from source
    sourceRes.quantity -= qty;
    sourceRes.status = ResourceManager.calculateStatus(sourceRes.quantity, sourceRes.minThreshold, sourceRes.criticalThreshold);
    sourceRes.lastUpdated = new Date().toISOString().replace('T', ' ').slice(0, 16);

    // Add or create in target
    let targetRes = resources.find(r => 
      r.department === toDept && 
      r.name.toLowerCase() === resourceName.toLowerCase()
    );

    if (targetRes) {
      targetRes.quantity += qty;
      targetRes.status = ResourceManager.calculateStatus(targetRes.quantity, targetRes.minThreshold, targetRes.criticalThreshold);
      targetRes.lastUpdated = new Date().toISOString().replace('T', ' ').slice(0, 16);
    } else {
      // Create new resource in target department
      const generatedId = `RES-${Math.floor(100 + Math.random() * 900)}`;
      targetRes = {
        id: generatedId,
        name: sourceRes.name,
        category: sourceRes.category,
        department: toDept,
        quantity: qty,
        minThreshold: sourceRes.minThreshold,
        criticalThreshold: sourceRes.criticalThreshold,
        priority: sourceRes.priority,
        unit: sourceRes.unit,
        status: ResourceManager.calculateStatus(qty, sourceRes.minThreshold, sourceRes.criticalThreshold),
        lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 16)
      };
      resources.push(targetRes);
    }

    StorageManager.saveResources(resources);
    StorageManager.addActivity(
      'Emergency Resource Transfer',
      `Transferred ${qty} ${sourceRes.unit} of '${resourceName}' from ${fromDept} to ${toDept}.`,
      'success'
    );

    return {
      success: true,
      fromDept,
      toDept,
      resourceName,
      quantity: qty,
      unit: sourceRes.unit,
      sourceRemaining: sourceRes.quantity,
      targetTotal: targetRes.quantity
    };
  },

  /**
   * Duplicate Resolution Engine
   * Merges or keeps selected records within a detected duplicate group
   */
  resolveDuplicateGroup(records, action, keepId = null) {
    if (!records || records.length < 2) {
      return { success: false, error: "Invalid duplicate record set." };
    }

    let resources = StorageManager.loadResources();

    if (action === 'MERGE') {
      // Primary is the first record or keepId
      const primaryIndex = resources.findIndex(r => r.id === (keepId || records[0].id));
      if (primaryIndex === -1) return { success: false, error: "Primary record not found." };

      let totalQty = 0;
      const idsToRemove = [];

      records.forEach(rec => {
        totalQty += Number(rec.quantity);
        if (rec.id !== resources[primaryIndex].id) {
          idsToRemove.push(rec.id);
        }
      });

      resources[primaryIndex].quantity = totalQty;
      resources[primaryIndex].status = ResourceManager.calculateStatus(
        totalQty, 
        resources[primaryIndex].minThreshold, 
        resources[primaryIndex].criticalThreshold
      );
      resources[primaryIndex].lastUpdated = new Date().toISOString().replace('T', ' ').slice(0, 16);

      // Remove the others
      resources = resources.filter(r => !idsToRemove.includes(r.id));
      StorageManager.saveResources(resources);
      StorageManager.addActivity(
        'Duplicate Merged',
        `Consolidated duplicate records for '${resources[primaryIndex].name}' in ${resources[primaryIndex].department}. Total merged stock: ${totalQty} ${resources[primaryIndex].unit}.`,
        'success'
      );
      return { success: true, message: `Merged into ${resources[primaryIndex].id} with total stock ${totalQty}.` };

    } else if (action === 'KEEP_FIRST') {
      const primary = records[0];
      const idsToRemove = records.slice(1).map(r => r.id);
      resources = resources.filter(r => !idsToRemove.includes(r.id));
      StorageManager.saveResources(resources);
      StorageManager.addActivity('Duplicate Resolved', `Retained ${primary.id} and discarded ${idsToRemove.length} duplicate entries.`, 'info');
      return { success: true, message: `Retained ${primary.id}.` };

    } else if (action === 'KEEP_SECOND' && records.length >= 2) {
      const primary = records[1];
      const idsToRemove = records.filter(r => r.id !== primary.id).map(r => r.id);
      resources = resources.filter(r => !idsToRemove.includes(r.id));
      StorageManager.saveResources(resources);
      StorageManager.addActivity('Duplicate Resolved', `Retained ${primary.id} and discarded alternate duplicate entries.`, 'info');
      return { success: true, message: `Retained ${primary.id}.` };
    }

    return { success: false, error: "Unsupported duplicate resolution action." };
  }
};
