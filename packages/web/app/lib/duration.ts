export function getTotalTime(runtime: number | null): {
  uiText: string;
  totalHours: number | null;
  totalMinutes: number | null;
} {
  if (!runtime) {
    return {
      uiText: "",
      totalHours: null,
      totalMinutes: null,
    };
  }

  const totalMinutes = runtime % 60;
  const totalHours = Math.floor(runtime / 60);

  return {
    totalHours,
    totalMinutes,
    uiText: `${totalHours ? `${totalHours}h ` : ""}${totalMinutes ? `${totalMinutes}m` : ""}`,
  };
}
