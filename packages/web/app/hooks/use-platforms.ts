import { useQuery } from "@tanstack/react-query";

import { streamingSchema } from "@subtis/api/shared/streaming";
// shared external
import { getApiClient } from "@subtis/shared/ui";

export function usePlatforms(imdbId: string | undefined) {
  return useQuery({
    queryKey: ["title", "platforms", imdbId],
    queryFn: async () => {
      if (!imdbId) {
        return null;
      }

      const apiClient = getApiClient({
        apiBaseUrl: "https://api.subt.is",
      });

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
