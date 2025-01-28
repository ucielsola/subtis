export interface RecentTitle {
  id: string;
  title: string;
  year: number;
  type: string;
  poster: string;
  imdb_id: string;
  tmdb_id: number;
}

export type RecentTitlesResponse = RecentTitle[];
