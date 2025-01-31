import cron from "node-cron";

// internals
import { indexNotFoundSubtitles } from "./not-found";

indexNotFoundSubtitles({ ascending: true });

// Run every 1 minute
cron.schedule("*/1 * * * *", () => {
  indexNotFoundSubtitles({ ascending: true });
});
