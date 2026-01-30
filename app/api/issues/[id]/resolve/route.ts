import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db/drizzle";
import { issue, issueAssignment, volunteerProfile } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

/**
 * POST /api/issues/[id]/resolve
 * Mark issue as resolved
 */
export async function POST(
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
        const { notes, equipmentUsed } = body;

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

        // Update assignment
        await db
            .update(issueAssignment)
            .set({
                status: "completed",
                completedAt: new Date(),
                notes: notes || null,
                equipmentUsed: equipmentUsed || null,
            })
            .where(eq(issueAssignment.id, assignment.id));

        // Update issue status to resolved
        await db
            .update(issue)
            .set({
                status: "resolved",
                resolvedAt: new Date(),
                resolutionNotes: notes || null,
            })
            .where(eq(issue.id, id));

        // Increment volunteer's total resolves
        await db
            .update(volunteerProfile)
            .set({
                totalResolves: sql`${volunteerProfile.totalResolves} + 1`,
            })
            .where(eq(volunteerProfile.id, volunteer.id));

        return NextResponse.json({
            success: true,
            message: "Issue resolved successfully",
        });
    } catch (error) {
        console.error("[ISSUE RESOLVE ERROR]", error);
        return NextResponse.json(
            { error: "Failed to resolve issue" },
            { status: 500 }
        );
    }
}
