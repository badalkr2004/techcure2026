"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    CloudRain,
    Flame,
    Wind,
    Waves,
    AlertTriangle,
    MapPin,
    Users,
    Calendar,
    ExternalLink,
    Loader2,
    ShieldAlert,
    Heart,
    IndianRupee,
    CheckCircle,
    Gift,
} from "lucide-react";

interface Disaster {
    id: string;
    disasterType: string;
    title: string;
    description: string;
    affectedDistricts: string[];
    severity: string;
    status: string;
    responseLevel: string;
    startedAt: string;
    stats: {
        teamsActivated: number;
        issuesReported: number;
        reliefCampaigns: number;
    };
}

interface Campaign {
    id: string;
    title: string;
    slug: string;
    description: string;
    coverImage: string | null;
    goalAmount: number;
    raisedAmount: number;
    donorCount: number;
    progress: number;
}

const disasterIcons: Record<string, React.ReactNode> = {
    flood: <Waves className="w-6 h-6" />,
    earthquake: <AlertTriangle className="w-6 h-6" />,
    cyclone: <Wind className="w-6 h-6" />,
    drought: <CloudRain className="w-6 h-6" />,
    fire: <Flame className="w-6 h-6" />,
    pandemic: <ShieldAlert className="w-6 h-6" />,
    other: <AlertTriangle className="w-6 h-6" />,
};

const severityColors: Record<string, string> = {
    minor: "bg-yellow-500",
    moderate: "bg-orange-500",
    severe: "bg-red-500",
    catastrophic: "bg-red-700 animate-pulse",
};

const statusColors: Record<string, string> = {
    active: "bg-red-500",
    contained: "bg-orange-500",
    resolved: "bg-green-500",
};

const responseLevelLabels: Record<string, string> = {
    local: "Local Response",
    district: "District Level",
    state: "State Level",
    national: "National Emergency",
};

const donationAmounts = [100, 500, 1000, 2500, 5000, 10000];

export default function DisastersPage() {
    const [disasters, setDisasters] = useState<Disaster[]>([]);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"active" | "all">("active");

    // Donation dialog state
    const [showDonateDialog, setShowDonateDialog] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
    const [donationAmount, setDonationAmount] = useState<number>(500);
    const [customAmount, setCustomAmount] = useState<string>("");
    const [donorName, setDonorName] = useState<string>("");
    const [donorEmail, setDonorEmail] = useState<string>("");
    const [donorPhone, setDonorPhone] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
    const [donating, setDonating] = useState(false);
    const [donationSuccess, setDonationSuccess] = useState(false);

    useEffect(() => {
        fetchData();
    }, [filter]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [disastersRes, campaignsRes] = await Promise.all([
                fetch(`/api/disasters?status=${filter}`),
                fetch("/api/campaigns?status=active"),
            ]);

            if (disastersRes.ok) {
                const data = await disastersRes.json();
                setDisasters(data.disasters || []);
            }

            if (campaignsRes.ok) {
                const data = await campaignsRes.json();
                setCampaigns(data.campaigns || []);
            }
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    const getTimeElapsed = (date: string) => {
        const diff = Date.now() - new Date(date).getTime();
        const hours = Math.floor(diff / 3600000);
        if (hours < 24) return `${hours} hours ago`;
        const days = Math.floor(hours / 24);
        return `${days} days ago`;
    };

    const formatAmount = (paisa: number) => `₹${(paisa / 100).toLocaleString("en-IN")}`;

    const handleDonate = async () => {
        if (!selectedCampaign) return;

        const amount = customAmount ? parseInt(customAmount) : donationAmount;
        if (!amount || amount < 10) {
            alert("Minimum donation is ₹10");
            return;
        }

        setDonating(true);
        try {
            const res = await fetch("/api/donations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    campaignId: selectedCampaign.id,
                    amount,
                    donorName: isAnonymous ? null : donorName,
                    donorEmail,
                    donorPhone,
                    isAnonymous,
                    message,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setDonationSuccess(true);
            fetchData(); // Refresh campaign data
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to process donation");
        } finally {
            setDonating(false);
        }
    };

    const openDonateDialog = (campaign: Campaign) => {
        setSelectedCampaign(campaign);
        setDonationSuccess(false);
        setDonationAmount(500);
        setCustomAmount("");
        setDonorName("");
        setDonorEmail("");
        setDonorPhone("");
        setMessage("");
        setIsAnonymous(false);
        setShowDonateDialog(true);
    };

    const closeDonateDialog = () => {
        setShowDonateDialog(false);
        setSelectedCampaign(null);
        setDonationSuccess(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* Header */}
            <header className="bg-gradient-to-r from-red-600 to-orange-600 text-white">
                <div className="max-w-6xl mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <AlertTriangle className="w-8 h-8" />
                        Disaster Alerts & Relief
                    </h1>
                    <p className="mt-2 text-white/80">
                        Live updates on ongoing disasters in Bihar - Donate to support relief efforts
                    </p>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8">
                {/* Quick Donate Section */}
                {campaigns.length > 0 && (
                    <Card className="mb-8 bg-gradient-to-r from-pink-50 to-red-50 dark:from-pink-900/20 dark:to-red-900/20 border-pink-200 dark:border-pink-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-pink-600">
                                <Heart className="w-5 h-5" />
                                Active Relief Campaigns - Donate Now
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {campaigns.slice(0, 6).map((campaign) => (
                                    <div
                                        key={campaign.id}
                                        className="bg-white dark:bg-gray-800 p-4 rounded-lg border"
                                    >
                                        <h3 className="font-semibold text-sm line-clamp-2 mb-2">
                                            {campaign.title}
                                        </h3>
                                        <div className="mb-2">
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                <div
                                                    className="bg-green-500 h-2 rounded-full transition-all"
                                                    style={{ width: `${campaign.progress}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between text-xs mt-1 text-gray-500">
                                                <span>{formatAmount(campaign.raisedAmount)}</span>
                                                <span>{formatAmount(campaign.goalAmount)}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500">
                                                {campaign.donorCount} donors
                                            </span>
                                            <Button
                                                size="sm"
                                                className="bg-pink-600 hover:bg-pink-700"
                                                onClick={() => openDonateDialog(campaign)}
                                            >
                                                <Gift className="w-3 h-3 mr-1" />
                                                Donate
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Filter */}
                <div className="flex gap-2 mb-6">
                    <Button
                        variant={filter === "active" ? "default" : "outline"}
                        onClick={() => setFilter("active")}
                    >
                        Active Disasters
                    </Button>
                    <Button
                        variant={filter === "all" ? "default" : "outline"}
                        onClick={() => setFilter("all")}
                    >
                        All Disasters
                    </Button>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
                    </div>
                )}

                {/* No disasters */}
                {!loading && disasters.length === 0 && (
                    <Card className="text-center py-16">
                        <CardContent>
                            <div className="w-20 h-20 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                                <ShieldAlert className="w-10 h-10 text-green-600" />
                            </div>
                            <h2 className="text-xl font-bold text-green-600">All Clear!</h2>
                            <p className="text-gray-500 mt-2">
                                No active disasters at this time.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Disaster List */}
                <div className="grid gap-6">
                    {disasters.map((disaster) => (
                        <Card
                            key={disaster.id}
                            className={`overflow-hidden ${disaster.severity === "catastrophic"
                                    ? "border-red-500 border-2"
                                    : ""
                                }`}
                        >
                            <CardHeader className="pb-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`w-14 h-14 rounded-full ${severityColors[disaster.severity]
                                                } text-white flex items-center justify-center`}
                                        >
                                            {disasterIcons[disaster.disasterType] ||
                                                disasterIcons.other}
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl">{disaster.title}</CardTitle>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge className={`${statusColors[disaster.status]} text-white`}>
                                                    {disaster.status.toUpperCase()}
                                                </Badge>
                                                <Badge variant="outline" className="capitalize">
                                                    {disaster.severity}
                                                </Badge>
                                                <span className="text-sm text-gray-500">
                                                    {responseLevelLabels[disaster.responseLevel]}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right text-sm text-gray-500">
                                        <Calendar className="w-4 h-4 inline mr-1" />
                                        {getTimeElapsed(disaster.startedAt)}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                    {disaster.description}
                                </p>

                                {/* Affected Districts */}
                                <div className="mb-4">
                                    <p className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        Affected Districts:
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {disaster.affectedDistricts.map((district) => (
                                            <Badge key={district} variant="secondary">
                                                {district}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    <div className="text-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                        <p className="text-2xl font-bold text-blue-600">
                                            {disaster.stats.teamsActivated}
                                        </p>
                                        <p className="text-sm text-gray-500">Teams Deployed</p>
                                    </div>
                                    <div className="text-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                        <p className="text-2xl font-bold text-orange-600">
                                            {disaster.stats.issuesReported}
                                        </p>
                                        <p className="text-sm text-gray-500">Issues Reported</p>
                                    </div>
                                    <div className="text-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                        <p className="text-2xl font-bold text-green-600">
                                            {disaster.stats.reliefCampaigns}
                                        </p>
                                        <p className="text-sm text-gray-500">Relief Campaigns</p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <Button asChild>
                                        <Link href={`/disasters/${disaster.id}`}>
                                            View Details
                                            <ExternalLink className="w-4 h-4 ml-2" />
                                        </Link>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="border-pink-500 text-pink-600 hover:bg-pink-50"
                                        onClick={() => {
                                            // Find campaigns for this disaster
                                            const disasterCampaigns = campaigns.filter(
                                                (c) => c.id
                                            );
                                            if (disasterCampaigns.length > 0) {
                                                openDonateDialog(disasterCampaigns[0]);
                                            } else if (campaigns.length > 0) {
                                                openDonateDialog(campaigns[0]);
                                            }
                                        }}
                                    >
                                        <Heart className="w-4 h-4 mr-2" />
                                        Donate for Relief
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Become a Volunteer CTA */}
                <Card className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Users className="w-6 h-6" />
                                    Join Our Volunteer Team
                                </h3>
                                <p className="text-white/80 mt-1">
                                    Help respond to disasters and save lives in your community
                                </p>
                            </div>
                            <Button variant="secondary" size="lg" asChild>
                                <Link href="/volunteer/onboard">
                                    Become a Volunteer
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </main>

            {/* Donation Dialog */}
            <Dialog open={showDonateDialog} onOpenChange={setShowDonateDialog}>
                <DialogContent className="max-w-md">
                    {donationSuccess ? (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4">
                                <CheckCircle className="w-10 h-10 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-green-600 mb-2">
                                Thank You!
                            </h2>
                            <p className="text-gray-600 mb-6">
                                Your donation has been received. Together, we can make a difference.
                            </p>
                            <Button onClick={closeDonateDialog}>Close</Button>
                        </div>
                    ) : (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <Heart className="w-5 h-5 text-pink-600" />
                                    Donate to Relief
                                </DialogTitle>
                                <DialogDescription>
                                    {selectedCampaign?.title}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                                {/* Quick Amounts */}
                                <div>
                                    <Label>Select Amount</Label>
                                    <div className="grid grid-cols-3 gap-2 mt-2">
                                        {donationAmounts.map((amt) => (
                                            <Button
                                                key={amt}
                                                type="button"
                                                variant={donationAmount === amt && !customAmount ? "default" : "outline"}
                                                onClick={() => {
                                                    setDonationAmount(amt);
                                                    setCustomAmount("");
                                                }}
                                            >
                                                ₹{amt.toLocaleString()}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {/* Custom Amount */}
                                <div>
                                    <Label>Or Enter Custom Amount</Label>
                                    <div className="relative mt-1">
                                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <Input
                                            type="number"
                                            value={customAmount}
                                            onChange={(e) => setCustomAmount(e.target.value)}
                                            placeholder="Enter amount"
                                            className="pl-9"
                                        />
                                    </div>
                                </div>

                                {/* Donor Info */}
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="anonymous"
                                        checked={isAnonymous}
                                        onChange={(e) => setIsAnonymous(e.target.checked)}
                                        className="rounded"
                                    />
                                    <Label htmlFor="anonymous" className="cursor-pointer">
                                        Donate anonymously
                                    </Label>
                                </div>

                                {!isAnonymous && (
                                    <div>
                                        <Label>Your Name</Label>
                                        <Input
                                            value={donorName}
                                            onChange={(e) => setDonorName(e.target.value)}
                                            placeholder="Enter your name"
                                        />
                                    </div>
                                )}

                                <div>
                                    <Label>Email (for receipt)</Label>
                                    <Input
                                        type="email"
                                        value={donorEmail}
                                        onChange={(e) => setDonorEmail(e.target.value)}
                                        placeholder="your@email.com"
                                    />
                                </div>

                                <div>
                                    <Label>Phone (optional)</Label>
                                    <Input
                                        type="tel"
                                        value={donorPhone}
                                        onChange={(e) => setDonorPhone(e.target.value)}
                                        placeholder="+91 98765 43210"
                                    />
                                </div>

                                <div>
                                    <Label>Message (optional)</Label>
                                    <Textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Leave a message of support..."
                                        rows={2}
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={closeDonateDialog}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleDonate}
                                    disabled={donating}
                                    className="bg-pink-600 hover:bg-pink-700"
                                >
                                    {donating ? (
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    ) : (
                                        <Heart className="w-4 h-4 mr-2" />
                                    )}
                                    Donate ₹{(customAmount ? parseInt(customAmount) : donationAmount).toLocaleString()}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
