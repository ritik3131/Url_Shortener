import express from "express";
import shortLinkRoutes from "./routes/shortLinkRoutes.js";
export function createApp() {
  const app = express();
  app.use(shortLinkRoutes);
  app.use((_error, _req, response, _next) =>
    response.status(500).json({ error: "internal server error" }),
  );
  return app;
}
