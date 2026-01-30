import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db/drizzle";
import {
    disasterTeamActivation,
    disaster,
    volunteerTeam,
    teamMembership,
    volunteerProfile,
} from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

/**
 * GET /api/volunteer/activations
 * Get disaster activations for teams the volunteer is part of
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

        // Get teams the volunteer is part of
        const memberships = await db
            .select({ teamId: teamMembership.teamId })
            .from(teamMembership)
            .where(
                and(
                    eq(teamMembership.volunteerId, volunteer.id),
                    eq(teamMembership.isActive, true)
                )
            );

        const teamIds = memberships.map((m) => m.teamId);

        if (teamIds.length === 0) {
            return NextResponse.json({
                activations: [],
                count: 0,
                message: "You are not part of any team yet",
            });
        }

        // Get activations for these teams
        const activations = await db
            .select({
                activation: disasterTeamActivation,
                disaster: disaster,
                team: volunteerTeam,
            })
            .from(disasterTeamActivation)
            .leftJoin(disaster, eq(disasterTeamActivation.disasterId, disaster.id))
            .leftJoin(volunteerTeam, eq(disasterTeamActivation.teamId, volunteerTeam.id))
            .where(
                and(
                    ...teamIds.map((id) => eq(disasterTeamActivation.teamId, id))
                )
            )
            .orderBy(desc(disasterTeamActivation.activatedAt));

        // Filter for active disasters
        const activeActivations = activations.filter(
            (a) => a.disaster?.status === "active" || a.disaster?.status === "contained"
        );

        return NextResponse.json({
            activations: activeActivations.map((a) => ({
                ...a.activation,
                disaster: a.disaster,
                team: a.team,
            })),
            count: activeActivations.length,
        });
    } catch (error) {
        console.error("[VOLUNTEER ACTIVATIONS ERROR]", error);
        return NextResponse.json(
            { error: "Failed to fetch activations" },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/volunteer/activations
 * Update activation status (deployed, completed)
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
        const { activationId, status } = body;

        if (!activationId || !status) {
            return NextResponse.json(
                { error: "Activation ID and status are required" },
                { status: 400 }
            );
        }

        const validStatuses = ["deployed", "completed"];
        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
                { status: 400 }
            );
        }

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

        // Get activation
        const [activation] = await db
            .select()
            .from(disasterTeamActivation)
            .where(eq(disasterTeamActivation.id, activationId))
            .limit(1);

        if (!activation) {
            return NextResponse.json(
                { error: "Activation not found" },
                { status: 404 }
            );
        }

        // Check if volunteer is part of this team
        const [membership] = await db
            .select()
            .from(teamMembership)
            .where(
                and(
                    eq(teamMembership.teamId, activation.teamId),
                    eq(teamMembership.volunteerId, volunteer.id),
                    eq(teamMembership.isActive, true)
                )
            )
            .limit(1);

        if (!membership) {
            return NextResponse.json(
                { error: "You are not part of this team" },
                { status: 403 }
            );
        }

        // Update activation
        const updates: Record<string, unknown> = { status };

        if (status === "deployed") {
            updates.deployedAt = new Date();
        } else if (status === "completed") {
            updates.completedAt = new Date();
        }

        const [updated] = await db
            .update(disasterTeamActivation)
            .set(updates)
            .where(eq(disasterTeamActivation.id, activationId))
            .returning();

        return NextResponse.json({
            success: true,
            message: `Activation status updated to ${status}`,
            activation: updated,
        });
    } catch (error) {
        console.error("[VOLUNTEER ACTIVATION UPDATE ERROR]", error);
        return NextResponse.json(
            { error: "Failed to update activation" },
            { status: 500 }
        );
    }
}
