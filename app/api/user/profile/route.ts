import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db/drizzle";
import { userProfile } from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

/**
 * GET /api/user/profile
 * Get current user's profile
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

        const [profile] = await db
            .select()
            .from(userProfile)
            .where(eq(userProfile.userId, session.user.id))
            .limit(1);

        if (!profile) {
            // Return empty profile structure
            return NextResponse.json({
                userId: session.user.id,
                phone: null,
                dateOfBirth: null,
                gender: null,
                bloodGroup: null,
                district: null,
                address: null,
                pincode: null,
                emergencyContactName: null,
                emergencyContactPhone: null,
                emergencyContactRelation: null,
                hasProfile: false,
            });
        }

        return NextResponse.json({
            ...profile,
            hasProfile: true,
        });
    } catch (error) {
        console.error("[USER PROFILE GET ERROR]", error);
        return NextResponse.json(
            { error: "Failed to get user profile" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/user/profile
 * Create or update user profile
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
            phone,
            alternatePhone,
            dateOfBirth,
            gender,
            bloodGroup,
            latitude,
            longitude,
            district,
            address,
            pincode,
            emergencyContactName,
            emergencyContactPhone,
            emergencyContactRelation,
        } = body;

        // Check if profile exists
        const [existingProfile] = await db
            .select()
            .from(userProfile)
            .where(eq(userProfile.userId, session.user.id))
            .limit(1);

        if (existingProfile) {
            // Update existing profile
            const [updated] = await db
                .update(userProfile)
                .set({
                    phone: phone ?? existingProfile.phone,
                    alternatePhone: alternatePhone ?? existingProfile.alternatePhone,
                    dateOfBirth: dateOfBirth
                        ? new Date(dateOfBirth)
                        : existingProfile.dateOfBirth,
                    gender: gender ?? existingProfile.gender,
                    bloodGroup: bloodGroup ?? existingProfile.bloodGroup,
                    latitude: latitude ?? existingProfile.latitude,
                    longitude: longitude ?? existingProfile.longitude,
                    district: district ?? existingProfile.district,
                    address: address ?? existingProfile.address,
                    pincode: pincode ?? existingProfile.pincode,
                    emergencyContactName:
                        emergencyContactName ?? existingProfile.emergencyContactName,
                    emergencyContactPhone:
                        emergencyContactPhone ?? existingProfile.emergencyContactPhone,
                    emergencyContactRelation:
                        emergencyContactRelation ?? existingProfile.emergencyContactRelation,
                })
                .where(eq(userProfile.userId, session.user.id))
                .returning();

            return NextResponse.json({
                success: true,
                message: "Profile updated successfully",
                profile: updated,
            });
        } else {
            // Create new profile
            const [created] = await db
                .insert(userProfile)
                .values({
                    id: randomUUID(),
                    userId: session.user.id,
                    phone: phone || null,
                    alternatePhone: alternatePhone || null,
                    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                    gender: gender || null,
                    bloodGroup: bloodGroup || null,
                    latitude: latitude || null,
                    longitude: longitude || null,
                    district: district || null,
                    address: address || null,
                    pincode: pincode || null,
                    emergencyContactName: emergencyContactName || null,
                    emergencyContactPhone: emergencyContactPhone || null,
                    emergencyContactRelation: emergencyContactRelation || null,
                })
                .returning();

            return NextResponse.json(
                {
                    success: true,
                    message: "Profile created successfully",
                    profile: created,
                },
                { status: 201 }
            );
        }
    } catch (error) {
        console.error("[USER PROFILE UPDATE ERROR]", error);
        return NextResponse.json(
            { error: "Failed to update user profile" },
            { status: 500 }
        );
    }
}
