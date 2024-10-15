import WebSocket from "ws";

// Create a WebSocket connection to the server
// const ws = new WebSocket("https://real-time-indexer.fly.dev"); // Change the port if needed
// const ws = new WebSocket("ws://127.0.0.1:3000"); // Change the port if needed
const ws = new WebSocket("https://socketdex.subt.is"); // Change the port if needed

// When the connection is open, send a test message
ws.on("open", () => {
  console.log("WebSocket connection opened");

  // Constructing a valid message
  const message = {
    subtitle: {
      bytes: 3232,
      titleFileName: "Deadpool.and.Wolverine.2024.2160p.WEB-DL.DDP5.1.Atmos.DV.HDR.H.265-FLUX.mkv",
    },
  };

  // Sending the message
  ws.send(JSON.stringify(message));
  console.log("Message sent to server");
});

// When a message is received from the server
ws.on("message", (data) => {
  console.log(`Message from server: ${data}`);
});

// When the WebSocket connection is closed
ws.on("close", (code, reason) => {
  console.log(`WebSocket closed with code: ${code}, reason: ${reason}`);
});

// If there's an error with the WebSocket connection
ws.on("error", (error) => {
  console.error(`WebSocket error: ${error.message}`);
});
