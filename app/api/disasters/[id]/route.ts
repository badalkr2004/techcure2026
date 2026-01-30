import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db/drizzle";
import { disaster, disasterTeamActivation, campaign, issue, volunteerTeam } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

/**
 * GET /api/disasters/[id]
 * Get disaster details with stats
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const [disasterData] = await db
            .select()
            .from(disaster)
            .where(eq(disaster.id, id))
            .limit(1);

        if (!disasterData) {
            return NextResponse.json({ error: "Disaster not found" }, { status: 404 });
        }

        // Get activated teams with details
        const activatedTeams = await db
            .select({
                activation: disasterTeamActivation,
                team: volunteerTeam,
            })
            .from(disasterTeamActivation)
            .leftJoin(volunteerTeam, eq(disasterTeamActivation.teamId, volunteerTeam.id))
            .where(eq(disasterTeamActivation.disasterId, id));

        // Get issue count
        const [issueCount] = await db
            .select({ count: sql<number>`count(*)` })
            .from(issue)
            .where(eq(issue.disasterId, id));

        // Get relief campaigns
        const reliefCampaigns = await db
            .select()
            .from(campaign)
            .where(eq(campaign.disasterId, id));

        return NextResponse.json({
            disaster: {
                ...disasterData,
                affectedDistricts: disasterData.affectedDistricts
                    ? JSON.parse(disasterData.affectedDistricts)
                    : [],
            },
            activatedTeams: activatedTeams.map((t) => ({
                ...t.activation,
                team: t.team,
            })),
            issueCount: Number(issueCount?.count || 0),
            reliefCampaigns,
        });
    } catch (error) {
        console.error("[DISASTER GET ERROR]", error);
        return NextResponse.json(
            { error: "Failed to fetch disaster details" },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/disasters/[id]
 * Update disaster status (admin only)
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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

        // Check admin role
        const [dbUser] = await db
            .select({ role: sql<string>`role` })
            .from(sql`"user"`)
            .where(sql`id = ${session.user.id}`)
            .limit(1);

        if (dbUser?.role !== "admin") {
            return NextResponse.json(
                { error: "Admin access required" },
                { status: 403 }
            );
        }

        const { id } = await params;
        const body = await request.json();

        const { status, responseLevel, containedAt, resolvedAt, description } = body;

        // Build update object
        const updates: Record<string, unknown> = {};

        if (status) {
            const validStatuses = ["active", "contained", "resolved"];
            if (!validStatuses.includes(status)) {
                return NextResponse.json(
                    { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
                    { status: 400 }
                );
            }
            updates.status = status;

            // Set timestamps based on status
            if (status === "contained" && !containedAt) {
                updates.containedAt = new Date();
            }
            if (status === "resolved" && !resolvedAt) {
                updates.resolvedAt = new Date();
            }
        }

        if (responseLevel) updates.responseLevel = responseLevel;
        if (containedAt) updates.containedAt = new Date(containedAt);
        if (resolvedAt) updates.resolvedAt = new Date(resolvedAt);
        if (description) updates.description = description;

        if (Object.keys(updates).length === 0) {
            return NextResponse.json(
                { error: "No valid fields to update" },
                { status: 400 }
            );
        }

        const [updated] = await db
            .update(disaster)
            .set(updates)
            .where(eq(disaster.id, id))
            .returning();

        if (!updated) {
            return NextResponse.json({ error: "Disaster not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: "Disaster updated successfully",
            disaster: {
                ...updated,
                affectedDistricts: updated.affectedDistricts
                    ? JSON.parse(updated.affectedDistricts)
                    : [],
            },
        });
    } catch (error) {
        console.error("[DISASTER UPDATE ERROR]", error);
        return NextResponse.json(
            { error: "Failed to update disaster" },
            { status: 500 }
        );
    }
}
