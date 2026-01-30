"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    CloudRain,
    Flame,
    Wind,
    Waves,
    AlertTriangle,
    MapPin,
    Users,
    Calendar,
    ArrowLeft,
    Loader2,
    ShieldAlert,
    Clock,
    CheckCircle,
    ExternalLink,
    Heart,
} from "lucide-react";

interface DisasterDetail {
    id: string;
    disasterType: string;
    title: string;
    description: string;
    affectedDistricts: string[];
    centerLatitude: number | null;
    centerLongitude: number | null;
    radiusKm: number | null;
    severity: string;
    estimatedAffectedPeople: number | null;
    status: string;
    responseLevel: string;
    startedAt: string;
    containedAt: string | null;
    resolvedAt: string | null;
}

interface ActivatedTeam {
    id: string;
    status: string;
    assignedArea: string | null;
    responsibilities: string | null;
    activatedAt: string;
    team: {
        id: string;
        name: string;
        teamType: string;
        district: string;
        memberCount: number;
    };
}

interface Campaign {
    id: string;
    title: string;
    slug: string;
    goalAmount: number;
    raisedAmount: number;
    status: string;
}

const disasterIcons: Record<string, React.ReactNode> = {
    flood: <Waves className="w-8 h-8" />,
    earthquake: <AlertTriangle className="w-8 h-8" />,
    cyclone: <Wind className="w-8 h-8" />,
    drought: <CloudRain className="w-8 h-8" />,
    fire: <Flame className="w-8 h-8" />,
    pandemic: <ShieldAlert className="w-8 h-8" />,
    other: <AlertTriangle className="w-8 h-8" />,
};

const severityColors: Record<string, string> = {
    minor: "bg-yellow-500",
    moderate: "bg-orange-500",
    severe: "bg-red-500",
    catastrophic: "bg-red-700",
};

const statusColors: Record<string, string> = {
    active: "bg-red-500",
    contained: "bg-orange-500",
    resolved: "bg-green-500",
};

export default function DisasterDetailPage() {
    const params = useParams();
    const router = useRouter();
    const disasterId = params.id as string;

    const [disaster, setDisaster] = useState<DisasterDetail | null>(null);
    const [teams, setTeams] = useState<ActivatedTeam[]>([]);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [issueCount, setIssueCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchDisasterDetails();
    }, [disasterId]);

    const fetchDisasterDetails = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/disasters/${disasterId}`);
            if (!res.ok) {
                throw new Error("Failed to fetch disaster details");
            }
            const data = await res.json();
            setDisaster(data.disaster);
            setTeams(data.activatedTeams || []);
            setCampaigns(data.reliefCampaigns || []);
            setIssueCount(data.issueCount || 0);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatAmount = (paisa: number) => {
        return `₹${(paisa / 100).toLocaleString("en-IN")}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-red-600" />
            </div>
        );
    }

    if (error || !disaster) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="w-full max-w-md text-center">
                    <CardContent className="pt-8 pb-8">
                        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h1 className="text-xl font-bold mb-4">Error</h1>
                        <p className="text-gray-600 mb-6">{error || "Disaster not found"}</p>
                        <Button onClick={() => router.back()}>Go Back</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* Header */}
            <header
                className={`${severityColors[disaster.severity]} text-white`}
            >
                <div className="max-w-6xl mx-auto px-4 py-8">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20 mb-4"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Disasters
                    </Button>

                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                            {disasterIcons[disaster.disasterType] || disasterIcons.other}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">{disaster.title}</h1>
                            <div className="flex items-center gap-3 mt-2">
                                <Badge className={`${statusColors[disaster.status]} text-white`}>
                                    {disaster.status.toUpperCase()}
                                </Badge>
                                <Badge variant="secondary" className="capitalize">
                                    {disaster.severity} Severity
                                </Badge>
                                <Badge variant="secondary" className="capitalize">
                                    {disaster.responseLevel} Response
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
                {/* Timeline */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            Timeline
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-8">
                            <div className="text-center">
                                <div className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center mx-auto mb-2">
                                    <AlertTriangle className="w-5 h-5" />
                                </div>
                                <p className="text-xs text-gray-500">Started</p>
                                <p className="text-sm font-medium">
                                    {formatDate(disaster.startedAt)}
                                </p>
                            </div>

                            <div className="flex-1 h-1 bg-gray-200 rounded" />

                            <div className="text-center">
                                <div
                                    className={`w-10 h-10 rounded-full ${disaster.containedAt
                                            ? "bg-orange-500 text-white"
                                            : "bg-gray-200 text-gray-400"
                                        } flex items-center justify-center mx-auto mb-2`}
                                >
                                    <ShieldAlert className="w-5 h-5" />
                                </div>
                                <p className="text-xs text-gray-500">Contained</p>
                                <p className="text-sm font-medium">
                                    {disaster.containedAt
                                        ? formatDate(disaster.containedAt)
                                        : "Ongoing"}
                                </p>
                            </div>

                            <div className="flex-1 h-1 bg-gray-200 rounded" />

                            <div className="text-center">
                                <div
                                    className={`w-10 h-10 rounded-full ${disaster.resolvedAt
                                            ? "bg-green-500 text-white"
                                            : "bg-gray-200 text-gray-400"
                                        } flex items-center justify-center mx-auto mb-2`}
                                >
                                    <CheckCircle className="w-5 h-5" />
                                </div>
                                <p className="text-xs text-gray-500">Resolved</p>
                                <p className="text-sm font-medium">
                                    {disaster.resolvedAt
                                        ? formatDate(disaster.resolvedAt)
                                        : "Pending"}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Description & Affected Areas */}
                <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>About This Disaster</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-gray-600 dark:text-gray-300">
                                {disaster.description}
                            </p>
                            {disaster.estimatedAffectedPeople && (
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                    <p className="text-sm text-gray-500">Estimated Affected</p>
                                    <p className="text-2xl font-bold text-red-600">
                                        {disaster.estimatedAffectedPeople.toLocaleString()} people
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="w-5 h-5" />
                                Affected Districts ({disaster.affectedDistricts.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {disaster.affectedDistricts.map((district) => (
                                    <Badge key={district} variant="outline" className="text-base py-1 px-3">
                                        {district}
                                    </Badge>
                                ))}
                            </div>

                            {disaster.centerLatitude && disaster.centerLongitude && (
                                <div className="mt-4">
                                    <a
                                        href={`https://www.google.com/maps?q=${disaster.centerLatitude},${disaster.centerLongitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        View on Google Maps
                                    </a>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="pt-6 text-center">
                            <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                            <p className="text-3xl font-bold">{teams.length}</p>
                            <p className="text-gray-500">Teams Deployed</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6 text-center">
                            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                            <p className="text-3xl font-bold">{issueCount}</p>
                            <p className="text-gray-500">Issues Reported</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6 text-center">
                            <Heart className="w-8 h-8 mx-auto mb-2 text-pink-600" />
                            <p className="text-3xl font-bold">{campaigns.length}</p>
                            <p className="text-gray-500">Relief Campaigns</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Deployed Teams */}
                {teams.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                Deployed Teams
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {teams.map((activation) => (
                                    <div
                                        key={activation.id}
                                        className="flex items-center justify-between p-4 border rounded-lg"
                                    >
                                        <div>
                                            <h3 className="font-semibold">{activation.team.name}</h3>
                                            <p className="text-sm text-gray-500">
                                                {activation.team.teamType} • {activation.team.district} •{" "}
                                                {activation.team.memberCount} members
                                            </p>
                                            {activation.assignedArea && (
                                                <p className="text-sm text-blue-600 mt-1">
                                                    Assigned to: {activation.assignedArea}
                                                </p>
                                            )}
                                        </div>
                                        <Badge
                                            className={
                                                activation.status === "deployed"
                                                    ? "bg-green-500"
                                                    : "bg-blue-500"
                                            }
                                        >
                                            {activation.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Relief Campaigns */}
                {campaigns.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Heart className="w-5 h-5 text-pink-600" />
                                Relief Campaigns
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {campaigns.map((camp) => (
                                    <div
                                        key={camp.id}
                                        className="p-4 border rounded-lg"
                                    >
                                        <h3 className="font-semibold">{camp.title}</h3>
                                        <div className="mt-2">
                                            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                                <div
                                                    className="bg-green-600 h-2 rounded-full"
                                                    style={{
                                                        width: `${Math.min(
                                                            (camp.raisedAmount / camp.goalAmount) * 100,
                                                            100
                                                        )}%`,
                                                    }}
                                                />
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>
                                                    Raised: <strong>{formatAmount(camp.raisedAmount)}</strong>
                                                </span>
                                                <span>
                                                    Goal: {formatAmount(camp.goalAmount)}
                                                </span>
                                            </div>
                                        </div>
                                        <Button size="sm" className="mt-3" asChild>
                                            <Link href={`/campaigns/${camp.slug}`}>
                                                Donate Now
                                            </Link>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
    );
}
