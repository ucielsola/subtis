export function getTitleFileNameWithoutExtension(fileName: string): string {
  return fileName.slice(0, -4);
}
