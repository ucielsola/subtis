import cron from "node-cron";

// internals
import { indexNotFoundSubtitles } from "./not-found";

indexNotFoundSubtitles({ ascending: false });

// Run every 3 hours
// cron.schedule("0 */3 * * *", () => {
//   indexNotFoundSubtitles({ ascending: false });
// });
