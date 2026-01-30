"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    AlertTriangle,
    Loader2,
    MapPin,
    Clock,
    ArrowLeft,
    CheckCircle,
    Plus,
    ExternalLink,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

interface Issue {
    id: string;
    title: string | null;
    description: string | null;
    severity: string;
    status: string;
    district: string | null;
    address: string | null;
    createdAt: string;
    resolvedAt: string | null;
    issueType: {
        name: string;
        icon: string;
        color: string;
    } | null;
    assignments: {
        id: string;
        status: string;
        volunteer: {
            displayName: string;
            phone: string;
        } | null;
    }[];
}

const severityColors: Record<string, string> = {
    low: "bg-green-500",
    medium: "bg-yellow-500",
    high: "bg-orange-500",
    critical: "bg-red-500",
};

const statusColors: Record<string, string> = {
    pending: "bg-yellow-500",
    acknowledged: "bg-blue-500",
    assigned: "bg-indigo-500",
    in_progress: "bg-purple-500",
    resolved: "bg-green-500",
    cancelled: "bg-gray-500",
};

export default function MyIssuesPage() {
    const router = useRouter();
    const { data: session, isPending: sessionLoading } = authClient.useSession();
    const [issues, setIssues] = useState<Issue[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session?.user) {
            fetchIssues();
        }
    }, [session]);

    const fetchIssues = async () => {
        try {
            const res = await fetch("/api/user/issues");
            if (res.ok) {
                const data = await res.json();
                setIssues(data.issues || []);
            }
        } catch (error) {
            console.error("Failed to fetch issues", error);
        } finally {
            setLoading(false);
        }
    };

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
                        <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
                        <Button onClick={() => router.push("/auth/login")}>Sign In</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <div className="max-w-6xl mx-auto px-4 py-6">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-white/20"
                            onClick={() => router.push("/dashboard")}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">My Issues</h1>
                            <p className="text-white/80">Track your reported issues</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <p className="text-gray-500">{issues.length} issues reported</p>
                    <Button asChild>
                        <Link href="/report">
                            <Plus className="w-4 h-4 mr-2" />
                            Report New Issue
                        </Link>
                    </Button>
                </div>

                {issues.length === 0 ? (
                    <Card className="text-center py-16">
                        <CardContent>
                            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                            <h2 className="text-xl font-bold">No Issues Reported</h2>
                            <p className="text-gray-500 mt-2">
                                You haven&apos;t reported any issues yet
                            </p>
                            <Button className="mt-4" asChild>
                                <Link href="/report">Report an Issue</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {issues.map((issue) => (
                            <Card key={issue.id}>
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge className={severityColors[issue.severity]}>
                                                    {issue.severity.toUpperCase()}
                                                </Badge>
                                                <Badge className={statusColors[issue.status]}>
                                                    {issue.status.replace("_", " ").toUpperCase()}
                                                </Badge>
                                                {issue.issueType && (
                                                    <Badge variant="outline">{issue.issueType.name}</Badge>
                                                )}
                                            </div>

                                            <h3 className="font-semibold text-lg">
                                                {issue.title || issue.issueType?.name || "Issue"}
                                            </h3>

                                            {issue.description && (
                                                <p className="text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                                                    {issue.description}
                                                </p>
                                            )}

                                            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                                                {(issue.district || issue.address) && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {issue.address || issue.district}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(issue.createdAt).toLocaleString()}
                                                </span>
                                            </div>

                                            {/* Assigned Volunteer */}
                                            {issue.assignments.length > 0 && (
                                                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                                    <p className="text-sm font-medium text-blue-600">
                                                        Assigned to:
                                                    </p>
                                                    {issue.assignments.map((assignment) => (
                                                        <div key={assignment.id} className="flex items-center justify-between mt-1">
                                                            <span>{assignment.volunteer?.displayName || "Volunteer"}</span>
                                                            <Badge className={statusColors[assignment.status] || "bg-gray-500"}>
                                                                {assignment.status}
                                                            </Badge>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Resolved */}
                                            {issue.status === "resolved" && issue.resolvedAt && (
                                                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                                    <p className="text-sm text-green-600 flex items-center gap-2">
                                                        <CheckCircle className="w-4 h-4" />
                                                        Resolved on {new Date(issue.resolvedAt).toLocaleString()}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
