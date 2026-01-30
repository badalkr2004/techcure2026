import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import {
    user,
    userProfile,
    volunteerProfile,
    volunteerQualification,
    volunteerTeam,
    teamMembership,
    issueType,
    issue,
    issueAssignment,
    disaster,
    disasterTeamActivation,
    campaign,
    donation,
    campaignUpdate,
    notification,
    biharDistrict,
} from "./schema";

// ============================================================================
// USER TYPES
// ============================================================================

export type User = InferSelectModel<typeof user>;
export type NewUser = InferInsertModel<typeof user>;

export type UserProfile = InferSelectModel<typeof userProfile>;
export type NewUserProfile = InferInsertModel<typeof userProfile>;

// ============================================================================
// VOLUNTEER TYPES
// ============================================================================

export type VolunteerProfile = InferSelectModel<typeof volunteerProfile>;
export type NewVolunteerProfile = InferInsertModel<typeof volunteerProfile>;

export type VolunteerQualification = InferSelectModel<typeof volunteerQualification>;
export type NewVolunteerQualification = InferInsertModel<typeof volunteerQualification>;

export type VolunteerTeam = InferSelectModel<typeof volunteerTeam>;
export type NewVolunteerTeam = InferInsertModel<typeof volunteerTeam>;

export type TeamMembership = InferSelectModel<typeof teamMembership>;
export type NewTeamMembership = InferInsertModel<typeof teamMembership>;

// ============================================================================
// ISSUE TYPES
// ============================================================================

export type IssueType = InferSelectModel<typeof issueType>;
export type NewIssueType = InferInsertModel<typeof issueType>;

export type Issue = InferSelectModel<typeof issue>;
export type NewIssue = InferInsertModel<typeof issue>;

export type IssueAssignment = InferSelectModel<typeof issueAssignment>;
export type NewIssueAssignment = InferInsertModel<typeof issueAssignment>;

// ============================================================================
// DISASTER TYPES
// ============================================================================

export type Disaster = InferSelectModel<typeof disaster>;
export type NewDisaster = InferInsertModel<typeof disaster>;

export type DisasterTeamActivation = InferSelectModel<typeof disasterTeamActivation>;
export type NewDisasterTeamActivation = InferInsertModel<typeof disasterTeamActivation>;

// ============================================================================
// CAMPAIGN TYPES
// ============================================================================

export type Campaign = InferSelectModel<typeof campaign>;
export type NewCampaign = InferInsertModel<typeof campaign>;

export type Donation = InferSelectModel<typeof donation>;
export type NewDonation = InferInsertModel<typeof donation>;

export type CampaignUpdate = InferSelectModel<typeof campaignUpdate>;
export type NewCampaignUpdate = InferInsertModel<typeof campaignUpdate>;

// ============================================================================
// OTHER TYPES
// ============================================================================

export type Notification = InferSelectModel<typeof notification>;
export type NewNotification = InferInsertModel<typeof notification>;

export type BiharDistrict = InferSelectModel<typeof biharDistrict>;
export type NewBiharDistrict = InferInsertModel<typeof biharDistrict>;

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

export const VolunteerRanks = [
    "beginner",
    "trained",
    "advanced",
    "expert",
    "leader",
] as const;
export type VolunteerRank = (typeof VolunteerRanks)[number];

export const VolunteerSpecializations = [
    "first_aid",
    "cpr",
    "swimming",
    "driving",
    "medical",
    "counseling",
    "rescue",
    "firefighting",
    "water_rescue",
    "crowd_management",
] as const;
export type VolunteerSpecialization = (typeof VolunteerSpecializations)[number];

export const TeamTypes = ["rescue", "medical", "relief", "general"] as const;
export type TeamType = (typeof TeamTypes)[number];

export const IssueSeverities = ["low", "medium", "high", "critical"] as const;
export type IssueSeverity = (typeof IssueSeverities)[number];

export const IssueStatuses = [
    "pending",
    "acknowledged",
    "assigned",
    "in_progress",
    "resolved",
    "escalated",
    "cancelled",
] as const;
export type IssueStatus = (typeof IssueStatuses)[number];

export const AssignmentStatuses = [
    "assigned",
    "accepted",
    "en_route",
    "on_site",
    "completed",
    "dropped",
] as const;
export type AssignmentStatus = (typeof AssignmentStatuses)[number];

export const DisasterTypes = [
    "flood",
    "earthquake",
    "cyclone",
    "drought",
    "fire",
    "pandemic",
    "landslide",
    "heatwave",
] as const;
export type DisasterType = (typeof DisasterTypes)[number];

export const DisasterSeverities = [
    "minor",
    "moderate",
    "severe",
    "catastrophic",
] as const;
export type DisasterSeverity = (typeof DisasterSeverities)[number];

export const DisasterStatuses = ["active", "contained", "resolved"] as const;
export type DisasterStatus = (typeof DisasterStatuses)[number];

export const CampaignCategories = [
    "disaster_relief",
    "medical",
    "education",
    "community",
    "emergency",
] as const;
export type CampaignCategory = (typeof CampaignCategories)[number];

export const CampaignStatuses = [
    "draft",
    "pending_approval",
    "active",
    "completed",
    "cancelled",
] as const;
export type CampaignStatus = (typeof CampaignStatuses)[number];

export const PaymentStatuses = [
    "pending",
    "completed",
    "failed",
    "refunded",
] as const;
export type PaymentStatus = (typeof PaymentStatuses)[number];

export const NotificationTypes = [
    "issue_assigned",
    "issue_resolved",
    "donation_received",
    "team_invite",
    "team_activated",
    "disaster_alert",
    "campaign_update",
    "volunteer_verified",
    "general",
] as const;
export type NotificationType = (typeof NotificationTypes)[number];

export const Genders = ["male", "female", "other"] as const;
export type Gender = (typeof Genders)[number];

export const BloodGroups = [
    "A+",
    "A-",
    "B+",
    "B-",
    "AB+",
    "AB-",
    "O+",
    "O-",
] as const;
export type BloodGroup = (typeof BloodGroups)[number];

// ============================================================================
// HELPER TYPES
// ============================================================================

export interface VolunteerWithUser extends VolunteerProfile {
    user: User;
}

export interface IssueWithType extends Issue {
    issueType: IssueType;
}

export interface IssueWithAssignments extends Issue {
    issueType: IssueType;
    assignments: (IssueAssignment & {
        volunteer?: VolunteerProfile;
        team?: VolunteerTeam;
    })[];
}

export interface CampaignWithDonations extends Campaign {
    donations: Donation[];
    updates: CampaignUpdate[];
}

export interface TeamWithMembers extends VolunteerTeam {
    leader: VolunteerProfile;
    memberships: (TeamMembership & { volunteer: VolunteerProfile })[];
}

export interface DisasterWithActivations extends Disaster {
    teamActivations: (DisasterTeamActivation & { team: VolunteerTeam })[];
    issues: Issue[];
    campaigns: Campaign[];
}
