import { z } from "zod";

import {
  releaseGroupsRowSchema,
  subtitleGroupsRowSchema,
  subtitlesRowSchema,
  titlesRowSchema,
} from "@subtis/db/schemas";

const subtitleGroupSchema = subtitleGroupsRowSchema.pick({ id: true });
const releaseGroupSchema = releaseGroupsRowSchema.pick({ release_group_name: true });
const titleSchema = titlesRowSchema.pick({
  title_name: true,
  type: true,
  year: true,
  poster: true,
  backdrop: true,
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
  subtitleGroup: SubtitleGroups ( id ),
  releaseGroup: ReleaseGroups ( release_group_name ),
  title: Titles ( title_name, type, year, poster, backdrop )
`;

export const youTubeSchema = z.object({
  kind: z.string(),
  etag: z.string(),
  nextPageToken: z.string(),
  regionCode: z.string(),
  pageInfo: z.object({ totalResults: z.number(), resultsPerPage: z.number() }),
  items: z.array(
    z.object({
      kind: z.string(),
      etag: z.string(),
      id: z.object({ kind: z.string(), videoId: z.string().optional() }),
      snippet: z.object({
        publishedAt: z.string(),
        channelId: z.string(),
        title: z.string(),
        description: z.string(),
        thumbnails: z.object({
          default: z.object({
            url: z.string(),
            width: z.number(),
            height: z.number(),
          }),
          medium: z.object({
            url: z.string(),
            width: z.number(),
            height: z.number(),
          }),
          high: z.object({
            url: z.string(),
            width: z.number(),
            height: z.number(),
          }),
        }),
        channelTitle: z.string(),
        liveBroadcastContent: z.string(),
        publishTime: z.string(),
      }),
    }),
  ),
});
