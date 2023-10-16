export function getIsInvariantError(error: Error): boolean {
  const INVARIANT_ERROR = 'Invariant' as const;
  return error.message.includes(INVARIANT_ERROR);
}

export function getParsedInvariantMessage(error: Error): string {
  return error.message.slice(18);
}
