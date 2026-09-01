/**
 * MEDIVIGIL - Intelligent Emergency Resource Command Center
 * Analytics, Heatmap & Consumption Trend Visualizer
 * Academic C-Mapping: Represents Data Aggregation, Frequency Counting & Statistical Arrays.
 */

const AnalyticsManager = {
  // Render clean SVG Donut Chart
  renderDonutChart(containerId, data = [], title = "") {
    const container = document.getElementById(containerId);
    if (!container) return;

    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) {
      container.innerHTML = '<div class="empty-chart-msg">No data available</div>';
      return;
    }

    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    let accumulatedOffset = 0;

    let svgSegments = "";
    let legendItems = "";

    data.forEach(item => {
      const percentage = item.value / total;
      const strokeDash = percentage * circumference;
      const strokeDashoffset = -accumulatedOffset;
      accumulatedOffset += strokeDash;

      svgSegments += `
        <circle cx="90" cy="90" r="${radius}" 
          fill="none" 
          stroke="${item.color}" 
          stroke-width="24" 
          stroke-dasharray="${strokeDash} ${circumference}" 
          stroke-dashoffset="${strokeDashoffset}"
          class="donut-segment" />
      `;

      legendItems += `
        <div class="legend-item">
          <span class="legend-badge" style="background-color: ${item.color}"></span>
          <span class="legend-label">${item.label}</span>
          <span class="legend-value">${item.value} (${Math.round(percentage * 100)}%)</span>
        </div>
      `;
    });

    container.innerHTML = `
      <div class="chart-flex-wrapper">
        <div class="donut-chart-container">
          <svg viewBox="0 0 180 180" class="donut-svg">
            <circle cx="90" cy="90" r="${radius}" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="24" />
            ${svgSegments}
            <text x="90" y="85" text-anchor="middle" class="donut-center-total">${total}</text>
            <text x="90" y="105" text-anchor="middle" class="donut-center-label">TOTAL</text>
          </svg>
        </div>
        <div class="chart-legend-container">
          ${legendItems}
        </div>
      </div>
    `;
  },

  // Render SVG Horizontal Bar Chart
  renderBarChart(containerId, items = [], maxVal = null) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!items || items.length === 0) {
      container.innerHTML = '<div class="empty-chart-msg">No data available</div>';
      return;
    }

    const calculatedMax = maxVal || Math.max(...items.map(i => i.value), 1);
    let barMarkup = "";

    items.forEach(item => {
      const pct = Math.min(100, Math.round((item.value / calculatedMax) * 100));
      barMarkup += `
        <div class="bar-chart-row">
          <div class="bar-header">
            <span class="bar-label">${item.label}</span>
            <span class="bar-num" style="color: ${item.color || '#38bdf8'}">${item.value} ${item.unit || ''}</span>
          </div>
          <div class="bar-track">
            <div class="bar-fill" style="width: ${pct}%; background: linear-gradient(90deg, ${item.color || '#38bdf8'}88, ${item.color || '#38bdf8'})"></div>
          </div>
        </div>
      `;
    });

    container.innerHTML = `<div class="bar-chart-list">${barMarkup}</div>`;
  },

  // Render Interactive Department x Category Heatmap Matrix
  renderHeatmap(containerId, resources = []) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // 8 Departments x 4 Categories
    let matrixHtml = `
      <div class="heatmap-table-container">
        <table class="heatmap-table">
          <thead>
            <tr>
              <th class="heatmap-corner">DEPARTMENT</th>
              ${CATEGORIES.map(c => `<th>${c.toUpperCase()}</th>`).join('')}
              <th>OVERALL READINESS</th>
            </tr>
          </thead>
          <tbody>
    `;

    DEPARTMENTS.forEach(dept => {
      const deptResources = resources.filter(r => r.department === dept);
      let deptSafe = 0;
      let deptLow = 0;
      let deptCrit = 0;
      let deptOos = 0;

      let rowCells = "";

      CATEGORIES.forEach(cat => {
        const catResources = deptResources.filter(r => r.category === cat);
        let cellStatus = "NONE";
        let cellClass = "cell-empty";
        let count = catResources.length;

        if (count > 0) {
          const hasOos = catResources.some(r => r.status === "OUT OF STOCK");
          const hasCrit = catResources.some(r => r.status === "CRITICAL");
          const hasLow = catResources.some(r => r.status === "LOW");

          if (hasOos) {
            cellStatus = "OUT OF STOCK";
            cellClass = "cell-oos";
            deptOos++;
          } else if (hasCrit) {
            cellStatus = "CRITICAL";
            cellClass = "cell-critical";
            deptCrit++;
          } else if (hasLow) {
            cellStatus = "LOW";
            cellClass = "cell-low";
            deptLow++;
          } else {
            cellStatus = "SAFE";
            cellClass = "cell-safe";
            deptSafe++;
          }
        }

        rowCells += `
          <td class="heatmap-cell ${cellClass}" onclick="App.filterByDeptAndCategory('${dept}', '${cat}')" title="${dept} - ${cat}: ${cellStatus} (${count} items)">
            <span class="cell-status-text">${cellStatus}</span>
            <span class="cell-count">${count} items</span>
          </td>
        `;
      });

      // Calculate dept readiness percentage
      const deptTotal = deptResources.length;
      let deptScore = deptTotal > 0 ? Math.round(((deptSafe + deptLow * 0.6) / deptTotal) * 100) : 100;
      let badgeClass = deptScore >= 80 ? "status-badge-safe" : deptScore >= 50 ? "status-badge-low" : "status-badge-critical";

      matrixHtml += `
        <tr>
          <td class="heatmap-dept-name">
            <span class="dept-dot"></span>
            <strong>${dept}</strong>
          </td>
          ${rowCells}
          <td class="heatmap-score">
            <span class="status-badge ${badgeClass}">${deptScore}%</span>
          </td>
        </tr>
      `;
    });

    matrixHtml += `
          </tbody>
        </table>
      </div>
      <div class="heatmap-legend">
        <span class="legend-tag safe"><span class="dot"></span> SAFE BUFFER</span>
        <span class="legend-tag low"><span class="dot"></span> LOW BUFFER</span>
        <span class="legend-tag crit"><span class="dot"></span> CRITICAL SHORTAGE</span>
        <span class="legend-tag oos"><span class="dot"></span> OUT OF STOCK</span>
      </div>
    `;

    container.innerHTML = matrixHtml;
  },

  // Render Consumption Trend Chart (SVG Line Graph with depletion forecast)
  renderConsumptionTrend(containerId, selectedItemName = "Oxygen Cylinder (40L)") {
    const container = document.getElementById(containerId);
    if (!container) return;

    const dataPoints = CONSUMPTION_TRENDS[selectedItemName] || CONSUMPTION_TRENDS["Oxygen Cylinder (40L)"];
    const width = 500;
    const height = 200;
    const padding = 40;

    const maxVal = Math.max(...dataPoints.map(d => d.quantity), 100);
    const minVal = 0;

    const points = dataPoints.map((d, index) => {
      const x = padding + (index * (width - 2 * padding) / (dataPoints.length - 1));
      const y = height - padding - ((d.quantity - minVal) / (maxVal - minVal)) * (height - 2 * padding);
      return { x, y, ...d };
    });

    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaD = `${pathD} L ${points[points.length-1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    // Calculate burn rate and time-to-depletion
    const firstVal = dataPoints[0].quantity;
    const lastVal = dataPoints[dataPoints.length - 1].quantity;
    const avgDailyConsumption = Math.round(((firstVal - lastVal) / (dataPoints.length - 1)) * 10) / 10;
    const daysUntilZero = avgDailyConsumption > 0 ? Math.round((lastVal / avgDailyConsumption) * 10) / 10 : "N/A";

    const svg = `
      <svg viewBox="0 0 ${width} ${height}" class="trend-svg">
        <defs>
          <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.4"/>
            <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.0"/>
          </linearGradient>
        </defs>

        <!-- Grid Lines -->
        <line x1="${padding}" y1="${padding}" x2="${width-padding}" y2="${padding}" stroke="rgba(255,255,255,0.08)" stroke-dasharray="3,3" />
        <line x1="${padding}" y1="${height/2}" x2="${width-padding}" y2="${height/2}" stroke="rgba(255,255,255,0.08)" stroke-dasharray="3,3" />
        <line x1="${padding}" y1="${height-padding}" x2="${width-padding}" y2="${height-padding}" stroke="rgba(255,255,255,0.2)" />

        <!-- Area Fill -->
        <path d="${areaD}" fill="url(#trendGrad)" />

        <!-- Line Stroke -->
        <path d="${pathD}" fill="none" stroke="#38bdf8" stroke-width="3" stroke-linecap="round" />

        <!-- Coordinate Circles & Values -->
        ${points.map(p => `
          <circle cx="${p.x}" cy="${p.y}" r="5" fill="#0f172a" stroke="#38bdf8" stroke-width="2.5" />
          <text x="${p.x}" y="${p.y - 12}" text-anchor="middle" class="trend-val-text">${p.quantity}</text>
          <text x="${p.x}" y="${height - padding + 20}" text-anchor="middle" class="trend-axis-text">${p.day}</text>
        `).join('')}
      </svg>
    `;

    container.innerHTML = `
      <div class="trend-wrapper">
        <div class="trend-header-row">
          <div>
            <h4 class="trend-title">${selectedItemName}</h4>
            <p class="trend-subtitle">5-Day Emergency Depletion Rate Telemetry</p>
          </div>
          <div class="trend-stat-badge">
            <span class="stat-label">Avg Daily Burn</span>
            <span class="stat-value text-warning">-${avgDailyConsumption} units/day</span>
          </div>
        </div>
        <div class="trend-chart-box">
          ${svg}
        </div>
        <div class="trend-forecast-alert ${daysUntilZero <= 2 ? 'alert-critical' : 'alert-warning'}">
          <span class="alert-icon">⏱️</span>
          <div>
            <strong>Linear Burn-Down Forecast:</strong>
            At current average consumption (${avgDailyConsumption} units/day), remaining stock (${lastVal}) is projected to reach critical exhaustion in 
            <span class="badge-highlight">${daysUntilZero} days</span>.
            <em class="forecast-disclaimer"> (Deterministic linear analytical simulation based on 5-day rolling average, not machine learning)</em>
          </div>
        </div>
      </div>
    `;
  }
};
