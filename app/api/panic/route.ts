import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { issue, issueType, volunteerProfile } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { randomUUID } from "crypto";
import { getBoundingBox, filterByRadius } from "@/lib/geo";

/**
 * POST /api/panic
 * Create a panic alert (no authentication required)
 * This is for CRITICAL emergencies only
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        const { victimPhone, latitude, longitude, description, victimName } = body;

        if (!victimPhone) {
            return NextResponse.json(
                { error: "Phone number is required" },
                { status: 400 }
            );
        }

        if (typeof latitude !== "number" || typeof longitude !== "number") {
            return NextResponse.json(
                { error: "Valid location coordinates are required" },
                { status: 400 }
            );
        }

        // Get the panic issue type using select
        const [panicType] = await db
            .select()
            .from(issueType)
            .where(eq(issueType.code, "panic"))
            .limit(1);

        if (!panicType) {
            return NextResponse.json(
                { error: "System not properly configured. Please try again later." },
                { status: 500 }
            );
        }

        // Create the panic alert
        const alertId = randomUUID();
        await db.insert(issue).values({
            id: alertId,
            issueTypeId: panicType.id,
            victimPhone,
            victimName: victimName || null,
            latitude,
            longitude,
            description: description || "Emergency panic alert triggered",
            severity: "critical",
            status: "pending",
            reporterRelation: "self",
        });

        // Find nearby available volunteers (within 20km radius initially)
        const searchRadius = 20; // km
        const bounds = getBoundingBox(latitude, longitude, searchRadius);

        const nearbyVolunteers = await db
            .select()
            .from(volunteerProfile)
            .where(
                and(
                    eq(volunteerProfile.isAvailable, true),
                    eq(volunteerProfile.isVerified, true),
                    gte(volunteerProfile.latitude, bounds.minLat),
                    lte(volunteerProfile.latitude, bounds.maxLat),
                    gte(volunteerProfile.longitude, bounds.minLng),
                    lte(volunteerProfile.longitude, bounds.maxLng)
                )
            )
            .limit(50);

        // Filter by actual distance and sort
        const volunteersWithDistance = filterByRadius(
            latitude,
            longitude,
            nearbyVolunteers,
            searchRadius
        );

        // TODO: Send notifications to nearby volunteers
        // This would be done via push notifications, SMS, or real-time websockets
        // For now, we'll just log the count
        console.log(
            `[PANIC ALERT] Alert ${alertId} created. Found ${volunteersWithDistance.length} nearby volunteers.`
        );

        return NextResponse.json(
            {
                success: true,
                alertId,
                message: "Panic alert created successfully",
                nearbyVolunteersCount: volunteersWithDistance.length,
                status: "pending",
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("[PANIC ALERT ERROR]", error);
        return NextResponse.json(
            { error: "Failed to create panic alert. Please try again." },
            { status: 500 }
        );
    }
}

/**
 * GET /api/panic?id=xxx
 * Get panic alert status (for tracking)
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const alertId = searchParams.get("id");

        if (!alertId) {
            return NextResponse.json(
                { error: "Alert ID is required" },
                { status: 400 }
            );
        }

        const [alert] = await db
            .select()
            .from(issue)
            .leftJoin(issueType, eq(issue.issueTypeId, issueType.id))
            .where(eq(issue.id, alertId))
            .limit(1);

        if (!alert) {
            return NextResponse.json({ error: "Alert not found" }, { status: 404 });
        }

        // Return limited info for privacy
        return NextResponse.json({
            id: alert.issue.id,
            status: alert.issue.status,
            severity: alert.issue.severity,
            createdAt: alert.issue.createdAt,
            acknowledgedAt: alert.issue.acknowledgedAt,
            resolvedAt: alert.issue.resolvedAt,
        });
    } catch (error) {
        console.error("[PANIC STATUS ERROR]", error);
        return NextResponse.json(
            { error: "Failed to get alert status" },
            { status: 500 }
        );
    }
}
