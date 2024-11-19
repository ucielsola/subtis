import { z } from "zod";

// internals
import { indexTitleByFileName } from "./file";

// schemas
const subtitleSchema = z.object({
  subtitle: z.object({
    bytes: z.number(),
    titleFileName: z.string(),
  }),
});

Bun.serve({
  port: process.env.PORT || 3000,
  fetch(req, server) {
    const success = server.upgrade(req);
    if (success) {
      // Bun automatically returns a 101 Switching Protocols if the upgrade succeeds
      return undefined;
    }

    // handle HTTP request normally
    return new Response("Hello world!");
  },
  websocket: {
    async message(ws, message) {
      console.log("\n ~ message ~ message:", message);
      if (typeof message !== "string") {
        ws.close(4000, "Invalid message");
        return;
      }

      const parsedMessage = JSON.parse(message);
      const subtitle = subtitleSchema.safeParse(parsedMessage);

      if (!subtitle.success) {
        ws.close(4000, "Invalid message");
        return;
      }

      const { ok } = await indexTitleByFileName({
        indexedBy: "indexer-websocket",
        websocket: ws,
        bytes: subtitle.data.subtitle.bytes,
        titleFileName: subtitle.data.subtitle.titleFileName,
        isDebugging: false,
        shouldStoreNotFoundSubtitle: false,
        shouldIndexAllTorrents: false,
      });

      ws.send(JSON.stringify({ ok }));

      if (ok === true) {
        ws.close(200, "Subtitle indexed successfully");
      }

      if (ok === false) {
        ws.close(404, "We couldn't find the subtitle for this file");
      }
    },
    // a message is received
    open(_ws) {
      console.log("open");
    },
    // a socket is opened
    close(_ws, code, _message) {
      console.log("\n ~ close ~ code:", code);
    },
    // a socket is closed
    drain(ws) {
      console.log("\n ~ drain ~ ws:", ws);
    }, // the socket is ready to receive more data
  },
});
