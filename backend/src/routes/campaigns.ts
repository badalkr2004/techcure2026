import { Router } from "express";
import { and, eq, desc, sql } from "drizzle-orm";
import { db } from "../db/drizzle";
import {
  campaign,
  campaignUpdate,
  disaster,
  user as userTable,
} from "../db/schema";
import { requireAuth, requireRole, validate } from "../middleware";
import {
  CreateCampaignSchema,
  CreateCampaignUpdateSchema,
} from "../lib/schemas";
import { generateId } from "../lib/id";

const router = Router();

function toRupees(paisa: number) {
  return Math.round(paisa) / 100;
}

function slugify(title: string, suffix: string) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${base}-${suffix}`;
}

router.get("/", async (req, res) => {
  try {
    const { status, category, district } = req.query as {
      status?: string;
      category?: string;
      district?: string;
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
        disaster,
      })
      .from(campaign)
      .leftJoin(disaster, eq(campaign.disasterId, disaster.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(campaign.createdAt));

    let filtered = rows;
    if (district) {
      filtered = rows.filter((row) => {
        const affected = row.disaster?.affectedDistricts
          ? JSON.parse(row.disaster.affectedDistricts)
          : [];
        return affected.includes(district);
      });
    }

    const paged = filtered.slice(offset, offset + limit);

    const campaigns = paged.map((row) => {
      const affected = row.disaster?.affectedDistricts
        ? JSON.parse(row.disaster.affectedDistricts)
        : [];
      return {
        id: row.campaign.id,
        title: row.campaign.title,
        category: row.campaign.category,
        status: row.campaign.status,
        goalAmount: toRupees(row.campaign.goalAmount),
        raisedAmount: toRupees(row.campaign.raisedAmount),
        donorCount: row.campaign.donorCount,
        district: affected[0] || null,
        endsAt: row.campaign.endDate,
        createdAt: row.campaign.createdAt,
        isVerified: row.campaign.isVerified,
      };
    });

    return res.json({ campaigns, count: campaigns.length });
  } catch (error) {
    console.error("GET /campaigns", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [row] = await db
      .select({
        campaign,
        creator: userTable,
      })
      .from(campaign)
      .leftJoin(userTable, eq(campaign.organizerId, userTable.id))
      .where(eq(campaign.id, id))
      .limit(1);

    if (!row) {
      return res.status(404).json({ error: "Not found" });
    }

    const updates = await db
      .select()
      .from(campaignUpdate)
      .where(eq(campaignUpdate.campaignId, id))
      .orderBy(desc(campaignUpdate.createdAt));

    return res.json({
      campaign: {
        ...row.campaign,
        goalAmount: toRupees(row.campaign.goalAmount),
        raisedAmount: toRupees(row.campaign.raisedAmount),
        creator: row.creator ? { name: row.creator.name } : null,
        updates,
      },
    });
  } catch (error) {
    console.error("GET /campaigns/:id", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post(
  "/",
  requireAuth,
  validate(CreateCampaignSchema),
  async (req, res) => {
    try {
      const body = req.validated as typeof CreateCampaignSchema._type;

      if (body.disasterId) {
        const [disasterRow] = await db
          .select()
          .from(disaster)
          .where(eq(disaster.id, body.disasterId))
          .limit(1);
        if (!disasterRow) {
          return res.status(400).json({ error: "Invalid disaster" });
        }
      }

      const goalAmount = Math.round(body.goalAmount * 100);
      const slug = slugify(body.title, generateId().slice(0, 8));

      const isAdmin = req.user!.role === "admin";
      const status = isAdmin ? "active" : "pending_approval";
      const isVerified = isAdmin;

      const [created] = await db
        .insert(campaign)
        .values({
          id: generateId(),
          title: body.title,
          slug,
          description: body.description,
          story: body.story || null,
          coverImage: body.coverImage || null,
          goalAmount,
          raisedAmount: 0,
          donorCount: 0,
          category: body.category,
          disasterId: body.disasterId || null,
          beneficiaryName: body.beneficiaryName || null,
          beneficiaryType: body.beneficiaryType || null,
          organizerId: req.user!.id,
          status,
          isVerified,
          verifiedBy: isAdmin ? req.user!.id : null,
          verifiedAt: isAdmin ? new Date() : null,
          startDate: body.startDate || null,
          endDate: body.endsAt || null,
        })
        .returning();

      return res.status(201).json({
        success: true,
        message: isAdmin
          ? "Campaign created and activated"
          : "Campaign submitted for approval",
        campaign: {
          ...created,
          goalAmount: toRupees(created.goalAmount),
          raisedAmount: toRupees(created.raisedAmount),
        },
      });
    } catch (error) {
      console.error("POST /campaigns", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.patch(
  "/:id",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
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

      const updates: Record<string, unknown> = {};
      if (req.body.status) updates.status = req.body.status;
      if (req.body.isVerified !== undefined) updates.isVerified = req.body.isVerified;
      if (req.body.title !== undefined) updates.title = req.body.title;
      if (req.body.description !== undefined) updates.description = req.body.description;
      if (req.body.category !== undefined) updates.category = req.body.category;
      if (req.body.goalAmount !== undefined) {
        updates.goalAmount = Math.round(Number(req.body.goalAmount) * 100);
      }
      if (req.body.endsAt !== undefined) updates.endDate = req.body.endsAt;

      if (
        req.body.status === "active" &&
        existing.status === "pending_approval"
      ) {
        updates.isVerified = true;
        updates.verifiedBy = req.user!.id;
        updates.verifiedAt = new Date();
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: "Invalid update payload" });
      }

      const [updated] = await db
        .update(campaign)
        .set(updates)
        .where(eq(campaign.id, id))
        .returning();

      return res.json({
        success: true,
        message: "Campaign updated",
        campaign: {
          ...updated,
          goalAmount: toRupees(updated.goalAmount),
          raisedAmount: toRupees(updated.raisedAmount),
        },
      });
    } catch (error) {
      console.error("PATCH /campaigns/:id", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.post(
  "/:id/updates",
  requireAuth,
  validate(CreateCampaignUpdateSchema),
  async (req, res) => {
    try {
      const { id } = req.params;
      const body = req.validated as typeof CreateCampaignUpdateSchema._type;

      const [campaignRow] = await db
        .select()
        .from(campaign)
        .where(eq(campaign.id, id))
        .limit(1);

      if (!campaignRow) {
        return res.status(404).json({ error: "Not found" });
      }

      if (
        req.user!.role !== "admin" &&
        campaignRow.organizerId !== req.user!.id
      ) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const [update] = await db
        .insert(campaignUpdate)
        .values({
          id: generateId(),
          campaignId: id,
          title: "Update",
          content: body.content,
        })
        .returning();

      return res.status(201).json({
        success: true,
        message: "Update posted",
        update,
      });
    } catch (error) {
      console.error("POST /campaigns/:id/updates", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
