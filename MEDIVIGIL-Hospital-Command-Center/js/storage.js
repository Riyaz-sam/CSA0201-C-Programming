/**
 * MEDIVIGIL - Intelligent Emergency Resource Command Center
 * Storage & Persistence Manager
 * Academic C-Mapping: Represents file handling using fopen(), fclose(), fread(), fwrite(), fprintf(), fscanf()
 */

const STORAGE_KEYS = {
  RESOURCES: 'MEDIVIGIL_RESOURCES_V1',
  BEDS: 'MEDIVIGIL_BEDS_V1',
  ACTIVITY_LOG: 'MEDIVIGIL_ACTIVITY_LOG_V1',
  EMERGENCY_MODE: 'MEDIVIGIL_EMERGENCY_MODE_V1',
  SESSION: 'MEDIVIGIL_SESSION_V1'
};

const StorageManager = {
  // Load resources from localStorage or initialize with default sample data
  loadResources() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RESOURCES);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse resources from localStorage:', e);
    }
    // Fallback: Clone initial sample resources
    const initial = JSON.parse(JSON.stringify(INITIAL_RESOURCES));
    this.saveResources(initial);
    return initial;
  },

  // Save active resources to localStorage
  saveResources(resources) {
    try {
      localStorage.setItem(STORAGE_KEYS.RESOURCES, JSON.stringify(resources));
      return true;
    } catch (e) {
      console.error('Failed to save resources to localStorage:', e);
      return false;
    }
  },

  // Load Bed Telemetry Data
  loadBeds() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BEDS);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed && typeof parsed.total === 'number') {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse beds from localStorage:', e);
    }
    const initialBeds = JSON.parse(JSON.stringify(INITIAL_BED_DATA));
    this.saveBeds(initialBeds);
    return initialBeds;
  },

  // Save Bed Telemetry Data
  saveBeds(bedData) {
    try {
      localStorage.setItem(STORAGE_KEYS.BEDS, JSON.stringify(bedData));
      return true;
    } catch (e) {
      console.error('Failed to save beds to localStorage:', e);
      return false;
    }
  },

  // Load Activity Logs
  loadActivityLog() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOG);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse activity log:', e);
    }
    const defaultLog = [
      {
        id: 'LOG-001',
        timestamp: new Date(Date.now() - 3600000 * 2).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        action: 'System Initialized',
        details: 'MEDIVIGIL Command Center telemetry activated. 37 baseline assets verified.',
        type: 'info'
      },
      {
        id: 'LOG-002',
        timestamp: new Date(Date.now() - 3600000 * 1.5).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        action: 'Safety Scan Completed',
        details: 'Automated threshold analysis flagged 5 critical items and 2 out-of-stock items.',
        type: 'warning'
      },
      {
        id: 'LOG-003',
        timestamp: new Date(Date.now() - 3600000 * 0.5).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        action: 'Administrator Session',
        details: 'Chief Medical Officer logged in via secure terminal.',
        type: 'success'
      }
    ];
    this.saveActivityLog(defaultLog);
    return defaultLog;
  },

  // Save Activity Logs
  saveActivityLog(logs) {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOG, JSON.stringify(logs.slice(0, 100))); // Keep last 100
      return true;
    } catch (e) {
      console.error('Failed to save activity log:', e);
      return false;
    }
  },

  // Add a new activity entry
  addActivity(action, details, type = 'info') {
    const logs = this.loadActivityLog();
    const newEntry = {
      id: 'LOG-' + Date.now().toString(36).toUpperCase(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      date: new Date().toISOString().split('T')[0],
      action,
      details,
      type
    };
    logs.unshift(newEntry);
    this.saveActivityLog(logs);
    if (window.App && typeof window.App.renderActivityLog === 'function') {
      window.App.renderActivityLog();
    }
    return newEntry;
  },

  // Clear Activity Logs
  clearActivityLog() {
    this.saveActivityLog([]);
  },

  // Emergency Mode persistence
  loadEmergencyMode() {
    return localStorage.getItem(STORAGE_KEYS.EMERGENCY_MODE) || 'NORMAL';
  },

  saveEmergencyMode(mode) {
    localStorage.setItem(STORAGE_KEYS.EMERGENCY_MODE, mode);
  },

  // Export Resources as CSV
  exportCSV(resources) {
    if (!resources || resources.length === 0) return null;
    const headers = ['Resource ID', 'Resource Name', 'Category', 'Department', 'Quantity', 'Min Threshold', 'Critical Threshold', 'Priority', 'Unit', 'Status', 'Health Score %', 'Last Updated'];
    const rows = resources.map(r => {
      const health = Math.round((r.quantity / (r.minThreshold || 1)) * 100);
      return [
        `"${r.id}"`,
        `"${r.name.replace(/"/g, '""')}"`,
        `"${r.category}"`,
        `"${r.department}"`,
        r.quantity,
        r.minThreshold,
        r.criticalThreshold,
        `"${r.priority}"`,
        `"${r.unit}"`,
        `"${r.status}"`,
        health,
        `"${r.lastUpdated}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent([headers.join(','), ...rows].join('\r\n'));
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `MEDIVIGIL_Resource_Manifest_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.addActivity('CSV Export', `Exported ${resources.length} resources to CSV spreadsheet.`, 'info');
    return true;
  },

  // Export Complete System Backup as JSON
  exportJSON(resources, beds, logs) {
    const backup = {
      system: "MEDIVIGIL Intelligent Emergency Resource Command Center",
      exportTimestamp: new Date().toISOString(),
      version: "2.0.0",
      academicMapping: "File Handling / Persistent Storage Simulation",
      data: {
        resources: resources || this.loadResources(),
        beds: beds || this.loadBeds(),
        activityLog: logs || this.loadActivityLog()
      }
    };
    const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', jsonStr);
    link.setAttribute('download', `MEDIVIGIL_Database_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.addActivity('JSON Backup Export', 'Full system state backed up to JSON file.', 'info');
    return true;
  },

  // Import JSON Backup
  importJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.data || !Array.isArray(parsed.data.resources)) {
        throw new Error('Invalid MEDIVIGIL backup schema: Missing resources array.');
      }
      this.saveResources(parsed.data.resources);
      if (parsed.data.beds) this.saveBeds(parsed.data.beds);
      if (parsed.data.activityLog) this.saveActivityLog(parsed.data.activityLog);
      this.addActivity('JSON Backup Restored', `Restored ${parsed.data.resources.length} resources from JSON backup.`, 'success');
      return { success: true, count: parsed.data.resources.length };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // Reset Everything to Baseline Dataset
  resetToDefault() {
    const initialRes = JSON.parse(JSON.stringify(INITIAL_RESOURCES));
    const initialBeds = JSON.parse(JSON.stringify(INITIAL_BED_DATA));
    this.saveResources(initialRes);
    this.saveBeds(initialBeds);
    this.saveEmergencyMode('NORMAL');
    this.addActivity('System Reset', 'All inventory, bed telemetry, and emergency modes reset to initial default baseline.', 'warning');
    return { resources: initialRes, beds: initialBeds };
  }
};
