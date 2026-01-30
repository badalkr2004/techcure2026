import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db/drizzle";
import { volunteerTeam, volunteerProfile, teamMembership } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/teams/[id]/members
 * Get team members
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const members = await db
            .select({
                membership: teamMembership,
                volunteer: volunteerProfile,
            })
            .from(teamMembership)
            .leftJoin(volunteerProfile, eq(teamMembership.volunteerId, volunteerProfile.id))
            .where(and(eq(teamMembership.teamId, id), eq(teamMembership.isActive, true)));

        return NextResponse.json({
            members: members.map((m) => ({
                ...m.membership,
                volunteer: m.volunteer
                    ? {
                        id: m.volunteer.id,
                        displayName: m.volunteer.displayName,
                        rank: m.volunteer.rank,
                        phone: m.volunteer.phone,
                        district: m.volunteer.district,
                        isAvailable: m.volunteer.isAvailable,
                    }
                    : null,
            })),
            count: members.length,
        });
    } catch (error) {
        console.error("[TEAM MEMBERS GET ERROR]", error);
        return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
    }
}

/**
 * POST /api/teams/[id]/members
 * Join team or add member
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
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
        const { volunteerId, role } = body;

        // Get current user's volunteer profile
        const [currentVolunteer] = await db
            .select()
            .from(volunteerProfile)
            .where(eq(volunteerProfile.userId, session.user.id))
            .limit(1);

        if (!currentVolunteer) {
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

        // Determine which volunteer to add
        const targetVolunteerId = volunteerId || currentVolunteer.id;
        const isLeader = team.leaderId === currentVolunteer.id;
        const isSelfJoin = targetVolunteerId === currentVolunteer.id;

        // If adding someone else, must be leader
        if (!isSelfJoin && !isLeader) {
            return NextResponse.json(
                { error: "Only the team leader can add members" },
                { status: 403 }
            );
        }

        // Check if already a member
        const [existing] = await db
            .select()
            .from(teamMembership)
            .where(
                and(
                    eq(teamMembership.teamId, id),
                    eq(teamMembership.volunteerId, targetVolunteerId)
                )
            )
            .limit(1);

        if (existing) {
            if (existing.isActive) {
                return NextResponse.json(
                    { error: "Already a member of this team" },
                    { status: 400 }
                );
            }
            // Reactivate membership
            await db
                .update(teamMembership)
                .set({ isActive: true, joinedAt: new Date() })
                .where(eq(teamMembership.id, existing.id));
        } else {
            // Create new membership
            await db.insert(teamMembership).values({
                id: nanoid(),
                teamId: id,
                volunteerId: targetVolunteerId,
                role: role || "member",
                isActive: true,
            });
        }

        // Update team member count
        await db
            .update(volunteerTeam)
            .set({ memberCount: sql`${volunteerTeam.memberCount} + 1` })
            .where(eq(volunteerTeam.id, id));

        return NextResponse.json({
            success: true,
            message: isSelfJoin ? "Successfully joined the team" : "Member added successfully",
        });
    } catch (error) {
        console.error("[TEAM MEMBERS POST ERROR]", error);
        return NextResponse.json({ error: "Failed to add member" }, { status: 500 });
    }
}

/**
 * DELETE /api/teams/[id]/members
 * Leave team or remove member
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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
        const { searchParams } = new URL(request.url);
        const volunteerId = searchParams.get("volunteerId");

        // Get current user's volunteer profile
        const [currentVolunteer] = await db
            .select()
            .from(volunteerProfile)
            .where(eq(volunteerProfile.userId, session.user.id))
            .limit(1);

        if (!currentVolunteer) {
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

        const targetVolunteerId = volunteerId || currentVolunteer.id;
        const isLeader = team.leaderId === currentVolunteer.id;
        const isSelfLeave = targetVolunteerId === currentVolunteer.id;

        // Can't remove yourself if you're the leader
        if (isSelfLeave && isLeader) {
            return NextResponse.json(
                { error: "Team leader cannot leave. Transfer leadership first." },
                { status: 400 }
            );
        }

        // Only leader can remove others
        if (!isSelfLeave && !isLeader) {
            return NextResponse.json(
                { error: "Only the team leader can remove members" },
                { status: 403 }
            );
        }

        // Deactivate membership
        await db
            .update(teamMembership)
            .set({ isActive: false })
            .where(
                and(
                    eq(teamMembership.teamId, id),
                    eq(teamMembership.volunteerId, targetVolunteerId)
                )
            );

        // Update team member count
        await db
            .update(volunteerTeam)
            .set({ memberCount: sql`GREATEST(${volunteerTeam.memberCount} - 1, 1)` })
            .where(eq(volunteerTeam.id, id));

        return NextResponse.json({
            success: true,
            message: isSelfLeave ? "Successfully left the team" : "Member removed successfully",
        });
    } catch (error) {
        console.error("[TEAM MEMBERS DELETE ERROR]", error);
        return NextResponse.json({ error: "Failed to remove member" }, { status: 500 });
    }
}
