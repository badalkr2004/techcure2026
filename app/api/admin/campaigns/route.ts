import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db/drizzle";
import { campaign, user, disaster } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { randomUUID } from "crypto";

/**
 * GET /api/admin/campaigns
 * List all campaigns with filters
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

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");
        const category = searchParams.get("category");
        const limit = parseInt(searchParams.get("limit") || "50");

        let conditions = [];

        if (status && status !== "all") {
            conditions.push(eq(campaign.status, status));
        }

        if (category) {
            conditions.push(eq(campaign.category, category));
        }

        const campaigns = await db
            .select({
                campaign: campaign,
                organizer: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                },
            })
            .from(campaign)
            .leftJoin(user, eq(campaign.organizerId, user.id))
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(desc(campaign.createdAt))
            .limit(limit);

        return NextResponse.json({
            campaigns: campaigns.map((c) => ({
                ...c.campaign,
                organizer: c.organizer,
                progress: c.campaign.goalAmount > 0
                    ? Math.min((c.campaign.raisedAmount / c.campaign.goalAmount) * 100, 100)
                    : 0,
            })),
            count: campaigns.length,
        });
    } catch (error) {
        console.error("[ADMIN CAMPAIGNS GET ERROR]", error);
        return NextResponse.json(
            { error: "Failed to fetch campaigns" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/admin/campaigns
 * Create a new campaign (Admin only)
 */
export async function POST(request: NextRequest) {
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

        const body = await request.json();
        const {
            title,
            description,
            story,
            goalAmount,
            category,
            disasterId,
            beneficiaryName,
            beneficiaryType,
            coverImage,
            videoUrl,
            status = "active", // Admin-created campaigns default to active
        } = body;

        // Validation
        if (!title || title.trim().length < 5) {
            return NextResponse.json(
                { error: "Title must be at least 5 characters" },
                { status: 400 }
            );
        }

        if (!description || description.trim().length < 20) {
            return NextResponse.json(
                { error: "Description must be at least 20 characters" },
                { status: 400 }
            );
        }

        if (!goalAmount || goalAmount < 1000) {
            return NextResponse.json(
                { error: "Goal amount must be at least ₹10 (1000 paisa)" },
                { status: 400 }
            );
        }

        const validCategories = ["disaster_relief", "medical", "education", "community"];
        if (!category || !validCategories.includes(category)) {
            return NextResponse.json(
                { error: `Invalid category. Must be one of: ${validCategories.join(", ")}` },
                { status: 400 }
            );
        }

        // If disasterId is provided, verify it exists
        if (disasterId) {
            const [disasterExists] = await db
                .select({ id: disaster.id })
                .from(disaster)
                .where(eq(disaster.id, disasterId))
                .limit(1);

            if (!disasterExists) {
                return NextResponse.json(
                    { error: "Invalid disaster ID" },
                    { status: 400 }
                );
            }
        }

        // Generate slug from title
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "") + "-" + randomUUID().slice(0, 8);

        // Create campaign
        const campaignId = randomUUID();
        const [newCampaign] = await db
            .insert(campaign)
            .values({
                id: campaignId,
                title: title.trim(),
                slug,
                description: description.trim(),
                story: story?.trim() || null,
                goalAmount,
                raisedAmount: 0,
                donorCount: 0,
                category,
                disasterId: disasterId || null,
                beneficiaryName: beneficiaryName?.trim() || null,
                beneficiaryType: beneficiaryType || null,
                coverImage: coverImage || null,
                videoUrl: videoUrl || null,
                organizerId: session.user.id,
                status,
                isVerified: true, // Admin-created campaigns are auto-verified
                verifiedBy: session.user.id,
                verifiedAt: new Date(),
                createdAt: new Date(),
            })
            .returning();

        return NextResponse.json({
            success: true,
            message: "Campaign created successfully",
            campaign: newCampaign,
        });
    } catch (error) {
        console.error("[ADMIN CAMPAIGNS POST ERROR]", error);
        return NextResponse.json(
            { error: "Failed to create campaign" },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/admin/campaigns
 * Approve/reject/update campaign
 */
export async function PATCH(request: NextRequest) {
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

        const body = await request.json();
        const { campaignId, status, isVerified } = body;

        if (!campaignId) {
            return NextResponse.json(
                { error: "Campaign ID is required" },
                { status: 400 }
            );
        }

        const updates: Record<string, unknown> = {};

        if (status) {
            const validStatuses = ["draft", "pending_approval", "active", "completed", "cancelled"];
            if (!validStatuses.includes(status)) {
                return NextResponse.json(
                    { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
                    { status: 400 }
                );
            }
            updates.status = status;
        }

        if (typeof isVerified === "boolean") {
            updates.isVerified = isVerified;
            if (isVerified) {
                updates.verifiedBy = session.user.id;
                updates.verifiedAt = new Date();
            }
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json(
                { error: "No updates provided" },
                { status: 400 }
            );
        }

        const [updated] = await db
            .update(campaign)
            .set(updates)
            .where(eq(campaign.id, campaignId))
            .returning();

        return NextResponse.json({
            success: true,
            message: "Campaign updated successfully",
            campaign: updated,
        });
    } catch (error) {
        console.error("[ADMIN CAMPAIGNS PATCH ERROR]", error);
        return NextResponse.json(
            { error: "Failed to update campaign" },
            { status: 500 }
        );
    }
}
