"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Users,
    AlertTriangle,
    Heart,
    ShieldAlert,
    Loader2,
    TrendingUp,
    IndianRupee,
    CheckCircle,
    Clock,
    ArrowUpRight,
    Shield,
    UserCheck,
    Settings,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

interface AdminStats {
    users: { total: number };
    volunteers: { total: number };
    teams: { total: number };
    issues: {
        total: number;
        pending: number;
        inProgress: number;
        resolved: number;
        critical: number;
    };
    campaigns: {
        total: number;
        active: number;
        pending: number;
        totalRaised: number;
    };
    disasters: { total: number; active: number };
    donations: { total: number; totalAmount: number; todayAmount: number };
}

export default function AdminDashboard() {
    const router = useRouter();
    const { data: session, isPending: sessionLoading } = authClient.useSession();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session?.user) {
            fetchStats();
        }
    }, [session]);

    const fetchStats = async () => {
        try {
            const res = await fetch("/api/admin/stats");
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error("Failed to fetch stats", error);
        } finally {
            setLoading(false);
        }
    };

    const formatAmount = (paisa: number) =>
        `₹${(paisa / 100).toLocaleString("en-IN")}`;

    if (sessionLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    if (!session?.user) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="w-full max-w-md text-center">
                    <CardContent className="pt-8 pb-8">
                        <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold mb-4">Admin Access Required</h1>
                        <Button onClick={() => router.push("/auth/login")}>Sign In</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
            {/* Header */}
            <header className="bg-gray-900 text-white">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                <Settings className="w-6 h-6" />
                                Admin Dashboard
                            </h1>
                            <p className="text-gray-400 mt-1">Bihar Sahayata Control Center</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="bg-green-600 text-white">
                                <span className="animate-pulse mr-1">●</span> Live
                            </Badge>
                        </div>
                    </div>
                </div>
            </header>

            {/* Navigation */}
            <nav className="bg-gray-800 text-white">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex gap-4 overflow-x-auto">
                        <Link
                            href="/admin"
                            className="px-4 py-2 bg-gray-700 rounded-lg text-sm font-medium"
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/admin/issues"
                            className="px-4 py-2 hover:bg-gray-700 rounded-lg text-sm font-medium"
                        >
                            Issues
                        </Link>
                        <Link
                            href="/admin/volunteers"
                            className="px-4 py-2 hover:bg-gray-700 rounded-lg text-sm font-medium"
                        >
                            Volunteers
                        </Link>
                        <Link
                            href="/admin/disasters"
                            className="px-4 py-2 hover:bg-gray-700 rounded-lg text-sm font-medium"
                        >
                            Disasters
                        </Link>
                        <Link
                            href="/admin/campaigns"
                            className="px-4 py-2 hover:bg-gray-700 rounded-lg text-sm font-medium"
                        >
                            Campaigns
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Critical Alert */}
                {stats?.issues.critical && stats.issues.critical > 0 && (
                    <Card className="mb-6 border-red-500 border-2 bg-red-50 dark:bg-red-900/20">
                        <CardContent className="pt-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center animate-pulse">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-red-600">
                                        {stats.issues.critical} Critical Issues Pending
                                    </h3>
                                    <p className="text-sm text-gray-600">Require immediate attention</p>
                                </div>
                            </div>
                            <Button className="bg-red-600 hover:bg-red-700" asChild>
                                <Link href="/admin/issues?severity=critical">View Critical</Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {/* Total Users */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Total Users</p>
                                    <p className="text-3xl font-bold">{stats?.users.total || 0}</p>
                                </div>
                                <Users className="w-8 h-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Active Volunteers */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Volunteers</p>
                                    <p className="text-3xl font-bold">{stats?.volunteers.total || 0}</p>
                                </div>
                                <UserCheck className="w-8 h-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Active Issues */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Active Issues</p>
                                    <p className="text-3xl font-bold">
                                        {(stats?.issues.pending || 0) + (stats?.issues.inProgress || 0)}
                                    </p>
                                </div>
                                <AlertTriangle className="w-8 h-8 text-orange-600" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Active Disasters */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Active Disasters</p>
                                    <p className="text-3xl font-bold">{stats?.disasters.active || 0}</p>
                                </div>
                                <ShieldAlert className="w-8 h-8 text-red-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Second Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Issues Overview */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Issues Overview</span>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href="/admin/issues">
                                        View All <ArrowUpRight className="w-4 h-4 ml-1" />
                                    </Link>
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                        <span>Pending</span>
                                    </div>
                                    <span className="font-bold">{stats?.issues.pending || 0}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                                        <span>In Progress</span>
                                    </div>
                                    <span className="font-bold">{stats?.issues.inProgress || 0}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-green-500" />
                                        <span>Resolved</span>
                                    </div>
                                    <span className="font-bold">{stats?.issues.resolved || 0}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                                        <span className="text-red-600 font-medium">Critical</span>
                                    </div>
                                    <span className="font-bold text-red-600">{stats?.issues.critical || 0}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Fundraising */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Fundraising</span>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href="/admin/campaigns">
                                        View All <ArrowUpRight className="w-4 h-4 ml-1" />
                                    </Link>
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                                    <p className="text-sm text-gray-500">Total Raised</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {formatAmount(stats?.campaigns.totalRaised || 0)}
                                    </p>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Heart className="w-4 h-4 text-pink-600" />
                                        <span>Active Campaigns</span>
                                    </div>
                                    <span className="font-bold">{stats?.campaigns.active || 0}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-yellow-600" />
                                        <span>Pending Approval</span>
                                    </div>
                                    <Badge className="bg-yellow-500">{stats?.campaigns.pending || 0}</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-blue-600" />
                                        <span>Today&apos;s Donations</span>
                                    </div>
                                    <span className="font-bold text-green-600">
                                        {formatAmount(stats?.donations.todayAmount || 0)}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button className="w-full justify-start" variant="outline" asChild>
                                <Link href="/admin/disasters">
                                    <ShieldAlert className="w-4 h-4 mr-2" />
                                    Declare Disaster
                                </Link>
                            </Button>
                            <Button className="w-full justify-start" variant="outline" asChild>
                                <Link href="/admin/volunteers?verified=false">
                                    <UserCheck className="w-4 h-4 mr-2" />
                                    Verify Volunteers
                                </Link>
                            </Button>
                            <Button className="w-full justify-start" variant="outline" asChild>
                                <Link href="/admin/campaigns?status=pending_approval">
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Approve Campaigns
                                </Link>
                            </Button>
                            <Button className="w-full justify-start" variant="outline" asChild>
                                <Link href="/admin/issues?severity=critical">
                                    <AlertTriangle className="w-4 h-4 mr-2" />
                                    Critical Issues
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Platform Stats */}
                <Card>
                    <CardHeader>
                        <CardTitle>Platform Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="text-2xl font-bold">{stats?.users.total || 0}</p>
                                <p className="text-sm text-gray-500">Users</p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="text-2xl font-bold">{stats?.volunteers.total || 0}</p>
                                <p className="text-sm text-gray-500">Volunteers</p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="text-2xl font-bold">{stats?.teams.total || 0}</p>
                                <p className="text-sm text-gray-500">Teams</p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="text-2xl font-bold">{stats?.issues.total || 0}</p>
                                <p className="text-sm text-gray-500">Total Issues</p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="text-2xl font-bold">{stats?.campaigns.total || 0}</p>
                                <p className="text-sm text-gray-500">Campaigns</p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="text-2xl font-bold">{stats?.donations.total || 0}</p>
                                <p className="text-sm text-gray-500">Donations</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
