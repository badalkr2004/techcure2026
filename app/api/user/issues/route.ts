import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db/drizzle";
import { issue, issueType, issueAssignment, volunteerProfile } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

/**
 * GET /api/user/issues
 * Get issues reported by the current user
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

        const issues = await db
            .select({
                issue: issue,
                issueType: issueType,
            })
            .from(issue)
            .leftJoin(issueType, eq(issue.issueTypeId, issueType.id))
            .where(eq(issue.reporterUserId, session.user.id))
            .orderBy(desc(issue.createdAt));

        // Get assignments for these issues
        const issueIds = issues.map((i) => i.issue.id);

        let assignments: {
            assignment: typeof issueAssignment.$inferSelect;
            volunteer: typeof volunteerProfile.$inferSelect | null;
        }[] = [];
        if (issueIds.length > 0) {
            assignments = await db
                .select({
                    assignment: issueAssignment,
                    volunteer: volunteerProfile,
                })
                .from(issueAssignment)
                .leftJoin(volunteerProfile, eq(issueAssignment.volunteerId, volunteerProfile.id));
        }

        return NextResponse.json({
            issues: issues.map((i) => {
                const issueAssignments = assignments.filter(
                    (a) => a.assignment.issueId === i.issue.id
                );
                return {
                    ...i.issue,
                    issueType: i.issueType,
                    assignments: issueAssignments.map((a) => ({
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
                };
            }),
            count: issues.length,
        });
    } catch (error) {
        console.error("[USER ISSUES GET ERROR]", error);
        return NextResponse.json(
            { error: "Failed to fetch issues" },
            { status: 500 }
        );
    }
}
