import dayjs from "dayjs";
import dayOfYear from "dayjs/plugin/dayOfYear";
import cron from "node-cron";

// db
import { supabase } from "@subtis/db";

// internals
import { indexMoviesByYear } from "./movies";
import { indexNotFoundSubtitles } from "./not-found";
import { saveReleaseGroupsToDb } from "./release-groups";
import { saveSubtitleGroupsToDb } from "./subtitle-groups";
import { indexSeriesByYear } from "./tv-shows";

// setup
dayjs.extend(dayOfYear);

// cron - runs every day at 19:30
cron.schedule("30 19 * * *", async () => {
  const today = dayjs();
  const dayOfYearValue = today.dayOfYear();

  if (dayOfYearValue % 2 === 0) {
    console.log("Indexing movies...");
    await indexMoviesByYear(2024, false);
  } else {
    console.log("Indexing tv shows...");
    await indexSeriesByYear(2024, false);
  }

  console.log("Indexing not found subtiles...");
  await indexNotFoundSubtitles();
});

// update release and subtitle groups
saveReleaseGroupsToDb(supabase);
saveSubtitleGroupsToDb(supabase);
