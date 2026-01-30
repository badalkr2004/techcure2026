"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    User,
    AlertTriangle,
    Heart,
    MapPin,
    Phone,
    Clock,
    Loader2,
    Settings,
    Shield,
    Plus,
    CheckCircle,
    IndianRupee,
    ArrowRight,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

interface UserProfile {
    hasProfile: boolean;
    profile?: {
        phone: string | null;
        district: string | null;
        address: string | null;
        emergencyContactName: string | null;
        emergencyContactPhone: string | null;
    };
    user: {
        id: string;
        name: string;
        email: string;
        image: string | null;
    };
}

interface Issue {
    id: string;
    title: string | null;
    description: string | null;
    severity: string;
    status: string;
    createdAt: string;
    issueType: {
        name: string;
    } | null;
}

interface Donation {
    id: string;
    amount: number;
    paymentStatus: string;
    createdAt: string;
    campaign: {
        title: string;
    } | null;
}

const statusColors: Record<string, string> = {
    pending: "bg-yellow-500",
    acknowledged: "bg-blue-500",
    assigned: "bg-indigo-500",
    in_progress: "bg-purple-500",
    resolved: "bg-green-500",
    cancelled: "bg-gray-500",
};

export default function UserDashboard() {
    const router = useRouter();
    const { data: session, isPending: sessionLoading } = authClient.useSession();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [issues, setIssues] = useState<Issue[]>([]);
    const [donations, setDonations] = useState<Donation[]>([]);
    const [totalDonated, setTotalDonated] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session?.user) {
            fetchData();
        }
    }, [session]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch profile
            const profileRes = await fetch("/api/user/profile");
            if (profileRes.ok) {
                const profileData = await profileRes.json();
                setProfile(profileData);
            }

            // Fetch issues
            const issuesRes = await fetch("/api/user/issues");
            if (issuesRes.ok) {
                const issuesData = await issuesRes.json();
                setIssues(issuesData.issues || []);
            }

            // Fetch donations
            const donationsRes = await fetch("/api/user/donations");
            if (donationsRes.ok) {
                const donationsData = await donationsRes.json();
                setDonations(donationsData.donations || []);
                setTotalDonated(donationsData.totalAmount || 0);
            }
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    const formatAmount = (paisa: number) =>
        `₹${(paisa / 100).toLocaleString("en-IN")}`;

    if (sessionLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!session?.user) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="w-full max-w-md text-center">
                    <CardContent className="pt-8 pb-8">
                        <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
                        <p className="text-gray-600 mb-6">Please sign in to view your dashboard</p>
                        <Button onClick={() => router.push("/auth/login")} className="w-full">
                            Sign In
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const activeIssues = issues.filter(
        (i) => !["resolved", "cancelled"].includes(i.status)
    ).length;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* Header */}
            <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <div className="max-w-6xl mx-auto px-4 py-8">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                            {profile?.user.image ? (
                                <img
                                    src={profile.user.image}
                                    alt={profile.user.name}
                                    className="w-14 h-14 rounded-full"
                                />
                            ) : (
                                <User className="w-8 h-8" />
                            )}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">{profile?.user.name || "User"}</h1>
                            <p className="text-white/80">{profile?.user.email}</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8">
                {/* Profile Completion Banner */}
                {!profile?.hasProfile && (
                    <Card className="mb-8 border-blue-300 bg-blue-50 dark:bg-blue-900/20">
                        <CardContent className="pt-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center">
                                    <User className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-blue-700">Complete Your Profile</h3>
                                    <p className="text-sm text-gray-600">
                                        Add your contact info and emergency details for faster assistance
                                    </p>
                                </div>
                            </div>
                            <Button asChild>
                                <Link href="/profile">Complete Profile</Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Total Issues</p>
                                    <p className="text-3xl font-bold">{issues.length}</p>
                                </div>
                                <AlertTriangle className="w-8 h-8 text-orange-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Active Issues</p>
                                    <p className="text-3xl font-bold">{activeIssues}</p>
                                </div>
                                <Clock className="w-8 h-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Donations</p>
                                    <p className="text-3xl font-bold">{donations.length}</p>
                                </div>
                                <Heart className="w-8 h-8 text-pink-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Total Donated</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {formatAmount(totalDonated)}
                                    </p>
                                </div>
                                <IndianRupee className="w-8 h-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Recent Issues */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" />
                                My Issues
                            </CardTitle>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/my-issues">
                                    View All <ArrowRight className="w-4 h-4 ml-1" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {issues.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                                    <p>No issues reported</p>
                                    <Button size="sm" className="mt-4" asChild>
                                        <Link href="/report">
                                            <Plus className="w-4 h-4 mr-1" />
                                            Report Issue
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {issues.slice(0, 5).map((issue) => (
                                        <div
                                            key={issue.id}
                                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                                        >
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">
                                                        {issue.title || issue.issueType?.name || "Issue"}
                                                    </span>
                                                    <Badge className={statusColors[issue.status]}>
                                                        {issue.status.replace("_", " ")}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(issue.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Donations */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Heart className="w-5 h-5" />
                                My Donations
                            </CardTitle>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/disasters">
                                    Donate <ArrowRight className="w-4 h-4 ml-1" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {donations.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <Heart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                    <p>No donations yet</p>
                                    <Button size="sm" className="mt-4" asChild>
                                        <Link href="/disasters">
                                            <Heart className="w-4 h-4 mr-1" />
                                            Browse Campaigns
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {donations.slice(0, 5).map((donation) => (
                                        <div
                                            key={donation.id}
                                            className="flex items-center justify-between p-3 border rounded-lg"
                                        >
                                            <div>
                                                <p className="font-medium">
                                                    {donation.campaign?.title || "Campaign"}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(donation.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <span className="font-bold text-green-600">
                                                {formatAmount(donation.amount)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                    <Card
                        className="hover:shadow-lg transition cursor-pointer"
                        onClick={() => router.push("/report")}
                    >
                        <CardContent className="pt-6 text-center">
                            <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-orange-500" />
                            <h3 className="font-semibold">Report Issue</h3>
                        </CardContent>
                    </Card>

                    <Card
                        className="hover:shadow-lg transition cursor-pointer"
                        onClick={() => router.push("/disasters")}
                    >
                        <CardContent className="pt-6 text-center">
                            <Heart className="w-10 h-10 mx-auto mb-3 text-pink-500" />
                            <h3 className="font-semibold">Donate</h3>
                        </CardContent>
                    </Card>

                    <Card
                        className="hover:shadow-lg transition cursor-pointer"
                        onClick={() => router.push("/volunteer/onboard")}
                    >
                        <CardContent className="pt-6 text-center">
                            <Shield className="w-10 h-10 mx-auto mb-3 text-blue-500" />
                            <h3 className="font-semibold">Become Volunteer</h3>
                        </CardContent>
                    </Card>

                    <Card
                        className="hover:shadow-lg transition cursor-pointer"
                        onClick={() => router.push("/profile")}
                    >
                        <CardContent className="pt-6 text-center">
                            <Settings className="w-10 h-10 mx-auto mb-3 text-gray-500" />
                            <h3 className="font-semibold">Settings</h3>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
