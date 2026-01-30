import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db/drizzle";
import { userProfile, user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

/**
 * GET /api/user/profile
 * Get user profile
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

        // Get user profile
        const [profile] = await db
            .select()
            .from(userProfile)
            .where(eq(userProfile.userId, session.user.id))
            .limit(1);

        if (!profile) {
            // Return basic user info without profile
            return NextResponse.json({
                hasProfile: false,
                user: {
                    id: session.user.id,
                    name: session.user.name,
                    email: session.user.email,
                    image: session.user.image,
                },
            });
        }

        return NextResponse.json({
            hasProfile: true,
            profile,
            user: {
                id: session.user.id,
                name: session.user.name,
                email: session.user.email,
                image: session.user.image,
            },
        });
    } catch (error) {
        console.error("[USER PROFILE GET ERROR]", error);
        return NextResponse.json(
            { error: "Failed to fetch profile" },
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
        const [existing] = await db
            .select()
            .from(userProfile)
            .where(eq(userProfile.userId, session.user.id))
            .limit(1);

        if (existing) {
            // Update existing profile
            const [updated] = await db
                .update(userProfile)
                .set({
                    phone,
                    alternatePhone,
                    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
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
                })
                .where(eq(userProfile.id, existing.id))
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
                    id: nanoid(),
                    userId: session.user.id,
                    phone,
                    alternatePhone,
                    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
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
                })
                .returning();

            return NextResponse.json({
                success: true,
                message: "Profile created successfully",
                profile: created,
            });
        }
    } catch (error) {
        console.error("[USER PROFILE POST ERROR]", error);
        return NextResponse.json(
            { error: "Failed to save profile" },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/user/profile
 * Partial profile update
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

        // Get existing profile
        const [existing] = await db
            .select()
            .from(userProfile)
            .where(eq(userProfile.userId, session.user.id))
            .limit(1);

        if (!existing) {
            return NextResponse.json(
                { error: "Profile not found. Use POST to create one." },
                { status: 404 }
            );
        }

        const updates: Record<string, unknown> = {};

        // Only update provided fields
        if (body.phone !== undefined) updates.phone = body.phone;
        if (body.alternatePhone !== undefined) updates.alternatePhone = body.alternatePhone;
        if (body.dateOfBirth !== undefined) updates.dateOfBirth = body.dateOfBirth ? new Date(body.dateOfBirth) : null;
        if (body.gender !== undefined) updates.gender = body.gender;
        if (body.bloodGroup !== undefined) updates.bloodGroup = body.bloodGroup;
        if (body.latitude !== undefined) updates.latitude = body.latitude;
        if (body.longitude !== undefined) updates.longitude = body.longitude;
        if (body.district !== undefined) updates.district = body.district;
        if (body.address !== undefined) updates.address = body.address;
        if (body.pincode !== undefined) updates.pincode = body.pincode;
        if (body.emergencyContactName !== undefined) updates.emergencyContactName = body.emergencyContactName;
        if (body.emergencyContactPhone !== undefined) updates.emergencyContactPhone = body.emergencyContactPhone;
        if (body.emergencyContactRelation !== undefined) updates.emergencyContactRelation = body.emergencyContactRelation;

        if (Object.keys(updates).length === 0) {
            return NextResponse.json(
                { error: "No updates provided" },
                { status: 400 }
            );
        }

        const [updated] = await db
            .update(userProfile)
            .set(updates)
            .where(eq(userProfile.id, existing.id))
            .returning();

        return NextResponse.json({
            success: true,
            message: "Profile updated successfully",
            profile: updated,
        });
    } catch (error) {
        console.error("[USER PROFILE PATCH ERROR]", error);
        return NextResponse.json(
            { error: "Failed to update profile" },
            { status: 500 }
        );
    }
}
