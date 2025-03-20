// db
// import { supabase } from "@subtis/db";

// internals
import { indexMoviesByYear } from "./movies";
// import { saveReleaseGroupsToDb } from "./release-groups";
// import { saveSubtitleGroupsToDb } from "./subtitle-groups";
// import { saveTmdbMovieGenresToDb } from "./tmdb";

// testing
// indexMoviesByYear({
//   year: 2025,
//   isDebugging: false,
//   indexFromPage: 163,
// });

indexMoviesByYear({
  year: 2020,
  isDebugging: false,
  indexFromPage: 0,
});

// saveReleaseGroupsToDb(supabase);
// saveSubtitleGroupsToDb(supabase);
// saveTmdbMovieGenresToDb(supabase);
