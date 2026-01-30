"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Users,
    Loader2,
    MapPin,
    Plus,
    Search,
    Shield,
    Star,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { PageWrapper } from "@/components/layout";

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
}

const teamTypeColors: Record<string, string> = {
    rescue: "bg-red-500",
    medical: "bg-blue-500",
    relief: "bg-green-500",
    general: "bg-gray-500",
};

const teamTypeLabels: Record<string, string> = {
    rescue: "Rescue",
    medical: "Medical",
    relief: "Relief",
    general: "General",
};

export default function TeamsPage() {
    const router = useRouter();
    const { data: session } = authClient.useSession();
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        try {
            const res = await fetch("/api/teams");
            if (res.ok) {
                const data = await res.json();
                setTeams(data.teams || []);
            }
        } catch (error) {
            console.error("Failed to fetch teams", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTeams = teams.filter(
        (team) =>
            team.name.toLowerCase().includes(search.toLowerCase()) ||
            team.district.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <PageWrapper>
                <div className="min-h-[50vh] flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin" />
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper showBackButton>
            {/* Header */}
            <header className="bg-[#1a365d] text-white">
                <div className="max-w-6xl mx-auto px-4 py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
                                <Users className="w-7 h-7" />
                                Volunteer Teams
                            </h1>
                            <p className="text-blue-100 mt-1 text-sm sm:text-base">
                                Join or create teams to respond to emergencies
                            </p>
                        </div>
                        {session?.user && (
                            <Button variant="secondary" asChild className="w-full sm:w-auto">
                                <Link href="/teams/create">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Team
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-6">
                {/* Search */}
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search teams by name or district..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardContent className="pt-6 text-center">
                            <p className="text-3xl font-bold text-blue-600">{teams.length}</p>
                            <p className="text-sm text-gray-500">Total Teams</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6 text-center">
                            <p className="text-3xl font-bold text-green-600">
                                {teams.reduce((sum, t) => sum + t.memberCount, 0)}
                            </p>
                            <p className="text-sm text-gray-500">Total Members</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6 text-center">
                            <p className="text-3xl font-bold text-orange-600">
                                {teams.reduce((sum, t) => sum + t.totalResolves, 0)}
                            </p>
                            <p className="text-sm text-gray-500">Issues Resolved</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6 text-center">
                            <p className="text-3xl font-bold text-purple-600">
                                {new Set(teams.map((t) => t.district)).size}
                            </p>
                            <p className="text-sm text-gray-500">Districts Covered</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Teams Grid */}
                {filteredTeams.length === 0 ? (
                    <Card className="text-center py-16">
                        <CardContent>
                            <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                            <h2 className="text-xl font-bold">No Teams Found</h2>
                            <p className="text-gray-500 mt-2">
                                {search ? "Try a different search term" : "Be the first to create a team!"}
                            </p>
                            {session?.user && (
                                <Button className="mt-4" asChild>
                                    <Link href="/teams/create">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create Team
                                    </Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTeams.map((team) => (
                            <Card key={team.id} className="hover:shadow-lg transition">
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                                <Users className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">{team.name}</h3>
                                                <Badge className={teamTypeColors[team.teamType]}>
                                                    {teamTypeLabels[team.teamType] || team.teamType}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    {team.description && (
                                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-4">
                                            {team.description}
                                        </p>
                                    )}

                                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            {team.district}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Users className="w-3 h-3" />
                                            {team.memberCount} members
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Star className="w-3 h-3" />
                                            {team.totalResolves} resolved
                                        </span>
                                    </div>

                                    {team.leader && (
                                        <p className="text-xs text-gray-500 mb-4">
                                            Led by <span className="font-medium">{team.leader.displayName}</span>
                                        </p>
                                    )}

                                    <Button className="w-full" variant="outline" asChild>
                                        <Link href={`/teams/${team.id}`}>View Team</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </PageWrapper>
    );
}
