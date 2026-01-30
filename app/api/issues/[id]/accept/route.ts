import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db/drizzle";
import { issue, issueAssignment, volunteerProfile } from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

/**
 * POST /api/issues/[id]/accept
 * Volunteer accepts an issue
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

        // Check if issue exists
        const [issueData] = await db
            .select()
            .from(issue)
            .where(eq(issue.id, id))
            .limit(1);

        if (!issueData) {
            return NextResponse.json({ error: "Issue not found" }, { status: 404 });
        }

        // Check if already assigned to this volunteer
        const [existingAssignment] = await db
            .select()
            .from(issueAssignment)
            .where(eq(issueAssignment.issueId, id))
            .limit(1);

        if (existingAssignment?.volunteerId === volunteer.id) {
            return NextResponse.json(
                { error: "You are already assigned to this issue" },
                { status: 400 }
            );
        }

        // Create assignment
        const assignmentId = randomUUID();
        const [newAssignment] = await db
            .insert(issueAssignment)
            .values({
                id: assignmentId,
                issueId: id,
                volunteerId: volunteer.id,
                status: "accepted",
                acceptedAt: new Date(),
            })
            .returning();

        // Update issue status to assigned
        await db
            .update(issue)
            .set({
                status: "assigned",
                acknowledgedAt: issueData.acknowledgedAt || new Date(),
            })
            .where(eq(issue.id, id));

        return NextResponse.json({
            success: true,
            message: "Issue accepted successfully",
            assignment: newAssignment,
        });
    } catch (error) {
        console.error("[ISSUE ACCEPT ERROR]", error);
        return NextResponse.json(
            { error: "Failed to accept issue" },
            { status: 500 }
        );
    }
}
