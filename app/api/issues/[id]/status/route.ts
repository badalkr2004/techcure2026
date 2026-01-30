import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db/drizzle";
import { issue, issueAssignment, volunteerProfile } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * PATCH /api/issues/[id]/status
 * Update assignment status (en_route, on_site)
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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
        const { status } = body;

        // Validate status
        const validStatuses = ["en_route", "on_site"];
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

        // Get assignment
        const [assignment] = await db
            .select()
            .from(issueAssignment)
            .where(
                and(
                    eq(issueAssignment.issueId, id),
                    eq(issueAssignment.volunteerId, volunteer.id)
                )
            )
            .limit(1);

        if (!assignment) {
            return NextResponse.json(
                { error: "You are not assigned to this issue" },
                { status: 403 }
            );
        }

        // Update assignment status
        const updates: Record<string, unknown> = { status };

        if (status === "on_site") {
            updates.arrivedAt = new Date();
        }

        const [updated] = await db
            .update(issueAssignment)
            .set(updates)
            .where(eq(issueAssignment.id, assignment.id))
            .returning();

        // Update issue status to in_progress
        await db
            .update(issue)
            .set({ status: "in_progress" })
            .where(eq(issue.id, id));

        return NextResponse.json({
            success: true,
            message: `Status updated to ${status}`,
            assignment: updated,
        });
    } catch (error) {
        console.error("[ISSUE STATUS UPDATE ERROR]", error);
        return NextResponse.json(
            { error: "Failed to update status" },
            { status: 500 }
        );
    }
}
