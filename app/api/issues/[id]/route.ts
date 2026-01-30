import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db/drizzle";
import { issue, issueType, issueAssignment, volunteerProfile } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * GET /api/issues/[id]
 * Get complete issue details
 */
export async function GET(
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

        // Get issue with type
        const [issueData] = await db
            .select()
            .from(issue)
            .leftJoin(issueType, eq(issue.issueTypeId, issueType.id))
            .where(eq(issue.id, id))
            .limit(1);

        if (!issueData) {
            return NextResponse.json({ error: "Issue not found" }, { status: 404 });
        }

        // Get assignments for this issue
        const assignments = await db
            .select({
                assignment: issueAssignment,
                volunteer: volunteerProfile,
            })
            .from(issueAssignment)
            .leftJoin(volunteerProfile, eq(issueAssignment.volunteerId, volunteerProfile.id))
            .where(eq(issueAssignment.issueId, id));

        // Check if current user is a volunteer
        const [currentVolunteer] = await db
            .select()
            .from(volunteerProfile)
            .where(eq(volunteerProfile.userId, session.user.id))
            .limit(1);

        // Check if current volunteer is assigned
        const myAssignment = currentVolunteer
            ? assignments.find((a) => a.assignment.volunteerId === currentVolunteer.id)
            : null;

        return NextResponse.json({
            issue: {
                ...issueData.issue,
                issueType: issueData.issue_type,
            },
            assignments: assignments.map((a) => ({
                ...a.assignment,
                volunteer: a.volunteer
                    ? {
                        id: a.volunteer.id,
                        displayName: a.volunteer.displayName,
                        phone: a.volunteer.phone,
                        rank: a.volunteer.rank,
                    }
                    : null,
            })),
            myAssignment: myAssignment
                ? {
                    ...myAssignment.assignment,
                }
                : null,
            currentVolunteer: currentVolunteer
                ? {
                    id: currentVolunteer.id,
                    displayName: currentVolunteer.displayName,
                }
                : null,
        });
    } catch (error) {
        console.error("[ISSUE GET ERROR]", error);
        return NextResponse.json(
            { error: "Failed to get issue details" },
            { status: 500 }
        );
    }
}
