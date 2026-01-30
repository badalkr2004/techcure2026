import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db/drizzle";
import { disaster, disasterTeamActivation, volunteerTeam } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

/**
 * GET /api/disasters/[id]/teams
 * Get teams activated for this disaster
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const activations = await db
            .select({
                activation: disasterTeamActivation,
                team: volunteerTeam,
            })
            .from(disasterTeamActivation)
            .leftJoin(volunteerTeam, eq(disasterTeamActivation.teamId, volunteerTeam.id))
            .where(eq(disasterTeamActivation.disasterId, id));

        return NextResponse.json({
            teams: activations.map((a) => ({
                ...a.activation,
                team: a.team,
            })),
            count: activations.length,
        });
    } catch (error) {
        console.error("[DISASTER TEAMS GET ERROR]", error);
        return NextResponse.json(
            { error: "Failed to fetch activated teams" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/disasters/[id]/teams
 * Activate a team for this disaster (admin only)
 */
export async function POST(
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

        const { teamId, assignedArea, responsibilities } = body;

        if (!teamId) {
            return NextResponse.json(
                { error: "Team ID is required" },
                { status: 400 }
            );
        }

        // Check if disaster exists
        const [disasterData] = await db
            .select()
            .from(disaster)
            .where(eq(disaster.id, id))
            .limit(1);

        if (!disasterData) {
            return NextResponse.json({ error: "Disaster not found" }, { status: 404 });
        }

        // Check if team exists
        const [team] = await db
            .select()
            .from(volunteerTeam)
            .where(eq(volunteerTeam.id, teamId))
            .limit(1);

        if (!team) {
            return NextResponse.json({ error: "Team not found" }, { status: 404 });
        }

        // Check if already activated
        const [existing] = await db
            .select()
            .from(disasterTeamActivation)
            .where(
                sql`${disasterTeamActivation.disasterId} = ${id} AND ${disasterTeamActivation.teamId} = ${teamId}`
            )
            .limit(1);

        if (existing) {
            return NextResponse.json(
                { error: "Team is already activated for this disaster" },
                { status: 400 }
            );
        }

        // Create activation
        const activationId = randomUUID();
        const [activation] = await db
            .insert(disasterTeamActivation)
            .values({
                id: activationId,
                disasterId: id,
                teamId,
                assignedArea: assignedArea || null,
                responsibilities: responsibilities || null,
                status: "activated",
            })
            .returning();

        return NextResponse.json(
            {
                success: true,
                message: "Team activated successfully",
                activation: {
                    ...activation,
                    team,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("[DISASTER TEAM ACTIVATE ERROR]", error);
        return NextResponse.json(
            { error: "Failed to activate team" },
            { status: 500 }
        );
    }
}
