export function getCliArguments(): Record<string, string> {
  return process.argv.reduce((accumulator, value, index, array) => {
    if (/--[a-z]/gi.test(value)) {
      return { ...accumulator, [value]: array[index + 1] };
    }

    return accumulator;
  }, {});
}

export function sanitizePath(path: string): string {
  return path.replace(/^(\.\/|\.\.\/)+/, '');
}
