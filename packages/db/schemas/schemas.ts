import { z } from "zod";

// internals
import type { Json } from "./../types/types";

export const jsonSchema: z.ZodSchema<Json> = z.lazy(() =>
  z
    .union([z.string(), z.number(), z.boolean(), z.record(z.union([jsonSchema, z.undefined()])), z.array(jsonSchema)])
    .nullable(),
);

export const genresRowSchema = z.object({
  created_at: z.string(),
  genre_id: z.number(),
  id: z.number(),
  name: z.string(),
});

export const genresInsertSchema = z.object({
  created_at: z.string().optional(),
  genre_id: z.number(),
  id: z.number().optional(),
  name: z.string(),
});

export const genresUpdateSchema = z.object({
  created_at: z.string().optional(),
  genre_id: z.number().optional(),
  id: z.number().optional(),
  name: z.string().optional(),
});

export const genresRelationshipsSchema = z.tuple([]);

export const releaseGroupsRowSchema = z.object({
  created_at: z.string(),
  id: z.number(),
  is_supported: z.boolean().nullable(),
  matches: z.array(z.string()),
  release_group_name: z.string(),
});

export const releaseGroupsInsertSchema = z.object({
  created_at: z.string().optional(),
  id: z.number().optional(),
  is_supported: z.boolean().optional().nullable(),
  matches: z.array(z.string()),
  release_group_name: z.string(),
});

export const releaseGroupsUpdateSchema = z.object({
  created_at: z.string().optional(),
  id: z.number().optional(),
  is_supported: z.boolean().optional().nullable(),
  matches: z.array(z.string()).optional(),
  release_group_name: z.string().optional(),
});

export const releaseGroupsRelationshipsSchema = z.tuple([]);

export const subtitleGroupsRowSchema = z.object({
  created_at: z.string(),
  id: z.number(),
  subtitle_group_name: z.string(),
  website: z.string(),
});

export const subtitleGroupsInsertSchema = z.object({
  created_at: z.string().optional(),
  id: z.number().optional(),
  subtitle_group_name: z.string(),
  website: z.string(),
});

export const subtitleGroupsUpdateSchema = z.object({
  created_at: z.string().optional(),
  id: z.number().optional(),
  subtitle_group_name: z.string().optional(),
  website: z.string().optional(),
});

export const subtitleGroupsRelationshipsSchema = z.tuple([]);

export const subtitlesRowSchema = z.object({
  author: z.string().nullable(),
  bytes: z.number(),
  created_at: z.string(),
  current_episode: z.number().nullable(),
  current_season: z.number().nullable(),
  external_id: z.string(),
  file_extension: z.string(),
  id: z.number(),
  is_valid: z.boolean(),
  lang: z.string(),
  last_queried_at: z.string().nullable(),
  queried_times: z.number().nullable(),
  release_group_id: z.number(),
  resolution: z.string(),
  reviewed: z.boolean(),
  rip_type: z.string().nullable(),
  subtitle_file_name: z.string(),
  subtitle_group_id: z.number(),
  subtitle_link: z.string(),
  title_file_name: z.string(),
  title_slug: z.string(),
  torrent_id: z.number(),
  uploaded_by: z.string().nullable(),
});

export const subtitlesInsertSchema = z.object({
  author: z.string().optional().nullable(),
  bytes: z.number(),
  created_at: z.string().optional(),
  current_episode: z.number().optional().nullable(),
  current_season: z.number().optional().nullable(),
  external_id: z.string(),
  file_extension: z.string(),
  id: z.number().optional(),
  is_valid: z.boolean(),
  lang: z.string(),
  last_queried_at: z.string().optional().nullable(),
  queried_times: z.number().optional().nullable(),
  release_group_id: z.number(),
  resolution: z.string(),
  reviewed: z.boolean(),
  rip_type: z.string().optional().nullable(),
  subtitle_file_name: z.string(),
  subtitle_group_id: z.number(),
  subtitle_link: z.string(),
  title_file_name: z.string(),
  title_slug: z.string(),
  torrent_id: z.number(),
  uploaded_by: z.string().optional().nullable(),
});

export const subtitlesUpdateSchema = z.object({
  author: z.string().optional().nullable(),
  bytes: z.number().optional(),
  created_at: z.string().optional(),
  current_episode: z.number().optional().nullable(),
  current_season: z.number().optional().nullable(),
  external_id: z.string().optional(),
  file_extension: z.string().optional(),
  id: z.number().optional(),
  is_valid: z.boolean().optional(),
  lang: z.string().optional(),
  last_queried_at: z.string().optional().nullable(),
  queried_times: z.number().optional().nullable(),
  release_group_id: z.number().optional(),
  resolution: z.string().optional(),
  reviewed: z.boolean().optional(),
  rip_type: z.string().optional().nullable(),
  subtitle_file_name: z.string().optional(),
  subtitle_group_id: z.number().optional(),
  subtitle_link: z.string().optional(),
  title_file_name: z.string().optional(),
  title_slug: z.string().optional(),
  torrent_id: z.number().optional(),
  uploaded_by: z.string().optional().nullable(),
});

export const subtitlesRelationshipsSchema = z.tuple([
  z.object({
    foreignKeyName: z.literal("Subtitles_releaseGroupId_fkey"),
    columns: z.tuple([z.literal("release_group_id")]),
    isOneToOne: z.literal(false),
    referencedRelation: z.literal("ReleaseGroups"),
    referencedColumns: z.tuple([z.literal("id")]),
  }),
  z.object({
    foreignKeyName: z.literal("Subtitles_subtitleGroupId_fkey"),
    columns: z.tuple([z.literal("subtitle_group_id")]),
    isOneToOne: z.literal(false),
    referencedRelation: z.literal("SubtitleGroups"),
    referencedColumns: z.tuple([z.literal("id")]),
  }),
  z.object({
    foreignKeyName: z.literal("Subtitles_title_slug_fkey"),
    columns: z.tuple([z.literal("title_slug")]),
    isOneToOne: z.literal(false),
    referencedRelation: z.literal("Titles"),
    referencedColumns: z.tuple([z.literal("slug")]),
  }),
  z.object({
    foreignKeyName: z.literal("Subtitles_torrent_id_fkey"),
    columns: z.tuple([z.literal("torrent_id")]),
    isOneToOne: z.literal(false),
    referencedRelation: z.literal("Torrents"),
    referencedColumns: z.tuple([z.literal("id")]),
  }),
]);

export const subtitlesNotFoundRowSchema = z.object({
  bytes: z.number(),
  created_at: z.string(),
  email: z.string().nullable(),
  id: z.number(),
  run_times: z.number(),
  title_file_name: z.string(),
});

export const subtitlesNotFoundInsertSchema = z.object({
  bytes: z.number(),
  created_at: z.string().optional(),
  email: z.string().optional().nullable(),
  id: z.number().optional(),
  run_times: z.number().optional(),
  title_file_name: z.string(),
});

export const subtitlesNotFoundUpdateSchema = z.object({
  bytes: z.number().optional(),
  created_at: z.string().optional(),
  email: z.string().optional().nullable(),
  id: z.number().optional(),
  run_times: z.number().optional(),
  title_file_name: z.string().optional(),
});

export const subtitlesNotFoundRelationshipsSchema = z.tuple([]);

export const titleGenresRowSchema = z.object({
  created_at: z.string(),
  genre_id: z.number(),
  id: z.number(),
  title_id: z.number(),
});

export const titleGenresInsertSchema = z.object({
  created_at: z.string().optional(),
  genre_id: z.number(),
  id: z.number().optional(),
  title_id: z.number(),
});

export const titleGenresUpdateSchema = z.object({
  created_at: z.string().optional(),
  genre_id: z.number().optional(),
  id: z.number().optional(),
  title_id: z.number().optional(),
});

export const titleGenresRelationshipsSchema = z.tuple([
  z.object({
    foreignKeyName: z.literal("TitleGenres_genre_id_fkey"),
    columns: z.tuple([z.literal("genre_id")]),
    isOneToOne: z.literal(false),
    referencedRelation: z.literal("Genres"),
    referencedColumns: z.tuple([z.literal("genre_id")]),
  }),
  z.object({
    foreignKeyName: z.literal("TitleGenres_title_id_fkey"),
    columns: z.tuple([z.literal("title_id")]),
    isOneToOne: z.literal(false),
    referencedRelation: z.literal("Titles"),
    referencedColumns: z.tuple([z.literal("id")]),
  }),
]);

export const titlesRowSchema = z.object({
  backdrop: z.string().nullable(),
  backdrop_thumbhash: z.string().nullable(),
  created_at: z.string(),
  id: z.number(),
  imdb_id: z.string(),
  last_queried_at: z.string().nullable(),
  logo: z.string().nullable(),
  optimized_backdrop: z.string().nullable(),
  optimized_logo: z.string().nullable(),
  optimized_poster: z.string().nullable(),
  overview: z.string(),
  poster: z.string().nullable(),
  poster_thumbhash: z.string().nullable(),
  queried_times: z.number().nullable(),
  rating: z.number(),
  release_date: z.string(),
  runtime: z.number().nullable(),
  searched_times: z.number().nullable(),
  slug: z.string(),
  title_name: z.string(),
  title_name_ja: z.string().nullable(),
  title_name_spa: z.string(),
  title_name_without_special_chars: z.string(),
  total_episodes: z.number().nullable(),
  total_seasons: z.number().nullable(),
  type: z.string(),
  year: z.number(),
});

export const titlesInsertSchema = z.object({
  backdrop: z.string().optional().nullable(),
  backdrop_thumbhash: z.string().optional().nullable(),
  created_at: z.string().optional(),
  id: z.number().optional(),
  imdb_id: z.string(),
  last_queried_at: z.string().optional().nullable(),
  logo: z.string().optional().nullable(),
  optimized_backdrop: z.string().optional().nullable(),
  optimized_logo: z.string().optional().nullable(),
  optimized_poster: z.string().optional().nullable(),
  overview: z.string(),
  poster: z.string().optional().nullable(),
  poster_thumbhash: z.string().optional().nullable(),
  queried_times: z.number().optional().nullable(),
  rating: z.number(),
  release_date: z.string(),
  runtime: z.number().optional().nullable(),
  searched_times: z.number().optional().nullable(),
  slug: z.string(),
  title_name: z.string(),
  title_name_ja: z.string().optional().nullable(),
  title_name_spa: z.string(),
  title_name_without_special_chars: z.string(),
  total_episodes: z.number().optional().nullable(),
  total_seasons: z.number().optional().nullable(),
  type: z.string(),
  year: z.number(),
});

export const titlesUpdateSchema = z.object({
  backdrop: z.string().optional().nullable(),
  backdrop_thumbhash: z.string().optional().nullable(),
  created_at: z.string().optional(),
  id: z.number().optional(),
  imdb_id: z.string().optional(),
  last_queried_at: z.string().optional().nullable(),
  logo: z.string().optional().nullable(),
  optimized_backdrop: z.string().optional().nullable(),
  optimized_logo: z.string().optional().nullable(),
  optimized_poster: z.string().optional().nullable(),
  overview: z.string().optional(),
  poster: z.string().optional().nullable(),
  poster_thumbhash: z.string().optional().nullable(),
  queried_times: z.number().optional().nullable(),
  rating: z.number().optional(),
  release_date: z.string().optional(),
  runtime: z.number().optional().nullable(),
  searched_times: z.number().optional().nullable(),
  slug: z.string().optional(),
  title_name: z.string().optional(),
  title_name_ja: z.string().optional().nullable(),
  title_name_spa: z.string().optional(),
  title_name_without_special_chars: z.string().optional(),
  total_episodes: z.number().optional().nullable(),
  total_seasons: z.number().optional().nullable(),
  type: z.string().optional(),
  year: z.number().optional(),
});

export const titlesRelationshipsSchema = z.tuple([]);

export const torrentsRowSchema = z.object({
  created_at: z.string(),
  id: z.number(),
  torrent_bytes: z.number(),
  torrent_link: z.string(),
  torrent_name: z.string(),
  torrent_seeds: z.number(),
  torrent_size: z.string(),
  torrent_tracker: z.string(),
});

export const torrentsInsertSchema = z.object({
  created_at: z.string().optional(),
  id: z.number().optional(),
  torrent_bytes: z.number(),
  torrent_link: z.string(),
  torrent_name: z.string(),
  torrent_seeds: z.number(),
  torrent_size: z.string(),
  torrent_tracker: z.string(),
});

export const torrentsUpdateSchema = z.object({
  created_at: z.string().optional(),
  id: z.number().optional(),
  torrent_bytes: z.number().optional(),
  torrent_link: z.string().optional(),
  torrent_name: z.string().optional(),
  torrent_seeds: z.number().optional(),
  torrent_size: z.string().optional(),
  torrent_tracker: z.string().optional(),
});

export const torrentsRelationshipsSchema = z.tuple([]);
