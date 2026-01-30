import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db/drizzle";
import { issue, issueType } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

/**
 * GET /api/admin/issues
 * List all issues with filters
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
        const status = searchParams.get("status");
        const severity = searchParams.get("severity");
        const district = searchParams.get("district");
        const limit = parseInt(searchParams.get("limit") || "50");

        let conditions = [];

        if (status && status !== "all") {
            conditions.push(eq(issue.status, status));
        }

        if (severity) {
            conditions.push(eq(issue.severity, severity));
        }

        if (district) {
            conditions.push(eq(issue.district, district));
        }

        const issues = await db
            .select({
                issue: issue,
                issueType: issueType,
            })
            .from(issue)
            .leftJoin(issueType, eq(issue.issueTypeId, issueType.id))
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(desc(issue.createdAt))
            .limit(limit);

        return NextResponse.json({
            issues: issues.map((i) => ({
                ...i.issue,
                issueType: i.issueType,
            })),
            count: issues.length,
        });
    } catch (error) {
        console.error("[ADMIN ISSUES GET ERROR]", error);
        return NextResponse.json(
            { error: "Failed to fetch issues" },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/admin/issues
 * Update issue status
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
        const { issueId, status, severity } = body;

        if (!issueId) {
            return NextResponse.json(
                { error: "Issue ID is required" },
                { status: 400 }
            );
        }

        const updates: Record<string, unknown> = {};

        if (status) {
            const validStatuses = ["pending", "acknowledged", "assigned", "in_progress", "resolved", "escalated", "cancelled"];
            if (!validStatuses.includes(status)) {
                return NextResponse.json(
                    { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
                    { status: 400 }
                );
            }
            updates.status = status;
            if (status === "resolved") {
                updates.resolvedAt = new Date();
            } else if (status === "acknowledged") {
                updates.acknowledgedAt = new Date();
            }
        }

        if (severity) {
            const validSeverities = ["low", "medium", "high", "critical"];
            if (!validSeverities.includes(severity)) {
                return NextResponse.json(
                    { error: `Invalid severity. Must be one of: ${validSeverities.join(", ")}` },
                    { status: 400 }
                );
            }
            updates.severity = severity;
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json(
                { error: "No updates provided" },
                { status: 400 }
            );
        }

        const [updated] = await db
            .update(issue)
            .set(updates)
            .where(eq(issue.id, issueId))
            .returning();

        return NextResponse.json({
            success: true,
            message: "Issue updated successfully",
            issue: updated,
        });
    } catch (error) {
        console.error("[ADMIN ISSUES PATCH ERROR]", error);
        return NextResponse.json(
            { error: "Failed to update issue" },
            { status: 500 }
        );
    }
}
