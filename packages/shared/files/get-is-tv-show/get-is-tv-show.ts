export function getIsTvShow(title: string): boolean {
  return /s\d{2}e\d{2}/gi.test(title);
}
