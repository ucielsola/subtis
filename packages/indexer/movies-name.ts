// db
import { supabase } from "@subtis/db";

// internals
import { indexMovieByName } from "./movies";
import { saveReleaseGroupsToDb } from "./release-groups";
import { saveSubtitleGroupsToDb } from "./subtitle-groups";
import { saveTmdbMovieGenresToDb } from "./tmdb";

// testing
indexMovieByName({
  year: 2025,
  name: "Flow",
  isDebugging: false,
});

saveReleaseGroupsToDb(supabase);
saveSubtitleGroupsToDb(supabase);
saveTmdbMovieGenresToDb(supabase);
