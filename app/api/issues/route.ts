import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db/drizzle";
import {
    issue,
    issueType,
    volunteerProfile,
    issueAssignment,
} from "@/db/schema";
import { eq, and, desc, gte, lte, or, inArray, sql } from "drizzle-orm";
import { randomUUID } from "crypto";
import { getBoundingBox, filterByRadius } from "@/lib/geo";

// Extended user type with role
interface SessionUser {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
}

/**
 * POST /api/issues
 * Create a new issue/report (requires authentication for non-panic issues)
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        const body = await request.json();

        const {
            issueTypeCode,
            victimPhone,
            victimName,
            victimAge,
            victimGender,
            reporterPhone,
            reporterName,
            reporterRelation,
            latitude,
            longitude,
            address,
            district,
            landmark,
            title,
            description,
            severity,
        } = body;

        // Get the issue type using select instead of query
        const [type] = await db
            .select()
            .from(issueType)
            .where(eq(issueType.code, issueTypeCode || "general"))
            .limit(1);

        if (!type) {
            return NextResponse.json({ error: "Invalid issue type" }, { status: 400 });
        }

        // Check if auth is required for this issue type
        if (type.requiresAuth && !session?.user) {
            return NextResponse.json(
                { error: "Authentication required for this issue type" },
                { status: 401 }
            );
        }

        // Validate required fields
        if (!victimPhone) {
            return NextResponse.json(
                { error: "Victim phone number is required" },
                { status: 400 }
            );
        }

        if (typeof latitude !== "number" || typeof longitude !== "number") {
            return NextResponse.json(
                { error: "Valid location coordinates are required" },
                { status: 400 }
            );
        }

        // Create the issue
        const issueId = randomUUID();
        const [newIssue] = await db
            .insert(issue)
            .values({
                id: issueId,
                issueTypeId: type.id,
                reporterUserId: session?.user?.id || null,
                victimPhone,
                victimName: victimName || null,
                victimAge: victimAge || null,
                victimGender: victimGender || null,
                reporterPhone: reporterPhone || null,
                reporterName: reporterName || null,
                reporterRelation: reporterRelation || "self",
                latitude,
                longitude,
                address: address || null,
                district: district || null,
                landmark: landmark || null,
                title: title || null,
                description: description || null,
                severity: severity || type.defaultSeverity || "medium",
                status: "pending",
            })
            .returning();

        // Find and notify nearby volunteers if this is a high-priority issue
        let nearbyCount = 0;
        if (["high", "critical"].includes(newIssue.severity)) {
            const searchRadius = 15;
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
                .limit(30);

            const volunteersWithDistance = filterByRadius(
                latitude,
                longitude,
                nearbyVolunteers,
                searchRadius
            );
            nearbyCount = volunteersWithDistance.length;

            // TODO: Send notifications to volunteers
        }

        return NextResponse.json(
            {
                success: true,
                issueId,
                message: "Issue reported successfully",
                nearbyVolunteersNotified: nearbyCount,
                status: "pending",
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("[ISSUE CREATE ERROR]", error);
        return NextResponse.json(
            { error: "Failed to create issue" },
            { status: 500 }
        );
    }
}

/**
 * GET /api/issues
 * Get issues based on role:
 * - Regular users: their own reported issues
 * - Volunteers: issues near them or assigned to them
 * - Admins: all issues
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

        const user = session.user as SessionUser;
        const { searchParams } = new URL(request.url);
        const statusFilter = searchParams.get("status");
        const lat = searchParams.get("lat");
        const lng = searchParams.get("lng");
        const radius = searchParams.get("radius") || "15";
        const limitParam = parseInt(searchParams.get("limit") || "50");
        const myIssues = searchParams.get("my") === "true";

        // Get user role from database since session might not have it
        const [dbUser] = await db
            .select({ role: sql<string>`role` })
            .from(sql`"user"`)
            .where(sql`id = ${user.id}`)
            .limit(1);

        const userRole = dbUser?.role || "user";

        // Build base conditions
        const conditions = [];

        if (statusFilter) {
            conditions.push(eq(issue.status, statusFilter));
        }

        if (myIssues) {
            conditions.push(eq(issue.reporterUserId, user.id));
        }

        // Location-based filtering
        if (lat && lng) {
            const radiusKm = parseInt(radius);
            const bounds = getBoundingBox(parseFloat(lat), parseFloat(lng), radiusKm);
            conditions.push(gte(issue.latitude, bounds.minLat));
            conditions.push(lte(issue.latitude, bounds.maxLat));
            conditions.push(gte(issue.longitude, bounds.minLng));
            conditions.push(lte(issue.longitude, bounds.maxLng));
        }

        let issues;

        if (userRole === "admin") {
            // Admins see all issues
            issues = await db
                .select()
                .from(issue)
                .leftJoin(issueType, eq(issue.issueTypeId, issueType.id))
                .where(conditions.length > 0 ? and(...conditions) : undefined)
                .orderBy(desc(issue.createdAt))
                .limit(limitParam);
        } else if (userRole === "volunteer") {
            // Get volunteer profile
            const [volunteer] = await db
                .select()
                .from(volunteerProfile)
                .where(eq(volunteerProfile.userId, user.id))
                .limit(1);

            if (!volunteer) {
                return NextResponse.json(
                    { error: "Volunteer profile not found" },
                    { status: 404 }
                );
            }

            // Get volunteer's assigned issues
            const assignments = await db
                .select({ issueId: issueAssignment.issueId })
                .from(issueAssignment)
                .where(eq(issueAssignment.volunteerId, volunteer.id));

            const assignedIssueIds = assignments.map((a) => a.issueId);

            // Get nearby pending/assigned issues + volunteer's own assignments
            const searchRadius = volunteer.serviceRadius || 15;
            const bounds = getBoundingBox(
                volunteer.latitude,
                volunteer.longitude,
                searchRadius
            );

            const nearbyConditions = [
                inArray(issue.status, ["pending", "acknowledged"]),
                gte(issue.latitude, bounds.minLat),
                lte(issue.latitude, bounds.maxLat),
                gte(issue.longitude, bounds.minLng),
                lte(issue.longitude, bounds.maxLng),
            ];

            issues = await db
                .select()
                .from(issue)
                .leftJoin(issueType, eq(issue.issueTypeId, issueType.id))
                .where(
                    and(
                        or(
                            assignedIssueIds.length > 0
                                ? inArray(issue.id, assignedIssueIds)
                                : sql`false`,
                            and(...nearbyConditions)
                        ),
                        ...(conditions.length > 0 ? conditions : [])
                    )
                )
                .orderBy(desc(issue.createdAt))
                .limit(limitParam);
        } else {
            // Regular users see only their own issues
            issues = await db
                .select()
                .from(issue)
                .leftJoin(issueType, eq(issue.issueTypeId, issueType.id))
                .where(
                    and(eq(issue.reporterUserId, user.id), ...conditions)
                )
                .orderBy(desc(issue.createdAt))
                .limit(limitParam);
        }

        // Transform the result
        const formattedIssues = issues.map((row) => ({
            ...row.issue,
            issueType: row.issue_type,
        }));

        return NextResponse.json({
            issues: formattedIssues,
            count: formattedIssues.length,
        });
    } catch (error) {
        console.error("[ISSUES GET ERROR]", error);
        return NextResponse.json(
            { error: "Failed to get issues" },
            { status: 500 }
        );
    }
}
