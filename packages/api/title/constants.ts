// Prioritize channel ids by language from i.e. Disney Latam, Disney US
const CURATED_CHANNELS = [
  {
    name: "Warner Bros. Pictures",
    ids: ["UCjmJDM5pRKbUlVIzDYYWb6g", "EJEMPLO_2", "EJEMPLO_3"],
  },
] as const;

export const OFFICIAL_SUBTIS_CHANNELS = CURATED_CHANNELS.map((channel) => ({
  ...channel,
  ids: channel.ids.map((id) => id.toLowerCase()),
}));
