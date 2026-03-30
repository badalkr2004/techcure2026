import { Router } from "express";
import { and, count, desc, eq, sum } from "drizzle-orm";
import { db } from "../db/drizzle";
import {
  campaign,
  disaster,
  donation,
  issue,
  issueAssignment,
  notification,
  session,
  user as userTable,
  userProfile,
  volunteerProfile,
} from "../db/schema";
import { requireAuth, requireRole, validate } from "../middleware";
import {
  RejectCampaignSchema,
  SendNotificationSchema,
  UpdateUserRoleSchema,
  UpdateVolunteerRankSchema,
} from "../lib/schemas";
import { generateId } from "../lib/id";

const router = Router();

router.use(requireAuth, requireRole("admin"));

function toRupees(paisa: number) {
  return Math.round(paisa) / 100;
}

router.get("/users", async (req, res) => {
  try {
    const { role } = req.query as { role?: string };
    const page = parseInt((req.query.page as string) || "1", 10);
    const limitRaw = parseInt((req.query.limit as string) || "20", 10);
    const limit = Math.min(Math.max(limitRaw, 1), 100);
    const offset = (page - 1) * limit;

    const conditions: any[] = [];
    if (role) conditions.push(eq(userTable.role, role));

    const users = await db
      .select({
        id: userTable.id,
        name: userTable.name,
        email: userTable.email,
        role: userTable.role,
        emailVerified: userTable.emailVerified,
        createdAt: userTable.createdAt,
      })
      .from(userTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(userTable.createdAt))
      .limit(limit)
      .offset(offset);

    return res.json({ users, count: users.length });
  } catch (error) {
    console.error("GET /admin/users", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [row] = await db
      .select({
        user: userTable,
        userProfile,
        volunteerProfile,
      })
      .from(userTable)
      .leftJoin(userProfile, eq(userProfile.userId, userTable.id))
      .leftJoin(volunteerProfile, eq(volunteerProfile.userId, userTable.id))
      .where(eq(userTable.id, id))
      .limit(1);

    if (!row) {
      return res.status(404).json({ error: "Not found" });
    }

    return res.json({
      user: row.user,
      userProfile: row.userProfile || null,
      volunteerProfile: row.volunteerProfile || null,
    });
  } catch (error) {
    console.error("GET /admin/users/:id", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch(
  "/users/:id/role",
  validate(UpdateUserRoleSchema),
  async (req, res) => {
    try {
      const { id } = req.params;
      const body = req.validated as typeof UpdateUserRoleSchema._type;

      if (req.user!.id === id) {
        return res.status(400).json({ error: "Cannot change your own role" });
      }

      const [existing] = await db
        .select()
        .from(userTable)
        .where(eq(userTable.id, id))
        .limit(1);

      if (!existing) {
        return res.status(404).json({ error: "Not found" });
      }

      const [updated] = await db
        .update(userTable)
        .set({ role: body.role })
        .where(eq(userTable.id, id))
        .returning();

      return res.json({
        success: true,
        message: "Role updated",
        user: updated,
      });
    } catch (error) {
      console.error("PATCH /admin/users/:id/role", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db
      .select()
      .from(userTable)
      .where(eq(userTable.id, id))
      .limit(1);

    if (!existing) {
      return res.status(404).json({ error: "Not found" });
    }

    await db.update(userTable).set({ role: "user" }).where(eq(userTable.id, id));
    await db.delete(session).where(eq(session.userId, id));
    console.log(`Deactivated user ${id}`);

    return res.json({ success: true, message: "User deactivated" });
  } catch (error) {
    console.error("DELETE /admin/users/:id", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/campaigns", async (req, res) => {
  try {
    const { status, category } = req.query as {
      status?: string;
      category?: string;
    };
    const page = parseInt((req.query.page as string) || "1", 10);
    const limitRaw = parseInt((req.query.limit as string) || "20", 10);
    const limit = Math.min(Math.max(limitRaw, 1), 100);
    const offset = (page - 1) * limit;

    const conditions: any[] = [];
    if (status) conditions.push(eq(campaign.status, status));
    if (category) conditions.push(eq(campaign.category, category));

    const rows = await db
      .select({
        campaign,
        creator: userTable,
      })
      .from(campaign)
      .leftJoin(userTable, eq(campaign.organizerId, userTable.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(campaign.createdAt))
      .limit(limit)
      .offset(offset);

    const campaigns = rows.map((row) => ({
      ...row.campaign,
      goalAmount: toRupees(row.campaign.goalAmount),
      raisedAmount: toRupees(row.campaign.raisedAmount),
      creatorName: row.creator?.name || null,
    }));

    return res.json({ campaigns, count: campaigns.length });
  } catch (error) {
    console.error("GET /admin/campaigns", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/campaigns/:id/approve", async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db
      .select()
      .from(campaign)
      .where(eq(campaign.id, id))
      .limit(1);

    if (!existing) {
      return res.status(404).json({ error: "Not found" });
    }

    if (existing.status !== "pending_approval") {
      return res.status(400).json({ error: "Campaign is not pending approval" });
    }

    const [updated] = await db
      .update(campaign)
      .set({
        status: "active",
        isVerified: true,
      })
      .where(eq(campaign.id, id))
      .returning();

    return res.json({
      success: true,
      message: "Campaign approved and activated",
      campaign: {
        ...updated,
        goalAmount: toRupees(updated.goalAmount),
        raisedAmount: toRupees(updated.raisedAmount),
      },
    });
  } catch (error) {
    console.error("PATCH /admin/campaigns/:id/approve", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch(
  "/campaigns/:id/reject",
  validate(RejectCampaignSchema),
  async (req, res) => {
    try {
      const { id } = req.params;
      const body = req.validated as typeof RejectCampaignSchema._type;

      const [existing] = await db
        .select()
        .from(campaign)
        .where(eq(campaign.id, id))
        .limit(1);

      if (!existing) {
        return res.status(404).json({ error: "Not found" });
      }

      if (existing.status !== "pending_approval") {
        return res.status(400).json({ error: "Campaign is not pending approval" });
      }

      await db
        .update(campaign)
        .set({ status: "cancelled" })
        .where(eq(campaign.id, id));

      return res.json({
        success: true,
        message: "Campaign rejected",
        reason: body.reason,
      });
    } catch (error) {
      console.error("PATCH /admin/campaigns/:id/reject", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.get("/issues", async (req, res) => {
  try {
    const { status, severity, district } = req.query as {
      status?: string;
      severity?: string;
      district?: string;
    };
    const page = parseInt((req.query.page as string) || "1", 10);
    const limitRaw = parseInt((req.query.limit as string) || "50", 10);
    const limit = Math.min(Math.max(limitRaw, 1), 100);
    const offset = (page - 1) * limit;

    const conditions: any[] = [];
    if (status) conditions.push(eq(issue.status, status));
    if (severity) conditions.push(eq(issue.severity, severity));
    if (district) conditions.push(eq(issue.district, district));

    const rows = await db
      .select({
        issue,
        assigneeCount: count(issueAssignment.id),
      })
      .from(issue)
      .leftJoin(issueAssignment, eq(issueAssignment.issueId, issue.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(issue.id)
      .orderBy(desc(issue.createdAt))
      .limit(limit)
      .offset(offset);

    const issues = rows.map((row) => ({
      ...row.issue,
      assigneeCount: Number(row.assigneeCount ?? 0),
    }));

    return res.json({ issues, count: issues.length });
  } catch (error) {
    console.error("GET /admin/issues", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/issues/:id/escalate", async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db
      .select()
      .from(issue)
      .where(eq(issue.id, id))
      .limit(1);

    if (!existing) {
      return res.status(404).json({ error: "Not found" });
    }

    if (existing.status === "resolved") {
      return res.status(400).json({ error: "Cannot escalate resolved issue" });
    }

    await db.update(issue).set({ status: "escalated" }).where(eq(issue.id, id));

    return res.json({ success: true, message: "Issue escalated" });
  } catch (error) {
    console.error("PATCH /admin/issues/:id/escalate", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/volunteers", async (req, res) => {
  try {
    const { rank, district } = req.query as {
      rank?: string;
      district?: string;
    };
    const isVerifiedParam = req.query.isVerified as string | undefined;
    const page = parseInt((req.query.page as string) || "1", 10);
    const limitRaw = parseInt((req.query.limit as string) || "20", 10);
    const limit = Math.min(Math.max(limitRaw, 1), 100);
    const offset = (page - 1) * limit;

    const conditions: any[] = [];
    if (rank) conditions.push(eq(volunteerProfile.rank, rank));
    if (district) conditions.push(eq(volunteerProfile.district, district));
    if (isVerifiedParam === "true" || isVerifiedParam === "false") {
      conditions.push(eq(volunteerProfile.isVerified, isVerifiedParam === "true"));
    }

    const rows = await db
      .select({
        volunteer: volunteerProfile,
        user: userTable,
      })
      .from(volunteerProfile)
      .leftJoin(userTable, eq(volunteerProfile.userId, userTable.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(volunteerProfile.createdAt))
      .limit(limit)
      .offset(offset);

    const volunteers = rows.map((row) => ({
      ...row.volunteer,
      user: row.user
        ? {
            id: row.user.id,
            name: row.user.name,
            email: row.user.email,
          }
        : null,
    }));

    return res.json({ volunteers, count: volunteers.length });
  } catch (error) {
    console.error("GET /admin/volunteers", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/volunteers/:id/verify", async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db
      .select()
      .from(volunteerProfile)
      .where(eq(volunteerProfile.id, id))
      .limit(1);

    if (!existing) {
      return res.status(404).json({ error: "Not found" });
    }

    const [updated] = await db
      .update(volunteerProfile)
      .set({ isVerified: true, verifiedAt: new Date() })
      .where(eq(volunteerProfile.id, id))
      .returning();

    return res.json({
      success: true,
      message: "Volunteer verified",
      volunteer: updated,
    });
  } catch (error) {
    console.error("PATCH /admin/volunteers/:id/verify", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch(
  "/volunteers/:id/rank",
  validate(UpdateVolunteerRankSchema),
  async (req, res) => {
    try {
      const { id } = req.params;
      const body = req.validated as typeof UpdateVolunteerRankSchema._type;

      const [existing] = await db
        .select()
        .from(volunteerProfile)
        .where(eq(volunteerProfile.id, id))
        .limit(1);

      if (!existing) {
        return res.status(404).json({ error: "Not found" });
      }

      const [updated] = await db
        .update(volunteerProfile)
        .set({ rank: body.rank })
        .where(eq(volunteerProfile.id, id))
        .returning();

      return res.json({
        success: true,
        message: "Volunteer rank updated",
        volunteer: updated,
      });
    } catch (error) {
      console.error("PATCH /admin/volunteers/:id/rank", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.post(
  "/notifications",
  validate(SendNotificationSchema),
  async (req, res) => {
    try {
      const body = req.validated as typeof SendNotificationSchema._type;

      let recipientIds: string[] = [];

      if (body.userId) {
        const [target] = await db
          .select({ id: userTable.id })
          .from(userTable)
          .where(eq(userTable.id, body.userId))
          .limit(1);
        if (!target) {
          return res.status(404).json({ error: "Not found" });
        }
        recipientIds = [target.id];
      } else if (body.targetRole === "all") {
        const users = await db
          .select({ id: userTable.id })
          .from(userTable);
        recipientIds = users.map((u) => u.id);
      } else {
        const users = await db
          .select({ id: userTable.id })
          .from(userTable)
          .where(eq(userTable.role, body.targetRole));
        recipientIds = users.map((u) => u.id);
      }

      if (recipientIds.length > 0) {
        await db.insert(notification).values(
          recipientIds.map((userId) => ({
            id: generateId(),
            userId,
            type: "admin_notification",
            title: body.title,
            body: body.message,
          }))
        );
      }

      return res.status(201).json({
        success: true,
        message: "Notification sent",
        recipientCount: recipientIds.length,
      });
    } catch (error) {
      console.error("POST /admin/notifications", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.get("/stats", async (req, res) => {
  try {
    const [
      usersTotalRows,
      usersVolunteerRows,
      usersAdminRows,
      issuesTotalRows,
      issuesPendingRows,
      issuesInProgressRows,
      issuesResolvedRows,
      disastersTotalRows,
      disastersActiveRows,
      disastersContainedRows,
      disastersResolvedRows,
      campaignsTotalRows,
      campaignsActiveRows,
      campaignsPendingRows,
      campaignsRaisedRows,
      donationsTotalRows,
      donationsAmountRows,
      volunteersTotalRows,
      volunteersVerifiedRows,
      volunteersAvailableRows,
    ] = await Promise.all([
      db.select({ count: count() }).from(userTable),
      db
        .select({ count: count() })
        .from(userTable)
        .where(eq(userTable.role, "volunteer")),
      db
        .select({ count: count() })
        .from(userTable)
        .where(eq(userTable.role, "admin")),
      db.select({ count: count() }).from(issue),
      db
        .select({ count: count() })
        .from(issue)
        .where(eq(issue.status, "pending")),
      db
        .select({ count: count() })
        .from(issue)
        .where(eq(issue.status, "in_progress")),
      db
        .select({ count: count() })
        .from(issue)
        .where(eq(issue.status, "resolved")),
      db.select({ count: count() }).from(disaster),
      db
        .select({ count: count() })
        .from(disaster)
        .where(eq(disaster.status, "active")),
      db
        .select({ count: count() })
        .from(disaster)
        .where(eq(disaster.status, "contained")),
      db
        .select({ count: count() })
        .from(disaster)
        .where(eq(disaster.status, "resolved")),
      db.select({ count: count() }).from(campaign),
      db
        .select({ count: count() })
        .from(campaign)
        .where(eq(campaign.status, "active")),
      db
        .select({ count: count() })
        .from(campaign)
        .where(eq(campaign.status, "pending_approval")),
      db.select({ sum: sum(campaign.raisedAmount) }).from(campaign),
      db.select({ count: count() }).from(donation),
      db.select({ sum: sum(donation.amount) }).from(donation),
      db.select({ count: count() }).from(volunteerProfile),
      db
        .select({ count: count() })
        .from(volunteerProfile)
        .where(eq(volunteerProfile.isVerified, true)),
      db
        .select({ count: count() })
        .from(volunteerProfile)
        .where(eq(volunteerProfile.isAvailable, true)),
    ]);

    const stats = {
      users: {
        total: Number(usersTotalRows[0]?.count ?? 0),
        volunteers: Number(usersVolunteerRows[0]?.count ?? 0),
        admins: Number(usersAdminRows[0]?.count ?? 0),
      },
      issues: {
        total: Number(issuesTotalRows[0]?.count ?? 0),
        pending: Number(issuesPendingRows[0]?.count ?? 0),
        inProgress: Number(issuesInProgressRows[0]?.count ?? 0),
        resolved: Number(issuesResolvedRows[0]?.count ?? 0),
      },
      disasters: {
        total: Number(disastersTotalRows[0]?.count ?? 0),
        active: Number(disastersActiveRows[0]?.count ?? 0),
        contained: Number(disastersContainedRows[0]?.count ?? 0),
        resolved: Number(disastersResolvedRows[0]?.count ?? 0),
      },
      campaigns: {
        total: Number(campaignsTotalRows[0]?.count ?? 0),
        active: Number(campaignsActiveRows[0]?.count ?? 0),
        pendingApproval: Number(campaignsPendingRows[0]?.count ?? 0),
        totalRaisedRupees: toRupees(
          Number(campaignsRaisedRows[0]?.sum ?? 0)
        ),
      },
      donations: {
        total: Number(donationsTotalRows[0]?.count ?? 0),
        totalAmountRupees: toRupees(
          Number(donationsAmountRows[0]?.sum ?? 0)
        ),
      },
      volunteers: {
        total: Number(volunteersTotalRows[0]?.count ?? 0),
        verified: Number(volunteersVerifiedRows[0]?.count ?? 0),
        available: Number(volunteersAvailableRows[0]?.count ?? 0),
      },
    };

    return res.json(stats);
  } catch (error) {
    console.error("GET /admin/stats", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
