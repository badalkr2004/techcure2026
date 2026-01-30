import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db/drizzle";
import { volunteerProfile, volunteerQualification, teamMembership, volunteerTeam } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * GET /api/volunteer/profile
 * Get current volunteer's profile
 */
export async function GET() {
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

        // Get qualifications
        const qualifications = await db
            .select()
            .from(volunteerQualification)
            .where(eq(volunteerQualification.volunteerId, volunteer.id));

        // Get team memberships
        const memberships = await db
            .select({
                membership: teamMembership,
                team: volunteerTeam,
            })
            .from(teamMembership)
            .leftJoin(volunteerTeam, eq(teamMembership.teamId, volunteerTeam.id))
            .where(eq(teamMembership.volunteerId, volunteer.id));

        return NextResponse.json({
            ...volunteer,
            specializations: volunteer.specializations
                ? JSON.parse(volunteer.specializations)
                : [],
            qualifications,
            teamMemberships: memberships.map((m) => ({
                ...m.membership,
                team: m.team,
            })),
        });
    } catch (error) {
        console.error("[VOLUNTEER PROFILE GET ERROR]", error);
        return NextResponse.json(
            { error: "Failed to get volunteer profile" },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/volunteer/profile
 * Update volunteer profile
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

        const [existingVolunteer] = await db
            .select()
            .from(volunteerProfile)
            .where(eq(volunteerProfile.userId, session.user.id))
            .limit(1);

        if (!existingVolunteer) {
            return NextResponse.json(
                { error: "Volunteer profile not found" },
                { status: 404 }
            );
        }

        const body = await request.json();

        // Fields that can be updated
        const allowedFields = [
            "displayName",
            "phone",
            "age",
            "bio",
            "profileImage",
            "latitude",
            "longitude",
            "district",
            "address",
            "serviceRadius",
            "specializations",
            "isAvailable",
        ];

        const updates: Record<string, unknown> = {};
        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                if (field === "specializations" && Array.isArray(body[field])) {
                    updates[field] = JSON.stringify(body[field]);
                } else {
                    updates[field] = body[field];
                }
            }
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json(
                { error: "No valid fields to update" },
                { status: 400 }
            );
        }

        const [updated] = await db
            .update(volunteerProfile)
            .set(updates)
            .where(eq(volunteerProfile.userId, session.user.id))
            .returning();

        return NextResponse.json({
            success: true,
            volunteer: {
                ...updated,
                specializations: updated.specializations
                    ? JSON.parse(updated.specializations)
                    : [],
            },
        });
    } catch (error) {
        console.error("[VOLUNTEER PROFILE UPDATE ERROR]", error);
        return NextResponse.json(
            { error: "Failed to update volunteer profile" },
            { status: 500 }
        );
    }
}
