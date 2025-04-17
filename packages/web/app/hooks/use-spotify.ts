import { useQuery } from "@tanstack/react-query";

// api
import { titleSpotifySlugResponseSchema } from "@subtis/api/routers/providers/schemas";

// lib
import { apiClient } from "~/lib/api";

export function useSpotify(slug: string | undefined) {
  return useQuery({
    queryKey: ["title", "spotify", slug],
    queryFn: async () => {
      if (!slug) {
        return null;
      }

      const response = await apiClient.v1.providers.spotify.soundtrack[":slug"].$get({
        param: { slug },
      });

      if (!response.ok) {
        return null;
      }

      const soundtrack = await response.json();
      const parsedSoundtrack = titleSpotifySlugResponseSchema.safeParse(soundtrack);

      if (parsedSoundtrack.error) {
        return null;
      }

      return parsedSoundtrack.data;
    },
  });
}
