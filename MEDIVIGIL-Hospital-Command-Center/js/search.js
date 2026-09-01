/**
 * MEDIVIGIL - Intelligent Emergency Resource Command Center
 * Smart Search & Multi-Criteria Filtering Engine
 * Academic C-Mapping: Represents Linear Search (strcasestr / strcmp in arrays of structures) and Binary Search on sorted indices.
 */

const SearchManager = {
  /**
   * Linear search algorithm across multiple attributes
   * Academic Concept: C linear search traversing array struct Resource arr[i] with string comparison
   */
  search(resources, query = '') {
    if (!query || !query.trim()) return resources;
    const term = query.trim().toLowerCase();

    return resources.filter(r => {
      const matchId = (r.id || '').toLowerCase().includes(term);
      const matchName = (r.name || '').toLowerCase().includes(term);
      const matchCategory = (r.category || '').toLowerCase().includes(term);
      const matchDept = (r.department || '').toLowerCase().includes(term);
      const matchPriority = (r.priority || '').toLowerCase().includes(term);
      const matchStatus = (r.status || '').toLowerCase().includes(term);
      const matchUnit = (r.unit || '').toLowerCase().includes(term);

      return matchId || matchName || matchCategory || matchDept || matchPriority || matchStatus || matchUnit;
    });
  },

  /**
   * Combined Filter Engine
   * Applies Query + Department + Category + Status + Priority + Low/Critical Quick Filter simultaneously
   */
  filter(resources, criteria = {}) {
    let results = [...resources];

    // 1. Text Search Query
    if (criteria.query && criteria.query.trim() !== '') {
      results = this.search(results, criteria.query);
    }

    // 2. Department Filter
    if (criteria.department && criteria.department !== 'ALL') {
      results = results.filter(r => r.department === criteria.department);
    }

    // 3. Category Filter
    if (criteria.category && criteria.category !== 'ALL') {
      results = results.filter(r => r.category === criteria.category);
    }

    // 4. Status Filter
    if (criteria.status && criteria.status !== 'ALL') {
      results = results.filter(r => r.status === criteria.status);
    }

    // 5. Priority Filter
    if (criteria.priority && criteria.priority !== 'ALL') {
      results = results.filter(r => r.priority === criteria.priority);
    }

    // 6. Quick Toggle for Shortages (e.g. Critical + Out of Stock)
    if (criteria.onlyShortages) {
      results = results.filter(r => r.status === 'CRITICAL' || r.status === 'OUT OF STOCK');
    }

    return results;
  },

  /**
   * Binary Search Demonstration (Academic Purpose)
   * Searches for a resource by exact ID in a sorted array
   * Academic Concept: int binarySearch(struct Resource arr[], int low, int high, char key[])
   */
  binarySearchById(sortedResources, targetId) {
    const key = targetId.trim().toUpperCase();
    let low = 0;
    let high = sortedResources.length - 1;
    let comparisons = 0;

    while (low <= high) {
      comparisons++;
      const mid = Math.floor((low + high) / 2);
      const midId = sortedResources[mid].id.toUpperCase();

      if (midId === key) {
        return { found: true, index: mid, resource: sortedResources[mid], comparisons };
      } else if (midId < key) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    return { found: false, index: -1, resource: null, comparisons };
  }
};
