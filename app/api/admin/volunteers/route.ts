import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db/drizzle";
import { volunteerProfile, user } from "@/db/schema";
import { eq, desc, and, like, or } from "drizzle-orm";

/**
 * GET /api/admin/volunteers
 * List all volunteers with filters
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
        const search = searchParams.get("search");
        const verified = searchParams.get("verified");
        const district = searchParams.get("district");
        const limit = parseInt(searchParams.get("limit") || "50");

        let conditions = [];

        if (verified === "true") {
            conditions.push(eq(volunteerProfile.isVerified, true));
        } else if (verified === "false") {
            conditions.push(eq(volunteerProfile.isVerified, false));
        }

        if (district) {
            conditions.push(eq(volunteerProfile.district, district));
        }

        const volunteers = await db
            .select({
                volunteer: volunteerProfile,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                },
            })
            .from(volunteerProfile)
            .leftJoin(user, eq(volunteerProfile.userId, user.id))
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(desc(volunteerProfile.createdAt))
            .limit(limit);

        // Filter by search if provided
        let filtered = volunteers;
        if (search) {
            const searchLower = search.toLowerCase();
            filtered = volunteers.filter(
                (v) =>
                    v.volunteer.displayName.toLowerCase().includes(searchLower) ||
                    v.volunteer.phone.includes(search) ||
                    v.user?.email?.toLowerCase().includes(searchLower)
            );
        }

        return NextResponse.json({
            volunteers: filtered.map((v) => ({
                ...v.volunteer,
                user: v.user,
            })),
            count: filtered.length,
        });
    } catch (error) {
        console.error("[ADMIN VOLUNTEERS GET ERROR]", error);
        return NextResponse.json(
            { error: "Failed to fetch volunteers" },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/admin/volunteers
 * Verify/update volunteer
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
        const { volunteerId, isVerified, rank } = body;

        if (!volunteerId) {
            return NextResponse.json(
                { error: "Volunteer ID is required" },
                { status: 400 }
            );
        }

        const updates: Record<string, unknown> = {};

        if (typeof isVerified === "boolean") {
            updates.isVerified = isVerified;
            if (isVerified) {
                updates.verifiedAt = new Date();
            }
        }

        if (rank) {
            const validRanks = ["beginner", "trained", "advanced", "expert", "leader"];
            if (!validRanks.includes(rank)) {
                return NextResponse.json(
                    { error: `Invalid rank. Must be one of: ${validRanks.join(", ")}` },
                    { status: 400 }
                );
            }
            updates.rank = rank;
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json(
                { error: "No updates provided" },
                { status: 400 }
            );
        }

        const [updated] = await db
            .update(volunteerProfile)
            .set(updates)
            .where(eq(volunteerProfile.id, volunteerId))
            .returning();

        return NextResponse.json({
            success: true,
            message: "Volunteer updated successfully",
            volunteer: updated,
        });
    } catch (error) {
        console.error("[ADMIN VOLUNTEERS PATCH ERROR]", error);
        return NextResponse.json(
            { error: "Failed to update volunteer" },
            { status: 500 }
        );
    }
}
