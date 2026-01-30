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
    Heart,
    Loader2,
    Filter,
    ArrowLeft,
    CheckCircle,
    XCircle,
    Users,
    Clock,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

interface Campaign {
    id: string;
    title: string;
    slug: string;
    description: string;
    category: string;
    goalAmount: number;
    raisedAmount: number;
    donorCount: number;
    status: string;
    isVerified: boolean;
    progress: number;
    createdAt: string;
    organizer: {
        id: string;
        name: string;
        email: string;
    } | null;
}

const statusColors: Record<string, string> = {
    draft: "bg-gray-500",
    pending_approval: "bg-yellow-500",
    active: "bg-green-500",
    completed: "bg-blue-500",
    cancelled: "bg-red-500",
};

const categoryLabels: Record<string, string> = {
    disaster_relief: "Disaster Relief",
    medical: "Medical Aid",
    education: "Education",
    community: "Community",
};

function AdminCampaignsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session, isPending: sessionLoading } = authClient.useSession();

    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => {
        if (session?.user) {
            fetchCampaigns();
        }
    }, [session, statusFilter, categoryFilter]);

    const fetchCampaigns = async () => {
        setLoading(true);
        try {
            let url = "/api/admin/campaigns?";
            if (statusFilter && statusFilter !== "all") url += `status=${statusFilter}&`;
            if (categoryFilter && categoryFilter !== "all") url += `category=${categoryFilter}&`;

            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setCampaigns(data.campaigns || []);
            }
        } catch (error) {
            console.error("Failed to fetch campaigns", error);
        } finally {
            setLoading(false);
        }
    };

    const updateCampaign = async (campaignId: string, updates: Record<string, unknown>) => {
        setUpdating(campaignId);
        try {
            const res = await fetch("/api/admin/campaigns", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ campaignId, ...updates }),
            });

            if (res.ok) {
                fetchCampaigns();
            }
        } catch (error) {
            console.error("Failed to update campaign", error);
        } finally {
            setUpdating(null);
        }
    };

    const formatAmount = (paisa: number) =>
        `₹${(paisa / 100).toLocaleString("en-IN")}`;

    if (sessionLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    const pendingCount = campaigns.filter((c) => c.status === "pending_approval").length;

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
                            <h1 className="text-2xl font-bold">Campaign Management</h1>
                            <p className="text-gray-400">Approve and manage fundraising campaigns</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Pending Approval Alert */}
                {pendingCount > 0 && (
                    <Card className="mb-6 border-yellow-500 border-2 bg-yellow-50 dark:bg-yellow-900/20">
                        <CardContent className="pt-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-yellow-500 text-white flex items-center justify-center">
                                    <Heart className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-yellow-700">
                                        {pendingCount} Campaigns Pending Approval
                                    </h3>
                                    <p className="text-sm text-gray-600">Review and approve campaign requests</p>
                                </div>
                            </div>
                            <Button
                                className="bg-yellow-600 hover:bg-yellow-700"
                                onClick={() => setStatusFilter("pending_approval")}
                            >
                                Review Pending
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Filters */}
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-medium">Filters:</span>
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="pending_approval">Pending Approval</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    <SelectItem value="disaster_relief">Disaster Relief</SelectItem>
                                    <SelectItem value="medical">Medical Aid</SelectItem>
                                    <SelectItem value="education">Education</SelectItem>
                                    <SelectItem value="community">Community</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline" onClick={() => { setStatusFilter("all"); setCategoryFilter("all"); }}>
                                Clear Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Campaigns List */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                ) : campaigns.length === 0 ? (
                    <Card className="text-center py-16">
                        <CardContent>
                            <Heart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                            <h2 className="text-xl font-bold">No Campaigns Found</h2>
                            <p className="text-gray-500">No campaigns match your current filters</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {campaigns.map((campaign) => (
                            <Card key={campaign.id} className={campaign.status === "pending_approval" ? "border-yellow-300 border-2" : ""}>
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge className={statusColors[campaign.status]}>
                                                    {campaign.status.replace("_", " ").toUpperCase()}
                                                </Badge>
                                                <Badge variant="outline">
                                                    {categoryLabels[campaign.category] || campaign.category}
                                                </Badge>
                                                {campaign.isVerified && (
                                                    <Badge className="bg-blue-500">
                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                        Verified
                                                    </Badge>
                                                )}
                                            </div>

                                            <h3 className="font-semibold text-lg">{campaign.title}</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                                                {campaign.description}
                                            </p>

                                            {campaign.organizer && (
                                                <p className="text-sm text-gray-500 mt-2">
                                                    Organized by: <span className="font-medium">{campaign.organizer.name}</span>
                                                    {" "}({campaign.organizer.email})
                                                </p>
                                            )}

                                            {/* Progress */}
                                            <div className="mt-4">
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span>{formatAmount(campaign.raisedAmount)} raised</span>
                                                    <span>{formatAmount(campaign.goalAmount)} goal</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-green-500 h-2 rounded-full"
                                                        style={{ width: `${campaign.progress}%` }}
                                                    />
                                                </div>
                                                <div className="flex gap-4 mt-2 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Users className="w-3 h-3" />
                                                        {campaign.donorCount} donors
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(campaign.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 ml-4">
                                            {campaign.status === "pending_approval" && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700"
                                                        onClick={() => updateCampaign(campaign.id, { status: "active", isVerified: true })}
                                                        disabled={updating === campaign.id}
                                                    >
                                                        {updating === campaign.id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <>
                                                                <CheckCircle className="w-4 h-4 mr-1" />
                                                                Approve
                                                            </>
                                                        )}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-red-600"
                                                        onClick={() => updateCampaign(campaign.id, { status: "cancelled" })}
                                                        disabled={updating === campaign.id}
                                                    >
                                                        <XCircle className="w-4 h-4 mr-1" />
                                                        Reject
                                                    </Button>
                                                </>
                                            )}
                                            {campaign.status === "active" && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => updateCampaign(campaign.id, { status: "completed" })}
                                                    disabled={updating === campaign.id}
                                                >
                                                    Mark Complete
                                                </Button>
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

export default function AdminCampaignsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        }>
            <AdminCampaignsContent />
        </Suspense>
    );
}
