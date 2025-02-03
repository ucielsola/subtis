import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

// api
import { titleTeaserFileNameResponseSchema } from "@subtis/api/controllers/title/schemas";

// lib
import { apiClient } from "~/lib/api";

export function useTeaser(fileName: string | undefined) {
  return useQuery({
    queryKey: ["title", "teaser", fileName],
    queryFn: async () => {
      if (!fileName) {
        return null;
      }

      const titleTeaserResponse = await apiClient.v1.title.teaser[":fileName"].$get({
        param: { fileName },
      });

      if (!titleTeaserResponse.ok) {
        const titleTeaserData = await titleTeaserResponse.json();
        const titleTeaserError = z.object({ message: z.string() }).safeParse(titleTeaserData);

        if (titleTeaserError.error) {
          throw new Error("Invalid title teaser data");
        }

        return titleTeaserError.data;
      }

      const titleTeaserData = await titleTeaserResponse.json();
      const titleTeaserParsedData = titleTeaserFileNameResponseSchema.safeParse(titleTeaserData);

      if (titleTeaserParsedData.error) {
        throw new Error("Invalid title teaser data");
      }

      return titleTeaserParsedData.data;
    },
  });
}
