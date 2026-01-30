import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db/drizzle";
import { donation, campaign } from "@/db/schema";
import { eq, sql, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

/**
 * POST /api/donations
 * Create a donation (public - can be anonymous)
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        const body = await request.json();

        let {
            campaignId,
            amount, // in rupees
            donorName,
            donorEmail,
            donorPhone,
            isAnonymous,
            message,
        } = body;

        // Validate amount
        if (!amount || amount <= 0) {
            return NextResponse.json(
                { error: "Valid amount is required" },
                { status: 400 }
            );
        }

        let campaignData;

        // If no campaignId provided, find the first active campaign
        if (!campaignId) {
            const [firstActiveCampaign] = await db
                .select()
                .from(campaign)
                .where(eq(campaign.status, "active"))
                .orderBy(desc(campaign.createdAt))
                .limit(1);

            if (!firstActiveCampaign) {
                return NextResponse.json(
                    { error: "No active campaigns available for donations" },
                    { status: 400 }
                );
            }

            campaignId = firstActiveCampaign.id;
            campaignData = firstActiveCampaign;
        } else {
            // Check if campaign exists and is active
            const [foundCampaign] = await db
                .select()
                .from(campaign)
                .where(eq(campaign.id, campaignId))
                .limit(1);

            if (!foundCampaign) {
                return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
            }

            if (foundCampaign.status !== "active") {
                return NextResponse.json(
                    { error: "This campaign is not accepting donations" },
                    { status: 400 }
                );
            }

            campaignData = foundCampaign;
        }

        // Create donation record
        const donationId = randomUUID();
        const amountInPaisa = Math.round(amount * 100);

        const [newDonation] = await db
            .insert(donation)
            .values({
                id: donationId,
                campaignId,
                donorUserId: session?.user?.id || null,
                donorName: isAnonymous ? null : donorName || null,
                donorEmail: donorEmail || null,
                donorPhone: donorPhone || null,
                isAnonymous: isAnonymous || false,
                amount: amountInPaisa,
                currency: "INR",
                paymentProvider: "demo", // For demo purposes
                paymentId: `demo_${donationId.slice(0, 16)}`,
                paymentStatus: "completed", // Auto-complete for demo
                message: message || null,
                completedAt: new Date(),
            })
            .returning();

        // Update campaign raised amount and donor count
        await db
            .update(campaign)
            .set({
                raisedAmount: sql`${campaign.raisedAmount} + ${amountInPaisa}`,
                donorCount: sql`${campaign.donorCount} + 1`,
            })
            .where(eq(campaign.id, campaignId));

        return NextResponse.json(
            {
                success: true,
                message: "Donation successful! Thank you for your generosity.",
                donation: {
                    id: newDonation.id,
                    amount: amount,
                    campaignTitle: campaignData.title,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("[DONATION CREATE ERROR]", error);
        return NextResponse.json(
            { error: "Failed to process donation" },
            { status: 500 }
        );
    }
}

/**
 * GET /api/donations
 * Get user's donation history (authenticated)
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        const donations = await db
            .select({
                donation: donation,
                campaign: campaign,
            })
            .from(donation)
            .leftJoin(campaign, eq(donation.campaignId, campaign.id))
            .where(eq(donation.donorUserId, session.user.id));

        return NextResponse.json({
            donations: donations.map((d) => ({
                ...d.donation,
                campaign: d.campaign,
            })),
            count: donations.length,
        });
    } catch (error) {
        console.error("[DONATIONS GET ERROR]", error);
        return NextResponse.json(
            { error: "Failed to fetch donations" },
            { status: 500 }
        );
    }
}
