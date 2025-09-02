import { serve } from "@hono/node-server";
import { app } from "./web/App.js";
import "dotenv/config";

const server = serve({ port: 3000, fetch: app.fetch }, (info) => {
  console.log("Running");
});

process.on("SIGINT", () => {
  server.close();
  process.exit(0);
});

process.on("SIGTERM", () => {
  server.close((err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    process.exit(0);
  });
});
