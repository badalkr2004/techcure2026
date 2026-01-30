import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db/drizzle";
import { volunteerTeam, volunteerProfile, teamMembership } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

/**
 * GET /api/teams
 * List teams (public/authenticated)
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const district = searchParams.get("district");
        const teamType = searchParams.get("type");
        const limit = parseInt(searchParams.get("limit") || "50");

        let conditions = [eq(volunteerTeam.isActive, true)];

        if (district) {
            conditions.push(eq(volunteerTeam.district, district));
        }
        if (teamType) {
            conditions.push(eq(volunteerTeam.teamType, teamType));
        }

        const teams = await db
            .select()
            .from(volunteerTeam)
            .where(and(...conditions))
            .orderBy(desc(volunteerTeam.createdAt))
            .limit(limit);

        return NextResponse.json({
            teams,
            count: teams.length,
        });
    } catch (error) {
        console.error("[TEAMS GET ERROR]", error);
        return NextResponse.json(
            { error: "Failed to fetch teams" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/teams
 * Create a new team (volunteer auth required)
 */
export async function POST(request: NextRequest) {
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

        // Get volunteer profile
        const [volunteer] = await db
            .select()
            .from(volunteerProfile)
            .where(eq(volunteerProfile.userId, session.user.id))
            .limit(1);

        if (!volunteer) {
            return NextResponse.json(
                { error: "You must be a volunteer to create a team" },
                { status: 403 }
            );
        }

        const body = await request.json();

        const { name, description, logo, teamType, district, latitude, longitude } =
            body;

        if (!name || !teamType || !district) {
            return NextResponse.json(
                { error: "Name, team type, and district are required" },
                { status: 400 }
            );
        }

        // Validate team type
        const validTypes = ["rescue", "medical", "relief", "general"];
        if (!validTypes.includes(teamType)) {
            return NextResponse.json(
                { error: `Invalid team type. Must be one of: ${validTypes.join(", ")}` },
                { status: 400 }
            );
        }

        // Create team
        const teamId = randomUUID();
        const [newTeam] = await db
            .insert(volunteerTeam)
            .values({
                id: teamId,
                name,
                description: description || null,
                logo: logo || null,
                teamType,
                district,
                latitude: latitude || volunteer.latitude,
                longitude: longitude || volunteer.longitude,
                leaderId: volunteer.id,
                memberCount: 1,
                totalResolves: 0,
                isActive: true,
            })
            .returning();

        // Add creator as team leader
        await db.insert(teamMembership).values({
            id: randomUUID(),
            teamId,
            volunteerId: volunteer.id,
            role: "leader",
            isActive: true,
        });

        return NextResponse.json(
            {
                success: true,
                message: "Team created successfully",
                team: newTeam,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("[TEAM CREATE ERROR]", error);
        return NextResponse.json(
            { error: "Failed to create team" },
            { status: 500 }
        );
    }
}
