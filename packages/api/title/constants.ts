// Prioritize channel ids by language from i.e. Disney Latam, Disney US
const CURATED_CHANNELS = [
  {
    name: "Warner Bros Pictures",
    ids: ["UCqh7RMx5BPU9k0D3MAVtGQg", "UCu-cVVMn41qUA-pwdEhNqhg", "UCjmJDM5pRKbUlVIzDYYWb6g"], // ARGENTINA - LATAM - MAIN
  },
  {
    name: "Netflix",
    ids: ["UC5ZiUaIJ2b5dYBYGf5iEUrA", "UCWOA1ZGywLbqmigxE4Qlvuw"], // LATAM - MAIN
  },
  {
    name: "Marvel",
    ids: ["UC8LEXZO4hjzVk6wO3G9pJyQ", "UCvC4D8onUfXzvjTOM-dBfEA"], // LATAM - MAIN
  },
  {
    name: "Disney",
    ids: ["UC8huWhDjI8UJK4bqo8BJ9WQ", "UCIrgJInjLS2BhlHOMDW7v0g"], // LATAM - MAIN
  },
  {
    name: "HBO",
    ids: ["UC7Hu5kbXt2F1OWhf1-390vQ", "UCVTQuK2CaWaTgSsoNkn5AiQ"], // LATAM - MAIN
  },
  {
    name: "Paramount",
    ids: ["UCrRttZIypNTA1Mrfwo745Sg", "UCF9imwPMSGz4Vq1NiTWCC7g"], // Paramount Plus - Paramount Pictures
  },
  {
    name: "Prime video",
    ids: ["UCP7i-E6AYr-UChpNcO0EEag", "UCQJWtTnAHhEG5w4uN0udnUQ"], // LATAM - MAIN
  },
  {
    name: "A24",
    ids: ["UCuPivVjnfNo4mb3Oog_frZg"], // MAIN
  },
  {
    name: "Sony Pictures",
    ids: ["UCIE62zVNUal3RowbhM3H_7Q", "UCz97F7dMxBNOfGYu3rx8aCw"], // ARG - MAIN
  },
  {
    name: "MAX",
    ids: ["UCjq5m8s71qA9ZMfJw0q7Fgw", "UCxixc2BUfEK9jwde1qQc19w"], // LATAM - MAIN
  },
  {
    name: "Universal",
    ids: ["UCq0OueAsdxH6b8nyAspwViw"], // MAIN
  },
  {
    name: "20th Century Studios",
    ids: ["UCZBR7jzRamjhK7FCV9bg-7w", "UC2-BeLxzUBSs0uSrmzWhJuQ"], // LATAM - MAIN
  },
  {
    name: "Illumination",
    ids: ["UCWzHmkceM9FRp0FvbOy_azg", "UCq7OHvWO6Z3u-LztFdrcU-g"], // LATAM - MAIN
  },
  {
    name: "Jaaz Multimedia",
    ids: ["UCeTKpxSeEzmnEE2kIa8ijbw"], // MAIN
  },
  {
    name: "Lionsgate Movies",
    ids: ["UCJ6nMHaJPZvsJ-HmUmj1SeA"], // MAIN
  },
  {
    name: "Rotten Tomatoes TV",
    ids: ["UCi8e0iOVk1fEOogdfu4YgfA"], // MAIN
  },
  {
    name: "Apple TV",
    ids: ["UC1Myj674wRVXB9I4c6Hm5zA"], // MAIN
  },
  {
    name: "IFC Films",
    ids: ["UCOn923UnbV8H9zo_lO6ZCRw"], // MAIN
  },
  { 
    name: "DiamondFilms",
    ids: ["UCaFEAxeTC-Y_0AFthe0Xmwg"], // LATAM
  },
  
  {
    name: "Neon",
    ids: ["UCpy5dRhZd-JbZP4NsrnLt1w"], // MAIN
  },

] as const;

export const OFFICIAL_SUBTIS_CHANNELS = CURATED_CHANNELS.map((channel) => ({
  ...channel,
  ids: channel.ids.map((id) => id.toLowerCase()),
}));
