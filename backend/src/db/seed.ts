import { eq } from "drizzle-orm";
import { db } from "./drizzle";
import {
  biharDistrict,
  campaign,
  disaster,
  issueType,
  user as userTable,
  volunteerProfile,
} from "./schema";
import { auth } from "../lib/auth";
import { generateId } from "../lib/id";

const issueTypesData = [
  {
    code: "panic",
    name: "Panic Alert",
    description: "Critical emergency panic alert",
    icon: "AlertTriangle",
    color: "#EF4444",
    requiresAuth: false,
    defaultSeverity: "critical",
    autoAssignTeamType: null,
    sortOrder: 0,
  },
  {
    code: "medical_emergency",
    name: "Medical Emergency",
    description: "Health-related emergencies requiring immediate attention",
    icon: "Heart",
    color: "#DC2626",
    requiresAuth: true,
    defaultSeverity: "high",
    autoAssignTeamType: "medical",
    sortOrder: 1,
  },
  {
    code: "harassment",
    name: "Harassment",
    description: "Report any form of harassment or abuse",
    icon: "ShieldAlert",
    color: "#F97316",
    requiresAuth: true,
    defaultSeverity: "high",
    autoAssignTeamType: null,
    sortOrder: 2,
  },
  {
    code: "accident",
    name: "Road Accident",
    description: "Vehicle accidents and road-related emergencies",
    icon: "Car",
    color: "#EAB308",
    requiresAuth: true,
    defaultSeverity: "high",
    autoAssignTeamType: "rescue",
    sortOrder: 3,
  },
  {
    code: "fire",
    name: "Fire",
    description: "Fire-related emergencies",
    icon: "Flame",
    color: "#F43F5E",
    requiresAuth: true,
    defaultSeverity: "critical",
    autoAssignTeamType: "rescue",
    sortOrder: 4,
  },
  {
    code: "flood",
    name: "Flood",
    description: "Flood-related emergencies and rescue needs",
    icon: "Waves",
    color: "#0EA5E9",
    requiresAuth: true,
    defaultSeverity: "high",
    autoAssignTeamType: "rescue",
    sortOrder: 5,
  },
  {
    code: "crime",
    name: "Crime Report",
    description: "Report criminal activity",
    icon: "AlertOctagon",
    color: "#8B5CF6",
    requiresAuth: true,
    defaultSeverity: "high",
    autoAssignTeamType: null,
    sortOrder: 6,
  },
  {
    code: "missing_person",
    name: "Missing Person",
    description: "Report a missing person",
    icon: "UserX",
    color: "#6366F1",
    requiresAuth: true,
    defaultSeverity: "high",
    autoAssignTeamType: null,
    sortOrder: 7,
  },
  {
    code: "natural_disaster",
    name: "Natural Disaster",
    description: "Earthquake, cyclone, and other natural disasters",
    icon: "CloudLightning",
    color: "#64748B",
    requiresAuth: true,
    defaultSeverity: "critical",
    autoAssignTeamType: "relief",
    sortOrder: 8,
  },
  {
    code: "general",
    name: "General Help",
    description: "General assistance and support requests",
    icon: "HelpCircle",
    color: "#22C55E",
    requiresAuth: true,
    defaultSeverity: "medium",
    autoAssignTeamType: "general",
    sortOrder: 99,
  },
];

const districts = [
  { name: "Patna",       nameHindi: "????",       division: "Patna",     latitude: 25.5941, longitude: 85.1376, population: 5838465 },
  { name: "Gaya",        nameHindi: "???",         division: "Magadh",    latitude: 24.7955, longitude: 85.0002, population: 4391418 },
  { name: "Bhagalpur",   nameHindi: "???????",     division: "Bhagalpur", latitude: 25.2425, longitude: 86.9842, population: 3032226 },
  { name: "Muzaffarpur", nameHindi: "??????????",  division: "Tirhut",    latitude: 26.1197, longitude: 85.3910, population: 4778610 },
  { name: "Darbhanga",   nameHindi: "??????",      division: "Darbhanga", latitude: 26.1542, longitude: 85.8918, population: 3921971 },
  { name: "Purnia",      nameHindi: "????????",    division: "Purnia",    latitude: 25.7771, longitude: 87.4753, population: 3264619 },
  { name: "Samastipur",  nameHindi: "?????????",   division: "Darbhanga", latitude: 25.8607, longitude: 85.7819, population: 4261566 },
  { name: "Begusarai",   nameHindi: "????????",    division: "Munger",    latitude: 25.4182, longitude: 86.1272, population: 2970541 },
  { name: "Saran",       nameHindi: "????",        division: "Saran",     latitude: 25.9167, longitude: 84.7500, population: 3951862 },
  { name: "Vaishali",    nameHindi: "??????",      division: "Tirhut",    latitude: 25.6900, longitude: 85.2100, population: 3495249 },
  { name: "Sitamarhi",   nameHindi: "????????",    division: "Tirhut",    latitude: 26.6000, longitude: 85.4833, population: 3423574 },
  { name: "Madhubani",   nameHindi: "??????",      division: "Darbhanga", latitude: 26.3500, longitude: 86.0700, population: 4487379 },
  { name: "Supaul",      nameHindi: "?????",       division: "Koshi",     latitude: 26.1232, longitude: 86.6085, population: 2229076 },
  { name: "Araria",      nameHindi: "??????",      division: "Purnia",    latitude: 26.1483, longitude: 87.4697, population: 2811569 },
  { name: "Kishanganj",  nameHindi: "???????",     division: "Purnia",    latitude: 26.0950, longitude: 87.9450, population: 1690400 },
  { name: "Katihar",     nameHindi: "??????",      division: "Purnia",    latitude: 25.5390, longitude: 87.5672, population: 3068149 },
  { name: "Madhepura",   nameHindi: "???????",     division: "Koshi",     latitude: 25.9167, longitude: 86.7833, population: 2001762 },
  { name: "Saharsa",     nameHindi: "?????",       division: "Koshi",     latitude: 25.8784, longitude: 86.5997, population: 1897102 },
  { name: "Khagaria",    nameHindi: "???????",     division: "Munger",    latitude: 25.5020, longitude: 86.4620, population: 1666886 },
  { name: "Munger",      nameHindi: "??????",      division: "Munger",    latitude: 25.3742, longitude: 86.4734, population: 1367765 },
  { name: "Sheikhpura",  nameHindi: "???????",    division: "Munger",    latitude: 25.1386, longitude: 85.8503, population: 636342  },
  { name: "Lakhisarai",  nameHindi: "???????",    division: "Munger",    latitude: 25.1561, longitude: 86.0945, population: 1000912 },
  { name: "Jamui",       nameHindi: "????",        division: "Munger",    latitude: 24.9280, longitude: 86.2240, population: 1760405 },
  { name: "Nawada",      nameHindi: "?????",       division: "Magadh",    latitude: 24.8873, longitude: 85.5423, population: 2219146 },
  { name: "Jehanabad",   nameHindi: "????????",   division: "Magadh",    latitude: 25.2150, longitude: 84.9930, population: 1125313 },
  { name: "Arwal",       nameHindi: "????",        division: "Magadh",    latitude: 25.2524, longitude: 84.6820, population: 700843  },
  { name: "Aurangabad",  nameHindi: "????????",   division: "Magadh",    latitude: 24.7517, longitude: 84.3741, population: 2511243 },
  { name: "Rohtas",      nameHindi: "??????",      division: "Patna",     latitude: 24.9500, longitude: 83.7900, population: 2962593 },
  { name: "Kaimur",      nameHindi: "?????",       division: "Patna",     latitude: 25.0452, longitude: 83.5892, population: 1626384 },
  { name: "Buxar",       nameHindi: "?????",       division: "Patna",     latitude: 25.5646, longitude: 83.9812, population: 1706352 },
  { name: "Bhojpur",     nameHindi: "??????",      division: "Patna",     latitude: 25.5500, longitude: 84.4500, population: 2728407 },
  { name: "Nalanda",     nameHindi: "??????",      division: "Magadh",    latitude: 25.1369, longitude: 85.4459, population: 2877653 },
  { name: "Patna",       nameHindi: "????",        division: "Patna",     latitude: 25.5941, longitude: 85.1376, population: 5838465 },
  { name: "Gopalganj",   nameHindi: "????????",    division: "Saran",     latitude: 26.4670, longitude: 84.4320, population: 2562012 },
  { name: "Siwan",       nameHindi: "?????",       division: "Saran",     latitude: 26.2197, longitude: 84.3550, population: 3318176 },
  { name: "East Champaran", nameHindi: "?????? ???????", division: "Tirhut", latitude: 26.6481, longitude: 84.9193, population: 5082868 },
  { name: "West Champaran", nameHindi: "??????? ???????", division: "Tirhut", latitude: 27.0000, longitude: 84.3667, population: 3935042 },
  { name: "Sheohar",     nameHindi: "?????",       division: "Tirhut",    latitude: 26.5190, longitude: 85.2990, population: 656916  },
];

function slugify(title: string, suffix: string) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${base}-${suffix}`;
}

async function seedIssueTypes() {
  for (const type of issueTypesData) {
    await db
      .insert(issueType)
      .values({
        id: generateId(),
        ...type,
        isActive: true,
      })
      .onConflictDoNothing();
  }
}

async function seedDistricts() {
  const existing = await db.select({ name: biharDistrict.name }).from(biharDistrict);
  const existingNames = new Set(existing.map((row) => row.name));

  for (const district of districts) {
    if (existingNames.has(district.name)) {
      continue;
    }

    await db.insert(biharDistrict).values({
      id: generateId(),
      ...district,
      isActive: true,
    });

    existingNames.add(district.name);
    console.log(`? Seeded district: ${district.name}`);
  }
}

async function ensureUser({ name, email, password }: { name: string; email: string; password: string }) {
  let [existing] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.email, email))
    .limit(1);

  if (!existing) {
    await auth.api.signUpEmail({
      body: { name, email, password },
    });

    [existing] = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, email))
      .limit(1);
  }

  if (!existing) {
    throw new Error(`Failed to create user: ${email}`);
  }

  return existing;
}

async function seed() {
  await seedIssueTypes();
  await seedDistricts();

  const adminUser = await ensureUser({
    name: "Bihar Sahayata Admin",
    email: "admin@biharsahayata.in",
    password: "Admin@123456",
  });

  await db
    .update(userTable)
    .set({ role: "admin", emailVerified: true })
    .where(eq(userTable.email, "admin@biharsahayata.in"));

  console.log("? Admin user ready: admin@biharsahayata.in");

  const volunteerUser = await ensureUser({
    name: "Rahul Kumar",
    email: "volunteer@biharsahayata.in",
    password: "Volunteer@123",
  });

  await db
    .update(userTable)
    .set({ role: "volunteer", emailVerified: true })
    .where(eq(userTable.email, "volunteer@biharsahayata.in"));

  const [existingVolunteerProfile] = await db
    .select()
    .from(volunteerProfile)
    .where(eq(volunteerProfile.userId, volunteerUser.id))
    .limit(1);

  if (!existingVolunteerProfile) {
    await db.insert(volunteerProfile).values({
      id: generateId(),
      userId: volunteerUser.id,
      displayName: "Rahul Kumar",
      phone: "9876543210",
      age: 25,
      bio: "Experienced flood rescue volunteer from Patna",
      specializations: JSON.stringify(["first_aid", "rescue", "swimming"]),
      latitude: 25.5941,
      longitude: 85.1376,
      district: "Patna",
      address: "Gandhi Maidan, Patna, Bihar",
      serviceRadius: 20,
      experienceYears: 3,
      rank: "trained",
      isVerified: true,
      isAvailable: true,
      totalResolves: 5,
    });
  }

  console.log("? Volunteer user ready: volunteer@biharsahayata.in");

  await ensureUser({
    name: "Test User",
    email: "user@biharsahayata.in",
    password: "User@123456",
  });

  await db
    .update(userTable)
    .set({ emailVerified: true })
    .where(eq(userTable.email, "user@biharsahayata.in"));

  console.log("? Regular user ready: user@biharsahayata.in");

  const [existingDisaster] = await db.select().from(disaster).limit(1);

  if (!existingDisaster) {
    await db.insert(disaster).values({
      id: generateId(),
      title: "Bihar Floods 2025",
      description:
        "Severe flooding across multiple districts of Bihar\n" +
        "due to heavy monsoon rainfall and overflow of the\n" +
        "Ganga and Kosi rivers. Over 2 million people affected.",
      disasterType: "flood",
      severity: "severe",
      status: "active",
      responseLevel: "state",
      affectedDistricts: JSON.stringify([
        "Patna",
        "Muzaffarpur",
        "Darbhanga",
        "Bhagalpur",
        "Supaul",
        "Madhepura",
        "Saharsa",
      ]),
      centerLatitude: 25.5941,
      centerLongitude: 85.1376,
      startedAt: new Date("2025-07-15"),
    });

    console.log("? Active disaster seeded");
  }

  const [existingCampaign] = await db
    .select()
    .from(campaign)
    .where(eq(campaign.status, "active"))
    .limit(1);

  if (!existingCampaign) {
    const slug = slugify("Bihar Flood Relief Fund 2025", generateId().slice(0, 8));

    await db.insert(campaign).values({
      id: generateId(),
      title: "Bihar Flood Relief Fund 2025",
      slug,
      description:
        "Emergency fundraising campaign to provide food,\n" +
        "clean water, shelter, and medical aid to over 2 million\n" +
        "flood-affected people across Bihar. Every rupee counts.",
      category: "disaster_relief",
      status: "active",
      isVerified: true,
      goalAmount: 50000000,
      raisedAmount: 0,
      donorCount: 0,
      beneficiaryType: "community",
      organizerId: adminUser.id,
      verifiedBy: adminUser.id,
      verifiedAt: new Date(),
      endDate: new Date("2025-12-31"),
    });

    console.log("? Active campaign seeded");
  }

  console.log("");
  console.log("???????????????????????????????????????");
  console.log("  Bihar Sahayata ? Seed Complete");
  console.log("???????????????????????????????????????");
  console.log("  Admin:     admin@biharsahayata.in / Admin@123456");
  console.log("  Volunteer: volunteer@biharsahayata.in / Volunteer@123");
  console.log("  User:      user@biharsahayata.in / User@123456");
  console.log("???????????????????????????????????????");
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seed failed", error);
    process.exit(1);
  });
