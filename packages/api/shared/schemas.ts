import {
  releaseGroupsRowSchema,
  subtitleGroupsRowSchema,
  subtitlesRowSchema,
  titlesRowSchema,
} from "@subtis/db/schemas";

const releaseGroupSchema = releaseGroupsRowSchema.pick({ release_group_name: true });
const subtitleGroupSchema = subtitleGroupsRowSchema.pick({ subtitle_group_name: true });
const titleSchema = titlesRowSchema.pick({
  title_name: true,
  type: true,
  year: true,
  poster: true,
  backdrop: true,
  logo: true,
});

export const alternativeTitlesSchema = titlesRowSchema.pick({ id: true });

export const subtitleSchema = subtitlesRowSchema
  .pick({
    id: true,
    resolution: true,
    subtitle_link: true,
    queried_times: true,
    current_season: true,
    current_episode: true,
    subtitle_file_name: true,
  })
  .extend({
    title: titleSchema,
    releaseGroup: releaseGroupSchema,
    subtitleGroup: subtitleGroupSchema,
  });

export const subtitleShortenerSchema = subtitlesRowSchema.pick({ subtitle_link: true });

export const subtitlesQuery = `
  id,
  resolution,
  subtitle_link,
  queried_times,
  subtitle_file_name,
  current_season,
  current_episode,
  releaseGroup: ReleaseGroups ( release_group_name ),
  subtitleGroup: SubtitleGroups ( subtitle_group_name ),
  title: Titles ( title_name, type, year, poster, backdrop, logo )
`;
