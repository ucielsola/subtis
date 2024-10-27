import type { z } from "zod";

// db
import {
  releaseGroupsRowSchema,
  subtitleGroupsRowSchema,
  subtitlesRowSchema,
  titlesRowSchema,
} from "@subtis/db/schemas";

// titles
export const titleSchema = titlesRowSchema.pick({
  id: true,
  imdb_id: true,
  queried_times: true,
  searched_times: true,
  type: true,
  year: true,
  title_name: true,
  poster: true,
  backdrop: true,
});

export const titlesQuery = `
  id,
  imdb_id,
  queried_times,
  searched_times,
  type,
  year,
  poster,
  backdrop,
  title_name
`;

export const alternativeTitlesSchema = titlesRowSchema.pick({ imdb_id: true });

// release groups
export const releaseGroupSchema = releaseGroupsRowSchema.pick({ id: true, release_group_name: true });

// subtitles
export const subtitleGroupSchema = subtitleGroupsRowSchema.pick({ id: true, subtitle_group_name: true });

export const subtitleSchema = subtitlesRowSchema
  .pick({
    id: true,
    bytes: true,
    is_valid: true,
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
    releaseGroup: releaseGroupSchema,
    subtitleGroup: subtitleGroupSchema,
  });

export type SubtisSubtitle = z.infer<typeof subtitleSchema>;

export const subtitleShortenerSchema = subtitlesRowSchema.pick({ subtitle_link: true });

export const subtitlesQuery = `
  id,
  bytes,
  is_valid,
  resolution,
  title_file_name,
  subtitle_link,
  queried_times,
  subtitle_file_name,
  current_season,
  current_episode,
  releaseGroup: ReleaseGroups ( id, release_group_name ),
  subtitleGroup: SubtitleGroups ( id, subtitle_group_name ),
  title: Titles ( ${titlesQuery} )
`;
