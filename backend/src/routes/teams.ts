import { Router } from "express";
import { and, eq, desc, sql } from "drizzle-orm";
import { db } from "../db/drizzle";
import {
  volunteerTeam,
  volunteerProfile,
  teamMembership,
} from "../db/schema";
import { requireAuth, requireRole, validate } from "../middleware";
import { CreateTeamSchema } from "../lib/schemas";
import { generateId } from "../lib/id";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { district, teamType } = req.query as {
      district?: string;
      teamType?: string;
    };

    const conditions = [eq(volunteerTeam.isActive, true)];
    if (district) conditions.push(eq(volunteerTeam.district, district));
    if (teamType) conditions.push(eq(volunteerTeam.teamType, teamType));

    const teams = await db
      .select()
      .from(volunteerTeam)
      .where(and(...conditions))
      .orderBy(desc(volunteerTeam.createdAt));

    return res.json({ teams, count: teams.length });
  } catch (error) {
    console.error("GET /teams", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post(
  "/",
  requireAuth,
  requireRole("volunteer"),
  validate(CreateTeamSchema),
  async (req, res) => {
    try {
      const [profile] = await db
        .select()
        .from(volunteerProfile)
        .where(eq(volunteerProfile.userId, req.user!.id))
        .limit(1);

      if (!profile) {
        return res.status(400).json({ error: "Volunteer profile not found" });
      }

      const body = req.validated as typeof CreateTeamSchema._type;

      const [team] = await db
        .insert(volunteerTeam)
        .values({
          id: generateId(),
          name: body.name,
          description: body.description || null,
          logo: body.logo || null,
          teamType: body.teamType,
          district: body.district,
          latitude: body.latitude ?? profile.latitude,
          longitude: body.longitude ?? profile.longitude,
          leaderId: profile.id,
          memberCount: 1,
          totalResolves: 0,
          isActive: true,
        })
        .returning();

      await db.insert(teamMembership).values({
        id: generateId(),
        teamId: team.id,
        volunteerId: profile.id,
        role: "leader",
        isActive: true,
      });

      return res.status(201).json({
        success: true,
        message: "Team created",
        team,
      });
    } catch (error) {
      console.error("POST /teams", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [team] = await db
      .select()
      .from(volunteerTeam)
      .where(eq(volunteerTeam.id, id))
      .limit(1);

    if (!team) {
      return res.status(404).json({ error: "Not found" });
    }

    const [leader] = await db
      .select({
        id: volunteerProfile.id,
        displayName: volunteerProfile.displayName,
        rank: volunteerProfile.rank,
      })
      .from(volunteerProfile)
      .where(eq(volunteerProfile.id, team.leaderId))
      .limit(1);

    return res.json({ ...team, leader });
  } catch (error) {
    console.error("GET /teams/:id", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const [profile] = await db
      .select()
      .from(volunteerProfile)
      .where(eq(volunteerProfile.userId, req.user!.id))
      .limit(1);

    if (!profile) {
      return res.status(400).json({ error: "Volunteer profile not found" });
    }

    const [team] = await db
      .select()
      .from(volunteerTeam)
      .where(eq(volunteerTeam.id, id))
      .limit(1);

    if (!team) {
      return res.status(404).json({ error: "Not found" });
    }

    if (team.leaderId !== profile.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const updates: Record<string, unknown> = {};
    if (req.body.name !== undefined) updates.name = req.body.name;
    if (req.body.description !== undefined) updates.description = req.body.description;
    if (req.body.district !== undefined) updates.district = req.body.district;
    if (req.body.isActive !== undefined) updates.isActive = req.body.isActive;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "Invalid update payload" });
    }

    const [updated] = await db
      .update(volunteerTeam)
      .set(updates)
      .where(eq(volunteerTeam.id, id))
      .returning();

    return res.json({
      success: true,
      message: "Team updated",
      team: updated,
    });
  } catch (error) {
    console.error("PATCH /teams/:id", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id/members", async (req, res) => {
  try {
    const { id } = req.params;

    const members = await db
      .select({
        membership: teamMembership,
        volunteer: volunteerProfile,
      })
      .from(teamMembership)
      .leftJoin(volunteerProfile, eq(teamMembership.volunteerId, volunteerProfile.id))
      .where(and(eq(teamMembership.teamId, id), eq(teamMembership.isActive, true)));

    const formatted = members.map((m) => ({
      ...m.membership,
      volunteer: m.volunteer
        ? {
            id: m.volunteer.id,
            displayName: m.volunteer.displayName,
            rank: m.volunteer.rank,
          }
        : null,
    }));

    return res.json({ members: formatted, count: formatted.length });
  } catch (error) {
    console.error("GET /teams/:id/members", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:id/members", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const [requester] = await db
      .select()
      .from(volunteerProfile)
      .where(eq(volunteerProfile.userId, req.user!.id))
      .limit(1);

    if (!requester) {
      return res.status(400).json({ error: "Volunteer profile not found" });
    }

    const [team] = await db
      .select()
      .from(volunteerTeam)
      .where(eq(volunteerTeam.id, id))
      .limit(1);

    if (!team) {
      return res.status(404).json({ error: "Not found" });
    }

    const targetVolunteerId = req.body?.volunteerId || requester.id;
    const isLeader = team.leaderId === requester.id;
    const isSelfJoin = targetVolunteerId === requester.id;

    if (!isSelfJoin && !isLeader) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const [existing] = await db
      .select()
      .from(teamMembership)
      .where(and(eq(teamMembership.teamId, id), eq(teamMembership.volunteerId, targetVolunteerId)))
      .limit(1);

    if (existing && existing.isActive) {
      return res.status(400).json({ error: "Already a member" });
    }

    if (existing && !existing.isActive) {
      await db
        .update(teamMembership)
        .set({ isActive: true, joinedAt: new Date() })
        .where(eq(teamMembership.id, existing.id));
    } else {
      await db.insert(teamMembership).values({
        id: generateId(),
        teamId: id,
        volunteerId: targetVolunteerId,
        role: "member",
        isActive: true,
      });
    }

    await db
      .update(volunteerTeam)
      .set({ memberCount: sql`${volunteerTeam.memberCount} + 1` })
      .where(eq(volunteerTeam.id, id));

    return res.status(201).json({
      success: true,
      message: "Joined team",
    });
  } catch (error) {
    console.error("POST /teams/:id/members", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id/members", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const [requester] = await db
      .select()
      .from(volunteerProfile)
      .where(eq(volunteerProfile.userId, req.user!.id))
      .limit(1);

    if (!requester) {
      return res.status(400).json({ error: "Volunteer profile not found" });
    }

    const [team] = await db
      .select()
      .from(volunteerTeam)
      .where(eq(volunteerTeam.id, id))
      .limit(1);

    if (!team) {
      return res.status(404).json({ error: "Not found" });
    }

    const targetVolunteerId = req.body?.volunteerId || requester.id;
    const isLeader = team.leaderId === requester.id;
    const isSelfLeave = targetVolunteerId === requester.id;

    if (team.leaderId === targetVolunteerId) {
      return res.status(400).json({ error: "Leader cannot leave their own team" });
    }

    if (!isSelfLeave && !isLeader) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const [membership] = await db
      .select()
      .from(teamMembership)
      .where(and(eq(teamMembership.teamId, id), eq(teamMembership.volunteerId, targetVolunteerId)))
      .limit(1);

    if (!membership || !membership.isActive) {
      return res.status(404).json({ error: "Not found" });
    }

    await db
      .update(teamMembership)
      .set({ isActive: false })
      .where(eq(teamMembership.id, membership.id));

    await db
      .update(volunteerTeam)
      .set({ memberCount: sql`GREATEST(${volunteerTeam.memberCount} - 1, 0)` })
      .where(eq(volunteerTeam.id, id));

    return res.json({ success: true, message: "Left team" });
  } catch (error) {
    console.error("DELETE /teams/:id/members", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
