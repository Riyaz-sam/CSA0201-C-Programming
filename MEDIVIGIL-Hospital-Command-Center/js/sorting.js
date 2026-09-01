/**
 * MEDIVIGIL - Intelligent Emergency Resource Command Center
 * Sorting Algorithms & Priority Rank Engine
 * Academic C-Mapping: Demonstrates Bubble Sort, Insertion Sort, and Quick Sort algorithms on arrays of structures.
 */

const SortingManager = {
  // Priority Rank Mapping (CRITICAL has highest urgency rank)
  PRIORITY_RANKS: {
    'CRITICAL': 4,
    'HIGH': 3,
    'MEDIUM': 2,
    'LOW': 1
  },

  // Status Urgency Rank
  STATUS_RANKS: {
    'OUT OF STOCK': 4,
    'CRITICAL': 3,
    'LOW': 2,
    'SAFE': 1
  },

  /**
   * Universal Sort Function
   * @param {Array} resources - Array of resource objects
   * @param {string} field - 'quantity' | 'name' | 'priority' | 'department' | 'category' | 'status' | 'healthScore' | 'id'
   * @param {string} direction - 'ASC' | 'DESC'
   */
  sort(resources, field = 'name', direction = 'ASC') {
    const list = [...resources];
    const isAsc = direction.toUpperCase() === 'ASC';

    list.sort((a, b) => {
      let valA, valB;

      switch (field) {
        case 'quantity':
          valA = Number(a.quantity);
          valB = Number(b.quantity);
          return isAsc ? valA - valB : valB - valA;

        case 'priority':
          valA = this.PRIORITY_RANKS[a.priority] || 0;
          valB = this.PRIORITY_RANKS[b.priority] || 0;
          return isAsc ? valA - valB : valB - valA;

        case 'status':
          valA = this.STATUS_RANKS[a.status] || 0;
          valB = this.STATUS_RANKS[b.status] || 0;
          return isAsc ? valA - valB : valB - valA;

        case 'healthScore':
          valA = (a.quantity / (a.minThreshold || 1)) * 100;
          valB = (b.quantity / (b.minThreshold || 1)) * 100;
          return isAsc ? valA - valB : valB - valA;

        case 'id':
          valA = a.id.toUpperCase();
          valB = b.id.toUpperCase();
          return isAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);

        case 'department':
          valA = a.department.toUpperCase();
          valB = b.department.toUpperCase();
          return isAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);

        case 'category':
          valA = a.category.toUpperCase();
          valB = b.category.toUpperCase();
          return isAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);

        case 'name':
        default:
          valA = a.name.toUpperCase();
          valB = b.name.toUpperCase();
          return isAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
    });

    return list;
  },

  /**
   * Academic Demonstration: Bubble Sort implementation in JavaScript mirroring C void bubbleSort(struct Resource arr[], int n)
   */
  bubbleSortByQuantity(resources, ascending = true) {
    const arr = [...resources];
    const n = arr.length;
    let comparisons = 0;
    let swaps = 0;

    for (let i = 0; i < n - 1; i++) {
      let swapped = false;
      for (let j = 0; j < n - i - 1; j++) {
        comparisons++;
        const condition = ascending ? arr[j].quantity > arr[j + 1].quantity : arr[j].quantity < arr[j + 1].quantity;
        if (condition) {
          const temp = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = temp;
          swaps++;
          swapped = true;
        }
      }
      if (!swapped) break;
    }

    return { sorted: arr, comparisons, swaps, algorithm: "Bubble Sort O(N^2)" };
  },

  /**
   * Academic Demonstration: Insertion Sort implementation in JavaScript mirroring C void insertionSort(struct Resource arr[], int n)
   */
  insertionSortByName(resources, ascending = true) {
    const arr = [...resources];
    const n = arr.length;
    let comparisons = 0;
    let shifts = 0;

    for (let i = 1; i < n; i++) {
      const key = arr[i];
      let j = i - 1;

      while (j >= 0) {
        comparisons++;
        const cmp = key.name.localeCompare(arr[j].name);
        const condition = ascending ? cmp < 0 : cmp > 0;
        if (condition) {
          arr[j + 1] = arr[j];
          shifts++;
          j = j - 1;
        } else {
          break;
        }
      }
      arr[j + 1] = key;
    }

    return { sorted: arr, comparisons, shifts, algorithm: "Insertion Sort O(N^2)" };
  }
};
