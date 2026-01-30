"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Users,
    Loader2,
    MapPin,
    ArrowLeft,
    Shield,
    Star,
    Phone,
    UserPlus,
    LogOut,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

interface TeamMember {
    id: string;
    role: string;
    joinedAt: string;
    volunteer: {
        id: string;
        displayName: string;
        rank: string;
        phone: string;
        district: string;
        isAvailable: boolean;
    } | null;
}

interface Team {
    id: string;
    name: string;
    description: string | null;
    teamType: string;
    district: string;
    memberCount: number;
    totalResolves: number;
    isActive: boolean;
    leader: {
        id: string;
        displayName: string;
        rank: string;
    } | null;
    members: TeamMember[];
}

const teamTypeColors: Record<string, string> = {
    rescue: "bg-red-500",
    medical: "bg-blue-500",
    relief: "bg-green-500",
    general: "bg-gray-500",
};

const teamTypeLabels: Record<string, string> = {
    rescue: "Rescue Team",
    medical: "Medical Team",
    relief: "Relief Team",
    general: "General Team",
};

const rankColors: Record<string, string> = {
    beginner: "bg-gray-500",
    trained: "bg-blue-500",
    advanced: "bg-purple-500",
    expert: "bg-orange-500",
    leader: "bg-yellow-500",
};

export default function TeamDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = authClient.useSession();
    const [team, setTeam] = useState<Team | null>(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [leaving, setLeaving] = useState(false);
    const [isMember, setIsMember] = useState(false);
    const [volunteerProfileId, setVolunteerProfileId] = useState<string | null>(null);

    useEffect(() => {
        if (params.id) {
            fetchTeam();
        }
    }, [params.id]);

    useEffect(() => {
        if (session?.user) {
            fetchVolunteerProfile();
        }
    }, [session]);

    const fetchTeam = async () => {
        try {
            const res = await fetch(`/api/teams/${params.id}`);
            if (res.ok) {
                const data = await res.json();
                setTeam(data);
            }
        } catch (error) {
            console.error("Failed to fetch team", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchVolunteerProfile = async () => {
        try {
            const res = await fetch("/api/volunteer/profile");
            if (res.ok) {
                const data = await res.json();
                setVolunteerProfileId(data.id);
                // Check if user is a member
                if (team?.members) {
                    const member = team.members.find(
                        (m) => m.volunteer?.id === data.id && m.volunteer
                    );
                    setIsMember(!!member);
                }
            }
        } catch (error) {
            // Not a volunteer
        }
    };

    useEffect(() => {
        if (team && volunteerProfileId) {
            const member = team.members.find((m) => m.volunteer?.id === volunteerProfileId);
            setIsMember(!!member);
        }
    }, [team, volunteerProfileId]);

    const handleJoin = async () => {
        setJoining(true);
        try {
            const res = await fetch(`/api/teams/${params.id}/members`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
            });

            if (res.ok) {
                fetchTeam();
                setIsMember(true);
            }
        } catch (error) {
            console.error("Failed to join team", error);
        } finally {
            setJoining(false);
        }
    };

    const handleLeave = async () => {
        setLeaving(true);
        try {
            const res = await fetch(`/api/teams/${params.id}/members`, {
                method: "DELETE",
            });

            if (res.ok) {
                fetchTeam();
                setIsMember(false);
            }
        } catch (error) {
            console.error("Failed to leave team", error);
        } finally {
            setLeaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    if (!team) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="w-full max-w-md text-center">
                    <CardContent className="pt-8 pb-8">
                        <h1 className="text-2xl font-bold mb-4">Team Not Found</h1>
                        <Button onClick={() => router.push("/teams")}>Browse Teams</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const isLeader = team.leader?.id === volunteerProfileId;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* Header */}
            <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <div className="max-w-6xl mx-auto px-4 py-8">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20 mb-4"
                        onClick={() => router.push("/teams")}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Teams
                    </Button>

                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                                <Users className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">{team.name}</h1>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge className={teamTypeColors[team.teamType]}>
                                        {teamTypeLabels[team.teamType] || team.teamType}
                                    </Badge>
                                    <span className="flex items-center gap-1 text-blue-100">
                                        <MapPin className="w-4 h-4" />
                                        {team.district}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            {session?.user && volunteerProfileId && !isLeader && (
                                <>
                                    {isMember ? (
                                        <Button
                                            variant="secondary"
                                            onClick={handleLeave}
                                            disabled={leaving}
                                        >
                                            {leaving ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <LogOut className="w-4 h-4 mr-2" />
                                                    Leave Team
                                                </>
                                            )}
                                        </Button>
                                    ) : (
                                        <Button onClick={handleJoin} disabled={joining}>
                                            {joining ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <UserPlus className="w-4 h-4 mr-2" />
                                                    Join Team
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8">
                {team.description && (
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <p className="text-gray-600 dark:text-gray-300">{team.description}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <Card>
                        <CardContent className="pt-6 text-center">
                            <p className="text-3xl font-bold text-blue-600">{team.memberCount}</p>
                            <p className="text-sm text-gray-500">Members</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6 text-center">
                            <p className="text-3xl font-bold text-green-600">{team.totalResolves}</p>
                            <p className="text-sm text-gray-500">Issues Resolved</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6 text-center">
                            <p className="text-3xl font-bold text-purple-600">
                                {team.isActive ? "Active" : "Inactive"}
                            </p>
                            <p className="text-sm text-gray-500">Status</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Leader */}
                {team.leader && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="w-5 h-5" />
                                Team Leader
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                                    <Shield className="w-6 h-6 text-yellow-600" />
                                </div>
                                <div>
                                    <p className="font-semibold">{team.leader.displayName}</p>
                                    <Badge className={rankColors[team.leader.rank]}>
                                        {team.leader.rank.toUpperCase()}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Members */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Team Members ({team.members.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {team.members.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No members yet</p>
                        ) : (
                            <div className="grid md:grid-cols-2 gap-4">
                                {team.members.map((member) => (
                                    <div
                                        key={member.id}
                                        className="flex items-center justify-between p-4 border rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                                <Users className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium">
                                                    {member.volunteer?.displayName || "Volunteer"}
                                                </p>
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <Badge className={rankColors[member.volunteer?.rank || "beginner"]} variant="outline">
                                                        {member.volunteer?.rank || "beginner"}
                                                    </Badge>
                                                    <Badge variant="outline" className="capitalize">
                                                        {member.role}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        {member.volunteer?.isAvailable && (
                                            <Badge className="bg-green-500">Available</Badge>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
