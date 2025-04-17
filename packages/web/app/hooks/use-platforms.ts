import { useQuery } from "@tanstack/react-query";

// api
import { titlePlatformsSlugResponseSchema } from "@subtis/api/routers/title/schemas";

// lib
import { apiClient } from "~/lib/api";

export function usePlatforms(slug: string | undefined) {
  return useQuery({
    queryKey: ["title", "platforms", slug],
    queryFn: async () => {
      if (!slug) {
        return null;
      }

      const response = await apiClient.v1.title.streaming[":slug"].$get({
        param: { slug },
      });

      if (!response.ok) {
        return null;
      }

      const streaming = await response.json();
      const parsedStreaming = titlePlatformsSlugResponseSchema.safeParse(streaming);

      if (parsedStreaming.error) {
        return null;
      }

      return parsedStreaming.data;
    },
  });
}
