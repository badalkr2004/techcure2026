import { Router } from "express";
import { and, eq, or, desc, inArray, sql } from "drizzle-orm";
import { db } from "../db/drizzle";
import {
  issue,
  issueType,
  issueAssignment,
  volunteerProfile,
} from "../db/schema";
import { requireAuth, validate } from "../middleware";
import { CreateIssueSchema, ResolveIssueSchema } from "../lib/schemas";
import { generateId } from "../lib/id";
import { nearbyVolunteers } from "../lib/geo";
import { auth } from "../lib/auth";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const { status, severity, district } = req.query as {
      status?: string;
      severity?: string;
      district?: string;
    };
    const page = parseInt((req.query.page as string) || "1", 10);
    const limit = parseInt((req.query.limit as string) || "50", 10);
    const offset = (page - 1) * limit;

    const conditions = [] as any[];
    if (status) conditions.push(eq(issue.status, status));
    if (severity) conditions.push(eq(issue.severity, severity));
    if (district) conditions.push(eq(issue.district, district));

    let whereClause: any = undefined;

    if (req.user!.role === "admin") {
      whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    } else if (req.user!.role === "volunteer") {
      const [volunteer] = await db
        .select()
        .from(volunteerProfile)
        .where(eq(volunteerProfile.userId, req.user!.id))
        .limit(1);

      if (!volunteer) {
        return res.status(400).json({ error: "Volunteer profile not found" });
      }

      const assignments = await db
        .select({ issueId: issueAssignment.issueId })
        .from(issueAssignment)
        .where(eq(issueAssignment.volunteerId, volunteer.id));

      const assignedIssueIds = assignments.map((a) => a.issueId);
      const roleFilter = or(
        eq(issue.district, volunteer.district),
        assignedIssueIds.length > 0
          ? inArray(issue.id, assignedIssueIds)
          : sql`false`
      );

      whereClause = conditions.length > 0 ? and(roleFilter, ...conditions) : roleFilter;
    } else {
      conditions.push(eq(issue.reporterUserId, req.user!.id));
      whereClause = and(...conditions);
    }

    const issues = await db
      .select()
      .from(issue)
      .where(whereClause)
      .orderBy(desc(issue.createdAt))
      .limit(limit)
      .offset(offset);

    return res.json({ issues, count: issues.length });
  } catch (error) {
    console.error("GET /issues", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", validate(CreateIssueSchema), async (req, res) => {
  try {
    const body = req.validated as typeof CreateIssueSchema._type;

    const session = await auth.api.getSession({
      headers: req.headers as any,
    });

    const [type] = await db
      .select()
      .from(issueType)
      .where(eq(issueType.code, body.issueTypeCode || "general"))
      .limit(1);

    if (!type) {
      return res.status(400).json({ error: "Invalid issue type" });
    }

    if (type.requiresAuth && !session?.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const [created] = await db
      .insert(issue)
      .values({
        id: generateId(),
        issueTypeId: type.id,
        reporterUserId: session?.user?.id || null,
        victimPhone: body.victimPhone,
        victimName: body.victimName || null,
        victimAge: body.victimAge || null,
        victimGender: body.victimGender || null,
        reporterPhone: body.reporterPhone || null,
        reporterName: body.reporterName || null,
        reporterRelation: body.reporterRelation || "self",
        latitude: body.latitude,
        longitude: body.longitude,
        address: body.address || null,
        district: body.district || null,
        landmark: body.landmark || null,
        title: body.title || null,
        description: body.description || null,
        severity: body.severity || type.defaultSeverity || "medium",
        status: "pending",
        disasterId: body.disasterId || null,
      })
      .returning();

    let nearbyVolunteersNotified = 0;
    if (["high", "critical"].includes(created.severity)) {
      const volunteers = await nearbyVolunteers(
        db,
        created.latitude,
        created.longitude,
        15
      );
      nearbyVolunteersNotified = volunteers.length;
    }

    return res.status(201).json({
      success: true,
      issueId: created.id,
      message: "Issue reported successfully",
      nearbyVolunteersNotified,
      status: "pending",
    });
  } catch (error) {
    console.error("POST /issues", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const [issueRow] = await db
      .select()
      .from(issue)
      .where(eq(issue.id, id))
      .limit(1);

    if (!issueRow) {
      return res.status(404).json({ error: "Not found" });
    }

    const assignments = await db
      .select({
        assignment: issueAssignment,
        volunteer: volunteerProfile,
      })
      .from(issueAssignment)
      .leftJoin(
        volunteerProfile,
        eq(issueAssignment.volunteerId, volunteerProfile.id)
      )
      .where(eq(issueAssignment.issueId, id));

    const formattedAssignments = assignments.map((a) => ({
      ...a.assignment,
      volunteer: a.volunteer
        ? {
            id: a.volunteer.id,
            displayName: a.volunteer.displayName,
            phone: a.volunteer.phone,
            rank: a.volunteer.rank,
          }
        : null,
    }));

    return res.json({ issue: issueRow, assignments: formattedAssignments });
  } catch (error) {
    console.error("GET /issues/:id", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:id/accept", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const [volunteer] = await db
      .select()
      .from(volunteerProfile)
      .where(eq(volunteerProfile.userId, req.user!.id))
      .limit(1);

    if (!volunteer) {
      return res.status(400).json({ error: "Volunteer profile not found" });
    }

    const [issueRow] = await db
      .select()
      .from(issue)
      .where(eq(issue.id, id))
      .limit(1);

    if (!issueRow) {
      return res.status(404).json({ error: "Not found" });
    }

    const [existing] = await db
      .select()
      .from(issueAssignment)
      .where(
        and(
          eq(issueAssignment.issueId, id),
          eq(issueAssignment.volunteerId, volunteer.id)
        )
      )
      .limit(1);

    if (existing) {
      return res.status(400).json({ error: "Already assigned to this issue" });
    }

    const [assignment] = await db
      .insert(issueAssignment)
      .values({
        id: generateId(),
        issueId: id,
        volunteerId: volunteer.id,
        status: "accepted",
        acceptedAt: new Date(),
      })
      .returning();

    await db
      .update(issue)
      .set({
        status: "assigned",
        acknowledgedAt: issueRow.acknowledgedAt || new Date(),
      })
      .where(eq(issue.id, id));

    return res.json({
      success: true,
      message: "Issue accepted",
      assignment,
    });
  } catch (error) {
    console.error("POST /issues/:id/accept", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id/status", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status?: string };

    if (!status || !["en_route", "on_site"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const [volunteer] = await db
      .select()
      .from(volunteerProfile)
      .where(eq(volunteerProfile.userId, req.user!.id))
      .limit(1);

    if (!volunteer) {
      return res.status(400).json({ error: "Volunteer profile not found" });
    }

    const [assignment] = await db
      .select()
      .from(issueAssignment)
      .where(
        and(
          eq(issueAssignment.issueId, id),
          eq(issueAssignment.volunteerId, volunteer.id)
        )
      )
      .limit(1);

    if (!assignment) {
      return res.status(404).json({ error: "Not found" });
    }

    const updates: Record<string, unknown> = { status };
    if (status === "on_site") updates.arrivedAt = new Date();

    await db
      .update(issueAssignment)
      .set(updates)
      .where(eq(issueAssignment.id, assignment.id));

    await db
      .update(issue)
      .set({ status: "in_progress" })
      .where(eq(issue.id, id));

    return res.json({ success: true, message: "Status updated" });
  } catch (error) {
    console.error("PATCH /issues/:id/status", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post(
  "/:id/resolve",
  requireAuth,
  validate(ResolveIssueSchema),
  async (req, res) => {
    try {
      const { id } = req.params;
      const body = req.validated as typeof ResolveIssueSchema._type;

      const [volunteer] = await db
        .select()
        .from(volunteerProfile)
        .where(eq(volunteerProfile.userId, req.user!.id))
        .limit(1);

      if (!volunteer) {
        return res.status(400).json({ error: "Volunteer profile not found" });
      }

      const [assignment] = await db
        .select()
        .from(issueAssignment)
        .where(
          and(
            eq(issueAssignment.issueId, id),
            eq(issueAssignment.volunteerId, volunteer.id)
          )
        )
        .limit(1);

      if (!assignment) {
        return res.status(404).json({ error: "Not found" });
      }

      await db
        .update(issueAssignment)
        .set({
          status: "completed",
          completedAt: new Date(),
          notes: body.resolutionNotes,
          equipmentUsed: body.equipmentUsed || null,
        })
        .where(eq(issueAssignment.id, assignment.id));

      await db
        .update(issue)
        .set({
          status: "resolved",
          resolvedAt: new Date(),
          resolutionNotes: body.resolutionNotes,
        })
        .where(eq(issue.id, id));

      await db
        .update(volunteerProfile)
        .set({
          totalResolves: sql`${volunteerProfile.totalResolves} + 1`,
        })
        .where(eq(volunteerProfile.id, volunteer.id));

      return res.json({
        success: true,
        message: "Issue resolved successfully",
      });
    } catch (error) {
      console.error("POST /issues/:id/resolve", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
