import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db/drizzle";
import { disaster, disasterTeamActivation, campaign, issue } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

/**
 * GET /api/disasters
 * List active disasters (public)
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status") || "active";
        const limit = parseInt(searchParams.get("limit") || "20");

        const disasters = await db
            .select()
            .from(disaster)
            .where(status !== "all" ? eq(disaster.status, status) : undefined)
            .orderBy(desc(disaster.startedAt))
            .limit(limit);

        // Get stats for each disaster
        const disastersWithStats = await Promise.all(
            disasters.map(async (d) => {
                // Count activated teams
                const [teamCount] = await db
                    .select({ count: sql<number>`count(*)` })
                    .from(disasterTeamActivation)
                    .where(eq(disasterTeamActivation.disasterId, d.id));

                // Count linked issues
                const [issueCount] = await db
                    .select({ count: sql<number>`count(*)` })
                    .from(issue)
                    .where(eq(issue.disasterId, d.id));

                // Count relief campaigns
                const [campaignCount] = await db
                    .select({ count: sql<number>`count(*)` })
                    .from(campaign)
                    .where(eq(campaign.disasterId, d.id));

                return {
                    ...d,
                    affectedDistricts: d.affectedDistricts
                        ? JSON.parse(d.affectedDistricts)
                        : [],
                    stats: {
                        teamsActivated: Number(teamCount?.count || 0),
                        issuesReported: Number(issueCount?.count || 0),
                        reliefCampaigns: Number(campaignCount?.count || 0),
                    },
                };
            })
        );

        return NextResponse.json({
            disasters: disastersWithStats,
            count: disastersWithStats.length,
        });
    } catch (error) {
        console.error("[DISASTERS GET ERROR]", error);
        return NextResponse.json(
            { error: "Failed to fetch disasters" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/disasters
 * Declare new disaster (admin only)
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

        // Check if user is admin (you may need to adjust based on your auth setup)
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

        const body = await request.json();

        const {
            disasterType,
            title,
            description,
            affectedDistricts,
            centerLatitude,
            centerLongitude,
            radiusKm,
            severity,
            estimatedAffectedPeople,
            responseLevel,
            startedAt,
        } = body;

        // Validate required fields
        if (!disasterType || !title || !description || !affectedDistricts || !severity) {
            return NextResponse.json(
                { error: "Missing required fields: disasterType, title, description, affectedDistricts, severity" },
                { status: 400 }
            );
        }

        // Validate disaster type
        const validTypes = ["flood", "earthquake", "cyclone", "drought", "fire", "pandemic", "other"];
        if (!validTypes.includes(disasterType)) {
            return NextResponse.json(
                { error: `Invalid disaster type. Must be one of: ${validTypes.join(", ")}` },
                { status: 400 }
            );
        }

        // Validate severity
        const validSeverities = ["minor", "moderate", "severe", "catastrophic"];
        if (!validSeverities.includes(severity)) {
            return NextResponse.json(
                { error: `Invalid severity. Must be one of: ${validSeverities.join(", ")}` },
                { status: 400 }
            );
        }

        const disasterId = randomUUID();
        const [newDisaster] = await db
            .insert(disaster)
            .values({
                id: disasterId,
                disasterType,
                title,
                description,
                affectedDistricts: JSON.stringify(affectedDistricts),
                centerLatitude: centerLatitude || null,
                centerLongitude: centerLongitude || null,
                radiusKm: radiusKm || null,
                severity,
                estimatedAffectedPeople: estimatedAffectedPeople || null,
                responseLevel: responseLevel || "local",
                status: "active",
                startedAt: startedAt ? new Date(startedAt) : new Date(),
            })
            .returning();

        return NextResponse.json(
            {
                success: true,
                message: "Disaster declared successfully",
                disaster: {
                    ...newDisaster,
                    affectedDistricts: JSON.parse(newDisaster.affectedDistricts),
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("[DISASTER CREATE ERROR]", error);
        return NextResponse.json(
            { error: "Failed to declare disaster" },
            { status: 500 }
        );
    }
}
