import dayjs from "dayjs";
import dayOfYear from "dayjs/plugin/dayOfYear";
import cron from "node-cron";

// db
// import { supabase } from "@subtis/db";

// internals
import { optimizeTitleTableImages } from "./image-optimizer";
import { indexMoviesByYear } from "./movies";
// import { indexNotFoundSubtitles } from "./not-found";
// import { saveSubtitleGroupsToDb } from "./subtitle-groups";
// import { saveReleaseGroupsToDb } from "./release-groups";
// import { indexSeriesByYear } from "./tv-shows";

// setup
dayjs.extend(dayOfYear);

// cron - runs every day at 19:30
cron.schedule("30 19 * * *", async () => {
  const today = dayjs();
  const dayOfYearValue = today.dayOfYear();
  console.log("\n ~ cron.schedule ~ dayOfYearValue:", dayOfYearValue);

  console.log("Indexing movies...");
  await indexMoviesByYear({
    year: 2024,
    indexFromPage: 52,
    isDebugging: false,
  });

  console.log("Optimizing title table images...");
  await optimizeTitleTableImages();

  // if (dayOfYearValue % 2 === 0) {
  // } else {
  //   console.log("Indexing tv shows...");
  //   await indexSeriesByYear(2024, false);
  // }
});

// update release and subtitle groups
// saveReleaseGroupsToDb(supabase);
// saveSubtitleGroupsToDb(supabase);
