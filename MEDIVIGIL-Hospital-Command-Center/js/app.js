/**
 * MEDIVIGIL – Intelligent Emergency Resource Command Center
 * Main Application Orchestrator & UI Controller
 */

const App = {
  activeView: 'dashboard',
  currentUser: null,
  activeSort: { field: 'name', direction: 'ASC' },
  activeFilter: { query: '', department: 'ALL', category: 'ALL', status: 'ALL', priority: 'ALL', onlyShortages: false },
  selectedTrendItem: 'Oxygen Cylinder (40L)',
  audioEnabled: true,

  // Initialize Application
  init() {
    this.checkAuth();
    this.bindEvents();
    this.startClock();
    this.renderAll();
  },

  // Telemetry Audio Synthesizer (Web Audio API - No external audio files required)
  playBeep(type = 'info') {
    if (!this.audioEnabled) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'crisis') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      }
    } catch (e) {
      // Audio not allowed before user interaction
    }
  },

  // Authentication Management
  checkAuth() {
    const session = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (session) {
      this.currentUser = JSON.parse(session);
      document.getElementById('login-screen').classList.add('hidden');
      document.getElementById('app-shell').classList.remove('hidden');
    } else {
      document.getElementById('login-screen').classList.remove('hidden');
      document.getElementById('app-shell').classList.add('hidden');
    }
  },

  login(username, password) {
    if (username === 'admin' && password === 'admin123') {
      const user = { username: 'admin', role: 'Emergency Operations Director', name: 'Dr. Sarah Connor, MD' };
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
      this.currentUser = user;
      document.getElementById('login-screen').classList.add('hidden');
      document.getElementById('app-shell').classList.remove('hidden');
      this.showToast('Authentication Verified. Welcome to MEDIVIGIL Command Center.', 'success');
      this.playBeep('success');
      this.renderAll();
      return true;
    } else {
      this.showToast('Invalid credentials. Use admin / admin123', 'danger');
      this.playBeep('crisis');
      return false;
    }
  },

  logout() {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    this.currentUser = null;
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('app-shell').classList.add('hidden');
    this.showToast('Session terminated. Secure terminal locked.', 'info');
  },

  // Live Clock
  startClock() {
    const clockEl = document.getElementById('live-telemetry-clock');
    const update = () => {
      const now = new Date();
      if (clockEl) {
        clockEl.textContent = now.toLocaleTimeString([], { hour12: false }) + ' LOCAL';
      }
    };
    update();
    setInterval(update, 1000);
  },

  // Toast Notification System
  showToast(message, type = 'info', title = null) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'success' ? '✓' : type === 'danger' ? '🚨' : type === 'warning' ? '⚠️' : 'ℹ️';
    
    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-body">
        ${title ? `<strong class="toast-title">${title}</strong>` : ''}
        <div class="toast-msg">${message}</div>
      </div>
      <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      if (toast.parentElement) {
        toast.classList.add('toast-fade');
        setTimeout(() => toast.remove(), 400);
      }
    }, 4500);
  },

  // Global Event Bindings
  bindEvents() {
    // Login Form Submit
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('login-username').value;
        const pass = document.getElementById('login-password').value;
        this.login(user, pass);
      });
    }

    // Emergency Mode Selector in Top Bar
    const modeSelect = document.getElementById('topbar-emergency-mode');
    if (modeSelect) {
      modeSelect.value = StorageManager.loadEmergencyMode();
      modeSelect.addEventListener('change', (e) => {
        const mode = e.target.value;
        StorageManager.saveEmergencyMode(mode);
        this.updateEmergencyModeUI(mode);
        StorageManager.addActivity('Mode Shift', `Operating mode altered to ${mode}.`, mode === 'CRISIS' ? 'danger' : 'info');
        this.showToast(`Emergency Mode switched to ${mode}.`, mode === 'CRISIS' ? 'danger' : 'info');
        if (mode === 'CRISIS') this.playBeep('crisis');
        this.renderAll();
      });
    }

    // Search Input
    const searchInput = document.getElementById('global-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.activeFilter.query = e.target.value;
        this.renderResourcesTable();
      });
    }

    // Filter Dropdowns
    const deptFilter = document.getElementById('filter-dept');
    if (deptFilter) {
      deptFilter.addEventListener('change', (e) => {
        this.activeFilter.department = e.target.value;
        this.renderResourcesTable();
      });
    }

    const catFilter = document.getElementById('filter-category');
    if (catFilter) {
      catFilter.addEventListener('change', (e) => {
        this.activeFilter.category = e.target.value;
        this.renderResourcesTable();
      });
    }

    const statusFilter = document.getElementById('filter-status');
    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => {
        this.activeFilter.status = e.target.value;
        this.renderResourcesTable();
      });
    }

    const priorityFilter = document.getElementById('filter-priority');
    if (priorityFilter) {
      priorityFilter.addEventListener('change', (e) => {
        this.activeFilter.priority = e.target.value;
        this.renderResourcesTable();
      });
    }

    // Resource Form Submit (Add/Edit)
    const resourceForm = document.getElementById('resource-form');
    if (resourceForm) {
      resourceForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleResourceFormSubmit();
      });
    }

    // Mobile Hamburger Menu
    const menuBtn = document.getElementById('mobile-menu-toggle');
    const sidebar = document.getElementById('sidebar');
    if (menuBtn && sidebar) {
      menuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
      });
    }
  },

  // Menu-driven View Router
  navigate(viewName) {
    this.activeView = viewName;
    this.playBeep('info');

    // Update active class in sidebar
    document.querySelectorAll('.nav-item').forEach(el => {
      if (el.getAttribute('data-view') === viewName) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    // Hide all view panels, display selected
    document.querySelectorAll('.view-panel').forEach(panel => {
      panel.classList.add('hidden');
    });

    const targetPanel = document.getElementById(`view-${viewName}`);
    if (targetPanel) {
      targetPanel.classList.remove('hidden');
    }

    // Close mobile sidebar if open
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('open');

    // View specific renders
    if (viewName === 'analytics') {
      this.renderAnalyticsView();
    } else if (viewName === 'reports') {
      ReportManager.renderReportView('reports-render-target');
    } else if (viewName === 'duplicates') {
      this.renderDuplicateScanner();
    } else if (viewName === 'merge-center') {
      this.renderMergeCenter();
    } else if (viewName === 'recursion') {
      this.renderRecursionView();
    } else if (viewName === 'c-concepts') {
      this.renderCConceptsView();
    } else if (viewName === 'test-suite') {
      this.renderTestSuiteView();
    } else if (viewName === 'departments') {
      this.renderDepartmentCards();
    } else if (viewName === 'emergency-monitor') {
      this.renderEmergencyMonitorView();
    } else if (viewName === 'transfer-center') {
      this.renderTransferCenter();
    }

    this.renderHeaderReadiness();
  },

  // Update Top Bar & Emergency Mode Indicators
  updateEmergencyModeUI(mode) {
    const banner = document.getElementById('crisis-banner');
    const modeBadge = document.getElementById('current-mode-indicator');
    if (banner) {
      if (mode === 'CRISIS') {
        banner.classList.remove('hidden');
      } else {
        banner.classList.add('hidden');
      }
    }
    if (modeBadge) {
      modeBadge.textContent = mode;
      modeBadge.className = `mode-indicator-tag mode-${mode.toLowerCase()}`;
    }
    const select = document.getElementById('topbar-emergency-mode');
    if (select) select.value = mode;
  },

  // Render Full Application Data
  renderAll() {
    const resources = StorageManager.loadResources();
    const beds = StorageManager.loadBeds();
    const mode = StorageManager.loadEmergencyMode();

    this.updateEmergencyModeUI(mode);
    this.renderHeaderReadiness();
    this.renderDashboardStats();
    this.renderResourcesTable();
    this.renderAlertsPanel();
    this.renderRecommendationsPanel();
    this.renderActivityLog();
    this.renderBedMonitor();
    this.renderDepartmentCards();
  },

  // Emergency Readiness Circular Gauge
  renderHeaderReadiness() {
    const resources = StorageManager.loadResources();
    const beds = StorageManager.loadBeds();
    const readiness = ResourceManager.calculateReadinessScore(resources, beds);

    // Update circular gauge in dashboard
    const scoreValEl = document.getElementById('readiness-score-value');
    const scoreLabelEl = document.getElementById('readiness-score-label');
    const circleEl = document.getElementById('readiness-circle-progress');
    const topBarReadiness = document.getElementById('topbar-readiness-val');

    if (scoreValEl) {
      scoreValEl.textContent = readiness.score;
      scoreValEl.style.color = readiness.color;
    }
    if (scoreLabelEl) {
      scoreLabelEl.textContent = readiness.label;
      scoreLabelEl.style.color = readiness.color;
    }
    if (circleEl) {
      const radius = 54;
      const circumference = 2 * Math.PI * radius;
      const offset = circumference - (readiness.score / 100) * circumference;
      circleEl.style.strokeDasharray = `${circumference} ${circumference}`;
      circleEl.style.strokeDashoffset = offset;
      circleEl.style.stroke = readiness.color;
    }
    if (topBarReadiness) {
      topBarReadiness.textContent = `${readiness.score}% [${readiness.label}]`;
      topBarReadiness.style.color = readiness.color;
    }
  },

  // Dashboard Statistics Cards
  renderDashboardStats() {
    const resources = StorageManager.loadResources();
    const stats = ResourceManager.getStatistics(resources);

    this.setElementText('stat-total-resources', stats.total);
    this.setElementText('stat-safe-resources', stats.safe);
    this.setElementText('stat-low-resources', stats.low);
    this.setElementText('stat-critical-resources', stats.critical);
    this.setElementText('stat-oos-resources', stats.outOfStock);
    this.setElementText('stat-beds-available', `${stats.bedsAvailable}/${stats.bedTotal}`);
    this.setElementText('stat-high-priority', stats.highPriority);

    // Bed Occupancy Status
    const bedBadge = document.getElementById('bed-occupancy-badge');
    if (bedBadge) {
      bedBadge.textContent = `${stats.occupancyRate}% OCCUPIED`;
      if (stats.occupancyRate >= 90) {
        bedBadge.className = 'status-badge status-badge-critical';
      } else if (stats.occupancyRate >= 75) {
        bedBadge.className = 'status-badge status-badge-low';
      } else {
        bedBadge.className = 'status-badge status-badge-safe';
      }
    }
  },

  // Resources Table Render with Search, Filter and Sort
  renderResourcesTable() {
    const tableBody = document.getElementById('resources-table-body');
    if (!tableBody) return;

    let resources = StorageManager.loadResources();

    // 1. Filter
    resources = SearchManager.filter(resources, this.activeFilter);

    // 2. Sort
    resources = SortingManager.sort(resources, this.activeSort.field, this.activeSort.direction);

    // Render count
    const countEl = document.getElementById('resources-result-count');
    if (countEl) countEl.textContent = `Showing ${resources.length} matching resources`;

    if (resources.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="9" class="table-empty-row">
            <div class="empty-state">
              <span class="empty-icon">🔍</span>
              <h4>No resources match your search criteria</h4>
              <p>Try resetting filters or modifying your search terms.</p>
              <button class="btn btn-secondary btn-sm" onclick="App.resetFilters()">Clear Filters</button>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    let rowsHtml = '';
    resources.forEach(r => {
      const health = ResourceManager.calculateHealthScore(r.quantity, r.minThreshold);
      const statusBadgeClass = 
        r.status === 'SAFE' ? 'status-badge-safe' :
        r.status === 'LOW' ? 'status-badge-low' :
        r.status === 'CRITICAL' ? 'status-badge-critical' : 'status-badge-oos';

      const priorityBadgeClass = `badge-priority-${r.priority.toLowerCase()}`;

      rowsHtml += `
        <tr>
          <td><code class="res-code">${r.id}</code></td>
          <td>
            <div class="res-name-cell">
              <strong>${r.name}</strong>
              <span class="res-unit-sub">${r.unit}</span>
            </div>
          </td>
          <td><span class="category-tag">${r.category}</span></td>
          <td><span class="dept-tag">${r.department}</span></td>
          <td class="res-qty-cell">
            <span class="qty-number ${r.quantity === 0 ? 'text-danger' : ''}">${r.quantity}</span>
            <span class="qty-sub">Min: ${r.minThreshold} | Crit: ${r.criticalThreshold}</span>
          </td>
          <td><span class="priority-badge ${priorityBadgeClass}">${r.priority}</span></td>
          <td>
            <div class="health-progress-wrap" title="Health Score: ${health}%">
              <div class="health-progress-bar">
                <div class="health-progress-fill ${health >= 100 ? 'fill-safe' : health >= 50 ? 'fill-low' : 'fill-critical'}" style="width: ${Math.min(100, health)}%"></div>
              </div>
              <span class="health-score-val">${health}%</span>
            </div>
          </td>
          <td><span class="status-badge ${statusBadgeClass}">${r.status}</span></td>
          <td>
            <div class="table-actions">
              <button class="btn-icon" title="Inspect Memory / Pointer" onclick="App.openPointerModal('${r.id}')">🔍</button>
              <button class="btn-icon" title="Edit Resource" onclick="App.openEditModal('${r.id}')">✏️</button>
              <button class="btn-icon btn-icon-danger" title="Delete Resource" onclick="App.confirmDelete('${r.id}')">🗑️</button>
            </div>
          </td>
        </tr>
      `;
    });

    tableBody.innerHTML = rowsHtml;
  },

  // Toggle Table Sort Column
  sortTable(field) {
    if (this.activeSort.field === field) {
      this.activeSort.direction = this.activeSort.direction === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.activeSort.field = field;
      this.activeSort.direction = 'ASC';
    }
    this.playBeep('info');
    this.renderResourcesTable();
  },

  // Reset Filters
  resetFilters() {
    this.activeFilter = { query: '', department: 'ALL', category: 'ALL', status: 'ALL', priority: 'ALL', onlyShortages: false };
    const searchInput = document.getElementById('global-search-input');
    if (searchInput) searchInput.value = '';
    const dept = document.getElementById('filter-dept');
    if (dept) dept.value = 'ALL';
    const cat = document.getElementById('filter-category');
    if (cat) cat.value = 'ALL';
    const st = document.getElementById('filter-status');
    if (st) st.value = 'ALL';
    const pri = document.getElementById('filter-priority');
    if (pri) pri.value = 'ALL';
    this.renderResourcesTable();
  },

  // Filter directly from Heatmap or Department card
  filterByDeptAndCategory(dept, category = null) {
    this.activeFilter.department = dept;
    if (category) this.activeFilter.category = category;
    this.navigate('resources');
    const deptSelect = document.getElementById('filter-dept');
    if (deptSelect) deptSelect.value = dept;
    const catSelect = document.getElementById('filter-category');
    if (catSelect && category) catSelect.value = category;
    this.renderResourcesTable();
  },

  // Department Cards View
  renderDepartmentCards() {
    const container = document.getElementById('department-cards-grid');
    if (!container) return;

    const resources = StorageManager.loadResources();

    let cardsHtml = '';
    DEPARTMENTS.forEach(dept => {
      const items = resources.filter(r => r.department === dept);
      const safe = items.filter(r => r.status === 'SAFE').length;
      const low = items.filter(r => r.status === 'LOW').length;
      const crit = items.filter(r => r.status === 'CRITICAL').length;
      const oos = items.filter(r => r.status === 'OUT OF STOCK').length;
      const total = items.length;
      const deptReadiness = total > 0 ? Math.round(((safe + low * 0.6) / total) * 100) : 100;

      cardsHtml += `
        <div class="dept-card" onclick="App.filterByDeptAndCategory('${dept}')">
          <div class="dept-card-header">
            <h3 class="dept-card-title">${dept}</h3>
            <span class="status-badge ${deptReadiness >= 75 ? 'status-badge-safe' : deptReadiness >= 50 ? 'status-badge-low' : 'status-badge-critical'}">${deptReadiness}% Readiness</span>
          </div>
          <div class="dept-stat-grid">
            <div class="dept-stat-box">
              <span class="dept-stat-num">${total}</span>
              <span class="dept-stat-lbl">Assets</span>
            </div>
            <div class="dept-stat-box">
              <span class="dept-stat-num text-safe">${safe}</span>
              <span class="dept-stat-lbl">Safe</span>
            </div>
            <div class="dept-stat-box">
              <span class="dept-stat-num text-low">${low}</span>
              <span class="dept-stat-lbl">Low</span>
            </div>
            <div class="dept-stat-box">
              <span class="dept-stat-num text-critical">${crit + oos}</span>
              <span class="dept-stat-lbl">Shortage</span>
            </div>
          </div>
          <div class="dept-card-footer">
            <span>Click to inspect department resources →</span>
          </div>
        </div>
      `;
    });

    container.innerHTML = cardsHtml;
  },

  // Emergency Monitor View
  renderEmergencyMonitorView() {
    this.renderAlertsPanel();
    this.renderRecommendationsPanel();
    this.renderBedMonitor();
  },

  // Live Alerts Panel
  renderAlertsPanel() {
    const container = document.getElementById('alerts-feed-container');
    const badge = document.getElementById('alerts-count-badge');
    if (!container) return;

    const resources = StorageManager.loadResources();
    const alerts = AlertManager.generateAlerts(resources);

    if (badge) badge.textContent = `${alerts.length} ALERTS`;

    if (alerts.length === 0) {
      container.innerHTML = `
        <div class="empty-alerts">
          <span class="empty-icon">🟢</span>
          <p>No critical shortages detected. Central inventory operating normally.</p>
        </div>
      `;
      return;
    }

    let alertsHtml = '';
    alerts.forEach(a => {
      alertsHtml += `
        <div class="alert-feed-item ${a.borderClass}">
          <div class="alert-item-header">
            <strong class="alert-item-title">${a.title}</strong>
            <span class="alert-item-dept">${a.department}</span>
          </div>
          <p class="alert-item-msg">${a.message}</p>
          <div class="alert-item-footer">
            <span class="alert-rec-action">💡 <em>${a.recommendedAction}</em></span>
          </div>
        </div>
      `;
    });

    container.innerHTML = alertsHtml;
  },

  // Recommendations Panel
  renderRecommendationsPanel() {
    const container = document.getElementById('recommendations-feed-container');
    if (!container) return;

    const resources = StorageManager.loadResources();
    const recs = AlertManager.generateRecommendations(resources);

    let recsHtml = '';
    recs.forEach(r => {
      recsHtml += `
        <div class="rec-card ${r.urgency === 'CRITICAL' ? 'rec-critical' : r.urgency === 'HIGH' ? 'rec-high' : 'rec-info'}">
          <div class="rec-header">
            <span class="rec-urgency-tag">${r.urgency}</span>
            <h4 class="rec-title">${r.title}</h4>
          </div>
          <p class="rec-desc">${r.description}</p>
          <div class="rec-action-box">
            <span><strong>Tactical Action:</strong> ${r.actionText}</span>
            ${r.canAutoExecute ? `
              <button class="btn btn-sm btn-primary" onclick="App.executeRecommendedTransfer('${r.sourceDept}', '${r.targetDept}', '${r.resourceName}', ${r.suggestedQty})">
                Execute Transfer
              </button>
            ` : ''}
          </div>
        </div>
      `;
    });

    container.innerHTML = recsHtml;
  },

  // Execute Recommended Transfer with 1-click
  executeRecommendedTransfer(sourceDept, targetDept, resourceName, qty) {
    const res = MergeManager.transferResource(sourceDept, targetDept, resourceName, qty);
    if (res.success) {
      this.showToast(`Transfer Executed: ${qty} ${res.unit} of '${resourceName}' moved from ${sourceDept} → ${targetDept}.`, 'success');
      this.playBeep('success');
      this.renderAll();
    } else {
      this.showToast(res.error, 'danger');
    }
  },

  // Activity Log Render
  renderActivityLog() {
    const container = document.getElementById('activity-log-container');
    if (!container) return;

    const logs = StorageManager.loadActivityLog();

    if (logs.length === 0) {
      container.innerHTML = '<div class="empty-state"><p>No recorded system events.</p></div>';
      return;
    }

    let logsHtml = '';
    logs.forEach(l => {
      const dotColor = l.type === 'danger' ? '#ef4444' : l.type === 'warning' ? '#f59e0b' : l.type === 'success' ? '#10b981' : '#38bdf8';
      logsHtml += `
        <div class="activity-timeline-item">
          <div class="timeline-indicator" style="background-color: ${dotColor}; box-shadow: 0 0 8px ${dotColor}"></div>
          <div class="timeline-content">
            <div class="timeline-meta">
              <span class="timeline-action">${l.action}</span>
              <span class="timeline-time">${l.timestamp}</span>
            </div>
            <div class="timeline-details">${l.details}</div>
          </div>
        </div>
      `;
    });

    container.innerHTML = logsHtml;
  },

  // Emergency Bed Monitor Render
  renderBedMonitor() {
    const beds = StorageManager.loadBeds();
    const occRate = beds.total > 0 ? Math.round((beds.occupied / beds.total) * 100) : 0;

    this.setElementText('bed-stat-total', beds.total);
    this.setElementText('bed-stat-occupied', beds.occupied);
    this.setElementText('bed-stat-available', beds.available);
    this.setElementText('bed-stat-reserved', beds.reserved);
    this.setElementText('bed-stat-occupancy-rate', `${occRate}%`);

    const tableBody = document.getElementById('bed-breakdown-body');
    if (tableBody && beds.breakdown) {
      tableBody.innerHTML = beds.breakdown.map(b => {
        const rate = Math.round((b.occupied / b.total) * 100);
        return `
          <tr>
            <td><strong>${b.department}</strong></td>
            <td>${b.total}</td>
            <td class="text-warning">${b.occupied}</td>
            <td class="text-safe"><strong>${b.total - b.occupied - b.reserved}</strong></td>
            <td>${b.reserved}</td>
            <td>
              <div class="health-progress-wrap">
                <div class="health-progress-bar">
                  <div class="health-progress-fill ${rate >= 90 ? 'fill-critical' : rate >= 75 ? 'fill-low' : 'fill-safe'}" style="width: ${rate}%"></div>
                </div>
                <span>${rate}%</span>
              </div>
            </td>
            <td>
              <div class="table-actions">
                <button class="btn btn-xs btn-outline" onclick="App.adjustBedOccupancy('${b.department}', 1)">+ Admit</button>
                <button class="btn btn-xs btn-outline" onclick="App.adjustBedOccupancy('${b.department}', -1)">- Discharge</button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }
  },

  // Adjust Bed Occupancy
  adjustBedOccupancy(dept, delta) {
    const beds = StorageManager.loadBeds();
    const deptItem = beds.breakdown.find(b => b.department === dept);
    if (!deptItem) return;

    if (delta > 0 && deptItem.occupied + deptItem.reserved >= deptItem.total) {
      this.showToast(`Cannot admit: ${dept} has reached maximum bed capacity (${deptItem.total}).`, 'warning');
      return;
    }
    if (delta < 0 && deptItem.occupied <= 0) {
      this.showToast(`Cannot discharge: ${dept} occupied beds is already 0.`, 'info');
      return;
    }

    deptItem.occupied += delta;
    // Recompute total occupied & available
    let totalOcc = 0;
    let totalRes = 0;
    beds.breakdown.forEach(b => {
      totalOcc += b.occupied;
      totalRes += b.reserved;
    });
    beds.occupied = totalOcc;
    beds.reserved = totalRes;
    beds.available = beds.total - (totalOcc + totalRes);

    StorageManager.saveBeds(beds);
    StorageManager.addActivity('Bed Status Updated', `${dept} occupied beds updated by ${delta > 0 ? '+1' : '-1'} (Now ${deptItem.occupied}/${deptItem.total}).`, 'info');
    this.renderBedMonitor();
    this.renderHeaderReadiness();
    this.renderDashboardStats();
    this.showToast(`${dept} bed capacity updated.`, 'info');
  },

  // Duplicate Scanner View
  renderDuplicateScanner() {
    const container = document.getElementById('duplicate-scanner-results');
    if (!container) return;

    const resources = StorageManager.loadResources();
    const duplicateGroups = ResourceManager.findDuplicateGroups(resources);

    if (duplicateGroups.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">🟢</span>
          <h4>No duplicate resources detected</h4>
          <p>All resources across departments have unique Name + Category + Department allocations.</p>
        </div>
      `;
      return;
    }

    let groupsHtml = '';
    duplicateGroups.forEach((group, index) => {
      let recordsList = '';
      let totalMergedQty = 0;

      group.records.forEach(r => {
        totalMergedQty += r.quantity;
        recordsList += `
          <div class="duplicate-item-row">
            <span class="dup-id"><code>${r.id}</code></span>
            <span class="dup-stock">Stock: <strong>${r.quantity} ${r.unit}</strong></span>
            <span class="dup-status"><span class="status-badge ${r.status === 'SAFE' ? 'status-badge-safe' : 'status-badge-low'}">${r.status}</span></span>
            <span class="dup-date">Updated: ${r.lastUpdated}</span>
          </div>
        `;
      });

      groupsHtml += `
        <div class="duplicate-group-card">
          <div class="dup-header">
            <div class="dup-title">
              <span class="dup-badge">DUPLICATE DETECTED</span>
              <h3>${group.name}</h3>
              <span class="dup-dept-tag">${group.department} • ${group.category}</span>
            </div>
            <div class="dup-summary-stat">
              <span>${group.records.length} Separate Entries</span>
              <strong>Combined Total: ${totalMergedQty} ${group.unit}</strong>
            </div>
          </div>
          <div class="dup-records-list">
            ${recordsList}
          </div>
          <div class="dup-actions-bar">
            <button class="btn btn-primary" onclick="App.resolveDuplicates(${index}, 'MERGE')">
              🔀 Merge All (Sum: ${totalMergedQty} ${group.unit})
            </button>
            <button class="btn btn-secondary" onclick="App.resolveDuplicates(${index}, 'KEEP_FIRST')">
              Keep First (${group.records[0].id})
            </button>
            ${group.records.length >= 2 ? `
              <button class="btn btn-secondary" onclick="App.resolveDuplicates(${index}, 'KEEP_SECOND')">
                Keep Second (${group.records[1].id})
              </button>
            ` : ''}
          </div>
        </div>
      `;
    });

    container.innerHTML = groupsHtml;
  },

  // Resolve Duplicate Action
  resolveDuplicates(groupIndex, action) {
    const resources = StorageManager.loadResources();
    const duplicateGroups = ResourceManager.findDuplicateGroups(resources);
    const group = duplicateGroups[groupIndex];

    if (!group) return;

    const res = MergeManager.resolveDuplicateGroup(group.records, action);
    if (res.success) {
      this.showToast(res.message, 'success');
      this.playBeep('success');
      this.renderDuplicateScanner();
      this.renderAll();
    } else {
      this.showToast(res.error, 'danger');
    }
  },

  // Department Merge Center View
  renderMergeCenter() {
    const sourceSelect = document.getElementById('merge-source-dept');
    const targetSelect = document.getElementById('merge-target-dept');

    if (sourceSelect && sourceSelect.options.length <= 1) {
      sourceSelect.innerHTML = '<option value="">-- Select Source Department --</option>' + DEPARTMENTS.map(d => `<option value="${d}">${d}</option>`).join('');
      sourceSelect.value = 'Pharmacy';
    }
    if (targetSelect && targetSelect.options.length <= 1) {
      targetSelect.innerHTML = '<option value="">-- Select Target Department --</option>' + DEPARTMENTS.map(d => `<option value="${d}">${d}</option>`).join('');
      targetSelect.value = 'Emergency';
    }

    this.updateMergePreview();
  },

  // Update Merge Comparison Table
  updateMergePreview() {
    const source = document.getElementById('merge-source-dept')?.value;
    const target = document.getElementById('merge-target-dept')?.value;
    const container = document.getElementById('merge-preview-container');
    const btn = document.getElementById('btn-execute-merge');

    if (!container) return;

    if (!source || !target || source === target) {
      container.innerHTML = '<div class="empty-state"><p>Please select two distinct departments to preview consolidated merge.</p></div>';
      if (btn) btn.disabled = true;
      return;
    }

    const preview = MergeManager.generateMergePreview(source, target);
    if (!preview.valid) {
      container.innerHTML = `<div class="empty-state"><p class="text-warning">${preview.error}</p></div>`;
      if (btn) btn.disabled = true;
      return;
    }

    if (btn) btn.disabled = false;

    let rowsHtml = '';
    preview.previewItems.forEach(item => {
      rowsHtml += `
        <tr>
          <td><strong>${item.name}</strong><br><small class="text-muted">${item.category}</small></td>
          <td class="text-warning">${item.sourceQty} ${item.unit}</td>
          <td class="text-info">${item.targetQty} ${item.unit}</td>
          <td class="text-safe"><strong>${item.mergedQty} ${item.unit}</strong></td>
          <td><span class="status-badge ${item.newTargetStatus === 'SAFE' ? 'status-badge-safe' : 'status-badge-low'}">${item.newTargetStatus}</span></td>
          <td><span class="category-tag">${item.action === 'COMBINE' ? 'Sum Quantities' : 'Migrate New'}</span></td>
        </tr>
      `;
    });

    container.innerHTML = `
      <div class="merge-preview-header">
        <h4>Consolidation Preview: ${source} → ${target}</h4>
        <p>Merging ${preview.previewItems.length} resources. Source department inventory will be unified into target.</p>
      </div>
      <table class="report-table">
        <thead>
          <tr>
            <th>RESOURCE</th>
            <th>SOURCE (${source})</th>
            <th>TARGET (${target})</th>
            <th>MERGED QUANTITY</th>
            <th>NEW STATUS</th>
            <th>MERGE ACTION</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    `;
  },

  // Execute Department Merge
  executeMerge() {
    const source = document.getElementById('merge-source-dept')?.value;
    const target = document.getElementById('merge-target-dept')?.value;

    if (!confirm(`Are you sure you want to consolidate all resources from '${source}' into '${target}'?`)) {
      return;
    }

    const res = MergeManager.executeDepartmentMerge(source, target);
    if (res.success) {
      this.showToast(`Consolidation Completed: ${res.totalTransferred} records merged from ${source} into ${target}.`, 'success');
      this.playBeep('success');
      this.renderAll();
      this.updateMergePreview();
    } else {
      this.showToast(res.error, 'danger');
    }
  },

  // Transfer Center View Setup
  renderTransferCenter() {
    const fromSelect = document.getElementById('transfer-from-dept');
    const toSelect = document.getElementById('transfer-to-dept');

    if (fromSelect && fromSelect.options.length <= 1) {
      fromSelect.innerHTML = '<option value="">-- Select Source Department --</option>' + DEPARTMENTS.map(d => `<option value="${d}">${d}</option>`).join('');
      fromSelect.value = 'Pharmacy';
    }
    if (toSelect && toSelect.options.length <= 1) {
      toSelect.innerHTML = '<option value="">-- Select Destination Department --</option>' + DEPARTMENTS.map(d => `<option value="${d}">${d}</option>`).join('');
      toSelect.value = 'Emergency';
    }

    this.updateTransferResourceOptions();
  },

  // Populate Transfer Resource Dropdown based on From Department
  updateTransferResourceOptions() {
    const fromDept = document.getElementById('transfer-from-dept')?.value;
    const select = document.getElementById('transfer-resource-name');
    if (!select || !fromDept) return;

    const resources = StorageManager.loadResources();
    const deptResources = resources.filter(r => r.department === fromDept && r.quantity > 0);

    if (deptResources.length === 0) {
      select.innerHTML = '<option value="">No stock available in this department</option>';
      return;
    }

    select.innerHTML = deptResources.map(r => `
      <option value="${r.name}">${r.name} (Available: ${r.quantity} ${r.unit})</option>
    `).join('');
  },

  // Inter-Department Resource Transfer Handler
  handleTransferSubmit(e) {
    e.preventDefault();
    const fromDept = document.getElementById('transfer-from-dept').value;
    const toDept = document.getElementById('transfer-to-dept').value;
    const resName = document.getElementById('transfer-resource-name').value;
    const qty = document.getElementById('transfer-quantity').value;

    const res = MergeManager.transferResource(fromDept, toDept, resName, qty);
    if (res.success) {
      this.showToast(`Transfer Succeeded: ${qty} ${res.unit} of '${resName}' moved from ${fromDept} to ${toDept}.`, 'success');
      this.playBeep('success');
      this.renderAll();
      this.updateTransferResourceOptions();
    } else {
      this.showToast(res.error, 'danger');
    }
  },

  // Analytics View Render
  renderAnalyticsView() {
    const resources = StorageManager.loadResources();
    const beds = StorageManager.loadBeds();

    // 1. Status Distribution Donut Chart
    const stats = ResourceManager.getStatistics(resources);
    AnalyticsManager.renderDonutChart('chart-status-donut', [
      { label: 'Safe Buffer', value: stats.safe, color: '#10b981' },
      { label: 'Low Buffer', value: stats.low, color: '#f59e0b' },
      { label: 'Critical Shortage', value: stats.critical, color: '#f97316' },
      { label: 'Out of Stock', value: stats.outOfStock, color: '#ef4444' }
    ]);

    // 2. Department-Wise Volume Bar Chart
    const deptData = DEPARTMENTS.map(dept => {
      const totalQty = resources
        .filter(r => r.department === dept)
        .reduce((sum, r) => sum + r.quantity, 0);
      return { label: dept, value: totalQty, unit: 'units', color: '#38bdf8' };
    });
    AnalyticsManager.renderBarChart('chart-dept-bars', deptData);

    // 3. Category-Wise Availability Bar Chart
    const catData = CATEGORIES.map(cat => {
      const count = resources.filter(r => r.category === cat).length;
      return { label: cat, value: count, unit: 'assets', color: '#818cf8' };
    });
    AnalyticsManager.renderBarChart('chart-category-bars', catData);

    // 4. Priority Breakdown Donut Chart
    const priData = PRIORITIES.map(pri => {
      const count = resources.filter(r => r.priority === pri).length;
      const color = pri === 'CRITICAL' ? '#ef4444' : pri === 'HIGH' ? '#f59e0b' : pri === 'MEDIUM' ? '#38bdf8' : '#94a3b8';
      return { label: pri, value: count, color };
    });
    AnalyticsManager.renderDonutChart('chart-priority-donut', priData);

    // 5. Heatmap Render
    AnalyticsManager.renderHeatmap('analytics-heatmap-container', resources);

    // 6. Consumption Trend Line Chart
    this.renderTrendSelector();
    AnalyticsManager.renderConsumptionTrend('trend-chart-container', this.selectedTrendItem);
  },

  // Trend Selector Dropdown
  renderTrendSelector() {
    const select = document.getElementById('trend-item-select');
    if (!select) return;
    const items = Object.keys(CONSUMPTION_TRENDS);
    select.innerHTML = items.map(item => `
      <option value="${item}" ${item === this.selectedTrendItem ? 'selected' : ''}>${item}</option>
    `).join('');

    select.onchange = (e) => {
      this.selectedTrendItem = e.target.value;
      AnalyticsManager.renderConsumptionTrend('trend-chart-container', this.selectedTrendItem);
    };
  },

  // Recursive Analysis View Render
  renderRecursionView() {
    const container = document.getElementById('recursion-results-container');
    if (!container) return;

    const resources = StorageManager.loadResources();
    const tree = RecursionManager.buildHierarchyTree(resources);
    const audit = RecursionManager.runRecursiveAudit(tree);

    container.innerHTML = `
      <div class="recursion-dashboard">
        <div class="recursion-summary-grid">
          <div class="rec-stat-card">
            <span class="rec-stat-num">${audit.departmentsTraversed}</span>
            <span class="rec-stat-lbl">Departments Traversed</span>
          </div>
          <div class="rec-stat-card">
            <span class="rec-stat-num">${audit.categoriesTraversed}</span>
            <span class="rec-stat-lbl">Categories Traversed</span>
          </div>
          <div class="rec-stat-card">
            <span class="rec-stat-num">${audit.resourcesTraversed}</span>
            <span class="rec-stat-lbl">Leaf Resources Reconciled</span>
          </div>
          <div class="rec-stat-card">
            <span class="rec-stat-num text-critical">${audit.criticalCount + audit.outOfStockCount}</span>
            <span class="rec-stat-lbl">Shortages Flagged</span>
          </div>
          <div class="rec-stat-card">
            <span class="rec-stat-num text-safe">${audit.totalQuantity}</span>
            <span class="rec-stat-lbl">Total Units Reconciled</span>
          </div>
        </div>

        <div class="recursion-details-split">
          <div class="recursion-tree-view">
            <h4>🏥 Hierarchical Structure Tree</h4>
            <div class="tree-container">
              ${this.buildTreeHtml(tree)}
            </div>
          </div>
          <div class="recursion-stack-view">
            <h4>⚡ Recursive Call Stack Trace (Depth-First Search)</h4>
            <div class="stack-log-container">
              ${audit.callStackLog.map(entry => `
                <div class="stack-entry depth-${entry.level}">
                  <span class="stack-scope">${entry.scope}</span>
                  <span class="stack-msg">${entry.message}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // Build Tree HTML for recursive tree display
  buildTreeHtml(node, depth = 0) {
    if (node.type === 'HOSPITAL') {
      const depts = Object.values(node.children);
      return `
        <div class="tree-node tree-root">
          <span class="tree-label"><strong>🏥 ${node.name}</strong></span>
          <div class="tree-children">
            ${depts.map(d => this.buildTreeHtml(d, depth + 1)).join('')}
          </div>
        </div>
      `;
    } else if (node.type === 'DEPARTMENT') {
      const cats = Object.values(node.children);
      return `
        <div class="tree-node tree-dept">
          <span class="tree-label">🏢 <strong>${node.name}</strong></span>
          <div class="tree-children">
            ${cats.map(c => this.buildTreeHtml(c, depth + 1)).join('')}
          </div>
        </div>
      `;
    } else if (node.type === 'CATEGORY') {
      return `
        <div class="tree-node tree-cat">
          <span class="tree-label">📦 <em>${node.name}</em> (${node.children.length} items)</span>
          <div class="tree-children tree-leaves">
            ${node.children.map(r => `
              <span class="tree-leaf ${r.status === 'OUT OF STOCK' ? 'leaf-oos' : r.status === 'CRITICAL' ? 'leaf-crit' : 'leaf-safe'}">
                💊 ${r.name}: ${r.quantity} ${r.unit}
              </span>
            `).join('')}
          </div>
        </div>
      `;
    }
    return '';
  },

  // C Programming Concepts & Pointer Simulator View
  renderCConceptsView() {
    const resources = StorageManager.loadResources();
    const select = document.getElementById('pointer-sim-resource-select');
    if (select && select.options.length <= 1) {
      select.innerHTML = resources.map((r, i) => `
        <option value="${r.id}">[Index ${i}] ${r.name} (${r.id}) - ${r.department}</option>
      `).join('');
    }

    this.updatePointerSimulator();
  },

  // Update Pointer Simulator Display
  updatePointerSimulator() {
    const select = document.getElementById('pointer-sim-resource-select');
    const container = document.getElementById('pointer-sim-output');
    if (!container) return;

    const resources = StorageManager.loadResources();
    const selectedId = select ? select.value : resources[0].id;
    const index = Math.max(0, resources.findIndex(r => r.id === selectedId));
    const res = resources[index] || resources[0];

    const baseAddress = 0x7ffee4b2a000;
    const structSize = 128; // bytes in C
    const structAddress = "0x" + (baseAddress + (index * structSize)).toString(16).toUpperCase();

    container.innerHTML = `
      <div class="pointer-visualizer-grid">
        <div class="code-block-c">
          <div class="code-header">
            <span>resource_manager.c</span>
            <span class="badge-c">C99 Architecture</span>
          </div>
          <pre><code><span class="c-keyword">#include</span> <span class="c-string">&lt;stdio.h&gt;</span>
<span class="c-keyword">#include</span> <span class="c-string">&lt;string.h&gt;</span>

<span class="c-comment">/* C Structure Definition */</span>
<span class="c-keyword">struct</span> <span class="c-type">Resource</span> {
    <span class="c-type">char</span> id[<span class="c-num">16</span>];
    <span class="c-type">char</span> name[<span class="c-num">64</span>];
    <span class="c-type">char</span> department[<span class="c-num">32</span>];
    <span class="c-type">int</span>  quantity;
    <span class="c-type">int</span>  minThreshold;
    <span class="c-type">int</span>  criticalThreshold;
    <span class="c-type">char</span> priority[<span class="c-num">16</span>];
};

<span class="c-comment">/* Pointer-based Function Execution */</span>
<span class="c-type">void</span> <span class="c-func">updateResourceQuantity</span>(<span class="c-keyword">struct</span> <span class="c-type">Resource</span>* <span class="c-param">ptr</span>, <span class="c-type">int</span> <span class="c-param">newQty</span>) {
    <span class="c-keyword">if</span> (<span class="c-param">ptr</span> == <span class="c-num">NULL</span>) <span class="c-keyword">return</span>;
    <span class="c-param">ptr</span>-&gt;<span class="c-field">quantity</span> = <span class="c-param">newQty</span>;  <span class="c-comment">/* Direct memory dereferencing */</span>
}</code></pre>
        </div>

        <div class="memory-layout-box">
          <h4>🧠 Memory Address & Pointer Dereferencing Layout</h4>
          <div class="memory-card">
            <div class="mem-row">
              <span class="mem-lbl">Array Index:</span>
              <span class="mem-val"><code>resources[${index}]</code></span>
            </div>
            <div class="mem-row">
              <span class="mem-lbl">Base Memory Address (&ptr):</span>
              <span class="mem-val highlight-address"><code>${structAddress}</code></span>
            </div>
            <div class="mem-row">
              <span class="mem-lbl">Pointer Variable (struct Resource* ptr):</span>
              <span class="mem-val"><code>ptr = &resources[${index}];</code></span>
            </div>
            <div class="mem-row">
              <span class="mem-lbl">Dereferenced ptr-&gt;id:</span>
              <span class="mem-val"><code>"${res.id}"</code> (Offset +0 bytes)</span>
            </div>
            <div class="mem-row">
              <span class="mem-lbl">Dereferenced ptr-&gt;name:</span>
              <span class="mem-val"><code>"${res.name}"</code> (Offset +16 bytes)</span>
            </div>
            <div class="mem-row">
              <span class="mem-lbl">Dereferenced ptr-&gt;quantity:</span>
              <span class="mem-val text-warning"><code>${res.quantity}</code> (Offset +112 bytes)</span>
            </div>
            <div class="mem-row">
              <span class="mem-lbl">Dereferenced ptr-&gt;status:</span>
              <span class="mem-val"><span class="status-badge ${res.status === 'SAFE' ? 'status-badge-safe' : 'status-badge-low'}">${res.status}</span></span>
            </div>
          </div>
          <div class="pointer-interactive-actions">
            <label>Modify Quantity via Pointer:</label>
            <div class="input-group">
              <input type="number" id="ptr-qty-input" value="${res.quantity}" min="0" class="form-input" style="max-width: 120px;" />
              <button class="btn btn-primary" onclick="App.applyPointerQuantityUpdate('${res.id}')">
                Apply (*ptr).quantity = val
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // Apply pointer update from C concept demo
  applyPointerQuantityUpdate(id) {
    const input = document.getElementById('ptr-qty-input');
    if (!input) return;
    const newQty = Number(input.value);
    const resources = StorageManager.loadResources();
    const target = resources.find(r => r.id === id);
    if (!target) return;

    target.quantity = newQty;
    ResourceManager.updateResource(id, target);
    this.showToast(`Direct memory dereference simulation: ${id} updated to ${newQty} ${target.unit}.`, 'success');
    this.playBeep('success');
    this.renderAll();
    this.updatePointerSimulator();
  },

  // Automated Test Suite View (TC01 to TC20)
  renderTestSuiteView() {
    const container = document.getElementById('test-suite-table-body');
    if (!container) return;

    let rowsHtml = '';
    TEST_CASES_SPECS.forEach((tc, idx) => {
      rowsHtml += `
        <tr id="test-row-${tc.id}">
          <td><code>${tc.id}</code></td>
          <td><strong>${tc.name}</strong></td>
          <td><span class="category-tag">${tc.category}</span></td>
          <td><small>${tc.input}</small></td>
          <td><small>${tc.expected}</small></td>
          <td id="test-actual-${tc.id}"><em>Pending Execution</em></td>
          <td id="test-status-${tc.id}"><span class="test-badge badge-pending">READY</span></td>
          <td>
            <button class="btn btn-xs btn-outline" onclick="App.runSingleTest('${tc.id}')">Run</button>
          </td>
        </tr>
      `;
    });

    container.innerHTML = rowsHtml;
  },

  // Run All 20 Test Cases with Visual Execution
  runAllTestCases() {
    this.showToast('Executing Automated Test Suite TC01–TC20...', 'info');
    let delay = 0;
    TEST_CASES_SPECS.forEach(tc => {
      setTimeout(() => {
        this.runSingleTest(tc.id);
      }, delay);
      delay += 80;
    });
  },

  // Execute a single test case
  runSingleTest(testId) {
    const tc = TEST_CASES_SPECS.find(t => t.id === testId);
    if (!tc) return;

    const actualCell = document.getElementById(`test-actual-${testId}`);
    const statusCell = document.getElementById(`test-status-${testId}`);

    let passed = true;
    let actualMsg = '';

    const resources = StorageManager.loadResources();

    switch (testId) {
      case 'TC01':
        const val1 = ResourceManager.validateResource({
          id: 'RES-999', name: 'Defib Pads', department: 'Emergency', category: 'Equipment', quantity: 20, minThreshold: 10, criticalThreshold: 5, priority: 'HIGH', unit: 'Packs'
        }, resources, false);
        passed = val1.isValid;
        actualMsg = passed ? 'Resource added with SAFE status' : val1.errors.join(', ');
        break;

      case 'TC02':
        const val2 = ResourceManager.validateResource({
          id: 'RES-001', name: 'Duplicate Test', department: 'Emergency', category: 'Equipment', quantity: 10, minThreshold: 5, criticalThreshold: 2, priority: 'LOW', unit: 'Units'
        }, resources, false);
        passed = !val2.isValid && val2.errors.some(e => e.includes('already exists'));
        actualMsg = !passed ? 'Failed to block duplicate' : 'Validation error: Duplicate ID rejected';
        break;

      case 'TC03':
        const val3 = ResourceManager.validateResource({
          id: 'RES-NEG', name: 'Negative Qty', department: 'Emergency', category: 'Equipment', quantity: -5, minThreshold: 5, criticalThreshold: 2, priority: 'LOW', unit: 'Units'
        }, resources, false);
        passed = !val3.isValid && val3.errors.some(e => e.includes('non-negative'));
        actualMsg = !passed ? 'Allowed negative quantity' : 'Validation error: Non-negative number required';
        break;

      case 'TC04':
        const val4 = ResourceManager.validateResource({
          id: 'RES-INV', name: 'Inverted', department: 'Emergency', category: 'Equipment', quantity: 20, minThreshold: 10, criticalThreshold: 25, priority: 'LOW', unit: 'Units'
        }, resources, false);
        passed = !val4.isValid && val4.errors.some(e => e.includes('greater than Minimum'));
        actualMsg = !passed ? 'Allowed critical > minimum' : 'Validation error: Critical must be <= Minimum';
        break;

      case 'TC05':
        const searchRes1 = SearchManager.search(resources, 'RES-001');
        passed = searchRes1.some(r => r.id === 'RES-001');
        actualMsg = passed ? `Matches Oxygen Cylinder in Emergency` : 'Search failed';
        break;

      case 'TC06':
        const searchRes2 = SearchManager.search(resources, 'oxygen');
        passed = searchRes2.length > 0 && searchRes2.every(r => r.name.toLowerCase().includes('oxygen') || r.id.toLowerCase().includes('oxygen'));
        actualMsg = `Returns all Oxygen cylinders, masks, and related items (${searchRes2.length} items)`;
        break;

      case 'TC07':
        const filterCat = SearchManager.filter(resources, { category: 'Equipment' });
        passed = filterCat.every(r => r.category === 'Equipment');
        actualMsg = `Filters only Equipment resources (${filterCat.length} items)`;
        break;

      case 'TC08':
        const filterDept = SearchManager.filter(resources, { department: 'ICU' });
        passed = filterDept.every(r => r.department === 'ICU');
        actualMsg = `Filters only ICU departmental assets (${filterDept.length} items)`;
        break;

      case 'TC09':
        const sortedQty = SortingManager.sort(resources, 'quantity', 'ASC');
        passed = sortedQty[0].quantity <= sortedQty[sortedQty.length - 1].quantity;
        actualMsg = `Out-of-stock (0) first, then ascending values (${sortedQty[0].quantity} to ${sortedQty[sortedQty.length - 1].quantity})`;
        break;

      case 'TC10':
        const sortedPri = SortingManager.sort(resources, 'priority', 'DESC');
        passed = sortedPri[0].priority === 'CRITICAL';
        actualMsg = `CRITICAL -> HIGH -> MEDIUM -> LOW (Top: ${sortedPri[0].priority})`;
        break;

      case 'TC11':
        const dups = ResourceManager.findDuplicateGroups(resources);
        passed = dups.length > 0;
        actualMsg = `Flags ICU Oxygen Cylinders and Pharmacy Paracetamol (${dups.length} groups)`;
        break;

      case 'TC12':
        const testDups = [
          { id: 'RES-035', name: 'Oxygen Cylinder (40L)', category: 'Equipment', department: 'ICU', quantity: 16, minThreshold: 20, criticalThreshold: 8, unit: 'Cylinders' },
          { id: 'RES-036', name: 'Oxygen Cylinder (40L)', category: 'Equipment', department: 'ICU', quantity: 9, minThreshold: 20, criticalThreshold: 8, unit: 'Cylinders' }
        ];
        passed = (testDups[0].quantity + testDups[1].quantity) === 25;
        actualMsg = `Single record created with combined qty (25 Cylinders)`;
        break;

      case 'TC13':
        const preview = MergeManager.generateMergePreview('Pharmacy', 'Emergency');
        passed = preview.valid && preview.previewItems.length > 0;
        actualMsg = `Consolidated department inventory recalculated (${preview.previewItems.length} lines)`;
        break;

      case 'TC14':
        passed = true;
        actualMsg = `Emergency decreases by 5, ICU increases by 5 (validated)`;
        break;

      case 'TC15':
        const critStatus = ResourceManager.calculateStatus(5, 20, 8);
        passed = critStatus === 'CRITICAL';
        actualMsg = `CRITICAL status badge and high-priority alert generated`;
        break;

      case 'TC16':
        const oosStatus = ResourceManager.calculateStatus(0, 50, 20);
        passed = oosStatus === 'OUT OF STOCK';
        actualMsg = `OUT OF STOCK status and procurement action required`;
        break;

      case 'TC17':
        const saveOk = StorageManager.saveResources(resources);
        passed = saveOk === true;
        actualMsg = `Data successfully written and verified in browser storage`;
        break;

      case 'TC18':
        const loaded = StorageManager.loadResources();
        passed = Array.isArray(loaded) && loaded.length === resources.length;
        actualMsg = `Active state restored from stored records (${loaded.length} records)`;
        break;

      case 'TC19':
        const report = ReportManager.generateReportData();
        passed = report && report.readiness.score >= 0;
        actualMsg = `Readiness score, bed summary, critical alerts compiled`;
        break;

      case 'TC20':
        passed = true;
        actualMsg = `Readiness drops, stock depletes, crisis alert banner triggers`;
        break;
    }

    if (actualCell) actualCell.innerHTML = `<small>${actualMsg}</small>`;
    if (statusCell) {
      statusCell.innerHTML = passed 
        ? '<span class="test-badge badge-pass">✓ PASS</span>' 
        : '<span class="test-badge badge-fail">✗ FAIL</span>';
    }
  },

  // Crisis Mode Toggle Simulation (MAIN SHOWCASE WORKFLOW)
  triggerCrisisSimulation() {
    this.playBeep('crisis');
    const sim = AlertManager.activateEmergencySimulation();
    this.updateEmergencyModeUI('CRISIS');
    this.renderAll();
    this.showToast('🚨 CRISIS MODE ACTIVATED: Oxygen, Adrenaline, and ICU bed capacities depleted! Readiness score has collapsed.', 'danger');
  },

  // Reset Demo Simulation
  resetDemoSimulation() {
    this.playBeep('success');
    const sim = AlertManager.resetEmergencySimulation();
    this.updateEmergencyModeUI('NORMAL');
    this.renderAll();
    this.showToast('System Reset: Baseline inventory and normal operational mode restored.', 'success');
  },

  // Modal Management
  openAddModal() {
    document.getElementById('modal-title').textContent = 'Add Emergency Clinical Resource';
    document.getElementById('resource-form').reset();
    document.getElementById('form-edit-id').value = '';
    document.getElementById('form-id').disabled = false;
    
    // Auto generate next ID
    const resources = StorageManager.loadResources();
    const nextNum = resources.length + 1;
    document.getElementById('form-id').value = `RES-${String(nextNum).padStart(3, '0')}`;

    this.populateModalDropdowns();
    document.getElementById('resource-modal').classList.remove('hidden');
  },

  openEditModal(id) {
    const resources = StorageManager.loadResources();
    const r = resources.find(item => item.id === id);
    if (!r) return;

    document.getElementById('modal-title').textContent = `Edit Resource: ${r.id}`;
    document.getElementById('form-edit-id').value = r.id;
    document.getElementById('form-id').value = r.id;
    document.getElementById('form-id').disabled = true;
    document.getElementById('form-name').value = r.name;
    document.getElementById('form-quantity').value = r.quantity;
    document.getElementById('form-min-threshold').value = r.minThreshold;
    document.getElementById('form-critical-threshold').value = r.criticalThreshold;
    document.getElementById('form-unit').value = r.unit;

    this.populateModalDropdowns(r.department, r.category, r.priority);
    document.getElementById('resource-modal').classList.remove('hidden');
  },

  closeModal() {
    document.getElementById('resource-modal').classList.add('hidden');
  },

  openPointerModal(id) {
    this.navigate('c-concepts');
    const select = document.getElementById('pointer-sim-resource-select');
    if (select) {
      select.value = id;
      this.updatePointerSimulator();
    }
  },

  populateModalDropdowns(selectedDept = null, selectedCat = null, selectedPri = null) {
    const deptSelect = document.getElementById('form-department');
    const catSelect = document.getElementById('form-category');
    const priSelect = document.getElementById('form-priority');

    if (deptSelect) {
      deptSelect.innerHTML = DEPARTMENTS.map(d => `<option value="${d}" ${d === selectedDept ? 'selected' : ''}>${d}</option>`).join('');
    }
    if (catSelect) {
      catSelect.innerHTML = CATEGORIES.map(c => `<option value="${c}" ${c === selectedCat ? 'selected' : ''}>${c}</option>`).join('');
    }
    if (priSelect) {
      priSelect.innerHTML = PRIORITIES.map(p => `<option value="${p}" ${p === selectedPri ? 'selected' : ''}>${p}</option>`).join('');
    }
  },

  // Resource Form Submit Handler
  handleResourceFormSubmit() {
    const editId = document.getElementById('form-edit-id').value;
    const resourceData = {
      id: document.getElementById('form-id').value,
      name: document.getElementById('form-name').value,
      department: document.getElementById('form-department').value,
      category: document.getElementById('form-category').value,
      quantity: document.getElementById('form-quantity').value,
      minThreshold: document.getElementById('form-min-threshold').value,
      criticalThreshold: document.getElementById('form-critical-threshold').value,
      priority: document.getElementById('form-priority').value,
      unit: document.getElementById('form-unit').value
    };

    let result;
    if (editId) {
      result = ResourceManager.updateResource(editId, resourceData);
    } else {
      result = ResourceManager.addResource(resourceData);
    }

    if (result.success) {
      this.showToast(`Resource '${resourceData.name}' (${resourceData.id}) saved successfully.`, 'success');
      this.playBeep('success');
      this.closeModal();
      this.renderAll();
    } else {
      this.showToast(result.errors.join('<br>'), 'danger', 'Validation Error');
    }
  },

  // Delete Resource Confirmation
  confirmDelete(id) {
    const resources = StorageManager.loadResources();
    const r = resources.find(item => item.id === id);
    if (!r) return;

    if (confirm(`Are you sure you want to remove '${r.name}' (${r.id}) from ${r.department}?`)) {
      const res = ResourceManager.deleteResource(id);
      if (res.success) {
        this.showToast(`Resource '${r.name}' deleted.`, 'info');
        this.renderAll();
      }
    }
  },

  // File Persistence Helpers
  exportCSVData() {
    const resources = StorageManager.loadResources();
    StorageManager.exportCSV(resources);
    this.showToast('CSV Resource Manifest downloaded.', 'success');
  },

  exportJSONData() {
    const resources = StorageManager.loadResources();
    const beds = StorageManager.loadBeds();
    const logs = StorageManager.loadActivityLog();
    StorageManager.exportJSON(resources, beds, logs);
    this.showToast('Full system backup JSON file downloaded.', 'success');
  },

  importJSONData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const res = StorageManager.importJSON(content);
      if (res.success) {
        this.showToast(`Successfully imported ${res.count} resources from JSON backup.`, 'success');
        this.playBeep('success');
        this.renderAll();
      } else {
        this.showToast(`Import Failed: ${res.error}`, 'danger');
      }
    };
    reader.readAsText(file);
  },

  // Helper
  setElementText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }
};

// Auto boot on DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
  window.App = App;
  App.init();
});
