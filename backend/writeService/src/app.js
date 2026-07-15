import express from "express";
import { createShortLinkRouter } from "./routes/shortLinkRoutes.js";

export function createApp(service) {
  const app = express();
  app.use(express.json({ limit: "10kb" }));
  app.use(createShortLinkRouter(service));
  app.use((error, _request, response, _next) => {
    console.error(error);
    response
      .status(error.statusCode ?? 500)
      .json({
        error: error.statusCode ? error.message : "internal server error",
      });
  });
  return app;
}

