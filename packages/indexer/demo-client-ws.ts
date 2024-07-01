import { z } from "zod";

const socket = new WebSocket("ws://localhost:3000");

const detailMessageSchema = z.object({
  total: z.number(),
  message: z.string(),
});

const finalMessageSchema = z.object({
  ok: z.boolean(),
});

const MOCK_INITIAL_MESSAGE = {
  subtitle: {
    bytes: 332,
    titleFileName: "Hit.Man.2023.1080p.WEBRip.1400MB.DD5.1.x264-GalaxyRG.mkv",
  },
};

// message is received
socket.addEventListener("message", (event) => {
  if (typeof event.data !== "string") {
    return;
  }

  const parsedMessage = JSON.parse(event.data);

  const subtitleMessage = detailMessageSchema.safeParse(parsedMessage);

  if (subtitleMessage.success) {
    console.log(`Vamos un ${subtitleMessage.data.total * 100}% completado`);
    console.log(`Detalle: ${subtitleMessage.data.message} \n`);
  }

  const finalMessage = finalMessageSchema.safeParse(parsedMessage);

  if (finalMessage.success) {
    if (finalMessage.data.ok === true) {
      console.log(`Finalizado con éxito: ${finalMessage.data.ok}`);
      console.log(
        `Redireccionando a pagina /${MOCK_INITIAL_MESSAGE.subtitle.bytes}/${MOCK_INITIAL_MESSAGE.subtitle.titleFileName}`,
      );
    }
  }
});

// socket opened
socket.addEventListener("open", (event) => {
  // console.log("\n ~ event:", event.type);
  socket.send(JSON.stringify(MOCK_INITIAL_MESSAGE));
});

// socket closed
socket.addEventListener("close", (event) => {
  // console.log("\n ~ event:", event.type);
  console.log("\n ~ event close in:", event.reason);
});

// error handler
socket.addEventListener("error", (event) => {
  console.log("\n ~ event error in:", event.type);
});
