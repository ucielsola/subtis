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
  title_name: true,
  type: true,
  year: true,
  poster: true,
  backdrop: true,
});

export const titlesQuery = `
  id,
  type,
  year,
  poster,
  backdrop,
  title_name
`;

export const alternativeTitlesSchema = titlesRowSchema.pick({ id: true });

// release groups
const releaseGroupSchema = releaseGroupsRowSchema.pick({ id: true, release_group_name: true });

// subtitles
const subtitleGroupSchema = subtitleGroupsRowSchema.pick({ id: true, subtitle_group_name: true });

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
  title: Titles ( id, title_name, type, year, poster, backdrop )
`;
