import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db/drizzle";
import { user, volunteerProfile, volunteerTeam, issue, campaign, donation, disaster } from "@/db/schema";
import { eq, sql, count } from "drizzle-orm";

/**
 * GET /api/admin/stats
 * Get admin dashboard statistics
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

        // Check if admin (for now, we'll allow authenticated users - you can add role check later)
        // In production, add: if (session.user.role !== "admin") return 403

        // Get counts
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            userCount,
            volunteerCount,
            teamCount,
            issueStats,
            campaignStats,
            disasterStats,
            donationStats,
        ] = await Promise.all([
            // Total users
            db.select({ count: count() }).from(user),

            // Total volunteers
            db.select({ count: count() }).from(volunteerProfile),

            // Total teams
            db.select({ count: count() }).from(volunteerTeam).where(eq(volunteerTeam.isActive, true)),

            // Issue stats
            db.select({
                total: count(),
                pending: sql<number>`COUNT(*) FILTER (WHERE ${issue.status} = 'pending')`,
                inProgress: sql<number>`COUNT(*) FILTER (WHERE ${issue.status} IN ('acknowledged', 'assigned', 'in_progress'))`,
                resolved: sql<number>`COUNT(*) FILTER (WHERE ${issue.status} = 'resolved')`,
                critical: sql<number>`COUNT(*) FILTER (WHERE ${issue.severity} = 'critical' AND ${issue.status} NOT IN ('resolved', 'cancelled'))`,
            }).from(issue),

            // Campaign stats
            db.select({
                total: count(),
                active: sql<number>`COUNT(*) FILTER (WHERE ${campaign.status} = 'active')`,
                pending: sql<number>`COUNT(*) FILTER (WHERE ${campaign.status} = 'pending_approval')`,
                totalRaised: sql<number>`COALESCE(SUM(${campaign.raisedAmount}), 0)`,
            }).from(campaign),

            // Disaster stats
            db.select({
                total: count(),
                active: sql<number>`COUNT(*) FILTER (WHERE ${disaster.status} = 'active')`,
            }).from(disaster),

            // Donation stats  
            db.select({
                total: count(),
                totalAmount: sql<number>`COALESCE(SUM(${donation.amount}), 0)`,
                todayAmount: sql<number>`COALESCE(SUM(${donation.amount}) FILTER (WHERE ${donation.createdAt} >= ${today}), 0)`,
            }).from(donation).where(eq(donation.paymentStatus, "completed")),
        ]);

        return NextResponse.json({
            users: {
                total: userCount[0]?.count || 0,
            },
            volunteers: {
                total: volunteerCount[0]?.count || 0,
            },
            teams: {
                total: teamCount[0]?.count || 0,
            },
            issues: {
                total: issueStats[0]?.total || 0,
                pending: issueStats[0]?.pending || 0,
                inProgress: issueStats[0]?.inProgress || 0,
                resolved: issueStats[0]?.resolved || 0,
                critical: issueStats[0]?.critical || 0,
            },
            campaigns: {
                total: campaignStats[0]?.total || 0,
                active: campaignStats[0]?.active || 0,
                pending: campaignStats[0]?.pending || 0,
                totalRaised: campaignStats[0]?.totalRaised || 0,
            },
            disasters: {
                total: disasterStats[0]?.total || 0,
                active: disasterStats[0]?.active || 0,
            },
            donations: {
                total: donationStats[0]?.total || 0,
                totalAmount: donationStats[0]?.totalAmount || 0,
                todayAmount: donationStats[0]?.todayAmount || 0,
            },
        });
    } catch (error) {
        console.error("[ADMIN STATS ERROR]", error);
        return NextResponse.json(
            { error: "Failed to fetch stats" },
            { status: 500 }
        );
    }
}
