import { z } from "zod";

// db
import {
  publicReleasegroupsRowSchemaSchema,
  publicSubtitlegroupsRowSchemaSchema,
  publicSubtitlesRowSchemaSchema,
  publicTitlesRowSchemaSchema,
} from "@subtis/db/schemas";

// title
export const titleRandomQuery = `
  slug
`;

export const titleRandomSchema = publicTitlesRowSchemaSchema.pick({
  slug: true,
});

export const titleMetadataQuery = `
  id,
  slug,
  imdb_id,
  queried_times,
  searched_times,
  type,
  year,
  youtube_id,
  optimized_logo,
  optimized_poster,
  optimized_backdrop,
  title_name,
  subtitles: Subtitles ( id )
`;

export const titleMetadataSchema = publicTitlesRowSchemaSchema
  .pick({
    slug: true,
    type: true,
    year: true,
    imdb_id: true,
    title_name: true,
    youtube_id: true,
    queried_times: true,
    searched_times: true,
    optimized_logo: true,
    optimized_poster: true,
    optimized_backdrop: true,
  })
  .extend({
    subtitles: z.array(publicSubtitlesRowSchemaSchema.pick({ id: true })),
  });

// titles
export const titleSchema = publicTitlesRowSchemaSchema.pick({
  id: true,
  slug: true,
  imdb_id: true,
  queried_times: true,
  searched_times: true,
  type: true,
  year: true,
  title_name: true,
  optimized_logo: true,
  optimized_poster: true,
  optimized_backdrop: true,
  overview: true,
  runtime: true,
  rating: true,
  poster_thumbhash: true,
  backdrop_thumbhash: true,
  youtube_id: true,
});

export const titlesQuery = `
  id,
  slug,
  imdb_id,
  queried_times,
  searched_times,
  type,
  year,
  optimized_logo,
  optimized_poster,
  optimized_backdrop,
  title_name,
  overview,
  rating,
  runtime,
  poster_thumbhash,
  backdrop_thumbhash,
  youtube_id
`;

// alternative titles
export const alternativeTitlesSchema = publicTitlesRowSchemaSchema.pick({ slug: true });

// release groups
export const releaseGroupSchema = publicReleasegroupsRowSchemaSchema.pick({ id: true, release_group_name: true });

// subtitle groups
export const subtitleGroupSchema = publicSubtitlegroupsRowSchemaSchema.pick({
  id: true,
  website: true,
  subtitle_group_name: true,
});

// subtitles
export const subtitleSchema = publicSubtitlesRowSchemaSchema
  .pick({
    id: true,
    bytes: true,
    is_valid: true,
    rip_type: true,
    resolution: true,
    external_id: true,
    uploaded_by: true,
    subtitle_link: true,
    queried_times: true,
    current_season: true,
    current_episode: true,
    title_file_name: true,
    subtitle_file_name: true,
  })
  .extend({
    title: titleSchema,
    release_group: releaseGroupSchema,
    subtitle_group: subtitleGroupSchema,
  });

export type SubtisSubtitle = z.infer<typeof subtitleSchema>;

export const subtitleShortenerSchema = publicSubtitlesRowSchemaSchema.pick({ subtitle_link: true });

export const subtitlesQuery = `
  id,
  bytes,
  is_valid,
  rip_type,
  external_id,
  resolution,
  title_file_name,
  subtitle_link,
  queried_times,
  uploaded_by,
  subtitle_file_name,
  current_season,
  current_episode,
  release_group: ReleaseGroups ( id, release_group_name ),
  subtitle_group: SubtitleGroups ( id, subtitle_group_name, website ),
  title: Titles ( ${titlesQuery} )
`;
