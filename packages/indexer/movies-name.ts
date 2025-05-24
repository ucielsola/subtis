// db
// import { supabase } from "@subtis/db";

// internals
import { indexMovieByName } from "./movies";
// import { saveReleaseGroupsToDb } from "./release-groups";
// import { saveSubtitleGroupsToDb } from "./subtitle-groups";
// import { saveTmdbMovieGenresToDb } from "./tmdb";

// testing
indexMovieByName({
  year: 2007,
  isDebugging: false,
  name: "Next",
});

// saveReleaseGroupsToDb(supabase);
// saveSubtitleGroupsToDb(supabase);
// saveTmdbMovieGenresToDb(supabase);
