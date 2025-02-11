// db
// import { supabase } from "@subtis/db";

// internals
import { indexMoviesByYear } from "./movies";
// import { saveReleaseGroupsToDb } from "./release-groups";
// import { saveSubtitleGroupsToDb } from "./subtitle-groups";
// import { saveTmdbMovieGenresToDb } from "./tmdb";

// testing
indexMoviesByYear({
  year: 2024,
  isDebugging: false,
  indexFromPage: 500,
});

// saveReleaseGroupsToDb(supabase);
// saveSubtitleGroupsToDb(supabase);
// saveTmdbMovieGenresToDb(supabase);
