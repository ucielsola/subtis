import { useQuery } from "@tanstack/react-query";

// api
import { titleRottenTomatoesSlugResponseSchema } from "@subtis/api/routers/providers/schemas";

// lib
import { apiClient } from "~/lib/api";

export function useRottenTomatoes(slug: string | undefined) {
  return useQuery({
    queryKey: ["title", "rottentomatoes", slug],
    queryFn: async () => {
      if (!slug) {
        return null;
      }

      const response = await apiClient.v1.providers.rottentomatoes[":slug"].$get({
        param: { slug },
      });

      if (!response.ok) {
        return null;
      }

      const rottentomatoes = await response.json();
      const parsedRottenTomatoes = titleRottenTomatoesSlugResponseSchema.safeParse(rottentomatoes);

      if (parsedRottenTomatoes.error) {
        return null;
      }

      return parsedRottenTomatoes.data;
    },
  });
}
