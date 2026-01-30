import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db/drizzle";
import { campaign, disaster } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

/**
 * GET /api/campaigns
 * List campaigns (public)
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status") || "active";
        const disasterId = searchParams.get("disaster");
        const category = searchParams.get("category");
        const limit = parseInt(searchParams.get("limit") || "20");

        let conditions = [];

        if (status !== "all") {
            conditions.push(eq(campaign.status, status));
        }
        if (disasterId) {
            conditions.push(eq(campaign.disasterId, disasterId));
        }
        if (category) {
            conditions.push(eq(campaign.category, category));
        }

        const campaigns = await db
            .select()
            .from(campaign)
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(desc(campaign.createdAt))
            .limit(limit);

        // Calculate progress for each campaign
        const campaignsWithProgress = campaigns.map((c) => ({
            ...c,
            progress: c.goalAmount > 0 ? Math.min((c.raisedAmount / c.goalAmount) * 100, 100) : 0,
        }));

        return NextResponse.json({
            campaigns: campaignsWithProgress,
            count: campaignsWithProgress.length,
        });
    } catch (error) {
        console.error("[CAMPAIGNS GET ERROR]", error);
        return NextResponse.json(
            { error: "Failed to fetch campaigns" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/campaigns
 * Create campaign (authenticated)
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
            coverImage,
            goalAmount,
            category,
            disasterId,
            beneficiaryName,
            beneficiaryType,
            startDate,
            endDate,
        } = body;

        // Validate required fields
        if (!title || !description || !goalAmount || !category) {
            return NextResponse.json(
                { error: "Missing required fields: title, description, goalAmount, category" },
                { status: 400 }
            );
        }

        // Generate slug from title
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "") +
            "-" + randomUUID().slice(0, 8);

        // Validate disaster if linked
        if (disasterId) {
            const [disasterExists] = await db
                .select({ id: disaster.id })
                .from(disaster)
                .where(eq(disaster.id, disasterId))
                .limit(1);

            if (!disasterExists) {
                return NextResponse.json(
                    { error: "Disaster not found" },
                    { status: 404 }
                );
            }
        }

        const campaignId = randomUUID();
        const [newCampaign] = await db
            .insert(campaign)
            .values({
                id: campaignId,
                title,
                slug,
                description,
                story: story || null,
                coverImage: coverImage || null,
                goalAmount: goalAmount * 100, // Convert to paisa
                raisedAmount: 0,
                donorCount: 0,
                category,
                disasterId: disasterId || null,
                beneficiaryName: beneficiaryName || null,
                beneficiaryType: beneficiaryType || null,
                organizerId: session.user.id,
                status: "pending_approval",
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
            })
            .returning();

        return NextResponse.json(
            {
                success: true,
                message: "Campaign created and pending approval",
                campaign: newCampaign,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("[CAMPAIGN CREATE ERROR]", error);
        return NextResponse.json(
            { error: "Failed to create campaign" },
            { status: 500 }
        );
    }
}
