import express from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import {
  panicRouter,
  issuesRouter,
  disastersRouter,
  campaignsRouter,
  donationsRouter,
  teamsRouter,
  volunteerRouter,
  userRouter,
  adminRouter,
} from "./routes";

const app = express();

app.all("/api/auth/*", toNodeHandler(auth));

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/panic", panicRouter);
app.use("/api/issues", issuesRouter);
app.use("/api/disasters", disastersRouter);
app.use("/api/campaigns", campaignsRouter);
app.use("/api/donations", donationsRouter);
app.use("/api/teams", teamsRouter);
app.use("/api/volunteer", volunteerRouter);
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);

export default app;
