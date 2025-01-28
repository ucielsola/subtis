import { useQuery } from "@tanstack/react-query";

import { cinemasSchema } from "@subtis/api/shared/cinemas";
// shared external
import { getApiClient } from "@subtis/shared/ui";

export function useCinemas(imdbId: string | undefined) {
  return useQuery({
    queryKey: ["title", "cinemas", imdbId],
    queryFn: async () => {
      if (!imdbId) {
        return null;
      }

      const apiClient = getApiClient({
        apiBaseUrl: "https://api.subt.is",
      });

      const response = await apiClient.v1.title.cinemas[":imdbId"].$get({
        param: { imdbId },
      });

      const cinemas = await response.json();

      if ("message" in cinemas) {
        return null;
      }

      const parsedCinemas = cinemasSchema.safeParse(cinemas);

      if (parsedCinemas.error) {
        return null;
      }

      return parsedCinemas.data;
    },
  });
}
