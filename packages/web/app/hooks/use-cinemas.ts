import { useQuery } from "@tanstack/react-query";

// shared
import { titleCinemaSlugResponseSchema } from "@subtis/api/controllers/title/schemas";

// lib
import { apiClient } from "~/lib/api";

export function useCinemas(slug: string | undefined) {
  return useQuery({
    queryKey: ["title", "cinemas", slug],
    queryFn: async () => {
      if (!slug) {
        return null;
      }

      const response = await apiClient.v1.title.cinemas[":slug"].$get({
        param: { slug },
      });

      if (!response.ok) {
        return null;
      }

      const cinemas = await response.json();
      const parsedCinemas = titleCinemaSlugResponseSchema.safeParse(cinemas);

      if (parsedCinemas.error) {
        return null;
      }

      return parsedCinemas.data;
    },
  });
}
