import { z } from "zod";

// db
import {
  releaseGroupsRowSchema,
  subtitleGroupsRowSchema,
  subtitlesRowSchema,
  titlesRowSchema,
} from "@subtis/db/schemas";

// title
export const titleMetadataQuery = `
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
  subtitles: Subtitles ( id )
`;

export const titleMetadataSchema = titlesRowSchema
  .pick({
    slug: true,
    type: true,
    year: true,
    imdb_id: true,
    title_name: true,
    queried_times: true,
    searched_times: true,
    optimized_logo: true,
    optimized_poster: true,
    optimized_backdrop: true,
  })
  .extend({
    subtitles: z.array(subtitlesRowSchema.pick({ id: true })),
  });

// titles
export const titleSchema = titlesRowSchema.pick({
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
});

export const titlesQuery = `
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
  backdrop_thumbhash
`;

// alternative titles
export const alternativeTitlesSchema = titlesRowSchema.pick({ slug: true });

// release groups
export const releaseGroupSchema = releaseGroupsRowSchema.pick({ id: true, release_group_name: true });

// subtitle groups
export const subtitleGroupSchema = subtitleGroupsRowSchema.pick({ id: true, subtitle_group_name: true });

// subtitles
export const subtitleSchema = subtitlesRowSchema
  .pick({
    id: true,
    bytes: true,
    is_valid: true,
    rip_type: true,
    resolution: true,
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

export const subtitleShortenerSchema = subtitlesRowSchema.pick({ subtitle_link: true });

export const subtitlesQuery = `
  id,
  bytes,
  is_valid,
  rip_type,
  resolution,
  title_file_name,
  subtitle_link,
  queried_times,
  subtitle_file_name,
  current_season,
  current_episode,
  release_group: ReleaseGroups ( id, release_group_name ),
  subtitle_group: SubtitleGroups ( id, subtitle_group_name ),
  title: Titles ( ${titlesQuery} )
`;
