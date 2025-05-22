type Certification = "G" | "PG" | "PG-13" | "R" | "NC-17" | "NR";

export function getUiCertification(certification: string): string | null {
  const mapping: Record<Certification, string> = {
    G: "ATP",
    PG: "10",
    "PG-13": "13",
    R: "17",
    "NC-17": "18",
    NR: "Sin Calificación",
  };

  const result = mapping[certification as Certification];

  return ["G", "NR"].includes(certification) ? result : `${result}+`;
}
