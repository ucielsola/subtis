import { OpenPanel } from "@openpanel/web";
import { z } from "zod";

// helpers
function getOpenPanelClientId() {
  return z.string().parse(process.env.OPEN_PANEL_CLIENT_ID);
}

function getOpenPanelClientSecret() {
  return z.string().parse(process.env.OPEN_PANEL_CLIENT_SECRET);
}

export const op = new OpenPanel({
  trackAttributes: true,
  trackScreenViews: true,
  trackOutgoingLinks: true,
  clientId: getOpenPanelClientId(),
  clientSecret: getOpenPanelClientSecret(),
});
