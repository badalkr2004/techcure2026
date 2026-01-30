"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
    MapPin,
    Phone,
    AlertTriangle,
    CheckCircle,
    Clock,
    Loader2,
    Shield,
    Users,
    Star,
    TrendingUp,
    Bell,
    Settings,
    ExternalLink,
    Waves,
    Flame,
    Wind,
    ShieldAlert,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { PageWrapper } from "@/components/layout";

interface VolunteerProfile {
    id: string;
    displayName: string;
    phone: string;
    age: number;
    rank: string;
    district: string;
    isAvailable: boolean;
    isVerified: boolean;
    totalResolves: number;
    rating: number;
    specializations: string[];
}

interface Issue {
    id: string;
    title: string | null;
    description: string | null;
    severity: string;
    status: string;
    district: string | null;
    address: string | null;
    landmark: string | null;
    victimPhone: string;
    latitude: number;
    longitude: number;
    createdAt: string;
    issueType: {
        name: string;
        icon: string;
        color: string;
    } | null;
}

interface DisasterActivation {
    id: string;
    status: string;
    assignedArea: string | null;
    responsibilities: string | null;
    activatedAt: string;
    disaster: {
        id: string;
        title: string;
        disasterType: string;
        severity: string;
        status: string;
        affectedDistricts: string[];
    };
    team: {
        id: string;
        name: string;
    };
}

// Helper to get location display text
const getLocationText = (issue: Issue): string => {
    if (issue.address) return issue.address;
    if (issue.landmark) return `Near ${issue.landmark}`;
    if (issue.district) return issue.district;
    if (issue.latitude && issue.longitude) {
        return `${issue.latitude.toFixed(4)}°N, ${issue.longitude.toFixed(4)}°E`;
    }
    return "Location captured";
};

const rankColors: Record<string, string> = {
    beginner: "bg-gray-500",
    trained: "bg-blue-500",
    advanced: "bg-purple-500",
    expert: "bg-orange-500",
    leader: "bg-yellow-500",
};

const severityColors: Record<string, string> = {
    low: "bg-green-500",
    medium: "bg-yellow-500",
    high: "bg-orange-500",
    critical: "bg-red-500",
};

const disasterIcons: Record<string, React.ReactNode> = {
    flood: <Waves className="w-5 h-5" />,
    earthquake: <AlertTriangle className="w-5 h-5" />,
    cyclone: <Wind className="w-5 h-5" />,
    fire: <Flame className="w-5 h-5" />,
    pandemic: <ShieldAlert className="w-5 h-5" />,
    other: <AlertTriangle className="w-5 h-5" />,
};

export default function VolunteerDashboardPage() {
    const router = useRouter();
    const { data: session, isPending: sessionLoading } = authClient.useSession();

    const [profile, setProfile] = useState<VolunteerProfile | null>(null);
    const [issues, setIssues] = useState<Issue[]>([]);
    const [activations, setActivations] = useState<DisasterActivation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingAvailability, setUpdatingAvailability] = useState(false);

    // Fetch volunteer profile and issues
    useEffect(() => {
        if (session?.user) {
            fetchData();
        }
    }, [session]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch profile
            const profileRes = await fetch("/api/volunteer/profile");
            if (profileRes.status === 404) {
                // Not a volunteer yet, redirect to onboarding
                router.push("/volunteer/onboard");
                return;
            }
            if (!profileRes.ok) throw new Error("Failed to fetch profile");
            const profileData = await profileRes.json();
            setProfile(profileData);

            // Fetch nearby issues
            const issuesRes = await fetch("/api/issues");
            if (issuesRes.ok) {
                const issuesData = await issuesRes.json();
                setIssues(issuesData.issues || []);
            }

            // Fetch disaster activations
            const activationsRes = await fetch("/api/volunteer/activations");
            if (activationsRes.ok) {
                const activationsData = await activationsRes.json();
                setActivations(activationsData.activations || []);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const toggleAvailability = async () => {
        if (!profile) return;

        setUpdatingAvailability(true);
        try {
            const res = await fetch("/api/volunteer/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isAvailable: !profile.isAvailable }),
            });

            if (res.ok) {
                setProfile({ ...profile, isAvailable: !profile.isAvailable });
            }
        } catch {
            // Handle error silently
        } finally {
            setUpdatingAvailability(false);
        }
    };

    // Loading state
    if (sessionLoading || loading) {
        return (
            <PageWrapper>
                <div className="min-h-[50vh] flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            </PageWrapper>
        );
    }

    // Not logged in
    if (!session?.user) {
        return (
            <PageWrapper showBackButton>
                <div className="min-h-[50vh] flex items-center justify-center p-4">
                    <Card className="w-full max-w-md text-center">
                        <CardContent className="pt-8 pb-8">
                            <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                            <h1 className="text-2xl font-bold mb-4">Volunteer Dashboard</h1>
                            <p className="text-gray-600 mb-6">
                                Please sign in to access your volunteer dashboard.
                            </p>
                            <Button onClick={() => router.push("/auth/login")} className="w-full">
                                Sign In
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </PageWrapper>
        );
    }

    // Error state
    if (error) {
        return (
            <PageWrapper showBackButton>
                <div className="min-h-[50vh] flex items-center justify-center p-4">
                    <Card className="w-full max-w-md text-center">
                        <CardContent className="pt-8 pb-8">
                            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                            <h1 className="text-xl font-bold mb-4">Error Loading Dashboard</h1>
                            <p className="text-gray-600 mb-6">{error}</p>
                            <Button onClick={fetchData}>Try Again</Button>
                        </CardContent>
                    </Card>
                </div>
            </PageWrapper>
        );
    }

    if (!profile) return null;

    const activeIssues = issues.filter((i) =>
        ["pending", "acknowledged", "assigned", "in_progress"].includes(i.status)
    );
    const criticalIssues = activeIssues.filter((i) => i.severity === "critical");

    return (
        <PageWrapper showBackButton>
            {/* Header */}
            <header className="bg-[#1a365d] text-white">
                <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/20 flex items-center justify-center">
                                <Shield className="w-6 h-6 sm:w-7 sm:h-7" />
                            </div>
                            <div>
                                <h1 className="text-lg sm:text-xl font-bold">{profile.displayName}</h1>
                                <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                                    <Badge className={`${rankColors[profile.rank]} text-white text-xs`}>
                                        {profile.rank.toUpperCase()}
                                    </Badge>
                                    {profile.isVerified ? (
                                        <Badge className="bg-green-500 text-white flex items-center gap-1 text-xs">
                                            <CheckCircle className="w-3 h-3" /> Verified
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-yellow-500 text-white text-xs">
                                            Pending
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-white/80">Available</span>
                                <Switch
                                    checked={profile.isAvailable}
                                    onCheckedChange={toggleAvailability}
                                    disabled={updatingAvailability}
                                />
                            </div>
                            <Button variant="secondary" size="sm" asChild>
                                <Link href="/volunteer/profile">
                                    <Settings className="w-4 h-4 mr-2" />
                                    Settings
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{profile.totalResolves}</p>
                                    <p className="text-sm text-gray-500">Issues Resolved</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                                    <Star className="w-6 h-6 text-yellow-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{profile.rating.toFixed(1)}</p>
                                    <p className="text-sm text-gray-500">Rating</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                    <AlertTriangle className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{criticalIssues.length}</p>
                                    <p className="text-sm text-gray-500">Critical Alerts</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                    <MapPin className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{profile.district}</p>
                                    <p className="text-sm text-gray-500">Service Area</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Disaster Activations */}
                {activations.length > 0 && (
                    <Card className="mb-8 border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-red-600">
                                <ShieldAlert className="w-5 h-5" />
                                Disaster Team Activations
                                <Badge className="bg-red-500">{activations.length}</Badge>
                            </CardTitle>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/disasters">View All Disasters</Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {activations.map((activation) => (
                                    <div
                                        key={activation.id}
                                        className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 rounded-lg"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600">
                                                {disasterIcons[activation.disaster.disasterType] || disasterIcons.other}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">
                                                        {activation.disaster.title}
                                                    </span>
                                                    <Badge variant="outline" className="text-xs capitalize">
                                                        {activation.disaster.severity}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    <span className="font-medium text-blue-600">{activation.team.name}</span>
                                                    {activation.assignedArea && (
                                                        <span> • {activation.assignedArea}</span>
                                                    )}
                                                </p>
                                                {activation.responsibilities && (
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {activation.responsibilities}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge className={
                                                activation.status === "deployed"
                                                    ? "bg-green-500"
                                                    : activation.status === "activated"
                                                        ? "bg-blue-500"
                                                        : "bg-gray-500"
                                            }>
                                                {activation.status}
                                            </Badge>
                                            <Button size="sm" asChild>
                                                <Link href={`/disasters/${activation.disaster.id}`}>
                                                    Details
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Active Alerts */}
                <Card className="mb-8">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="w-5 h-5" />
                            Nearby Alerts
                            {activeIssues.length > 0 && (
                                <Badge className="bg-red-500">{activeIssues.length}</Badge>
                            )}
                        </CardTitle>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/volunteer/alerts">View All</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {activeIssues.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                                <p>No active alerts in your area</p>
                                <p className="text-sm mt-2">
                                    You&apos;ll be notified when new emergencies occur nearby
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {activeIssues.slice(0, 5).map((issue) => (
                                    <div
                                        key={issue.id}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className={`w-3 h-3 rounded-full ${severityColors[issue.severity]
                                                    }`}
                                            />
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">
                                                        {issue.issueType?.name || "Alert"}
                                                    </span>
                                                    <Badge variant="outline" className="text-xs">
                                                        {issue.severity}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                                    <MapPin className="w-3 h-3" />
                                                    {getLocationText(issue)}
                                                    <span className="mx-1">•</span>
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(issue.createdAt).toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>
                                        <Button size="sm" asChild>
                                            <Link href={`/volunteer/alerts/${issue.id}`}>
                                                View
                                                <ExternalLink className="w-4 h-4 ml-2" />
                                            </Link>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="hover:shadow-lg transition cursor-pointer" onClick={() => router.push("/volunteer/alerts")}>
                        <CardContent className="pt-6 text-center">
                            <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-orange-500" />
                            <h3 className="font-semibold">View All Alerts</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                See all emergencies in your area
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition cursor-pointer" onClick={() => router.push("/volunteer/team")}>
                        <CardContent className="pt-6 text-center">
                            <Users className="w-10 h-10 mx-auto mb-3 text-blue-500" />
                            <h3 className="font-semibold">My Team</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Manage your volunteer team
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition cursor-pointer" onClick={() => router.push("/volunteer/profile")}>
                        <CardContent className="pt-6 text-center">
                            <Settings className="w-10 h-10 mx-auto mb-3 text-gray-500" />
                            <h3 className="font-semibold">Profile Settings</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Update your profile and preferences
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </PageWrapper>
    );
}
