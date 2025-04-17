import { useQuery } from "@tanstack/react-query";

// api
import { titleLetterboxdSlugResponseSchema } from "@subtis/api/routers/providers/schemas";

// lib
import { apiClient } from "~/lib/api";

export function useLetterboxd(slug: string | undefined) {
  return useQuery({
    queryKey: ["title", "letterboxd", slug],
    queryFn: async () => {
      if (!slug) {
        return null;
      }

      const response = await apiClient.v1.providers.letterboxd[":slug"].$get({
        param: { slug },
      });

      if (!response.ok) {
        return null;
      }

      const letterboxd = await response.json();
      const parsedLetterboxd = titleLetterboxdSlugResponseSchema.safeParse(letterboxd);

      if (parsedLetterboxd.error) {
        return null;
      }

      return parsedLetterboxd.data;
    },
  });
}
