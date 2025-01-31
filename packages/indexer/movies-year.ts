// db
import { supabase } from "@subtis/db";

// internals
import { indexMoviesByYear } from "./movies";
import { saveReleaseGroupsToDb } from "./release-groups";
import { saveSubtitleGroupsToDb } from "./subtitle-groups";
import { saveTmdbMovieGenresToDb } from "./tmdb";

// testing
indexMoviesByYear({
  year: 2024,
  indexFromPage: 2,
  isDebugging: false,
});

// indexMoviesByYear({
//   year: 2024,
//   indexFromPage: 0,
//   isDebugging: false,
// });

// indexMoviesByYear({
//   year: 2025,
//   indexFromPage: 0,
//   isDebugging: false,
// });

// indexMovieByName({
//   year: 2002,
//   isDebugging: false,
//   name: "Harry Potter and the Chamber of Secrets",
// });

saveReleaseGroupsToDb(supabase);
saveSubtitleGroupsToDb(supabase);
saveTmdbMovieGenresToDb(supabase);
