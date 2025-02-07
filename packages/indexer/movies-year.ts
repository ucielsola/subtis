// db
import { supabase } from "@subtis/db";

// internals
import { indexMoviesByYear } from "./movies";
import { saveReleaseGroupsToDb } from "./release-groups";
import { saveSubtitleGroupsToDb } from "./subtitle-groups";
import { saveTmdbMovieGenresToDb } from "./tmdb";

// testing
indexMoviesByYear({
  year: 2023,
  indexFromPage: 0,
  isDebugging: false,
});

saveReleaseGroupsToDb(supabase);
saveSubtitleGroupsToDb(supabase);
saveTmdbMovieGenresToDb(supabase);
