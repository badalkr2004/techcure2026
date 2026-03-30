import { z } from "zod";

export const CreateVolunteerProfileSchema = z.object({
  displayName: z.string().min(1),
  phone: z.string().min(1),
  age: z.coerce.number().int(),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  district: z.string().min(1),
  address: z.string().optional(),
  bio: z.string().optional(),
  specializations: z.array(z.string()).optional(),
  serviceRadius: z.coerce.number().int().optional(),
});

export const AddQualificationSchema = z.object({
  qualificationType: z.string().min(1),
  certificateUrl: z.string().url().optional(),
  issuedBy: z.string().optional(),
  issuedAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date().optional(),
});

export const CreateTeamSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  logo: z.string().optional(),
  teamType: z.string().min(1),
  district: z.string().min(1),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
});

export const PanicSchema = z.object({
  victimPhone: z.string().min(1),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  description: z.string().optional(),
  victimName: z.string().optional(),
});

export const CreateIssueSchema = z.object({
  issueTypeCode: z.string().optional(),
  victimPhone: z.string().min(1),
  victimName: z.string().optional(),
  victimAge: z.coerce.number().int().optional(),
  victimGender: z.string().optional(),
  reporterPhone: z.string().optional(),
  reporterName: z.string().optional(),
  reporterRelation: z.string().optional(),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  address: z.string().optional(),
  district: z.string().optional(),
  landmark: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  severity: z.string().optional(),
  disasterId: z.string().optional(),
});

export const ResolveIssueSchema = z.object({
  resolutionNotes: z.string().min(1),
  equipmentUsed: z.string().optional(),
});

export const CreateDisasterSchema = z.object({
  disasterType: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  affectedDistricts: z.array(z.string()).min(1),
  severity: z.string().min(1),
  centerLatitude: z.coerce.number().optional(),
  centerLongitude: z.coerce.number().optional(),
  radiusKm: z.coerce.number().int().optional(),
  estimatedAffectedPeople: z.coerce.number().int().optional(),
  responseLevel: z.string().optional(),
  startedAt: z.coerce.date().optional(),
});

export const UpdateDisasterSchema = z.object({
  disasterType: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  affectedDistricts: z.array(z.string()).optional(),
  severity: z.string().optional(),
  status: z.string().optional(),
  responseLevel: z.string().optional(),
  centerLatitude: z.coerce.number().optional(),
  centerLongitude: z.coerce.number().optional(),
  radiusKm: z.coerce.number().int().optional(),
  estimatedAffectedPeople: z.coerce.number().int().optional(),
  startedAt: z.coerce.date().optional(),
  containedAt: z.coerce.date().optional(),
  resolvedAt: z.coerce.date().optional(),
});

export const ActivateTeamSchema = z.object({
  teamId: z.string().min(1),
  assignedArea: z.string().optional(),
  responsibilities: z.string().optional(),
});

export const CreateCampaignSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  story: z.string().optional(),
  coverImage: z.string().optional(),
  goalAmount: z.coerce.number().min(1),
  category: z.enum(["disaster_relief", "medical", "education", "community"]),
  disasterId: z.string().optional(),
  beneficiaryName: z.string().optional(),
  beneficiaryType: z
    .enum(["individual", "family", "community", "organization"])
    .optional(),
  startDate: z.coerce.date().optional(),
  endsAt: z.coerce.date().optional(),
});

export const CreateCampaignUpdateSchema = z.object({
  content: z
    .string()
    .min(10, "Update must be at least 10 characters")
    .max(2000, "Update too long"),
});

export const CreateDonationSchema = z.object({
  amount: z.coerce.number().min(1),
  campaignId: z.string().optional(),
  donorName: z.string().optional(),
  donorPhone: z.string().optional(),
  message: z.string().optional(),
  isAnonymous: z.boolean().optional(),
});
