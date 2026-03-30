import express from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import routes from "./routes";

const app = express();

app.all("/api/auth/*", toNodeHandler(auth));

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", routes);

export default app;
