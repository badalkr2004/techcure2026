import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/drizzle";
import { issue, issueType } from "../db/schema";
import { validate } from "../middleware";
import { PanicSchema } from "../lib/schemas";
import { generateId } from "../lib/id";
import { nearbyVolunteers } from "../lib/geo";

const router = Router();

router.post("/", validate(PanicSchema), async (req, res) => {
  try {
    const body = req.validated as typeof PanicSchema._type;

    const [panicType] = await db
      .select()
      .from(issueType)
      .where(eq(issueType.code, "panic"))
      .limit(1);

    let issueTypeId = panicType?.id;
    if (!issueTypeId) {
      const [fallback] = await db
        .select()
        .from(issueType)
        .where(eq(issueType.code, "general"))
        .limit(1);
      issueTypeId = fallback?.id;
    }

    if (!issueTypeId) {
      return res.status(500).json({ error: "Internal server error" });
    }

    const [created] = await db
      .insert(issue)
      .values({
        id: generateId(),
        issueTypeId,
        reporterUserId: null,
        victimPhone: body.victimPhone,
        victimName: body.victimName || null,
        latitude: body.latitude,
        longitude: body.longitude,
        description: body.description || null,
        severity: "critical",
        status: "pending",
        reporterRelation: "self",
        title: "PANIC ALERT",
      })
      .returning();

    const volunteers = await nearbyVolunteers(
      db,
      body.latitude,
      body.longitude,
      20
    );

    return res.status(201).json({
      success: true,
      alertId: created.id,
      nearbyVolunteersCount: volunteers.length,
      status: "pending",
      message: "Panic alert created. Help is on the way.",
    });
  } catch (error) {
    console.error("POST /panic", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const id = req.query.id as string | undefined;
    if (!id) {
      return res.status(400).json({ error: "Not found" });
    }

    const [alert] = await db
      .select()
      .from(issue)
      .where(eq(issue.id, id))
      .limit(1);

    if (!alert) {
      return res.status(404).json({ error: "Not found" });
    }

    return res.json({ alert });
  } catch (error) {
    console.error("GET /panic", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
