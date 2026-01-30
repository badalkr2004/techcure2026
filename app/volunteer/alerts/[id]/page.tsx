"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    MapPin,
    Phone,
    User,
    Clock,
    AlertTriangle,
    CheckCircle,
    Loader2,
    ArrowLeft,
    Navigation,
    ExternalLink,
    Car,
    MapPinned,
    MessageCircle,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { formatDistance } from "@/lib/geo";

interface IssueDetail {
    id: string;
    victimName: string | null;
    victimPhone: string;
    victimAge: number | null;
    victimGender: string | null;
    reporterName: string | null;
    reporterPhone: string | null;
    reporterRelation: string | null;
    latitude: number;
    longitude: number;
    address: string | null;
    district: string | null;
    landmark: string | null;
    title: string | null;
    description: string | null;
    severity: string;
    status: string;
    createdAt: string;
    acknowledgedAt: string | null;
    resolvedAt: string | null;
    issueType: {
        name: string;
        icon: string;
        color: string;
    } | null;
}

interface Assignment {
    id: string;
    status: string;
    assignedAt: string;
    acceptedAt: string | null;
    arrivedAt: string | null;
    completedAt: string | null;
    volunteer: {
        id: string;
        displayName: string;
        phone: string;
        rank: string;
    } | null;
}

const severityColors: Record<string, string> = {
    low: "bg-green-500",
    medium: "bg-yellow-500",
    high: "bg-orange-500",
    critical: "bg-red-500 animate-pulse",
};

const statusColors: Record<string, string> = {
    pending: "bg-gray-500",
    acknowledged: "bg-blue-500",
    assigned: "bg-purple-500",
    in_progress: "bg-orange-500",
    resolved: "bg-green-500",
    escalated: "bg-red-500",
    cancelled: "bg-gray-400",
};

const assignmentStatusLabels: Record<string, string> = {
    assigned: "Assigned",
    accepted: "Accepted",
    en_route: "On The Way",
    on_site: "At Location",
    completed: "Completed",
    dropped: "Dropped",
};

export default function IssueDetailPage() {
    const router = useRouter();
    const params = useParams();
    const issueId = params.id as string;

    const { data: session, isPending: sessionLoading } = authClient.useSession();

    const [issue, setIssue] = useState<IssueDetail | null>(null);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [myAssignment, setMyAssignment] = useState<Assignment | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [showResolveDialog, setShowResolveDialog] = useState(false);
    const [resolutionNotes, setResolutionNotes] = useState("");
    const [volunteerLocation, setVolunteerLocation] = useState<{
        lat: number;
        lng: number;
    } | null>(null);

    // Get volunteer's current location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setVolunteerLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                () => {
                    // Silently fail - we'll use volunteer's saved location
                }
            );
        }
    }, []);

    // Fetch issue details
    useEffect(() => {
        if (session?.user && issueId) {
            fetchIssueDetails();
        }
    }, [session, issueId]);

    const fetchIssueDetails = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/issues/${issueId}`);
            if (!res.ok) {
                throw new Error("Failed to fetch issue details");
            }
            const data = await res.json();
            setIssue(data.issue);
            setAssignments(data.assignments || []);
            setMyAssignment(data.myAssignment || null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async () => {
        setActionLoading(true);
        try {
            const res = await fetch(`/api/issues/${issueId}/accept`, {
                method: "POST",
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            await fetchIssueDetails();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to accept");
        } finally {
            setActionLoading(false);
        }
    };

    const handleStatusUpdate = async (status: string) => {
        setActionLoading(true);
        try {
            const res = await fetch(`/api/issues/${issueId}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            await fetchIssueDetails();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to update status");
        } finally {
            setActionLoading(false);
        }
    };

    const handleResolve = async () => {
        setActionLoading(true);
        try {
            const res = await fetch(`/api/issues/${issueId}/resolve`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notes: resolutionNotes }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setShowResolveDialog(false);
            router.push("/volunteer/dashboard");
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to resolve");
        } finally {
            setActionLoading(false);
        }
    };

    const getGoogleMapsUrl = () => {
        if (!issue) return "";
        return `https://www.google.com/maps?q=${issue.latitude},${issue.longitude}`;
    };

    const getDirectionsUrl = () => {
        if (!issue) return "";
        if (volunteerLocation) {
            return `https://www.google.com/maps/dir/${volunteerLocation.lat},${volunteerLocation.lng}/${issue.latitude},${issue.longitude}`;
        }
        return `https://www.google.com/maps/dir/?api=1&destination=${issue.latitude},${issue.longitude}`;
    };

    const getTimeElapsed = (date: string) => {
        const diff = Date.now() - new Date(date).getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    // Loading state
    if (sessionLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    // Error state
    if (error || !issue) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="w-full max-w-md text-center">
                    <CardContent className="pt-8 pb-8">
                        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h1 className="text-xl font-bold mb-4">Error</h1>
                        <p className="text-gray-600 mb-6">{error || "Issue not found"}</p>
                        <Button onClick={() => router.back()}>Go Back</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const isAssignedToMe = !!myAssignment;
    const canAccept = !isAssignedToMe && ["pending", "acknowledged"].includes(issue.status);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* Header */}
            <header className="bg-white dark:bg-gray-900 border-b sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Button variant="ghost" size="sm" onClick={() => router.back()}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <div className="flex items-center gap-2">
                        <Badge className={`${severityColors[issue.severity]} text-white`}>
                            {issue.severity.toUpperCase()}
                        </Badge>
                        <Badge className={`${statusColors[issue.status]} text-white`}>
                            {issue.status.replace("_", " ").toUpperCase()}
                        </Badge>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                {/* Issue Type & Time */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-12 h-12 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: issue.issueType?.color || "#EF4444" }}
                                >
                                    <AlertTriangle className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold">
                                        {issue.issueType?.name || "Emergency Alert"}
                                    </h1>
                                    <p className="text-sm text-gray-500 flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {getTimeElapsed(issue.createdAt)}
                                    </p>
                                </div>
                            </div>
                        </div>
                        {issue.title && (
                            <p className="mt-4 font-medium">{issue.title}</p>
                        )}
                        {issue.description && (
                            <p className="mt-2 text-gray-600 dark:text-gray-300">
                                {issue.description}
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Location with Map */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="w-5 h-5" />
                            Location
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Static Map Preview */}
                        <div className="w-full h-48 bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden relative">
                            <iframe
                                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${issue.latitude},${issue.longitude}&zoom=15`}
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                            <div className="absolute top-2 right-2">
                                <a
                                    href={getGoogleMapsUrl()}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-white dark:bg-gray-800 px-2 py-1 rounded shadow text-xs flex items-center gap-1"
                                >
                                    <ExternalLink className="w-3 h-3" />
                                    Open in Maps
                                </a>
                            </div>
                        </div>

                        {/* Address */}
                        <div className="space-y-2">
                            {issue.address && (
                                <p className="text-gray-700 dark:text-gray-300">{issue.address}</p>
                            )}
                            {issue.landmark && (
                                <p className="text-sm text-gray-500">
                                    <MapPinned className="w-4 h-4 inline mr-1" />
                                    Near: {issue.landmark}
                                </p>
                            )}
                            {issue.district && (
                                <Badge variant="outline">{issue.district}</Badge>
                            )}
                            <p className="text-xs text-gray-400">
                                Coordinates: {issue.latitude.toFixed(6)}, {issue.longitude.toFixed(6)}
                            </p>
                        </div>

                        {/* Directions Button */}
                        <a
                            href={getDirectionsUrl()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                        >
                            <Navigation className="w-5 h-5" />
                            Get Directions to Location
                        </a>
                    </CardContent>
                </Card>

                {/* Victim Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Victim Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            {issue.victimName && (
                                <div>
                                    <p className="text-sm text-gray-500">Name</p>
                                    <p className="font-medium">{issue.victimName}</p>
                                </div>
                            )}
                            {issue.victimAge && (
                                <div>
                                    <p className="text-sm text-gray-500">Age</p>
                                    <p className="font-medium">{issue.victimAge} years</p>
                                </div>
                            )}
                            {issue.victimGender && (
                                <div>
                                    <p className="text-sm text-gray-500">Gender</p>
                                    <p className="font-medium capitalize">{issue.victimGender}</p>
                                </div>
                            )}
                        </div>

                        {/* Call Button */}
                        <a
                            href={`tel:${issue.victimPhone}`}
                            className="flex items-center justify-center gap-2 w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                        >
                            <Phone className="w-5 h-5" />
                            Call {issue.victimPhone}
                        </a>

                        {/* Reporter Info (if different) */}
                        {issue.reporterRelation !== "self" && issue.reporterPhone && (
                            <div className="pt-4 border-t">
                                <p className="text-sm text-gray-500 mb-2">
                                    Reported by: {issue.reporterName || "Unknown"} ({issue.reporterRelation})
                                </p>
                                <a
                                    href={`tel:${issue.reporterPhone}`}
                                    className="flex items-center justify-center gap-2 w-full py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg font-medium transition"
                                >
                                    <Phone className="w-4 h-4" />
                                    Call Reporter: {issue.reporterPhone}
                                </a>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Assignment Status */}
                {isAssignedToMe && myAssignment && (
                    <Card className="border-blue-200 dark:border-blue-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-blue-600" />
                                Your Assignment
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-gray-600">Current Status:</span>
                                <Badge className="bg-blue-600 text-white">
                                    {assignmentStatusLabels[myAssignment.status] || myAssignment.status}
                                </Badge>
                            </div>

                            {/* Status Timeline */}
                            <div className="flex items-center justify-between mb-6">
                                {["accepted", "en_route", "on_site", "completed"].map((step, idx) => {
                                    const steps = ["accepted", "en_route", "on_site", "completed"];
                                    const currentIdx = steps.indexOf(myAssignment.status);
                                    const isCompleted = idx <= currentIdx;
                                    const isCurrent = idx === currentIdx;
                                    return (
                                        <div key={step} className="flex flex-col items-center flex-1">
                                            <div
                                                className={`w-8 h-8 rounded-full flex items-center justify-center ${isCompleted
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-gray-200 text-gray-400"
                                                    } ${isCurrent ? "ring-4 ring-blue-200" : ""}`}
                                            >
                                                {isCompleted ? (
                                                    <CheckCircle className="w-4 h-4" />
                                                ) : (
                                                    <span className="text-xs">{idx + 1}</span>
                                                )}
                                            </div>
                                            <span className="text-xs mt-1 text-center">
                                                {assignmentStatusLabels[step]}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Action Buttons */}
                <div className="space-y-3 pb-8">
                    {canAccept && (
                        <Button
                            onClick={handleAccept}
                            disabled={actionLoading}
                            className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700"
                        >
                            {actionLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            ) : (
                                <CheckCircle className="w-5 h-5 mr-2" />
                            )}
                            Accept This Issue
                        </Button>
                    )}

                    {isAssignedToMe && myAssignment?.status === "accepted" && (
                        <Button
                            onClick={() => handleStatusUpdate("en_route")}
                            disabled={actionLoading}
                            className="w-full h-14 text-lg bg-orange-500 hover:bg-orange-600"
                        >
                            {actionLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            ) : (
                                <Car className="w-5 h-5 mr-2" />
                            )}
                            I&apos;m On My Way
                        </Button>
                    )}

                    {isAssignedToMe && myAssignment?.status === "en_route" && (
                        <Button
                            onClick={() => handleStatusUpdate("on_site")}
                            disabled={actionLoading}
                            className="w-full h-14 text-lg bg-purple-600 hover:bg-purple-700"
                        >
                            {actionLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            ) : (
                                <MapPin className="w-5 h-5 mr-2" />
                            )}
                            I&apos;ve Arrived
                        </Button>
                    )}

                    {isAssignedToMe && myAssignment?.status === "on_site" && (
                        <Button
                            onClick={() => setShowResolveDialog(true)}
                            disabled={actionLoading}
                            className="w-full h-14 text-lg bg-green-600 hover:bg-green-700"
                        >
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Mark as Resolved
                        </Button>
                    )}

                    {issue.status === "resolved" && (
                        <div className="text-center py-8">
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-green-600">Issue Resolved</h3>
                            <p className="text-gray-500 mt-2">
                                Resolved on {new Date(issue.resolvedAt!).toLocaleString()}
                            </p>
                        </div>
                    )}
                </div>
            </main>

            {/* Resolve Dialog */}
            <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Resolve Issue</DialogTitle>
                        <DialogDescription>
                            Add notes about how the issue was resolved.
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        placeholder="Describe how the issue was resolved..."
                        value={resolutionNotes}
                        onChange={(e) => setResolutionNotes(e.target.value)}
                        rows={4}
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowResolveDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleResolve}
                            disabled={actionLoading}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {actionLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                                <CheckCircle className="w-4 h-4 mr-2" />
                            )}
                            Confirm Resolution
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
