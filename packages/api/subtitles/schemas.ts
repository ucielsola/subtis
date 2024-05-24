import { releaseGroupsRowSchema, subtitlesRowSchema, titlesRowSchema } from "@subtis/db/schemas";

const releaseGroupSchema = releaseGroupsRowSchema.pick({ release_group_name: true });
const titleSchema = titlesRowSchema.pick({ title_name: true, type: true, year: true, poster: true, backdrop: true });

export const titlesVersionSchema = titlesRowSchema.pick({ id: true });

export const subtitleSchema = subtitlesRowSchema
  .pick({
    id: true,
    resolution: true,
    subtitle_link: true,
    current_season: true,
    current_episode: true,
    subtitle_file_name: true,
  })
  .extend({
    title: titleSchema,
    releaseGroup: releaseGroupSchema,
  });
