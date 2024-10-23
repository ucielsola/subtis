export function getResultsWithLength<T>(results: T[]): { results: T[]; total: number } {
  return {
    total: results.length,
    results,
  };
}
