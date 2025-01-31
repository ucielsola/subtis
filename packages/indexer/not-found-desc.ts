import cron from "node-cron";

// internals
import { indexNotFoundSubtitles } from "./not-found";

indexNotFoundSubtitles({ ascending: false });

// Run every 1 minute
cron.schedule("*/1 * * * *", () => {
  indexNotFoundSubtitles({ ascending: false });
});
