BIHAR SAHAYATA — PHASE 1: SCAFFOLD & NAVIGATION
MISSION CONTEXT
You are building Bihar Sahayata, a government-grade disaster relief and volunteer coordination mobile application for the state of Bihar, India. This is a production-level React Native app commissioned for government use. Every decision must reflect agency-grade quality: consistent naming, scalable architecture, clean separation of concerns, and zero shortcuts.
This is Phase 1 of 8. Your only job in this phase is to create the complete project scaffold, navigation structure, theme system, and a living context document. You will write zero business logic and make zero API calls.

STACK — USE EXACTLY THESE. NO SUBSTITUTIONS.
- Expo SDK (latest stable)
- Expo Router v3+ (file-based routing)
- TypeScript (strict mode)
- NativeWind v4 (Tailwind CSS for React Native)
- react-native-reanimated
- expo-secure-store
- expo-location
- @tanstack/react-query
- axios
- react-hook-form
- zod
- better-auth/react-native (do NOT install yet — only scaffold the file)
- expo-image

COMPLETE FOLDER & FILE TREE TO CREATE
Create every file listed below. Files marked [SCAFFOLD] should export a valid placeholder component/function and a comment saying // TODO: implement in Phase N. Files marked [IMPLEMENT] must be fully implemented now.
bihar-sahayata/
├── app/
│   ├── _layout.tsx                          [IMPLEMENT] Root layout with providers
│   ├── index.tsx                            [IMPLEMENT] Entry redirect logic
│   │
│   ├── (public)/
│   │   ├── _layout.tsx                      [IMPLEMENT] Public stack layout
│   │   ├── index.tsx                        [SCAFFOLD]  Home / Landing screen
│   │   ├── panic.tsx                        [SCAFFOLD]  Panic SOS screen
│   │   ├── disasters/
│   │   │   ├── index.tsx                    [SCAFFOLD]  Disasters list
│   │   │   └── [id].tsx                     [SCAFFOLD]  Disaster detail
│   │   └── teams/
│   │       ├── index.tsx                    [SCAFFOLD]  Teams list
│   │       └── [id].tsx                     [SCAFFOLD]  Team detail
│   │
│   ├── auth/
│   │   ├── _layout.tsx                      [IMPLEMENT] Auth stack layout
│   │   ├── login.tsx                        [SCAFFOLD]  Login screen
│   │   └── signup.tsx                       [SCAFFOLD]  Signup screen
│   │
│   ├── (user)/
│   │   ├── _layout.tsx                      [IMPLEMENT] Protected user layout
│   │   ├── dashboard.tsx                    [SCAFFOLD]  User dashboard
│   │   ├── my-issues.tsx                    [SCAFFOLD]  My issues list
│   │   └── profile.tsx                      [SCAFFOLD]  User profile
│   │
│   ├── (volunteer)/
│   │   ├── _layout.tsx                      [IMPLEMENT] Protected volunteer layout
│   │   ├── onboard.tsx                      [SCAFFOLD]  Volunteer onboarding
│   │   ├── dashboard.tsx                    [SCAFFOLD]  Volunteer dashboard
│   │   ├── alerts/
│   │   │   └── [id].tsx                     [SCAFFOLD]  Alert detail
│   │   └── teams/
│   │       └── create.tsx                   [SCAFFOLD]  Team create
│   │
│   └── (admin)/
│       ├── _layout.tsx                      [IMPLEMENT] Protected admin layout
│       ├── index.tsx                        [SCAFFOLD]  Admin dashboard
│       ├── issues.tsx                       [SCAFFOLD]  Admin issues
│       ├── volunteers.tsx                   [SCAFFOLD]  Admin volunteers
│       ├── disasters.tsx                    [SCAFFOLD]  Admin disasters
│       └── campaigns.tsx                    [SCAFFOLD]  Admin campaigns
│
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx                   [SCAFFOLD]  Phase 3
│   │   │   ├── Input.tsx                    [SCAFFOLD]  Phase 3
│   │   │   ├── Card.tsx                     [SCAFFOLD]  Phase 3
│   │   │   ├── Badge.tsx                    [SCAFFOLD]  Phase 3
│   │   │   ├── LoadingSpinner.tsx           [SCAFFOLD]  Phase 3
│   │   │   ├── EmptyState.tsx               [SCAFFOLD]  Phase 3
│   │   │   └── ErrorState.tsx               [SCAFFOLD]  Phase 3
│   │   ├── layout/
│   │   │   ├── PageWrapper.tsx              [SCAFFOLD]  Phase 3
│   │   │   ├── Navbar.tsx                   [SCAFFOLD]  Phase 3
│   │   │   └── MobileBottomNav.tsx          [SCAFFOLD]  Phase 3
│   │   └── auth/
│   │       ├── LoginForm.tsx                [SCAFFOLD]  Phase 2
│   │       └── SignupForm.tsx               [SCAFFOLD]  Phase 2
│   │
│   ├── context/
│   │   └── AuthContext.tsx                  [IMPLEMENT] Auth state context + provider
│   │
│   ├── hooks/
│   │   ├── useAuth.ts                       [IMPLEMENT] Auth hook consuming AuthContext
│   │   ├── useLocation.ts                   [SCAFFOLD]  Phase 3 — expo-location wrapper
│   │   └── useVolunteerProfile.ts           [SCAFFOLD]  Phase 6
│   │
│   ├── lib/
│   │   ├── axios.ts                         [SCAFFOLD]  Phase 2 — Axios instance + interceptor
│   │   ├── authClient.ts                    [SCAFFOLD]  Phase 2 — Better Auth client
│   │   └── queryClient.ts                   [IMPLEMENT] React Query client config
│   │
│   ├── constants/
│   │   ├── theme.ts                         [IMPLEMENT] Colors, typography, spacing
│   │   ├── enums.ts                         [IMPLEMENT] All app enums (exact values)
│   │   ├── routes.ts                        [IMPLEMENT] All route string constants
│   │   └── strings.ts                       [IMPLEMENT] EN/HI bilingual string map
│   │
│   ├── types/
│   │   ├── auth.ts                          [IMPLEMENT] User, Session types
│   │   ├── api.ts                           [IMPLEMENT] API response shapes
│   │   ├── issue.ts                         [IMPLEMENT] Issue, Assignment types
│   │   ├── disaster.ts                      [IMPLEMENT] Disaster, Team types
│   │   ├── volunteer.ts                     [IMPLEMENT] Volunteer, Qualification types
│   │   ├── campaign.ts                      [IMPLEMENT] Campaign, Donation types
│   │   └── navigation.ts                    [IMPLEMENT] Typed route param maps
│   │
│   └── utils/
│       ├── formatters.ts                    [IMPLEMENT] Date, currency, phone formatters
│       ├── validators.ts                    [IMPLEMENT] Zod schemas for all forms
│       └── storage.ts                       [IMPLEMENT] SecureStore read/write helpers
│
├── assets/
│   ├── images/
│   │   └── .gitkeep
│   └── fonts/
│       └── .gitkeep
│
├── docs/
│   └── CONTEXT.md                           [IMPLEMENT] Living context document (see below)
│
├── app.json                                 [IMPLEMENT]
├── tailwind.config.js                       [IMPLEMENT]
├── babel.config.js                          [IMPLEMENT]
├── tsconfig.json                            [IMPLEMENT]
├── metro.config.js                          [IMPLEMENT]
└── package.json                             [IMPLEMENT]

FILES TO IMPLEMENT IN FULL
1. tailwind.config.js
js/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  "#eff6ff",
          100: "#dbeafe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          900: "#1e3a5f",
        },
        danger:  "#dc2626",
        warning: "#d97706",
        success: "#16a34a",
        muted:   "#6b7280",
      },
      fontFamily: {
        sans:  ["System"],
        mono:  ["SpaceMono"],
      },
    },
  },
  plugins: [],
};

2. src/constants/theme.ts — IMPLEMENT FULLY
tsexport const Colors = {
  primary:        "#1e3a5f",
  primaryLight:   "#2563eb",
  primarySurface: "#eff6ff",
  danger:         "#dc2626",
  dangerSurface:  "#fef2f2",
  warning:        "#d97706",
  warningSurface: "#fffbeb",
  success:        "#16a34a",
  successSurface: "#f0fdf4",
  muted:          "#6b7280",
  mutedSurface:   "#f9fafb",
  border:         "#e5e7eb",
  white:          "#ffffff",
  black:          "#111827",
  background:     "#f3f4f6",
} as const;

export const FontSize = {
  xs:   12,
  sm:   14,
  base: 16,
  lg:   18,
  xl:   20,
  "2xl": 24,
  "3xl": 30,
} as const;

export const FontWeight = {
  regular: "400" as const,
  medium:  "500" as const,
  semibold:"600" as const,
  bold:    "700" as const,
} as const;

export const Spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  "2xl": 48,
} as const;

export const BorderRadius = {
  sm:   6,
  md:   10,
  lg:   16,
  full: 9999,
} as const;

3. src/constants/enums.ts — USE EXACTLY THESE VALUES
ts// These are the canonical enum values used by the backend.
// Never use string literals in components — always import from here.

export const UserRole = {
  USER:      "user",
  VOLUNTEER: "volunteer",
  ADMIN:     "admin",
} as const;

export const VolunteerRank = {
  BEGINNER:  "beginner",
  TRAINED:   "trained",
  ADVANCED:  "advanced",
  EXPERT:    "expert",
  LEADER:    "leader",
} as const;

export const QualificationType = {
  FIRST_AID:  "first_aid",
  CPR:        "cpr",
  SWIMMING:   "swimming",
  DRIVING:    "driving",
  MEDICAL:    "medical",
  COUNSELING: "counseling",
  RESCUE:     "rescue",
} as const;

export const TeamType = {
  RESCUE:  "rescue",
  MEDICAL: "medical",
  RELIEF:  "relief",
  GENERAL: "general",
} as const;

export const TeamMemberRole = {
  LEADER:    "leader",
  CO_LEADER: "co-leader",
  MEMBER:    "member",
} as const;

export const IssueStatus = {
  PENDING:      "pending",
  ACKNOWLEDGED: "acknowledged",
  ASSIGNED:     "assigned",
  IN_PROGRESS:  "in_progress",
  RESOLVED:     "resolved",
  ESCALATED:    "escalated",
  CANCELLED:    "cancelled",
} as const;

export const IssueSeverity = {
  LOW:      "low",
  MEDIUM:   "medium",
  HIGH:     "high",
  CRITICAL: "critical",
} as const;

export const ReporterRelation = {
  SELF:      "self",
  FAMILY:    "family",
  BYSTANDER: "bystander",
} as const;

export const AssignmentStatus = {
  ASSIGNED:  "assigned",
  ACCEPTED:  "accepted",
  EN_ROUTE:  "en_route",
  ON_SITE:   "on_site",
  COMPLETED: "completed",
  DROPPED:   "dropped",
} as const;

export const DisasterType = {
  FLOOD:      "flood",
  EARTHQUAKE: "earthquake",
  CYCLONE:    "cyclone",
  DROUGHT:    "drought",
  FIRE:       "fire",
  PANDEMIC:   "pandemic",
  OTHER:      "other",
} as const;

export const DisasterSeverity = {
  MINOR:         "minor",
  MODERATE:      "moderate",
  SEVERE:        "severe",
  CATASTROPHIC:  "catastrophic",
} as const;

export const DisasterStatus = {
  ACTIVE:    "active",
  CONTAINED: "contained",
  RESOLVED:  "resolved",
} as const;

export const ResponseLevel = {
  LOCAL:    "local",
  DISTRICT: "district",
  STATE:    "state",
  NATIONAL: "national",
} as const;

export const CampaignStatus = {
  DRAFT:            "draft",
  PENDING_APPROVAL: "pending_approval",
  ACTIVE:           "active",
  COMPLETED:        "completed",
  CANCELLED:        "cancelled",
} as const;

export const CampaignCategory = {
  DISASTER_RELIEF: "disaster_relief",
  MEDICAL:         "medical",
  EDUCATION:       "education",
  COMMUNITY:       "community",
} as const;

export const BeneficiaryType = {
  INDIVIDUAL:   "individual",
  FAMILY:       "family",
  COMMUNITY:    "community",
  ORGANIZATION: "organization",
} as const;

export const PaymentStatus = {
  PENDING:   "pending",
  COMPLETED: "completed",
  FAILED:    "failed",
  REFUNDED:  "refunded",
} as const;

4. src/constants/routes.ts — IMPLEMENT FULLY
ts// Never use raw strings for navigation. Always import from here.

export const Routes = {
  // Public
  HOME:            "/",
  PANIC:           "/panic",
  DISASTERS:       "/disasters",
  DISASTER_DETAIL: (id: string) => `/disasters/${id}` as const,
  TEAMS:           "/teams",
  TEAM_DETAIL:     (id: string) => `/teams/${id}` as const,

  // Auth
  LOGIN:           "/auth/login",
  SIGNUP:          "/auth/signup",

  // User
  DASHBOARD:       "/dashboard",
  MY_ISSUES:       "/my-issues",
  PROFILE:         "/profile",

  // Volunteer
  VOLUNTEER_ONBOARD:   "/volunteer/onboard",
  VOLUNTEER_DASHBOARD: "/volunteer/dashboard",
  VOLUNTEER_ALERT:     (id: string) => `/volunteer/alerts/${id}` as const,
  TEAM_CREATE:         "/volunteer/teams/create",

  // Admin
  ADMIN:                "/admin",
  ADMIN_ISSUES:         "/admin/issues",
  ADMIN_VOLUNTEERS:     "/admin/volunteers",
  ADMIN_DISASTERS:      "/admin/disasters",
  ADMIN_CAMPAIGNS:      "/admin/campaigns",
} as const;

5. src/constants/strings.ts — BILINGUAL (EN + HI)
ts// All user-facing strings live here.
// Components must use this — never hardcode display text.
// Add new strings here first, then use the key.

export type Lang = "en" | "hi";

export const Strings = {
  en: {
    appName:            "Bihar Sahayata",
    tagline:            "Disaster Relief & Volunteer Coordination",
    login:              "Login",
    signup:             "Sign Up",
    logout:             "Logout",
    dashboard:          "Dashboard",
    profile:            "Profile",
    myIssues:           "My Issues",
    volunteerDashboard: "Volunteer Dashboard",
    reportEmergency:    "Report Emergency",
    activeDisasters:    "Active Disasters",
    becomeVolunteer:    "Become a Volunteer",
    contributeRelief:   "Contribute to Relief Fund",
    panicAlert:         "PANIC ALERT",
    cancel:             "Cancel",
    submit:             "Submit",
    loading:            "Loading...",
    error:              "Something went wrong",
    retry:              "Try Again",
    returnHome:         "Return Home",
    signIn:             "Sign In",
    noData:             "No data available",
    teams:              "Teams",
    createTeam:         "Create Team",
    joinTeam:           "Join Team",
    leaveTeam:          "Leave Team",
    donate:             "Donate",
    saveProfile:        "Save Profile",
    registerVolunteer:  "Register as Volunteer",
    admin:              "Admin Panel",
    verify:             "Verify",
    approve:            "Approve",
    reject:             "Reject",
    escalate:           "Escalate",
    resolve:            "Mark as Resolved",
    acknowledge:        "Acknowledge",
  },
  hi: {
    appName:            "बिहार सहायता",
    tagline:            "आपदा राहत एवं स्वयंसेवक समन्वय",
    login:              "लॉग इन",
    signup:             "साइन अप",
    logout:             "लॉग आउट",
    dashboard:          "डैशबोर्ड",
    profile:            "प्रोफ़ाइल",
    myIssues:           "मेरी समस्याएँ",
    volunteerDashboard: "स्वयंसेवक डैशबोर्ड",
    reportEmergency:    "आपातकाल रिपोर्ट करें",
    activeDisasters:    "सक्रिय आपदाएँ",
    becomeVolunteer:    "स्वयंसेवक बनें",
    contributeRelief:   "राहत कोष में योगदान दें",
    panicAlert:         "आपातकालीन अलर्ट",
    cancel:             "रद्द करें",
    submit:             "सबमिट करें",
    loading:            "लोड हो रहा है...",
    error:              "कुछ गलत हुआ",
    retry:              "पुनः प्रयास करें",
    returnHome:         "होम पर वापस जाएँ",
    signIn:             "साइन इन करें",
    noData:             "कोई डेटा उपलब्ध नहीं",
    teams:              "टीमें",
    createTeam:         "टीम बनाएँ",
    joinTeam:           "टीम में शामिल हों",
    leaveTeam:          "टीम छोड़ें",
    donate:             "दान करें",
    saveProfile:        "प्रोफ़ाइल सहेजें",
    registerVolunteer:  "स्वयंसेवक के रूप में पंजीकरण करें",
    admin:              "एडमिन पैनल",
    verify:             "सत्यापित करें",
    approve:            "स्वीकृत करें",
    reject:             "अस्वीकार करें",
    escalate:           "बढ़ाएँ",
    resolve:            "हल के रूप में चिह्नित करें",
    acknowledge:        "पावती दें",
  },
} as const;

export type StringKey = keyof typeof Strings.en;

6. src/types/ — IMPLEMENT ALL TYPE FILES
src/types/auth.ts
tsimport { UserRole } from "../constants/enums";

export type Role = typeof UserRole[keyof typeof UserRole];

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  user: User;
  token: string;
  expiresAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
src/types/api.ts
ts// Standard API response shapes from the backend.
// All endpoints follow this contract — never assume a different shape.

export interface ApiSuccess<T = unknown> {
  success: true;
  message: string;
  data?: T;
}

export interface ApiError {
  error: string;
  fields?: Record<string, string>;  // Validation errors: field → message
}

export interface PaginatedResponse<T> {
  items: T[];
  count: number;
}
src/types/issue.ts
tsimport { IssueStatus, IssueSeverity, ReporterRelation, AssignmentStatus } from "../constants/enums";

export type IssueStatusType     = typeof IssueStatus[keyof typeof IssueStatus];
export type IssueSeverityType   = typeof IssueSeverity[keyof typeof IssueSeverity];
export type ReporterRelationType = typeof ReporterRelation[keyof typeof ReporterRelation];
export type AssignmentStatusType = typeof AssignmentStatus[keyof typeof AssignmentStatus];

export interface Issue {
  id: string;
  title: string;
  description: string;
  issueTypeCode?: string;
  status: IssueStatusType;
  severity: IssueSeverityType;
  reporterRelation: ReporterRelationType;
  victimName?: string;
  victimPhone: string;
  victimAge?: number;
  victimGender?: string;
  district?: string;
  address?: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  disasterId?: string;
  reportedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Assignment {
  id: string;
  issueId: string;
  volunteerId: string;
  status: AssignmentStatusType;
  acceptedAt?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  createdAt: string;
}
src/types/disaster.ts
tsimport { DisasterType, DisasterSeverity, DisasterStatus, ResponseLevel, TeamType } from "../constants/enums";

export type DisasterTypeValue    = typeof DisasterType[keyof typeof DisasterType];
export type DisasterSeverityType = typeof DisasterSeverity[keyof typeof DisasterSeverity];
export type DisasterStatusType   = typeof DisasterStatus[keyof typeof DisasterStatus];
export type ResponseLevelType    = typeof ResponseLevel[keyof typeof ResponseLevel];
export type TeamTypeValue        = typeof TeamType[keyof typeof TeamType];

export interface Disaster {
  id: string;
  name: string;
  description: string;
  disasterType: DisasterTypeValue;
  severity: DisasterSeverityType;
  status: DisasterStatusType;
  responseLevel: ResponseLevelType;
  affectedDistricts: string[];
  latitude?: number;
  longitude?: number;
  startedAt: string;
  containedAt?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  teamType: TeamTypeValue;
  district: string;
  maxMembers?: number;
  isActive: boolean;
  leaderId?: string;
  memberCount: number;
  createdAt: string;
}
src/types/volunteer.ts
tsimport { VolunteerRank, QualificationType } from "../constants/enums";

export type VolunteerRankType       = typeof VolunteerRank[keyof typeof VolunteerRank];
export type QualificationTypeValue  = typeof QualificationType[keyof typeof QualificationType];

export interface VolunteerProfile {
  id: string;
  userId: string;
  displayName: string;
  phone: string;
  age?: number;
  bio?: string;
  rank: VolunteerRankType;
  isVerified: boolean;
  isAvailable: boolean;
  district: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  serviceRadius?: number;
  specializations: string[];
  experienceYears?: number;
  totalResolves: number;
  rating?: number;
  createdAt: string;
}
src/types/campaign.ts
tsimport { CampaignStatus, CampaignCategory, BeneficiaryType, PaymentStatus } from "../constants/enums";

export type CampaignStatusType    = typeof CampaignStatus[keyof typeof CampaignStatus];
export type CampaignCategoryType  = typeof CampaignCategory[keyof typeof CampaignCategory];
export type BeneficiaryTypeValue  = typeof BeneficiaryType[keyof typeof BeneficiaryType];
export type PaymentStatusType     = typeof PaymentStatus[keyof typeof PaymentStatus];

export interface Campaign {
  id: string;
  title: string;
  description: string;
  story?: string;
  category: CampaignCategoryType;
  status: CampaignStatusType;
  goalAmount: number;        // stored in paisa
  raisedAmount: number;      // stored in paisa
  beneficiaryName?: string;
  beneficiaryType: BeneficiaryTypeValue;
  disasterId?: string;
  district?: string;
  coverImage?: string;
  videoUrl?: string;
  isVerified: boolean;
  endsAt?: string;
  createdAt: string;
}

export interface Donation {
  id: string;
  campaignId?: string;
  amount: number;            // in paisa
  donorName?: string;
  donorEmail?: string;
  donorPhone?: string;
  message?: string;
  isAnonymous: boolean;
  paymentStatus: PaymentStatusType;
  createdAt: string;
}

7. src/context/AuthContext.tsx — IMPLEMENT FULLY
tsximport React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import * as SecureStore from "expo-secure-store";
import { AuthState, User } from "../types/auth";

const TOKEN_KEY = "bihar_sahayata_token";

interface AuthContextValue extends AuthState {
  setAuth: (user: User, token: string) => Promise<void>;
  clearAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user:            null,
    token:           null,
    isLoading:       true,
    isAuthenticated: false,
  });

  // On mount: restore token from SecureStore
  useEffect(() => {
    (async () => {
      try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        if (token) {
          // Token exists — session validation happens in Phase 2
          // For now, mark as potentially authenticated so Phase 2 can validate
          setState(prev => ({ ...prev, token, isLoading: false }));
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    })();
  }, []);

  const setAuth = async (user: User, token: string) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    setState({ user, token, isLoading: false, isAuthenticated: true });
  };

  const clearAuth = async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
  };

  return (
    <AuthContext.Provider value={{ ...state, setAuth, clearAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}

export { TOKEN_KEY };

8. src/hooks/useAuth.ts — IMPLEMENT FULLY
tsimport { useAuthContext } from "../context/AuthContext";
import { UserRole } from "../constants/enums";

export function useAuth() {
  const auth = useAuthContext();

  return {
    ...auth,
    isUser:      auth.user?.role === UserRole.USER,
    isVolunteer: auth.user?.role === UserRole.VOLUNTEER,
    isAdmin:     auth.user?.role === UserRole.ADMIN,
  };
}

9. src/lib/queryClient.ts — IMPLEMENT FULLY
tsimport { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry:              2,
      staleTime:          1000 * 60 * 5,  // 5 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

10. src/utils/storage.ts — IMPLEMENT FULLY
tsimport * as SecureStore from "expo-secure-store";

export const Storage = {
  async get(key: string): Promise<string | null> {
    try { return await SecureStore.getItemAsync(key); }
    catch { return null; }
  },

  async set(key: string, value: string): Promise<boolean> {
    try { await SecureStore.setItemAsync(key, value); return true; }
    catch { return false; }
  },

  async delete(key: string): Promise<boolean> {
    try { await SecureStore.deleteItemAsync(key); return true; }
    catch { return false; }
  },
};

11. src/utils/formatters.ts — IMPLEMENT FULLY
ts// All display formatting lives here. Never format inline in components.

export function formatCurrency(paisa: number, symbol = "₹"): string {
  const rupees = paisa / 100;
  return `${symbol}${rupees.toLocaleString("en-IN")}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1)   return "Just now";
  if (minutes < 60)  return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24)    return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+91 ${digits.slice(0,5)} ${digits.slice(5)}`;
  return phone;
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, " ");
}

12. app/_layout.tsx — ROOT LAYOUT
tsximport { useEffect } from "react";
import { Stack } from "expo-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../src/context/AuthContext";
import { queryClient } from "../src/lib/queryClient";
import "../global.css";  // NativeWind

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </AuthProvider>
    </QueryClientProvider>
  );
}

13. app/index.tsx — ENTRY REDIRECT
tsximport { Redirect } from "expo-router";
import { useAuth } from "../src/hooks/useAuth";
import { Routes } from "../src/constants/routes";
import { View, ActivityIndicator } from "react-native";
import { Colors } from "../src/constants/theme";

export default function Index() {
  const { isLoading, isAuthenticated, isAdmin, isVolunteer } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.background }}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  if (!isAuthenticated) return <Redirect href={Routes.HOME as never} />;
  if (isAdmin)          return <Redirect href={Routes.ADMIN as never} />;
  if (isVolunteer)      return <Redirect href={Routes.VOLUNTEER_DASHBOARD as never} />;
  return <Redirect href={Routes.DASHBOARD as never} />;
}

14. Group _layout.tsx files — PROTECTED ROUTE GUARDS
app/(user)/_layout.tsx
tsximport { Redirect, Stack } from "expo-router";
import { useAuth } from "../../src/hooks/useAuth";
import { Routes } from "../../src/constants/routes";

export default function UserLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading)        return null;
  if (!isAuthenticated) return <Redirect href={Routes.LOGIN as never} />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
app/(volunteer)/_layout.tsx
tsximport { Redirect, Stack } from "expo-router";
import { useAuth } from "../../src/hooks/useAuth";
import { Routes } from "../../src/constants/routes";
import { UserRole } from "../../src/constants/enums";

export default function VolunteerLayout() {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading)        return null;
  if (!isAuthenticated) return <Redirect href={Routes.LOGIN as never} />;
  if (user?.role === UserRole.USER) return <Redirect href={Routes.VOLUNTEER_ONBOARD as never} />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
app/(admin)/_layout.tsx
tsximport { Redirect, Stack } from "expo-router";
import { useAuth } from "../../src/hooks/useAuth";
import { Routes } from "../../src/constants/routes";
import { UserRole } from "../../src/constants/enums";

export default function AdminLayout() {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading)        return null;
  if (!isAuthenticated) return <Redirect href={Routes.LOGIN as never} />;
  if (user?.role !== UserRole.ADMIN) return <Redirect href={Routes.DASHBOARD as never} />;
  return <Stack screenOptions={{ headerShown: false }} />;
}

THE LIVING CONTEXT DOCUMENT
Create docs/CONTEXT.md with exactly this content. This file is the single source of truth for every AI agent or developer who works in this repository after you.
markdown# Bihar Sahayata — Project Context Document

**Version:** 1.0.0  
**Last Updated:** Phase 1  
**Classification:** Government Project — Bihar Disaster Management Authority  
**Purpose:** This document gives any AI agent or developer complete context to work in this repository without causing regressions, inconsistencies, or architecture violations.

---

## What This App Is

Bihar Sahayata is a government-grade disaster relief and volunteer coordination platform for Bihar, India. It consists of:
- A fully complete backend (Node.js + Express + TypeScript + Drizzle ORM + Neon Postgres)
- This React Native mobile app (Expo + Expo Router + NativeWind + TypeScript)

The app serves three user roles: **citizens (user)**, **volunteers**, and **admins**.

---

## Current Phase Status

| Phase | Name | Status |
|-------|------|--------|
| 1 | Scaffold & Navigation | ✅ Complete |
| 2 | Auth System | ⏳ Not started |
| 3 | Shared Infrastructure | ⏳ Not started |
| 4 | Public Screens | ⏳ Not started |
| 5 | User Screens | ⏳ Not started |
| 6 | Volunteer Screens | ⏳ Not started |
| 7 | Admin Screens | ⏳ Not started |
| 8 | Polish | ⏳ Not started |

**Update this table at the start of every phase.**

---

## Backend

The backend is **100% complete and must not be modified**.

- Base URL (dev): `http://localhost:3000`
- Auth: Better Auth with bearer token for React Native
- Docs: `http://localhost:3000/api/docs`

### Test Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@biharsahayata.in | Admin@123456 |
| Volunteer | volunteer@biharsahayata.in | Volunteer@123 |
| User | user@biharsahayata.in | User@123456 |

### Auth Flow for React Native
1. POST `/api/auth/sign-in/email` → response contains `{ token }`
2. Store token: `await SecureStore.setItemAsync("bihar_sahayata_token", token)`
3. Attach to every request: `Authorization: Bearer <token>`
4. On 401: clear token + redirect to login
5. On app launch: read token from SecureStore → call `GET /api/auth/get-session` to validate

### Error Contract
All API errors follow this shape:
```json
{ "error": "string", "fields": { "fieldName": "message" } }
```
All successes:
```json
{ "success": true, "message": "string", ...data }
```

---

## Architecture Rules — NEVER VIOLATE THESE

1. **Never hardcode route strings.** Always import from `src/constants/routes.ts`.
2. **Never hardcode display text.** Always import from `src/constants/strings.ts`.
3. **Never hardcode enum values.** Always import from `src/constants/enums.ts`.
4. **Never format dates, currency, or phone inline.** Always use `src/utils/formatters.ts`.
5. **Never write raw `fetch` calls.** Always use the Axios instance from `src/lib/axios.ts` (created in Phase 2).
6. **Never manage server state with `useState`.** Always use React Query (`@tanstack/react-query`).
7. **Never store sensitive data in AsyncStorage.** Always use `expo-secure-store` via `src/utils/storage.ts`.
8. **Never put business logic in screen files.** Screens are dumb — logic goes in hooks.
9. **Every new screen must use `PageWrapper`.** (Created in Phase 3.)
10. **All amounts from the backend are in paisa.** Display using `formatCurrency()`.

---

## Folder Conventions
```
app/              Expo Router screens (routes)
src/components/   Reusable UI components
src/context/      React contexts (AuthContext)
src/hooks/        Custom hooks (useAuth, useLocation, etc.)
src/lib/          Third-party client setup (axios, queryClient, authClient)
src/constants/    Enums, routes, strings, theme
src/types/        TypeScript interfaces for all data models
src/utils/        Pure utility functions (formatters, validators, storage)
docs/             Project documentation
```

---

## Navigation Structure

| Route group | Guard | Redirect if fails |
|-------------|-------|-------------------|
| `(public)/` | None | — |
| `auth/` | None | — |
| `(user)/` | isAuthenticated | → /auth/login |
| `(volunteer)/` | isAuthenticated + role check | → /auth/login or /volunteer/onboard |
| `(admin)/` | isAuthenticated + role === admin | → /auth/login or /dashboard |

---

## All Enum Values (Canonical — Backend Enforced)

### user.role
`user` · `volunteer` · `admin`

### volunteer.rank
`beginner` · `trained` · `advanced` · `expert` · `leader`

### volunteer.qualificationType
`first_aid` · `cpr` · `swimming` · `driving` · `medical` · `counseling` · `rescue`

### team.teamType
`rescue` · `medical` · `relief` · `general`

### team_membership.role
`leader` · `co-leader` · `member`

### issue.status
`pending` · `acknowledged` · `assigned` · `in_progress` · `resolved` · `escalated` · `cancelled`

### issue.severity
`low` · `medium` · `high` · `critical`

### issue.reporterRelation
`self` · `family` · `bystander`

### assignment.status
`assigned` · `accepted` · `en_route` · `on_site` · `completed` · `dropped`

### disaster.disasterType
`flood` · `earthquake` · `cyclone` · `drought` · `fire` · `pandemic` · `other`

### disaster.severity
`minor` · `moderate` · `severe` · `catastrophic`

### disaster.status
`active` · `contained` · `resolved`

### disaster.responseLevel
`local` · `district` · `state` · `national`

### campaign.status
`draft` · `pending_approval` · `active` · `completed` · `cancelled`

### campaign.category
`disaster_relief` · `medical` · `education` · `community`

### campaign.beneficiaryType
`individual` · `family` · `community` · `organization`

### donation.paymentStatus
`pending` · `completed` · `failed` · `refunded`

---

## Screen Inventory

| Screen | Route | Role | Phase |
|--------|-------|------|-------|
| Home / Landing | / | Public | 4 |
| Auth Login | /auth/login | Public | 2 |
| Auth Signup | /auth/signup | Public | 2 |
| Panic SOS | /panic | Public | 4 |
| Disasters List | /disasters | Public | 4 |
| Disaster Detail | /disasters/[id] | Public | 4 |
| Teams List | /teams | Public | 4 |
| Team Detail | /teams/[id] | Public | 4 |
| User Dashboard | /dashboard | User | 5 |
| My Issues | /my-issues | User | 5 |
| User Profile | /profile | User | 5 |
| Volunteer Onboard | /volunteer/onboard | User→Volunteer | 6 |
| Volunteer Dashboard | /volunteer/dashboard | Volunteer | 6 |
| Volunteer Alert Detail | /volunteer/alerts/[id] | Volunteer | 6 |
| Team Create | /volunteer/teams/create | Volunteer | 6 |
| Admin Dashboard | /admin | Admin | 7 |
| Admin Issues | /admin/issues | Admin | 7 |
| Admin Volunteers | /admin/volunteers | Admin | 7 |
| Admin Disasters | /admin/disasters | Admin | 7 |
| Admin Campaigns | /admin/campaigns | Admin | 7 |

---

## Component Status

| Component | File | Status |
|-----------|------|--------|
| Button | src/components/ui/Button.tsx | Phase 3 |
| Input | src/components/ui/Input.tsx | Phase 3 |
| Card | src/components/ui/Card.tsx | Phase 3 |
| Badge | src/components/ui/Badge.tsx | Phase 3 |
| LoadingSpinner | src/components/ui/LoadingSpinner.tsx | Phase 3 |
| EmptyState | src/components/ui/EmptyState.tsx | Phase 3 |
| ErrorState | src/components/ui/ErrorState.tsx | Phase 3 |
| PageWrapper | src/components/layout/PageWrapper.tsx | Phase 3 |
| Navbar | src/components/layout/Navbar.tsx | Phase 3 |
| MobileBottomNav | src/components/layout/MobileBottomNav.tsx | Phase 3 |
| LoginForm | src/components/auth/LoginForm.tsx | Phase 2 |
| SignupForm | src/components/auth/SignupForm.tsx | Phase 2 |

---

## Known Gaps (Do Not Implement Until the Named Phase)

- `/auth/forgot-password` — not in current scope
- `/campaigns/[slug]` — referenced in disaster detail, not in scope
- `/volunteer/profile` — referenced in volunteer dashboard, not in scope  
- `/volunteer/alerts` — list view, not in scope
- `/volunteer/team` — referenced, not in scope
- `/report` — referenced in my-issues, handled via dashboard dialog instead

---

## Decisions Log

| Decision | Reason |
|----------|--------|
| Expo Router for navigation | File-based routing matches Next.js; familiar to team |
| NativeWind v4 for styling | Tailwind syntax consistency across web and mobile |
| React Query for server state | Caching, background refresh, optimistic updates |
| SecureStore for token | AsyncStorage is not encrypted; bearer token is sensitive |
| Axios over fetch | Interceptor support for Bearer token attachment and 401 handling |
| Bilingual strings in Phase 1 | Prevents refactoring in Phase 8; Bihar has large Hindi-speaking user base |
| Amounts in paisa | Backend stores all money in paisa; display layer divides by 100 |

---

## How to Add a New Screen

1. Create the file in the correct `app/` group folder
2. Add the route constant to `src/constants/routes.ts`
3. Add any new strings to `src/constants/strings.ts` (both `en` and `hi`)
4. Add any new types to `src/types/`
5. Create a custom hook in `src/hooks/` for the screen's data fetching
6. Update the Screen Inventory table in this document
7. Update the Phase Status table in this document

---

## How to Use This Document

**Before starting any task in this repo:**
1. Read the Phase Status table — know what is and is not built yet
2. Read the Architecture Rules — do not violate them
3. Read the Known Gaps — do not implement anything in that list early
4. Check the Decisions Log before proposing architectural changes

**After completing a phase:**
1. Update the Phase Status table
2. Update the Component Status table
3. Add any new decisions to the Decisions Log
4. Add any new known gaps discovered during implementation

SCAFFOLD TEMPLATE — USE FOR EVERY [SCAFFOLD] FILE
Every scaffold file must follow this exact pattern:
tsx// [SCAFFOLD] — Implemented in Phase N
// Screen: <Screen Name>
// Route: <route>
// See: docs/CONTEXT.md for architecture rules

import { View, Text } from "react-native";

export default function ScreenName() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 16, color: "#6b7280" }}>
        [Screen Name] — Phase N
      </Text>
    </View>
  );
}

PHASE 1 ACCEPTANCE CRITERIA
Before marking Phase 1 complete, verify every item:

 npx expo start runs without errors
 TypeScript compiles with zero errors (npx tsc --noEmit)
 All 20 scaffold screens render their placeholder text (no crashes)
 Navigation to /auth/login works from the root index
 (user)/_layout redirects to login when not authenticated
 (volunteer)/_layout redirects to login when not authenticated
 (admin)/_layout redirects to login when not authenticated
 docs/CONTEXT.md exists and is complete
 All enum values in src/constants/enums.ts match the backend spec exactly
 No hardcoded strings, colors, or route strings anywhere in the codebase


DO NOT DO IN THIS PHASE

Do not install or configure better-auth/react-native (Phase 2)
Do not implement the Axios instance (Phase 2)
Do not make any API calls (Phase 2+)
Do not implement any business logic in screens (Phase 4–7)
Do not add push notification config (Phase 8)
Do not add app icon or splash screen (Phase 8)