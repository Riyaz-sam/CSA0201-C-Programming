/**
 * MEDIVIGIL - Intelligent Emergency Resource Command Center
 * Consolidated Emergency Resource Report Generator
 * Academic C-Mapping: Represents Structured Report Generation & Formatted Output (fprintf to file/stdout).
 */

const ReportManager = {
  /**
   * Generate Full Emergency Operations Manifest
   */
  generateReportData() {
    const resources = StorageManager.loadResources();
    const beds = StorageManager.loadBeds();
    const mode = StorageManager.loadEmergencyMode();
    const readiness = ResourceManager.calculateReadinessScore(resources, beds);
    const stats = ResourceManager.getStatistics(resources);
    const alerts = AlertManager.generateAlerts(resources);
    const recommendations = AlertManager.generateRecommendations(resources);
    const duplicates = ResourceManager.findDuplicateGroups(resources);

    // Department-wise summary table
    const deptSummary = DEPARTMENTS.map(dept => {
      const deptItems = resources.filter(r => r.department === dept);
      const safe = deptItems.filter(r => r.status === 'SAFE').length;
      const low = deptItems.filter(r => r.status === 'LOW').length;
      const crit = deptItems.filter(r => r.status === 'CRITICAL').length;
      const oos = deptItems.filter(r => r.status === 'OUT OF STOCK').length;
      const total = deptItems.length;
      const deptReadiness = total > 0 ? Math.round(((safe + low * 0.6) / total) * 100) : 100;

      return {
        department: dept,
        total,
        safe,
        low,
        critical: crit,
        outOfStock: oos,
        readiness: deptReadiness
      };
    });

    const criticalItems = resources.filter(r => r.status === 'CRITICAL' || r.status === 'OUT OF STOCK');

    return {
      generatedAt: new Date().toLocaleString(),
      emergencyMode: mode,
      readiness,
      stats,
      beds,
      deptSummary,
      criticalItems,
      alertsCount: alerts.length,
      recommendations,
      duplicatesCount: duplicates.length,
      duplicates
    };
  },

  /**
   * Render Report HTML into Report View Container
   */
  renderReportView(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const data = this.generateReportData();

    container.innerHTML = `
      <div class="report-document" id="printable-report">
        <!-- Report Header -->
        <div class="report-header">
          <div class="report-brand">
            <div class="report-logo">MEDIVIGIL</div>
            <div class="report-tagline">Intelligent Emergency Resource Command Center</div>
            <div class="report-sub">Central Clinical Operations Directorate • Hospital Crisis Response Unit</div>
          </div>
          <div class="report-meta">
            <div><strong>Report Reference:</strong> MVR-${Date.now().toString(36).toUpperCase()}</div>
            <div><strong>Timestamp:</strong> ${data.generatedAt}</div>
            <div><strong>Operating Mode:</strong> <span class="mode-badge mode-${data.emergencyMode.toLowerCase()}">${data.emergencyMode}</span></div>
            <div><strong>System Status:</strong> ● TELEMETRY VERIFIED</div>
          </div>
        </div>

        <hr class="report-divider" />

        <!-- Executive Summary Cards -->
        <div class="report-section-title">1. EXECUTIVE SUMMARY & READINESS SCORE</div>
        <div class="report-grid-3">
          <div class="report-card">
            <div class="report-card-label">EMERGENCY READINESS INDEX</div>
            <div class="report-score-num" style="color: ${data.readiness.color}">${data.readiness.score}/100</div>
            <div class="report-score-label">RATING: <strong>${data.readiness.label}</strong></div>
          </div>
          <div class="report-card">
            <div class="report-card-label">TOTAL CLINICAL ASSETS</div>
            <div class="report-stat-num">${data.stats.total}</div>
            <div class="report-stat-sub">${data.stats.safe} Safe • ${data.stats.low} Low • ${data.stats.critical} Critical • ${data.stats.outOfStock} Stockout</div>
          </div>
          <div class="report-card">
            <div class="report-card-label">FACILITY BED OCCUPANCY</div>
            <div class="report-stat-num">${data.stats.occupancyRate}%</div>
            <div class="report-stat-sub">${data.stats.bedOccupied}/${data.stats.bedTotal} Occupied • ${data.stats.bedsAvailable} Available Beds</div>
          </div>
        </div>

        <!-- Department Summary Table -->
        <div class="report-section-title">2. DEPARTMENTAL READINESS BREAKDOWN</div>
        <table class="report-table">
          <thead>
            <tr>
              <th>DEPARTMENT</th>
              <th>TOTAL ASSETS</th>
              <th>SAFE</th>
              <th>LOW</th>
              <th>CRITICAL</th>
              <th>OUT OF STOCK</th>
              <th>DEPT READINESS</th>
            </tr>
          </thead>
          <tbody>
            ${data.deptSummary.map(d => `
              <tr>
                <td><strong>${d.department}</strong></td>
                <td>${d.total}</td>
                <td class="text-safe">${d.safe}</td>
                <td class="text-low">${d.low}</td>
                <td class="text-critical">${d.critical}</td>
                <td class="text-oos">${d.outOfStock}</td>
                <td><span class="report-badge ${d.readiness >= 75 ? 'badge-safe' : d.readiness >= 50 ? 'badge-low' : 'badge-danger'}">${d.readiness}%</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Critical Shortage Manifest -->
        <div class="report-section-title">3. CRITICAL SHORTAGES & STOCKOUT MANIFEST (${data.criticalItems.length} ITEMS)</div>
        ${data.criticalItems.length === 0 ? `
          <div class="report-empty">Zero critical shortages detected across all departments. All resources within safe buffers.</div>
        ` : `
          <table class="report-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>RESOURCE NAME</th>
                <th>DEPARTMENT</th>
                <th>CATEGORY</th>
                <th>STOCK</th>
                <th>CRITICAL BUFFER</th>
                <th>PRIORITY</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              ${data.criticalItems.map(item => `
                <tr>
                  <td><code>${item.id}</code></td>
                  <td><strong>${item.name}</strong></td>
                  <td>${item.department}</td>
                  <td>${item.category}</td>
                  <td class="text-danger"><strong>${item.quantity} ${item.unit}</strong></td>
                  <td>${item.criticalThreshold} ${item.unit}</td>
                  <td><span class="badge-${item.priority.toLowerCase()}">${item.priority}</span></td>
                  <td><span class="status-badge status-badge-${item.status === 'OUT OF STOCK' ? 'critical' : 'low'}">${item.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `}

        <!-- Duplicate Inventory Analysis -->
        <div class="report-section-title">4. DUPLICATE INVENTORY SCAN SUMMARY</div>
        <p class="report-text">
          ${data.duplicatesCount === 0 
            ? "No duplicate inventory allocations detected across clinical units." 
            : `Detected <strong>${data.duplicatesCount} duplicate resource groups</strong> requiring consolidation in Duplicate Scanner / Merge Center.`}
        </p>

        <!-- Recommended Operational Actions -->
        <div class="report-section-title">5. RECOMMENDED ACTIONS & TACTICAL DIRECTIVES</div>
        <div class="report-recommendations-list">
          ${data.recommendations.map(r => `
            <div class="report-rec-item">
              <div class="rec-item-badge ${r.urgency === 'CRITICAL' ? 'bg-danger' : r.urgency === 'HIGH' ? 'bg-warning' : 'bg-info'}">${r.urgency}</div>
              <div class="rec-item-content">
                <strong>${r.title}</strong>
                <p>${r.description}</p>
                <div class="rec-action-callout">Directive: ${r.actionText}</div>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Academic & Verification Sign-off -->
        <div class="report-footer">
          <div class="report-signoff">
            <div>Generated by <strong>MEDIVIGIL Command Engine</strong></div>
            <div>Academic C Programming Final Presentation & Automated Resource Allocation System</div>
          </div>
          <div class="report-auth">
            <div class="sign-line">Hospital Emergency Operations Directorate Signature</div>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Print Report
   */
  printReport() {
    window.print();
  }
};
