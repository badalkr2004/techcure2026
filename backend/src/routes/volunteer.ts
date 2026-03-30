import { Router } from "express";
import { and, eq, desc, inArray } from "drizzle-orm";
import { db } from "../db/drizzle";
import {
  volunteerProfile,
  volunteerQualification,
  teamMembership,
  volunteerTeam,
  disasterTeamActivation,
  disaster,
  user as userTable,
} from "../db/schema";
import { requireAuth, validate } from "../middleware";
import {
  AddQualificationSchema,
  CreateVolunteerProfileSchema,
} from "../lib/schemas";
import { generateId } from "../lib/id";

const router = Router();

router.get("/profile", requireAuth, async (req, res) => {
  try {
    const [profile] = await db
      .select()
      .from(volunteerProfile)
      .where(eq(volunteerProfile.userId, req.user!.id))
      .limit(1);

    if (!profile) {
      return res.status(404).json({ error: "Not found" });
    }

    const qualifications = await db
      .select()
      .from(volunteerQualification)
      .where(eq(volunteerQualification.volunteerId, profile.id));

    return res.json({ profile, qualifications });
  } catch (error) {
    console.error("GET /volunteer/profile", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post(
  "/profile",
  requireAuth,
  validate(CreateVolunteerProfileSchema),
  async (req, res) => {
    try {
      const [existing] = await db
        .select()
        .from(volunteerProfile)
        .where(eq(volunteerProfile.userId, req.user!.id))
        .limit(1);

      if (existing) {
        return res.status(400).json({ error: "Volunteer profile already exists" });
      }

      const body = req.validated as typeof CreateVolunteerProfileSchema._type;

      if (body.age < 18 || body.age > 70) {
        return res.status(400).json({ error: "Age must be between 18 and 70" });
      }

      const [profile] = await db
        .insert(volunteerProfile)
        .values({
          id: generateId(),
          userId: req.user!.id,
          displayName: body.displayName,
          phone: body.phone,
          age: body.age,
          latitude: body.latitude,
          longitude: body.longitude,
          district: body.district,
          address: body.address || null,
          bio: body.bio || null,
          specializations: body.specializations
            ? JSON.stringify(body.specializations)
            : null,
          serviceRadius: body.serviceRadius ?? 10,
          rank: "beginner",
          isVerified: false,
          isAvailable: true,
          totalResolves: 0,
        })
        .returning();

      await db
        .update(userTable)
        .set({ role: "volunteer" })
        .where(eq(userTable.id, req.user!.id));

      return res.status(201).json({
        success: true,
        message: "Volunteer profile created",
        profile,
      });
    } catch (error) {
      console.error("POST /volunteer/profile", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.patch("/profile", requireAuth, async (req, res) => {
  try {
    const [profile] = await db
      .select()
      .from(volunteerProfile)
      .where(eq(volunteerProfile.userId, req.user!.id))
      .limit(1);

    if (!profile) {
      return res.status(404).json({ error: "Not found" });
    }

    const allowedFields = [
      "bio",
      "specializations",
      "latitude",
      "longitude",
      "district",
      "address",
      "serviceRadius",
      "isAvailable",
    ];

    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === "specializations" && Array.isArray(req.body[field])) {
          updates[field] = JSON.stringify(req.body[field]);
        } else {
          updates[field] = req.body[field];
        }
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "Invalid update payload" });
    }

    const [updated] = await db
      .update(volunteerProfile)
      .set(updates)
      .where(eq(volunteerProfile.id, profile.id))
      .returning();

    return res.json({
      success: true,
      message: "Profile updated",
      profile: updated,
    });
  } catch (error) {
    console.error("PATCH /volunteer/profile", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/qualifications", requireAuth, async (req, res) => {
  try {
    const [profile] = await db
      .select()
      .from(volunteerProfile)
      .where(eq(volunteerProfile.userId, req.user!.id))
      .limit(1);

    if (!profile) {
      return res.status(404).json({ error: "Not found" });
    }

    const qualifications = await db
      .select()
      .from(volunteerQualification)
      .where(eq(volunteerQualification.volunteerId, profile.id));

    return res.json({ qualifications, count: qualifications.length });
  } catch (error) {
    console.error("GET /volunteer/qualifications", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post(
  "/qualifications",
  requireAuth,
  validate(AddQualificationSchema),
  async (req, res) => {
    try {
      const [profile] = await db
        .select()
        .from(volunteerProfile)
        .where(eq(volunteerProfile.userId, req.user!.id))
        .limit(1);

      if (!profile) {
        return res.status(404).json({ error: "Not found" });
      }

      const body = req.validated as typeof AddQualificationSchema._type;

      const [qualification] = await db
        .insert(volunteerQualification)
        .values({
          id: generateId(),
          volunteerId: profile.id,
          qualificationType: body.qualificationType,
          certificateUrl: body.certificateUrl || null,
          issuedBy: body.issuedBy || null,
          issuedAt: body.issuedAt || null,
          expiresAt: body.expiresAt || null,
          isVerified: false,
        })
        .returning();

      return res.status(201).json({ success: true, qualification });
    } catch (error) {
      console.error("POST /volunteer/qualifications", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.get("/activations", requireAuth, async (req, res) => {
  try {
    const [profile] = await db
      .select()
      .from(volunteerProfile)
      .where(eq(volunteerProfile.userId, req.user!.id))
      .limit(1);

    if (!profile) {
      return res.status(404).json({ error: "Not found" });
    }

    const memberships = await db
      .select({ teamId: teamMembership.teamId })
      .from(teamMembership)
      .where(
        and(
          eq(teamMembership.volunteerId, profile.id),
          eq(teamMembership.isActive, true)
        )
      );

    const teamIds = memberships.map((m) => m.teamId);
    if (teamIds.length === 0) {
      return res.json({ activations: [], count: 0 });
    }

    const activations = await db
      .select({
        activation: disasterTeamActivation,
        disaster,
        team: volunteerTeam,
      })
      .from(disasterTeamActivation)
      .leftJoin(disaster, eq(disasterTeamActivation.disasterId, disaster.id))
      .leftJoin(volunteerTeam, eq(disasterTeamActivation.teamId, volunteerTeam.id))
      .where(inArray(disasterTeamActivation.teamId, teamIds))
      .orderBy(desc(disasterTeamActivation.activatedAt));

    return res.json({
      activations: activations.map((a) => ({
        ...a.activation,
        disaster: a.disaster,
        team: a.team,
      })),
      count: activations.length,
    });
  } catch (error) {
    console.error("GET /volunteer/activations", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/activations/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["deployed", "completed"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const [profile] = await db
      .select()
      .from(volunteerProfile)
      .where(eq(volunteerProfile.userId, req.user!.id))
      .limit(1);

    if (!profile) {
      return res.status(404).json({ error: "Not found" });
    }

    const [activation] = await db
      .select()
      .from(disasterTeamActivation)
      .where(eq(disasterTeamActivation.id, id))
      .limit(1);

    if (!activation) {
      return res.status(404).json({ error: "Not found" });
    }

    const [membership] = await db
      .select()
      .from(teamMembership)
      .where(
        and(
          eq(teamMembership.teamId, activation.teamId),
          eq(teamMembership.volunteerId, profile.id),
          eq(teamMembership.isActive, true)
        )
      )
      .limit(1);

    if (!membership) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const updates: Record<string, unknown> = { status };
    if (status === "deployed") updates.deployedAt = new Date();
    if (status === "completed") updates.completedAt = new Date();

    await db
      .update(disasterTeamActivation)
      .set(updates)
      .where(eq(disasterTeamActivation.id, id));

    return res.json({ success: true, message: "Activation updated" });
  } catch (error) {
    console.error("PATCH /volunteer/activations/:id", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
