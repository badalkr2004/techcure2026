import { Router } from "express";
import { and, eq, sql, desc } from "drizzle-orm";
import { db } from "../db/drizzle";
import {
  disaster,
  issue,
  disasterTeamActivation,
  volunteerTeam,
} from "../db/schema";
import { requireAuth, requireRole, validate } from "../middleware";
import {
  CreateDisasterSchema,
  UpdateDisasterSchema,
  ActivateTeamSchema,
} from "../lib/schemas";
import { generateId } from "../lib/id";

const router = Router();

const validDisasterTypes = [
  "flood",
  "earthquake",
  "cyclone",
  "drought",
  "fire",
  "pandemic",
  "other",
];
const validSeverities = ["minor", "moderate", "severe", "catastrophic"];
const validStatuses = ["active", "contained", "resolved"];

router.get("/", async (req, res) => {
  try {
    const { status, disasterType, severity } = req.query as {
      status?: string;
      disasterType?: string;
      severity?: string;
    };

    const conditions: any[] = [];
    if (status && status !== "all") conditions.push(eq(disaster.status, status));
    if (disasterType) conditions.push(eq(disaster.disasterType, disasterType));
    if (severity) conditions.push(eq(disaster.severity, severity));

    const disasters = await db
      .select()
      .from(disaster)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(disaster.startedAt));

    const formatted = disasters.map((d) => ({
      ...d,
      affectedDistricts: d.affectedDistricts
        ? JSON.parse(d.affectedDistricts)
        : [],
    }));

    return res.json({ disasters: formatted, count: formatted.length });
  } catch (error) {
    console.error("GET /disasters", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post(
  "/",
  requireAuth,
  requireRole("admin"),
  validate(CreateDisasterSchema),
  async (req, res) => {
    try {
      const body = req.validated as typeof CreateDisasterSchema._type;

      if (!validDisasterTypes.includes(body.disasterType)) {
        return res.status(400).json({ error: "Invalid disaster type" });
      }
      if (!validSeverities.includes(body.severity)) {
        return res.status(400).json({ error: "Invalid severity" });
      }

      const [created] = await db
        .insert(disaster)
        .values({
          id: generateId(),
          disasterType: body.disasterType,
          title: body.title,
          description: body.description,
          affectedDistricts: JSON.stringify(body.affectedDistricts),
          centerLatitude: body.centerLatitude ?? null,
          centerLongitude: body.centerLongitude ?? null,
          radiusKm: body.radiusKm ?? null,
          severity: body.severity,
          estimatedAffectedPeople: body.estimatedAffectedPeople ?? null,
          responseLevel: body.responseLevel || "local",
          status: "active",
          startedAt: new Date(),
        })
        .returning();

      return res.status(201).json({
        success: true,
        message: "Disaster declared",
        disaster: {
          ...created,
          affectedDistricts: JSON.parse(created.affectedDistricts),
        },
      });
    } catch (error) {
      console.error("POST /disasters", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [data] = await db
      .select()
      .from(disaster)
      .where(eq(disaster.id, id))
      .limit(1);

    if (!data) {
      return res.status(404).json({ error: "Not found" });
    }

    const [issueCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(issue)
      .where(eq(issue.disasterId, id));

    const [teamCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(disasterTeamActivation)
      .where(eq(disasterTeamActivation.disasterId, id));

    return res.json({
      disaster: {
        ...data,
        affectedDistricts: data.affectedDistricts
          ? JSON.parse(data.affectedDistricts)
          : [],
      },
      counts: {
        affectedIssues: Number(issueCount?.count || 0),
        activatedTeams: Number(teamCount?.count || 0),
      },
    });
  } catch (error) {
    console.error("GET /disasters/:id", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch(
  "/:id",
  requireAuth,
  requireRole("admin"),
  validate(UpdateDisasterSchema),
  async (req, res) => {
    try {
      const { id } = req.params;
      const body = req.validated as typeof UpdateDisasterSchema._type;

      if (body.status && !validStatuses.includes(body.status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const updates: Record<string, unknown> = {};
      if (body.disasterType) updates.disasterType = body.disasterType;
      if (body.title) updates.title = body.title;
      if (body.description !== undefined) updates.description = body.description;
      if (body.affectedDistricts)
        updates.affectedDistricts = JSON.stringify(body.affectedDistricts);
      if (body.severity) updates.severity = body.severity;
      if (body.status) updates.status = body.status;
      if (body.responseLevel) updates.responseLevel = body.responseLevel;
      if (body.centerLatitude !== undefined)
        updates.centerLatitude = body.centerLatitude;
      if (body.centerLongitude !== undefined)
        updates.centerLongitude = body.centerLongitude;
      if (body.radiusKm !== undefined) updates.radiusKm = body.radiusKm;
      if (body.estimatedAffectedPeople !== undefined)
        updates.estimatedAffectedPeople = body.estimatedAffectedPeople;
      if (body.status === "contained") {
        updates.containedAt = new Date();
      }
      if (body.status === "resolved") {
        updates.resolvedAt = new Date();
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: "Invalid update payload" });
      }

      const [updated] = await db
        .update(disaster)
        .set(updates)
        .where(eq(disaster.id, id))
        .returning();

      if (!updated) {
        return res.status(404).json({ error: "Not found" });
      }

      return res.json({
        success: true,
        message: "Disaster updated",
        disaster: {
          ...updated,
          affectedDistricts: updated.affectedDistricts
            ? JSON.parse(updated.affectedDistricts)
            : [],
        },
      });
    } catch (error) {
      console.error("PATCH /disasters/:id", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.get("/:id/issues", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, severity } = req.query as {
      status?: string;
      severity?: string;
    };

    const conditions: any[] = [eq(issue.disasterId, id)];
    if (status) conditions.push(eq(issue.status, status));
    if (severity) conditions.push(eq(issue.severity, severity));

    const issues = await db
      .select()
      .from(issue)
      .where(and(...conditions))
      .orderBy(desc(issue.createdAt));

    return res.json({ issues, count: issues.length });
  } catch (error) {
    console.error("GET /disasters/:id/issues", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id/teams", async (req, res) => {
  try {
    const { id } = req.params;

    const activations = await db
      .select({
        activation: disasterTeamActivation,
        team: volunteerTeam,
      })
      .from(disasterTeamActivation)
      .leftJoin(volunteerTeam, eq(disasterTeamActivation.teamId, volunteerTeam.id))
      .where(eq(disasterTeamActivation.disasterId, id));

    const teams = activations.map((a) => ({
      ...a.activation,
      team: a.team,
    }));

    return res.json({ teams, count: teams.length });
  } catch (error) {
    console.error("GET /disasters/:id/teams", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post(
  "/:id/teams",
  requireAuth,
  requireRole("admin"),
  validate(ActivateTeamSchema),
  async (req, res) => {
    try {
      const { id } = req.params;
      const body = req.validated as typeof ActivateTeamSchema._type;

      const [disasterRow] = await db
        .select()
        .from(disaster)
        .where(eq(disaster.id, id))
        .limit(1);

      if (!disasterRow) {
        return res.status(404).json({ error: "Not found" });
      }

      const [team] = await db
        .select()
        .from(volunteerTeam)
        .where(eq(volunteerTeam.id, body.teamId))
        .limit(1);

      if (!team) {
        return res.status(404).json({ error: "Not found" });
      }

      const [existing] = await db
        .select()
        .from(disasterTeamActivation)
        .where(
          and(
            eq(disasterTeamActivation.disasterId, id),
            eq(disasterTeamActivation.teamId, body.teamId)
          )
        )
        .limit(1);

      if (existing) {
        return res
          .status(400)
          .json({ error: "Team already activated for this disaster" });
      }

      const [activation] = await db
        .insert(disasterTeamActivation)
        .values({
          id: generateId(),
          disasterId: id,
          teamId: body.teamId,
          assignedArea: body.assignedArea || null,
          responsibilities: body.responsibilities || null,
          status: "activated",
        })
        .returning();

      return res.status(201).json({
        success: true,
        message: "Team activated",
        activation,
      });
    } catch (error) {
      console.error("POST /disasters/:id/teams", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
