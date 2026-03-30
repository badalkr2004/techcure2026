import { Router } from "express";
import volunteerRouter from "./volunteer";
import teamsRouter from "./teams";
import panicRouter from "./panic";
import issuesRouter from "./issues";
import disastersRouter from "./disasters";
import campaignsRouter from "./campaigns";
import donationsRouter from "./donations";
import adminRouter from "./admin";

const router = Router();

router.use("/volunteer", volunteerRouter);
router.use("/teams", teamsRouter);
router.use("/panic", panicRouter);
router.use("/issues", issuesRouter);
router.use("/disasters", disastersRouter);
router.use("/campaigns", campaignsRouter);
router.use("/donations", donationsRouter);
router.use("/admin", adminRouter);

export default router;
