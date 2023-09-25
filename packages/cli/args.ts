export function getCliArguments(processArguments: string[]): Record<string, string> {
  return processArguments.reduce((accumulator, value, index, array) => {
    if (/--[a-z]/gi.test(value)) {
      return { ...accumulator, [value]: array[index + 1] };
    }

    return accumulator;
  }, {});
}

export function getSanitizedPath(path: string): string {
  return path.replace(/^(\.\/|\.\.\/)+/, '');
}
