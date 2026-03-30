import { db } from "./drizzle";
import { issueType } from "./schema";
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

seedIssueTypes()
  .then(() => {
    console.log("Seeded issue types");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed failed", error);
    process.exit(1);
  });
