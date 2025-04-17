import { useQuery } from "@tanstack/react-query";

// api
import { titleJustWatchSlugResponseSchema } from "@subtis/api/routers/providers/schemas";

// lib
import { apiClient } from "~/lib/api";

export function useJustWatch(slug: string | undefined) {
  return useQuery({
    queryKey: ["title", "justwatch", slug],
    queryFn: async () => {
      if (!slug) {
        return null;
      }

      const response = await apiClient.v1.providers.justwatch[":slug"].$get({
        param: { slug },
      });

      if (!response.ok) {
        return null;
      }

      const justwatchData = await response.json();
      const parsedJustwatch = titleJustWatchSlugResponseSchema.safeParse(justwatchData);

      if (parsedJustwatch.error) {
        return null;
      }

      return parsedJustwatch.data;
    },
  });
}
