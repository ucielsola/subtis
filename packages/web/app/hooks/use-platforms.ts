import { useQuery } from "@tanstack/react-query";

// shared
import { streamingSchema } from "@subtis/api/shared/streaming";

// lib
import { apiClient } from "~/lib/api";

export function usePlatforms(imdbId: string | undefined) {
  return useQuery({
    queryKey: ["title", "platforms", imdbId],
    queryFn: async () => {
      if (!imdbId) {
        return null;
      }

      const response = await apiClient.v1.title.streaming[":imdbId"].$get({
        param: { imdbId },
      });

      const streaming = await response.json();

      if ("message" in streaming) {
        return null;
      }

      const parsedStreaming = streamingSchema.safeParse(streaming);

      if (parsedStreaming.error) {
        return null;
      }

      return parsedStreaming.data;
    },
  });
}
