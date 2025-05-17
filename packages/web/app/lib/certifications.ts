export function getUiCertification(certification: string): string | null {
  const mapping: Record<string, string | null> = {
    G: "ATP",
    PG: "10",
    "PG-13": "13",
    R: "17",
    "NC-17": "18",
    NR: null,
  };
  const result = mapping[certification as keyof typeof mapping] || null;

  if (result === null) {
    return null;
  }

  return result === "ATP" ? result : `${result}+`;
}
