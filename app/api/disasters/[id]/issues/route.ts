import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { issue, issueType } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

/**
 * GET /api/disasters/[id]/issues
 * Get issues linked to this disaster
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");
        const limit = parseInt(searchParams.get("limit") || "50");

        let query = db
            .select()
            .from(issue)
            .leftJoin(issueType, eq(issue.issueTypeId, issueType.id))
            .where(eq(issue.disasterId, id))
            .orderBy(desc(issue.createdAt))
            .limit(limit);

        const issues = await query;

        // Filter by status if provided
        const filteredIssues = status
            ? issues.filter((i) => i.issue.status === status)
            : issues;

        return NextResponse.json({
            issues: filteredIssues.map((i) => ({
                ...i.issue,
                issueType: i.issue_type,
            })),
            count: filteredIssues.length,
        });
    } catch (error) {
        console.error("[DISASTER ISSUES GET ERROR]", error);
        return NextResponse.json(
            { error: "Failed to fetch disaster issues" },
            { status: 500 }
        );
    }
}
