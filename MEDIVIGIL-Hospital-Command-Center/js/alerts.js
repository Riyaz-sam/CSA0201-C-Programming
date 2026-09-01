/**
 * MEDIVIGIL - Intelligent Emergency Resource Command Center
 * Emergency Alert Center, Rule-Based Recommendation Engine, & Crisis Simulation
 * Academic C-Mapping: Represents Decision Logic (nested switch/case, multi-condition rule engine).
 */

const AlertManager = {
  /**
   * Scan resources and generate real-time priority alerts
   */
  generateAlerts(resources = []) {
    const alerts = [];

    resources.forEach(r => {
      if (r.quantity === 0) {
        alerts.push({
          id: `ALT-OOS-${r.id}`,
          severity: 'OUT_OF_STOCK',
          level: 'CRITICAL SHORTAGE',
          title: `🔴 OUT OF STOCK: ${r.name}`,
          resource: r.name,
          department: r.department,
          currentQty: 0,
          unit: r.unit,
          threshold: r.criticalThreshold,
          priority: r.priority,
          message: `${r.department} has 0 ${r.unit} remaining. Critical emergency risk!`,
          recommendedAction: 'Immediate emergency procurement or emergency inter-department transfer required.',
          timestamp: r.lastUpdated || 'Just now',
          badgeClass: 'badge-danger',
          borderClass: 'border-danger'
        });
      } else if (r.quantity <= r.criticalThreshold) {
        alerts.push({
          id: `ALT-CRT-${r.id}`,
          severity: 'CRITICAL',
          level: 'CRITICAL SHORTAGE',
          title: `🚨 CRITICAL: ${r.name}`,
          resource: r.name,
          department: r.department,
          currentQty: r.quantity,
          unit: r.unit,
          threshold: r.criticalThreshold,
          priority: r.priority,
          message: `${r.department} stock (${r.quantity} ${r.unit}) is below critical threshold (${r.criticalThreshold} ${r.unit}).`,
          recommendedAction: 'Initiate emergency transfer from surplus departments or expedite supplier dispatch.',
          timestamp: r.lastUpdated || 'Just now',
          badgeClass: 'badge-warning',
          borderClass: 'border-warning'
        });
      } else if (r.quantity <= r.minThreshold) {
        alerts.push({
          id: `ALT-LOW-${r.id}`,
          severity: 'LOW',
          level: 'LOW STOCK WARNING',
          title: `⚠️ LOW STOCK: ${r.name}`,
          resource: r.name,
          department: r.department,
          currentQty: r.quantity,
          unit: r.unit,
          threshold: r.minThreshold,
          priority: r.priority,
          message: `${r.department} stock (${r.quantity} ${r.unit}) is approaching safety buffer (${r.minThreshold} ${r.unit}).`,
          recommendedAction: 'Monitor consumption burn rate and queue batch reorder.',
          timestamp: r.lastUpdated || 'Just now',
          badgeClass: 'badge-info',
          borderClass: 'border-info'
        });
      }
    });

    // Check Bed telemetry
    const beds = StorageManager.loadBeds();
    if (beds && beds.total > 0) {
      const occPercent = Math.round((beds.occupied / beds.total) * 100);
      if (occPercent >= 90) {
        alerts.unshift({
          id: 'ALT-BED-CRIT',
          severity: 'CRITICAL',
          level: 'FACILITY CAPACITY CRISIS',
          title: '🚨 CRITICAL BED CAPACITY: ' + occPercent + '% Occupancy',
          resource: 'Emergency & ICU Beds',
          department: 'Emergency / ICU',
          currentQty: beds.available,
          unit: 'Available Beds',
          threshold: '10% Free Buffer',
          priority: 'CRITICAL',
          message: `Hospital bed occupancy is at ${occPercent}%. Only ${beds.available} total beds remaining.`,
          recommendedAction: 'Trigger surge capacity overflow protocol and divert non-critical triage admissions.',
          timestamp: 'Live Telemetry',
          badgeClass: 'badge-danger',
          borderClass: 'border-danger'
        });
      } else if (occPercent >= 75) {
        alerts.push({
          id: 'ALT-BED-HIGH',
          severity: 'LOW',
          level: 'HIGH LOAD CAPACITY',
          title: '⚠️ HIGH BED LOAD: ' + occPercent + '% Occupancy',
          resource: 'Hospital Inpatient Beds',
          department: 'General Ward / ICU',
          currentQty: beds.available,
          unit: 'Available Beds',
          threshold: '25% Free Buffer',
          priority: 'HIGH',
          message: `Inpatient beds are at ${occPercent}% occupancy. ${beds.available} beds currently vacant.`,
          recommendedAction: 'Accelerate discharge reviews and monitor emergency intake.',
          timestamp: 'Live Telemetry',
          badgeClass: 'badge-info',
          borderClass: 'border-info'
        });
      }
    }

    return alerts;
  },

  /**
   * Rule-Based Recommendation Engine
   * Identifies shortages and searches for departmental surplus partners to recommend zero-cost instant transfers
   */
  generateRecommendations(resources = []) {
    const recommendations = [];
    const criticalOrOos = resources.filter(r => r.quantity <= r.criticalThreshold);

    criticalOrOos.forEach(item => {
      // Look for surplus in other departments
      const surplusItems = resources.filter(other => 
        other.department !== item.department &&
        other.name.toLowerCase() === item.name.toLowerCase() &&
        other.quantity > (other.minThreshold * 1.3)
      );

      if (surplusItems.length > 0) {
        // Recommend transfer
        const source = surplusItems[0];
        const suggestedTransfer = Math.min(
          Math.floor((source.quantity - source.minThreshold) / 2) || 1,
          Math.max(1, item.minThreshold - item.quantity)
        );

        recommendations.push({
          type: 'TRANSFER',
          urgency: 'HIGH',
          title: `Inter-Department Transfer Opportunity: ${item.name}`,
          description: `${item.department} is experiencing a critical shortage (${item.quantity} ${item.unit}), while ${source.department} holds a surplus of ${source.quantity} ${source.unit}.`,
          actionText: `Transfer ${suggestedTransfer} ${item.unit} from ${source.department} → ${item.department}`,
          sourceDept: source.department,
          targetDept: item.department,
          resourceName: item.name,
          suggestedQty: suggestedTransfer,
          canAutoExecute: true
        });
      } else if (item.quantity === 0) {
        recommendations.push({
          type: 'PROCUREMENT',
          urgency: 'CRITICAL',
          title: `Emergency Procurement Order: ${item.name}`,
          description: `Total stockout in ${item.department}. No internal surplus detected across other departments.`,
          actionText: `Dispatch emergency requisition request for ${item.minThreshold * 2} ${item.unit}.`,
          canAutoExecute: false
        });
      } else {
        recommendations.push({
          type: 'REPLENISHMENT',
          urgency: 'MEDIUM',
          title: `Schedule Batch Replenishment: ${item.name}`,
          description: `Stock level in ${item.department} is at ${item.quantity} ${item.unit} (Critical Threshold: ${item.criticalThreshold} ${item.unit}).`,
          actionText: `Reorder ${item.minThreshold} ${item.unit} from certified medical suppliers.`,
          canAutoExecute: false
        });
      }
    });

    // If no shortages, provide optimal status note
    if (recommendations.length === 0) {
      recommendations.push({
        type: 'OPTIMAL',
        urgency: 'INFO',
        title: 'All Emergency Resources Within Safe Buffers',
        description: 'Resource levels across all 8 clinical departments satisfy minimum safety margins. Regular routine audit recommended.',
        actionText: 'Maintain current inventory posture.',
        canAutoExecute: false
      });
    }

    return recommendations;
  },

  /**
   * CRISIS MODE SIMULATION TRIGGER
   * Demonstrates sudden casualty surge: drops critical medicines & beds, triggers alerts, readiness drops
   */
  activateEmergencySimulation() {
    let resources = StorageManager.loadResources();
    let beds = StorageManager.loadBeds();

    // 1. Deplete critical emergency items to simulate surge
    resources = resources.map(r => {
      if (r.name.includes("Oxygen Cylinder")) {
        return { ...r, quantity: Math.max(2, Math.floor(r.criticalThreshold * 0.4)), status: "CRITICAL" };
      }
      if (r.name.includes("Epinephrine") || r.name.includes("Insulin")) {
        return { ...r, quantity: Math.max(1, Math.floor(r.criticalThreshold * 0.5)), status: "CRITICAL" };
      }
      if (r.name.includes("Blood Bag O-Negative")) {
        return { ...r, quantity: 0, status: "OUT OF STOCK" };
      }
      if (r.name.includes("Ventilator")) {
        return { ...r, quantity: Math.max(1, Math.floor(r.criticalThreshold * 0.8)), status: "CRITICAL" };
      }
      if (r.name.includes("Resuscitation Bed") || r.name.includes("ICU Bed")) {
        return { ...r, quantity: 1, status: "CRITICAL" };
      }
      if (r.name.includes("Cardiac Troponin") || r.name.includes("Endotracheal")) {
        return { ...r, quantity: 0, status: "OUT OF STOCK" };
      }
      return r;
    });

    // 2. Overload bed telemetry
    beds.occupied = 117;
    beds.available = 1;
    beds.reserved = 2;

    // 3. Save state & set CRISIS mode
    StorageManager.saveResources(resources);
    StorageManager.saveBeds(beds);
    StorageManager.saveEmergencyMode('CRISIS');

    StorageManager.addActivity(
      '🚨 CRISIS MODE ACTIVATED',
      'Mass Casualty Incident declared. Stock consumed by 65%, bed capacity at 98%, readiness score collapsed.',
      'danger'
    );

    return { resources, beds, mode: 'CRISIS' };
  },

  /**
   * Reset simulation back to normal baseline
   */
  resetEmergencySimulation() {
    const result = StorageManager.resetToDefault();
    StorageManager.saveEmergencyMode('NORMAL');
    StorageManager.addActivity('Emergency Stand-Down', 'Crisis mode deactivated. Normal operational telemetry restored.', 'success');
    return { ...result, mode: 'NORMAL' };
  }
};
