import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db/drizzle";
import { volunteerProfile, user } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

/**
 * POST /api/volunteer/onboard
 * Register current user as a volunteer
 * Requires authentication
 */
export async function POST(request: NextRequest) {
    try {
        // Get session
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        // Check if already a volunteer
        const [existingVolunteer] = await db
            .select()
            .from(volunteerProfile)
            .where(eq(volunteerProfile.userId, session.user.id))
            .limit(1);

        if (existingVolunteer) {
            return NextResponse.json(
                { error: "You are already registered as a volunteer" },
                { status: 400 }
            );
        }

        const body = await request.json();

        // Validate required fields
        const {
            displayName,
            phone,
            age,
            latitude,
            longitude,
            district,
            address,
            bio,
            specializations,
            serviceRadius,
        } = body;

        if (!displayName || !phone || !age || !latitude || !longitude || !district) {
            return NextResponse.json(
                {
                    error: "Required fields: displayName, phone, age, latitude, longitude, district",
                },
                { status: 400 }
            );
        }

        if (typeof age !== "number" || age < 18 || age > 100) {
            return NextResponse.json(
                { error: "Age must be between 18 and 100" },
                { status: 400 }
            );
        }

        // Create volunteer profile
        const volunteerId = randomUUID();
        const [newVolunteer] = await db
            .insert(volunteerProfile)
            .values({
                id: volunteerId,
                userId: session.user.id,
                displayName,
                phone,
                age,
                latitude,
                longitude,
                district,
                address: address || null,
                bio: bio || null,
                specializations: specializations
                    ? JSON.stringify(specializations)
                    : null,
                serviceRadius: serviceRadius || 10,
                rank: "beginner",
                isAvailable: true,
                isVerified: false, // Admin needs to verify
            })
            .returning();

        // Update user role to volunteer
        await db
            .update(user)
            .set({ role: "volunteer" })
            .where(eq(user.id, session.user.id));

        return NextResponse.json(
            {
                success: true,
                message: "Volunteer registration successful. Pending admin verification.",
                volunteer: {
                    id: newVolunteer.id,
                    displayName: newVolunteer.displayName,
                    rank: newVolunteer.rank,
                    isVerified: newVolunteer.isVerified,
                    district: newVolunteer.district,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("[VOLUNTEER ONBOARD ERROR]", error);
        return NextResponse.json(
            { error: "Failed to register as volunteer" },
            { status: 500 }
        );
    }
}
