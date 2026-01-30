"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Loader2,
    MapPin,
    Phone,
    Clock,
    Filter,
    ArrowLeft,
    CheckCircle,
    XCircle,
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
    victimPhone: string;
    createdAt: string;
    issueType: {
        name: string;
        icon: string;
        color: string;
    } | null;
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
    escalated: "bg-red-500",
    cancelled: "bg-gray-500",
};

function AdminIssuesContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session, isPending: sessionLoading } = authClient.useSession();

    const [issues, setIssues] = useState<Issue[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");
    const [severityFilter, setSeverityFilter] = useState(searchParams.get("severity") || "all");
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => {
        if (session?.user) {
            fetchIssues();
        }
    }, [session, statusFilter, severityFilter]);

    const fetchIssues = async () => {
        setLoading(true);
        try {
            let url = "/api/admin/issues?";
            if (statusFilter && statusFilter !== "all") url += `status=${statusFilter}&`;
            if (severityFilter && severityFilter !== "all") url += `severity=${severityFilter}&`;

            const res = await fetch(url);
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

    const updateIssue = async (issueId: string, updates: Record<string, string>) => {
        setUpdating(issueId);
        try {
            const res = await fetch("/api/admin/issues", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ issueId, ...updates }),
            });

            if (res.ok) {
                fetchIssues();
            }
        } catch (error) {
            console.error("Failed to update issue", error);
        } finally {
            setUpdating(null);
        }
    };

    if (sessionLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
            {/* Header */}
            <header className="bg-gray-900 text-white">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={() => router.push("/admin")}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Issue Management</h1>
                            <p className="text-gray-400">Monitor and manage all reported issues</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Filters */}
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-medium">Filters:</span>
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="acknowledged">Acknowledged</SelectItem>
                                    <SelectItem value="assigned">Assigned</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={severityFilter} onValueChange={setSeverityFilter}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Severity" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Severity</SelectItem>
                                    <SelectItem value="critical">Critical</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline" onClick={() => { setStatusFilter("all"); setSeverityFilter("all"); }}>
                                Clear Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Issues List */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                ) : issues.length === 0 ? (
                    <Card className="text-center py-16">
                        <CardContent>
                            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                            <h2 className="text-xl font-bold">No Issues Found</h2>
                            <p className="text-gray-500">No issues match your current filters</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {issues.map((issue) => (
                            <Card key={issue.id} className={issue.severity === "critical" ? "border-red-500 border-2" : ""}>
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
                                                {issue.district && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {issue.district}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Phone className="w-3 h-3" />
                                                    {issue.victimPhone}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(issue.createdAt).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2 ml-4">
                                            {issue.status === "pending" && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => updateIssue(issue.id, { status: "acknowledged" })}
                                                    disabled={updating === issue.id}
                                                >
                                                    {updating === issue.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Acknowledge"}
                                                </Button>
                                            )}
                                            {["pending", "acknowledged"].includes(issue.status) && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-red-600"
                                                    onClick={() => updateIssue(issue.id, { severity: "critical" })}
                                                    disabled={updating === issue.id || issue.severity === "critical"}
                                                >
                                                    Escalate
                                                </Button>
                                            )}
                                            {!["resolved", "cancelled"].includes(issue.status) && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-green-600"
                                                        onClick={() => updateIssue(issue.id, { status: "resolved" })}
                                                        disabled={updating === issue.id}
                                                    >
                                                        <CheckCircle className="w-4 h-4 mr-1" />
                                                        Resolve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-gray-500"
                                                        onClick={() => updateIssue(issue.id, { status: "cancelled" })}
                                                        disabled={updating === issue.id}
                                                    >
                                                        <XCircle className="w-4 h-4 mr-1" />
                                                        Cancel
                                                    </Button>
                                                </>
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

export default function AdminIssuesPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        }>
            <AdminIssuesContent />
        </Suspense>
    );
}
