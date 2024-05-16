import { supabase } from "@subtis/db";

import { indexMoviesByYear } from "./app";
import { saveReleaseGroupsToDb } from "./release-groups";
import { saveSubtitleGroupsToDb } from "./subtitle-groups";

// MOVIES
indexMoviesByYear(2023, false);
// indexByMovieTitle("The Batman");

// GENERAL
saveReleaseGroupsToDb(supabase);
saveSubtitleGroupsToDb(supabase);
