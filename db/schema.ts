import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  integer,
  doublePrecision,
} from "drizzle-orm/pg-core";

// ============================================================================
// CORE AUTH TABLES (Better Auth)
// ============================================================================

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  role: text("role").notNull().default("user"), // user, volunteer, admin
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)]
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)]
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)]
);

// ============================================================================
// USER PROFILE (Extended user information)
// ============================================================================

export const userProfile = pgTable(
  "user_profile",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    // Personal Info
    phone: text("phone"),
    alternatePhone: text("alternate_phone"),
    dateOfBirth: timestamp("date_of_birth"),
    gender: text("gender"), // male, female, other
    bloodGroup: text("blood_group"),

    // Location
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    district: text("district"),
    address: text("address"),
    pincode: text("pincode"),

    // Emergency Contact
    emergencyContactName: text("emergency_contact_name"),
    emergencyContactPhone: text("emergency_contact_phone"),
    emergencyContactRelation: text("emergency_contact_relation"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("user_profile_userId_idx").on(table.userId),
    index("user_profile_district_idx").on(table.district),
  ]
);

// ============================================================================
// BIHAR DISTRICTS (Location Management)
// ============================================================================

export const biharDistrict = pgTable("bihar_district", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  nameHindi: text("name_hindi"),
  division: text("division"), // Patna, Tirhut, Saran, etc.
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  population: integer("population"),
  isActive: boolean("is_active").default(true).notNull(),
});

// ============================================================================
// VOLUNTEER SYSTEM
// ============================================================================

export const volunteerProfile = pgTable(
  "volunteer_profile",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    // Basic Info
    displayName: text("display_name").notNull(),
    phone: text("phone").notNull(),
    age: integer("age").notNull(),
    profileImage: text("profile_image"),
    bio: text("bio"),

    // Rank & Experience
    rank: text("rank").notNull().default("beginner"), // beginner, trained, advanced, expert, leader
    experienceYears: integer("experience_years").default(0),

    // Specializations (stored as JSON array string)
    specializations: text("specializations"), // ["first_aid", "rescue", "counseling", "medical"]

    // Location
    latitude: doublePrecision("latitude").notNull(),
    longitude: doublePrecision("longitude").notNull(),
    district: text("district").notNull(),
    address: text("address"),
    serviceRadius: integer("service_radius").default(10), // km

    // Stats
    totalResolves: integer("total_resolves").default(0).notNull(),
    totalDonations: integer("total_donations").default(0), // amount in paisa
    rating: doublePrecision("rating").default(5.0),

    // Status
    isAvailable: boolean("is_available").default(true).notNull(),
    isVerified: boolean("is_verified").default(false).notNull(),
    verifiedAt: timestamp("verified_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("volunteer_userId_idx").on(table.userId),
    index("volunteer_district_idx").on(table.district),
    index("volunteer_location_idx").on(table.latitude, table.longitude),
    index("volunteer_available_idx").on(table.isAvailable, table.isVerified),
    index("volunteer_rank_idx").on(table.rank),
  ]
);

export const volunteerQualification = pgTable(
  "volunteer_qualification",
  {
    id: text("id").primaryKey(),
    volunteerId: text("volunteer_id")
      .notNull()
      .references(() => volunteerProfile.id, { onDelete: "cascade" }),

    qualificationType: text("qualification_type").notNull(),
    // first_aid, cpr, swimming, driving, medical, counseling, rescue

    certificateUrl: text("certificate_url"),
    issuedBy: text("issued_by"),
    issuedAt: timestamp("issued_at"),
    expiresAt: timestamp("expires_at"),
    isVerified: boolean("is_verified").default(false).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("qual_volunteer_idx").on(table.volunteerId),
    index("qual_type_idx").on(table.qualificationType),
  ]
);

// ============================================================================
// VOLUNTEER TEAMS
// ============================================================================

export const volunteerTeam = pgTable(
  "volunteer_team",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    logo: text("logo"),

    // Team Type
    teamType: text("team_type").notNull().default("general"), // rescue, medical, relief, general

    // Location
    district: text("district").notNull(),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),

    // Leadership
    leaderId: text("leader_id")
      .notNull()
      .references(() => volunteerProfile.id),

    // Stats
    memberCount: integer("member_count").default(1).notNull(),
    totalResolves: integer("total_resolves").default(0).notNull(),

    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("team_district_idx").on(table.district),
    index("team_type_idx").on(table.teamType),
    index("team_leader_idx").on(table.leaderId),
  ]
);

export const teamMembership = pgTable(
  "team_membership",
  {
    id: text("id").primaryKey(),
    teamId: text("team_id")
      .notNull()
      .references(() => volunteerTeam.id, { onDelete: "cascade" }),
    volunteerId: text("volunteer_id")
      .notNull()
      .references(() => volunteerProfile.id, { onDelete: "cascade" }),

    role: text("role").notNull().default("member"), // leader, co-leader, member
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
    isActive: boolean("is_active").default(true).notNull(),
  },
  (table) => [
    index("membership_team_idx").on(table.teamId),
    index("membership_volunteer_idx").on(table.volunteerId),
  ]
);

// ============================================================================
// ISSUE TYPES (Configurable)
// ============================================================================

export const issueType = pgTable("issue_type", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(), // harassment, medical_emergency, accident, etc.
  name: text("name").notNull(),
  nameHindi: text("name_hindi"),
  description: text("description"),
  icon: text("icon"),
  color: text("color"), // for UI

  // Configuration
  requiresAuth: boolean("requires_auth").default(true).notNull(),
  defaultSeverity: text("default_severity").default("medium"),
  autoAssignTeamType: text("auto_assign_team_type"), // which team type to notify

  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0),
});

// ============================================================================
// DISASTER MANAGEMENT
// ============================================================================

export const disaster = pgTable(
  "disaster",
  {
    id: text("id").primaryKey(),

    // Type
    disasterType: text("disaster_type").notNull(), // flood, earthquake, cyclone, drought, fire, pandemic

    // Details
    title: text("title").notNull(),
    description: text("description").notNull(),

    // Affected Area (JSON array of district names)
    affectedDistricts: text("affected_districts").notNull(),
    centerLatitude: doublePrecision("center_latitude"),
    centerLongitude: doublePrecision("center_longitude"),
    radiusKm: integer("radius_km"),

    // Severity & Impact
    severity: text("severity").notNull(), // minor, moderate, severe, catastrophic
    estimatedAffectedPeople: integer("estimated_affected_people"),

    // Status
    status: text("status").notNull().default("active"), // active, contained, resolved

    // Response
    responseLevel: text("response_level").default("local"), // local, district, state, national

    // Timestamps
    startedAt: timestamp("started_at").notNull(),
    containedAt: timestamp("contained_at"),
    resolvedAt: timestamp("resolved_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("disaster_type_idx").on(table.disasterType),
    index("disaster_status_idx").on(table.status),
    index("disaster_started_idx").on(table.startedAt),
  ]
);

export const disasterTeamActivation = pgTable(
  "disaster_team_activation",
  {
    id: text("id").primaryKey(),
    disasterId: text("disaster_id")
      .notNull()
      .references(() => disaster.id, { onDelete: "cascade" }),
    teamId: text("team_id")
      .notNull()
      .references(() => volunteerTeam.id),

    // Assignment
    assignedArea: text("assigned_area"),
    responsibilities: text("responsibilities"),

    // Status
    status: text("status").notNull().default("activated"), // activated, deployed, completed

    activatedAt: timestamp("activated_at").defaultNow().notNull(),
    deployedAt: timestamp("deployed_at"),
    completedAt: timestamp("completed_at"),
  },
  (table) => [
    index("activation_disaster_idx").on(table.disasterId),
    index("activation_team_idx").on(table.teamId),
  ]
);

// ============================================================================
// ISSUES / ALERTS (Unified table for all incident types)
// ============================================================================

export const issue = pgTable(
  "issue",
  {
    id: text("id").primaryKey(),

    // Type
    issueTypeId: text("issue_type_id")
      .notNull()
      .references(() => issueType.id),

    // Reporter (nullable for anonymous panic)
    reporterUserId: text("reporter_user_id").references(() => user.id),

    // Victim/Affected Info
    victimName: text("victim_name"),
    victimPhone: text("victim_phone").notNull(),
    victimAge: integer("victim_age"),
    victimGender: text("victim_gender"),

    // Reporter Info (if different from victim)
    reporterName: text("reporter_name"),
    reporterPhone: text("reporter_phone"),
    reporterRelation: text("reporter_relation"), // self, family, bystander

    // Location
    latitude: doublePrecision("latitude").notNull(),
    longitude: doublePrecision("longitude").notNull(),
    address: text("address"),
    district: text("district"),
    landmark: text("landmark"),

    // Issue Details
    title: text("title"),
    description: text("description"),
    severity: text("severity").notNull().default("medium"), // low, medium, high, critical

    // Media (JSON array of URLs)
    mediaUrls: text("media_urls"),

    // Status Workflow
    status: text("status").notNull().default("pending"),
    // pending -> acknowledged -> assigned -> in_progress -> resolved | escalated | cancelled

    // Linked Disaster (if part of disaster response)
    disasterId: text("disaster_id").references(() => disaster.id),

    // Resolution
    resolvedAt: timestamp("resolved_at"),
    resolutionNotes: text("resolution_notes"),
    resolutionRating: integer("resolution_rating"), // 1-5 stars

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    acknowledgedAt: timestamp("acknowledged_at"),
  },
  (table) => [
    index("issue_type_idx").on(table.issueTypeId),
    index("issue_status_idx").on(table.status),
    index("issue_location_idx").on(table.latitude, table.longitude),
    index("issue_district_idx").on(table.district),
    index("issue_created_idx").on(table.createdAt),
    index("issue_reporter_idx").on(table.reporterUserId),
    index("issue_disaster_idx").on(table.disasterId),
  ]
);

export const issueAssignment = pgTable(
  "issue_assignment",
  {
    id: text("id").primaryKey(),
    issueId: text("issue_id")
      .notNull()
      .references(() => issue.id, { onDelete: "cascade" }),

    // Assigned to (volunteer or team)
    volunteerId: text("volunteer_id").references(() => volunteerProfile.id),
    teamId: text("team_id").references(() => volunteerTeam.id),

    // Status
    status: text("status").notNull().default("assigned"),
    // assigned -> accepted -> en_route -> on_site -> completed | dropped

    // Actions
    equipmentUsed: text("equipment_used"),
    notes: text("notes"),

    // Timestamps
    assignedAt: timestamp("assigned_at").defaultNow().notNull(),
    acceptedAt: timestamp("accepted_at"),
    arrivedAt: timestamp("arrived_at"),
    completedAt: timestamp("completed_at"),
  },
  (table) => [
    index("assignment_issue_idx").on(table.issueId),
    index("assignment_volunteer_idx").on(table.volunteerId),
    index("assignment_team_idx").on(table.teamId),
  ]
);

// ============================================================================
// FUNDRAISING & CHARITY
// ============================================================================

export const campaign = pgTable(
  "campaign",
  {
    id: text("id").primaryKey(),

    // Campaign Info
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description").notNull(),
    story: text("story"), // detailed story in markdown

    // Media
    coverImage: text("cover_image"),
    galleryImages: text("gallery_images"), // JSON array
    videoUrl: text("video_url"),

    // Goals
    goalAmount: integer("goal_amount").notNull(), // in paisa
    raisedAmount: integer("raised_amount").default(0).notNull(),
    donorCount: integer("donor_count").default(0).notNull(),

    // Category
    category: text("category").notNull(), // disaster_relief, medical, education, community

    // Linked Disaster (optional)
    disasterId: text("disaster_id").references(() => disaster.id),

    // Beneficiary
    beneficiaryName: text("beneficiary_name"),
    beneficiaryType: text("beneficiary_type"), // individual, family, community, organization

    // Organizer
    organizerId: text("organizer_id")
      .notNull()
      .references(() => user.id),

    // Status
    status: text("status").notNull().default("draft"), // draft, pending_approval, active, completed, cancelled

    // Verification
    isVerified: boolean("is_verified").default(false).notNull(),
    verifiedBy: text("verified_by"),
    verifiedAt: timestamp("verified_at"),

    // Timeline
    startDate: timestamp("start_date"),
    endDate: timestamp("end_date"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("campaign_slug_idx").on(table.slug),
    index("campaign_category_idx").on(table.category),
    index("campaign_status_idx").on(table.status),
    index("campaign_organizer_idx").on(table.organizerId),
    index("campaign_disaster_idx").on(table.disasterId),
  ]
);

export const donation = pgTable(
  "donation",
  {
    id: text("id").primaryKey(),

    // Campaign
    campaignId: text("campaign_id")
      .notNull()
      .references(() => campaign.id),

    // Donor (optional - can be anonymous)
    donorUserId: text("donor_user_id").references(() => user.id),
    donorName: text("donor_name"),
    donorEmail: text("donor_email"),
    donorPhone: text("donor_phone"),
    isAnonymous: boolean("is_anonymous").default(false).notNull(),

    // Amount
    amount: integer("amount").notNull(), // in paisa
    currency: text("currency").default("INR").notNull(),

    // Payment
    paymentProvider: text("payment_provider"), // razorpay, upi, bank_transfer
    paymentId: text("payment_id"),
    paymentStatus: text("payment_status").notNull().default("pending"), // pending, completed, failed, refunded

    // Message
    message: text("message"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
  },
  (table) => [
    index("donation_campaign_idx").on(table.campaignId),
    index("donation_donor_idx").on(table.donorUserId),
    index("donation_status_idx").on(table.paymentStatus),
  ]
);

export const campaignUpdate = pgTable(
  "campaign_update",
  {
    id: text("id").primaryKey(),
    campaignId: text("campaign_id")
      .notNull()
      .references(() => campaign.id, { onDelete: "cascade" }),

    title: text("title").notNull(),
    content: text("content").notNull(),
    mediaUrls: text("media_urls"), // JSON array

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("update_campaign_idx").on(table.campaignId)]
);

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export const notification = pgTable(
  "notification",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    type: text("type").notNull(), // issue_assigned, donation_received, team_invite, etc.
    title: text("title").notNull(),
    body: text("body"),
    data: text("data"), // JSON with additional data

    isRead: boolean("is_read").default(false).notNull(),
    readAt: timestamp("read_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("notification_user_idx").on(table.userId),
    index("notification_read_idx").on(table.isRead),
  ]
);

// ============================================================================
// RELATIONS
// ============================================================================

// User Relations
export const userRelations = relations(user, ({ one, many }) => ({
  sessions: many(session),
  accounts: many(account),
  profile: one(userProfile),
  volunteerProfile: one(volunteerProfile),
  reportedIssues: many(issue),
  campaigns: many(campaign),
  donations: many(donation),
  notifications: many(notification),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const userProfileRelations = relations(userProfile, ({ one }) => ({
  user: one(user, {
    fields: [userProfile.userId],
    references: [user.id],
  }),
}));

// Volunteer Relations
export const volunteerProfileRelations = relations(
  volunteerProfile,
  ({ one, many }) => ({
    user: one(user, {
      fields: [volunteerProfile.userId],
      references: [user.id],
    }),
    qualifications: many(volunteerQualification),
    teamMemberships: many(teamMembership),
    ledTeams: many(volunteerTeam),
    assignments: many(issueAssignment),
  })
);

export const volunteerQualificationRelations = relations(
  volunteerQualification,
  ({ one }) => ({
    volunteer: one(volunteerProfile, {
      fields: [volunteerQualification.volunteerId],
      references: [volunteerProfile.id],
    }),
  })
);

// Team Relations
export const volunteerTeamRelations = relations(
  volunteerTeam,
  ({ one, many }) => ({
    leader: one(volunteerProfile, {
      fields: [volunteerTeam.leaderId],
      references: [volunteerProfile.id],
    }),
    memberships: many(teamMembership),
    assignments: many(issueAssignment),
    disasterActivations: many(disasterTeamActivation),
  })
);

export const teamMembershipRelations = relations(teamMembership, ({ one }) => ({
  team: one(volunteerTeam, {
    fields: [teamMembership.teamId],
    references: [volunteerTeam.id],
  }),
  volunteer: one(volunteerProfile, {
    fields: [teamMembership.volunteerId],
    references: [volunteerProfile.id],
  }),
}));

// Issue Relations
export const issueTypeRelations = relations(issueType, ({ many }) => ({
  issues: many(issue),
}));

export const issueRelations = relations(issue, ({ one, many }) => ({
  issueType: one(issueType, {
    fields: [issue.issueTypeId],
    references: [issueType.id],
  }),
  reporter: one(user, {
    fields: [issue.reporterUserId],
    references: [user.id],
  }),
  disaster: one(disaster, {
    fields: [issue.disasterId],
    references: [disaster.id],
  }),
  assignments: many(issueAssignment),
}));

export const issueAssignmentRelations = relations(
  issueAssignment,
  ({ one }) => ({
    issue: one(issue, {
      fields: [issueAssignment.issueId],
      references: [issue.id],
    }),
    volunteer: one(volunteerProfile, {
      fields: [issueAssignment.volunteerId],
      references: [volunteerProfile.id],
    }),
    team: one(volunteerTeam, {
      fields: [issueAssignment.teamId],
      references: [volunteerTeam.id],
    }),
  })
);

// Disaster Relations
export const disasterRelations = relations(disaster, ({ many }) => ({
  issues: many(issue),
  teamActivations: many(disasterTeamActivation),
  campaigns: many(campaign),
}));

export const disasterTeamActivationRelations = relations(
  disasterTeamActivation,
  ({ one }) => ({
    disaster: one(disaster, {
      fields: [disasterTeamActivation.disasterId],
      references: [disaster.id],
    }),
    team: one(volunteerTeam, {
      fields: [disasterTeamActivation.teamId],
      references: [volunteerTeam.id],
    }),
  })
);

// Campaign Relations
export const campaignRelations = relations(campaign, ({ one, many }) => ({
  organizer: one(user, {
    fields: [campaign.organizerId],
    references: [user.id],
  }),
  disaster: one(disaster, {
    fields: [campaign.disasterId],
    references: [disaster.id],
  }),
  donations: many(donation),
  updates: many(campaignUpdate),
}));

export const donationRelations = relations(donation, ({ one }) => ({
  campaign: one(campaign, {
    fields: [donation.campaignId],
    references: [campaign.id],
  }),
  donor: one(user, {
    fields: [donation.donorUserId],
    references: [user.id],
  }),
}));

export const campaignUpdateRelations = relations(campaignUpdate, ({ one }) => ({
  campaign: one(campaign, {
    fields: [campaignUpdate.campaignId],
    references: [campaign.id],
  }),
}));

// Notification Relations
export const notificationRelations = relations(notification, ({ one }) => ({
  user: one(user, {
    fields: [notification.userId],
    references: [user.id],
  }),
}));
