"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Heart,
    Loader2,
    Filter,
    ArrowLeft,
    CheckCircle,
    XCircle,
    Users,
    Clock,
    Plus,
    IndianRupee,
    Target,
    Image as ImageIcon,
    Video,
    FileText,
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

interface Disaster {
    id: string;
    title: string;
    status: string;
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
    const [disasters, setDisasters] = useState<Disaster[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [updating, setUpdating] = useState<string | null>(null);

    // Create Campaign Dialog State
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [createStep, setCreateStep] = useState(1);
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);
    const [createSuccess, setCreateSuccess] = useState(false);

    // Create Campaign Form Data
    const [createForm, setCreateForm] = useState({
        title: "",
        description: "",
        story: "",
        goalAmount: "",
        category: "disaster_relief",
        disasterId: "",
        beneficiaryName: "",
        beneficiaryType: "community",
        coverImage: "",
        videoUrl: "",
    });

    useEffect(() => {
        if (session?.user) {
            fetchCampaigns();
            fetchDisasters();
        }
    }, [session, statusFilter, categoryFilter]);

    const fetchDisasters = async () => {
        try {
            const res = await fetch("/api/disasters?status=active");
            if (res.ok) {
                const data = await res.json();
                setDisasters(data.disasters || []);
            }
        } catch (error) {
            console.error("Failed to fetch disasters", error);
        }
    };

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

    const handleCreateCampaign = async () => {
        setCreateError(null);

        // Validation
        if (!createForm.title || createForm.title.trim().length < 5) {
            setCreateError("Title must be at least 5 characters");
            return;
        }

        if (!createForm.description || createForm.description.trim().length < 20) {
            setCreateError("Description must be at least 20 characters");
            return;
        }

        const goalAmountPaisa = parseInt(createForm.goalAmount) * 100;
        if (!goalAmountPaisa || goalAmountPaisa < 1000) {
            setCreateError("Goal amount must be at least ₹10");
            return;
        }

        setCreating(true);
        try {
            const res = await fetch("/api/admin/campaigns", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: createForm.title.trim(),
                    description: createForm.description.trim(),
                    story: createForm.story.trim() || null,
                    goalAmount: goalAmountPaisa,
                    category: createForm.category,
                    disasterId: createForm.disasterId || null,
                    beneficiaryName: createForm.beneficiaryName.trim() || null,
                    beneficiaryType: createForm.beneficiaryType || null,
                    coverImage: createForm.coverImage.trim() || null,
                    videoUrl: createForm.videoUrl.trim() || null,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to create campaign");
            }

            setCreateSuccess(true);
            fetchCampaigns();
        } catch (err) {
            setCreateError(err instanceof Error ? err.message : "Failed to create campaign");
        } finally {
            setCreating(false);
        }
    };

    const resetCreateDialog = () => {
        setShowCreateDialog(false);
        setCreateStep(1);
        setCreateSuccess(false);
        setCreateError(null);
        setCreateForm({
            title: "",
            description: "",
            story: "",
            goalAmount: "",
            category: "disaster_relief",
            disasterId: "",
            beneficiaryName: "",
            beneficiaryType: "community",
            coverImage: "",
            videoUrl: "",
        });
    };

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
                    <div className="flex items-center justify-between">
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
                        <Button
                            onClick={() => setShowCreateDialog(true)}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Create Campaign
                        </Button>
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

            {/* Create Campaign Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={(open) => !open && resetCreateDialog()}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    {createSuccess ? (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4">
                                <CheckCircle className="w-10 h-10 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-green-600 mb-2">
                                Campaign Created!
                            </h2>
                            <p className="text-gray-600 mb-6">
                                Your campaign has been created and is now active.
                            </p>
                            <Button onClick={resetCreateDialog}>Close</Button>
                        </div>
                    ) : (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <Heart className="w-5 h-5 text-pink-600" />
                                    Create New Campaign
                                </DialogTitle>
                                <DialogDescription>
                                    Create a fundraising campaign to collect donations
                                </DialogDescription>
                            </DialogHeader>

                            {/* Step Indicator */}
                            <div className="flex items-center justify-center gap-2 py-4">
                                {[1, 2, 3].map((step) => (
                                    <div key={step} className="flex items-center">
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                                createStep >= step
                                                    ? "bg-green-600 text-white"
                                                    : "bg-gray-200 text-gray-500"
                                            }`}
                                        >
                                            {step}
                                        </div>
                                        {step < 3 && (
                                            <div
                                                className={`w-12 h-1 ${
                                                    createStep > step ? "bg-green-600" : "bg-gray-200"
                                                }`}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>

                            {createError && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                    {createError}
                                </div>
                            )}

                            {/* Step 1: Basic Info */}
                            {createStep === 1 && (
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="title">Campaign Title *</Label>
                                        <Input
                                            id="title"
                                            value={createForm.title}
                                            onChange={(e) =>
                                                setCreateForm({ ...createForm, title: e.target.value })
                                            }
                                            placeholder="e.g., Bihar Flood Relief 2026"
                                            className="mt-1"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="description">Short Description *</Label>
                                        <Textarea
                                            id="description"
                                            value={createForm.description}
                                            onChange={(e) =>
                                                setCreateForm({ ...createForm, description: e.target.value })
                                            }
                                            placeholder="Brief description of the campaign (min 20 characters)"
                                            rows={3}
                                            className="mt-1"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            {createForm.description.length}/500 characters
                                        </p>
                                    </div>

                                    <div>
                                        <Label htmlFor="category">Category *</Label>
                                        <Select
                                            value={createForm.category}
                                            onValueChange={(value) =>
                                                setCreateForm({ ...createForm, category: value })
                                            }
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="disaster_relief">
                                                    🆘 Disaster Relief
                                                </SelectItem>
                                                <SelectItem value="medical">
                                                    🏥 Medical Aid
                                                </SelectItem>
                                                <SelectItem value="education">
                                                    📚 Education
                                                </SelectItem>
                                                <SelectItem value="community">
                                                    🏘️ Community
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {disasters.length > 0 && (
                                        <div>
                                            <Label htmlFor="disasterId">Link to Disaster (Optional)</Label>
                                            <Select
                                                value={createForm.disasterId}
                                                onValueChange={(value) =>
                                                    setCreateForm({ ...createForm, disasterId: value })
                                                }
                                            >
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder="Select a disaster" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="None">None</SelectItem>
                                                    {disasters.map((d) => (
                                                        <SelectItem key={d.id} value={d.id}>
                                                            {d.title}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Step 2: Goal & Beneficiary */}
                            {createStep === 2 && (
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="goalAmount" className="flex items-center gap-2">
                                            <Target className="w-4 h-4" />
                                            Fundraising Goal (₹) *
                                        </Label>
                                        <div className="relative mt-1">
                                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <Input
                                                id="goalAmount"
                                                type="number"
                                                value={createForm.goalAmount}
                                                onChange={(e) =>
                                                    setCreateForm({ ...createForm, goalAmount: e.target.value })
                                                }
                                                placeholder="50000"
                                                className="pl-9"
                                                min="10"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Minimum ₹10. Enter amount in rupees.
                                        </p>
                                    </div>

                                    <div>
                                        <Label htmlFor="beneficiaryName">Beneficiary Name</Label>
                                        <Input
                                            id="beneficiaryName"
                                            value={createForm.beneficiaryName}
                                            onChange={(e) =>
                                                setCreateForm({ ...createForm, beneficiaryName: e.target.value })
                                            }
                                            placeholder="e.g., Flood Affected Families of Darbhanga"
                                            className="mt-1"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="beneficiaryType">Beneficiary Type</Label>
                                        <Select
                                            value={createForm.beneficiaryType}
                                            onValueChange={(value) =>
                                                setCreateForm({ ...createForm, beneficiaryType: value })
                                            }
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="individual">👤 Individual</SelectItem>
                                                <SelectItem value="family">👨‍👩‍👧‍👦 Family</SelectItem>
                                                <SelectItem value="community">🏘️ Community</SelectItem>
                                                <SelectItem value="organization">🏛️ Organization</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="story" className="flex items-center gap-2">
                                            <FileText className="w-4 h-4" />
                                            Detailed Story (Optional)
                                        </Label>
                                        <Textarea
                                            id="story"
                                            value={createForm.story}
                                            onChange={(e) =>
                                                setCreateForm({ ...createForm, story: e.target.value })
                                            }
                                            placeholder="Tell the full story behind this campaign. This helps donors connect emotionally..."
                                            rows={5}
                                            className="mt-1"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Media */}
                            {createStep === 3 && (
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="coverImage" className="flex items-center gap-2">
                                            <ImageIcon className="w-4 h-4" />
                                            Cover Image URL
                                        </Label>
                                        <Input
                                            id="coverImage"
                                            value={createForm.coverImage}
                                            onChange={(e) =>
                                                setCreateForm({ ...createForm, coverImage: e.target.value })
                                            }
                                            placeholder="https://example.com/image.jpg"
                                            className="mt-1"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Paste a direct link to an image. Recommended: 1200x630px
                                        </p>
                                    </div>

                                    {createForm.coverImage && (
                                        <div className="border rounded-lg overflow-hidden">
                                            <img
                                                src={createForm.coverImage}
                                                alt="Cover preview"
                                                className="w-full h-48 object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = "none";
                                                }}
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <Label htmlFor="videoUrl" className="flex items-center gap-2">
                                            <Video className="w-4 h-4" />
                                            Video URL (Optional)
                                        </Label>
                                        <Input
                                            id="videoUrl"
                                            value={createForm.videoUrl}
                                            onChange={(e) =>
                                                setCreateForm({ ...createForm, videoUrl: e.target.value })
                                            }
                                            placeholder="https://youtube.com/watch?v=..."
                                            className="mt-1"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            YouTube or Vimeo link
                                        </p>
                                    </div>

                                    {/* Summary Card */}
                                    <Card className="bg-gray-50 border-green-200">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm text-green-700">
                                                Campaign Summary
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Title:</span>
                                                <span className="font-medium">{createForm.title || "-"}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Category:</span>
                                                <span className="font-medium capitalize">
                                                    {createForm.category.replace("_", " ")}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Goal:</span>
                                                <span className="font-medium text-green-600">
                                                    ₹{parseInt(createForm.goalAmount || "0").toLocaleString("en-IN")}
                                                </span>
                                            </div>
                                            {createForm.beneficiaryName && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Beneficiary:</span>
                                                    <span className="font-medium">{createForm.beneficiaryName}</span>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            <DialogFooter className="gap-2 sm:gap-0">
                                {createStep > 1 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setCreateStep(createStep - 1)}
                                    >
                                        Back
                                    </Button>
                                )}
                                {createStep < 3 ? (
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            if (createStep === 1) {
                                                if (!createForm.title || createForm.title.trim().length < 5) {
                                                    setCreateError("Title must be at least 5 characters");
                                                    return;
                                                }
                                                if (!createForm.description || createForm.description.trim().length < 20) {
                                                    setCreateError("Description must be at least 20 characters");
                                                    return;
                                                }
                                            }
                                            if (createStep === 2) {
                                                if (!createForm.goalAmount || parseInt(createForm.goalAmount) < 10) {
                                                    setCreateError("Goal amount must be at least ₹10");
                                                    return;
                                                }
                                            }
                                            setCreateError(null);
                                            setCreateStep(createStep + 1);
                                        }}
                                        className="bg-gray-900"
                                    >
                                        Next
                                    </Button>
                                ) : (
                                    <Button
                                        type="button"
                                        onClick={handleCreateCampaign}
                                        disabled={creating}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        {creating ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <Heart className="w-4 h-4 mr-2" />
                                                Create Campaign
                                            </>
                                        )}
                                    </Button>
                                )}
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
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
