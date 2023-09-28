export const INVARIANT_ERROR = 'Invariant';

export function getParsedInvariantMessage(error: Error): string {
  return error.message.slice(18);
}
