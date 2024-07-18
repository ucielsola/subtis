// Prioritize channel ids by language from i.e. Disney Latam, Disney US
const CURATED_CHANNELS = [
  {
    name: "Warner Bros Pictures", //1)
    ids: ["UCqh7RMx5BPU9k0D3MAVtGQg", "UCu-cVVMn41qUA-pwdEhNqhg", "UCjmJDM5pRKbUlVIzDYYWb6g"], // ARGENTINA - LATAM - MAIN
  },
  {
    name: "Netflix", //2)
    ids: ["UC5ZiUaIJ2b5dYBYGf5iEUrA", "UCWOA1ZGywLbqmigxE4Qlvuw"], //LATAM - MAIN
  },
  {
    name: "Marvel", //3)
    ids: ["UC8LEXZO4hjzVk6wO3G9pJyQ", "UCvC4D8onUfXzvjTOM-dBfEA"], //LATAM - MAIN
  },
  {
    name: "Disney", //4)
    ids: ["UC8huWhDjI8UJK4bqo8BJ9WQ", "UCIrgJInjLS2BhlHOMDW7v0g"], //LATAM - MAIN
  },
  {
    name: "HBO", //5)
    ids: ["UC7Hu5kbXt2F1OWhf1-390vQ", "UCVTQuK2CaWaTgSsoNkn5AiQ"], //LATAM - MAIN 
  },
  {
    name: "Paramount", //6)
    ids: ["UCrRttZIypNTA1Mrfwo745Sg", "UCF9imwPMSGz4Vq1NiTWCC7g"], //Paramount Plus - Paramount Pictures
  },
  {
    name: "Prime video", //7)
    ids: ["UCP7i-E6AYr-UChpNcO0EEag", "UCQJWtTnAHhEG5w4uN0udnUQ"], //LATAM - MAIN
  },
  {
    name: "A24", //8)
    ids: ["UCuPivVjnfNo4mb3Oog_frZg"], //MAIN
  },
  {
    name: "Sony Pictures", //9)
    ids: ["UCIE62zVNUal3RowbhM3H_7Q", "UCz97F7dMxBNOfGYu3rx8aCw"], //ARG - MAIN
  },

  {
    name: "MAX", //10)
    ids: ["UCjq5m8s71qA9ZMfJw0q7Fgw", "UCxixc2BUfEK9jwde1qQc19w"], //LATAM - MAIN
  },
  {
    name: "Universal", //11)
    ids: ["UCq0OueAsdxH6b8nyAspwViw"], //MAIN
  },
  {
    name: "20th Century Studios", //12)
    ids: ["UCZBR7jzRamjhK7FCV9bg-7w", "UC2-BeLxzUBSs0uSrmzWhJuQ"], //LATAM - MAIN
  },
  {
    name: "Illumination", //13)
    ids: ["UCWzHmkceM9FRp0FvbOy_azg", "UCq7OHvWO6Z3u-LztFdrcU-g"], //LATAM - MAIN
  },
  {
    name: "Jaaz Multimedia", //14)
    ids: ["UCeTKpxSeEzmnEE2kIa8ijbw"], //MAIN
  },
  {
    name: "Lionsgate Movies", //15)
    ids: ["UCJ6nMHaJPZvsJ-HmUmj1SeA"], //MAIN
  },
  {
    name: "Rotten Tomatoes TV", //16)
    ids: ["UCi8e0iOVk1fEOogdfu4YgfA"], //MAIN
  },
  {
    name: "Apple TV", //17)
    ids: ["UC1Myj674wRVXB9I4c6Hm5zA"], //MAIN
  },
  {
    name: "IFC Films", //18)
    ids: ["UCOn923UnbV8H9zo_lO6ZCRw"], //MAIN
  },
  
] as const;

export const OFFICIAL_SUBTIS_CHANNELS = CURATED_CHANNELS.map((channel) => ({
  ...channel,
  ids: channel.ids.map((id) => id.toLowerCase()),
}));
