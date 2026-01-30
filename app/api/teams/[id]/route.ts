import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db/drizzle";
import { volunteerTeam, volunteerProfile, teamMembership } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/teams/[id]
 * Get team details
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const [team] = await db
            .select()
            .from(volunteerTeam)
            .where(eq(volunteerTeam.id, id))
            .limit(1);

        if (!team) {
            return NextResponse.json({ error: "Team not found" }, { status: 404 });
        }

        // Get leader info
        const [leader] = await db
            .select({
                id: volunteerProfile.id,
                displayName: volunteerProfile.displayName,
                rank: volunteerProfile.rank,
            })
            .from(volunteerProfile)
            .where(eq(volunteerProfile.id, team.leaderId))
            .limit(1);

        // Get members
        const members = await db
            .select({
                membership: teamMembership,
                volunteer: volunteerProfile,
            })
            .from(teamMembership)
            .leftJoin(volunteerProfile, eq(teamMembership.volunteerId, volunteerProfile.id))
            .where(and(eq(teamMembership.teamId, id), eq(teamMembership.isActive, true)));

        return NextResponse.json({
            ...team,
            leader,
            members: members.map((m) => ({
                ...m.membership,
                volunteer: m.volunteer
                    ? {
                        id: m.volunteer.id,
                        displayName: m.volunteer.displayName,
                        rank: m.volunteer.rank,
                        phone: m.volunteer.phone,
                    }
                    : null,
            })),
        });
    } catch (error) {
        console.error("[TEAM GET ERROR]", error);
        return NextResponse.json({ error: "Failed to fetch team" }, { status: 500 });
    }
}

/**
 * PATCH /api/teams/[id]
 * Update team (leader only)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
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

        const { id } = await params;
        const body = await request.json();

        // Get volunteer profile
        const [volunteer] = await db
            .select()
            .from(volunteerProfile)
            .where(eq(volunteerProfile.userId, session.user.id))
            .limit(1);

        if (!volunteer) {
            return NextResponse.json(
                { error: "Volunteer profile not found" },
                { status: 404 }
            );
        }

        // Get team
        const [team] = await db
            .select()
            .from(volunteerTeam)
            .where(eq(volunteerTeam.id, id))
            .limit(1);

        if (!team) {
            return NextResponse.json({ error: "Team not found" }, { status: 404 });
        }

        // Check if user is leader
        if (team.leaderId !== volunteer.id) {
            return NextResponse.json(
                { error: "Only the team leader can update the team" },
                { status: 403 }
            );
        }

        const { name, description, teamType, isActive } = body;

        const updates: Record<string, unknown> = {};
        if (name) updates.name = name;
        if (description !== undefined) updates.description = description;
        if (teamType) updates.teamType = teamType;
        if (typeof isActive === "boolean") updates.isActive = isActive;

        const [updated] = await db
            .update(volunteerTeam)
            .set(updates)
            .where(eq(volunteerTeam.id, id))
            .returning();

        return NextResponse.json({
            success: true,
            message: "Team updated successfully",
            team: updated,
        });
    } catch (error) {
        console.error("[TEAM PATCH ERROR]", error);
        return NextResponse.json({ error: "Failed to update team" }, { status: 500 });
    }
}
