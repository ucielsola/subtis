import cron from "node-cron";

// internals
import { indexNotFoundSubtitles } from "./not-found";

indexNotFoundSubtitles({ ascending: true });

// Run every 15 minutes
cron.schedule("*/15 * * * *", () => {
  indexNotFoundSubtitles({ ascending: true });
});
