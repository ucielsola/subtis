import { supabase } from "@subtis/db";

import { indexSeriesByYear } from "./app";
import { saveReleaseGroupsToDb } from "./release-groups";
import { saveSubtitleGroupsToDb } from "./subtitle-groups";

// GENERAL
saveReleaseGroupsToDb(supabase);
saveSubtitleGroupsToDb(supabase);

// SERIES
indexSeriesByYear(2024, false);
