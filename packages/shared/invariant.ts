export const INVARIANT_ERROR = 'Invariant';

export function getIsInvariantMessage(error: Error): boolean {
  return !error.message.includes(INVARIANT_ERROR);
}

export function getParsedInvariantMessage(error: Error): string {
  return error.message.slice(18);
}
