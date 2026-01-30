import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db/drizzle";
import { donation, campaign } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

/**
 * GET /api/user/donations
 * Get donations made by the current user
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
                campaign: {
                    id: campaign.id,
                    title: campaign.title,
                    slug: campaign.slug,
                    category: campaign.category,
                    coverImage: campaign.coverImage,
                },
            })
            .from(donation)
            .leftJoin(campaign, eq(donation.campaignId, campaign.id))
            .where(eq(donation.donorUserId, session.user.id))
            .orderBy(desc(donation.createdAt));

        // Calculate totals
        const totalAmount = donations
            .filter((d) => d.donation.paymentStatus === "completed")
            .reduce((sum, d) => sum + d.donation.amount, 0);

        return NextResponse.json({
            donations: donations.map((d) => ({
                ...d.donation,
                campaign: d.campaign,
            })),
            count: donations.length,
            totalAmount,
        });
    } catch (error) {
        console.error("[USER DONATIONS GET ERROR]", error);
        return NextResponse.json(
            { error: "Failed to fetch donations" },
            { status: 500 }
        );
    }
}
