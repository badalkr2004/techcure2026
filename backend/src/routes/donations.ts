import { Router } from "express";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "../db/drizzle";
import { campaign, donation } from "../db/schema";
import { requireAuth, validate } from "../middleware";
import { CreateDonationSchema } from "../lib/schemas";
import { generateId } from "../lib/id";
import { auth } from "../lib/auth";

const router = Router();

function toRupees(paisa: number) {
  return Math.round(paisa) / 100;
}

router.post("/", validate(CreateDonationSchema), async (req, res) => {
  try {
    const body = req.validated as typeof CreateDonationSchema._type;

    const session = await auth.api.getSession({
      headers: req.headers as any,
    });

    let targetCampaign: typeof campaign.$inferSelect | undefined;

    if (body.campaignId) {
      const [found] = await db
        .select()
        .from(campaign)
        .where(eq(campaign.id, body.campaignId))
        .limit(1);
      if (!found) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      if (found.status !== "active") {
        return res.status(400).json({ error: "Campaign is not active" });
      }
      targetCampaign = found;
    } else {
      const [found] = await db
        .select()
        .from(campaign)
        .where(eq(campaign.status, "active"))
        .orderBy(desc(campaign.createdAt))
        .limit(1);
      if (!found) {
        return res.status(400).json({ error: "No active campaign found" });
      }
      targetCampaign = found;
    }

    const amountInPaisa = Math.round(body.amount * 100);

    let createdDonation: typeof donation.$inferSelect | undefined;

    await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(donation)
        .values({
          id: generateId(),
          campaignId: targetCampaign!.id,
          donorUserId: session?.user?.id || null,
          donorName: body.donorName || null,
          donorPhone: body.donorPhone || null,
          message: body.message || null,
          isAnonymous: body.isAnonymous ?? false,
          amount: amountInPaisa,
          paymentProvider: "demo",
          paymentStatus: "completed",
          completedAt: new Date(),
        })
        .returning();

      createdDonation = created;

      await tx
        .update(campaign)
        .set({
          raisedAmount: sql`${campaign.raisedAmount} + ${amountInPaisa}`,
          donorCount: sql`${campaign.donorCount} + 1`,
        })
        .where(eq(campaign.id, targetCampaign!.id));
    });

    if (!createdDonation) {
      return res.status(500).json({ error: "Internal server error" });
    }

    return res.status(201).json({
      success: true,
      message: "Donation successful. Thank you for your contribution.",
      donation: {
        id: createdDonation.id,
        amount: toRupees(createdDonation.amount),
        amountInPaisa: createdDonation.amount,
        campaignId: createdDonation.campaignId,
        campaignTitle: targetCampaign!.title,
        paymentStatus: createdDonation.paymentStatus,
        paymentProvider: createdDonation.paymentProvider,
        createdAt: createdDonation.createdAt,
      },
    });
  } catch (error) {
    console.error("POST /donations", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/", requireAuth, async (req, res) => {
  try {
    const page = parseInt((req.query.page as string) || "1", 10);
    const limitRaw = parseInt((req.query.limit as string) || "20", 10);
    const limit = Math.min(Math.max(limitRaw, 1), 100);
    const offset = (page - 1) * limit;

    const rows = await db
      .select({
        donation,
        campaignTitle: campaign.title,
      })
      .from(donation)
      .leftJoin(campaign, eq(donation.campaignId, campaign.id))
      .where(eq(donation.donorUserId, req.user!.id))
      .orderBy(desc(donation.createdAt))
      .limit(limit)
      .offset(offset);

    const totals = await db
      .select({
        total: sql<number>`coalesce(sum(${donation.amount}), 0)`,
      })
      .from(donation)
      .where(eq(donation.donorUserId, req.user!.id));

    const totalAmount = totals[0]?.total ?? 0;

    const donations = rows.map((row) => ({
      id: row.donation.id,
      campaignId: row.donation.campaignId,
      campaignTitle: row.campaignTitle || null,
      amount: toRupees(row.donation.amount),
      amountInPaisa: row.donation.amount,
      paymentStatus: row.donation.paymentStatus,
      paymentProvider: row.donation.paymentProvider,
      createdAt: row.donation.createdAt,
    }));

    return res.json({
      donations,
      count: donations.length,
      totalDonated: toRupees(totalAmount),
    });
  } catch (error) {
    console.error("GET /donations", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
