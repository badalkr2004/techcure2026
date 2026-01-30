"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    UserCheck,
    Loader2,
    MapPin,
    Phone,
    Star,
    Filter,
    ArrowLeft,
    CheckCircle,
    Shield,
    Search,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

interface Volunteer {
    id: string;
    displayName: string;
    phone: string;
    age: number;
    rank: string;
    district: string;
    isAvailable: boolean;
    isVerified: boolean;
    totalResolves: number;
    rating: number;
    createdAt: string;
    user: {
        id: string;
        name: string;
        email: string;
    } | null;
}

const rankColors: Record<string, string> = {
    beginner: "bg-gray-500",
    trained: "bg-blue-500",
    advanced: "bg-purple-500",
    expert: "bg-orange-500",
    leader: "bg-yellow-500",
};

export default function AdminVolunteersPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session, isPending: sessionLoading } = authClient.useSession();

    const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [verifiedFilter, setVerifiedFilter] = useState(searchParams.get("verified") || "");
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => {
        if (session?.user) {
            fetchVolunteers();
        }
    }, [session, verifiedFilter]);

    const fetchVolunteers = async () => {
        setLoading(true);
        try {
            let url = "/api/admin/volunteers?";
            if (verifiedFilter) url += `verified=${verifiedFilter}&`;
            if (search) url += `search=${encodeURIComponent(search)}&`;

            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setVolunteers(data.volunteers || []);
            }
        } catch (error) {
            console.error("Failed to fetch volunteers", error);
        } finally {
            setLoading(false);
        }
    };

    const updateVolunteer = async (volunteerId: string, updates: Record<string, unknown>) => {
        setUpdating(volunteerId);
        try {
            const res = await fetch("/api/admin/volunteers", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ volunteerId, ...updates }),
            });

            if (res.ok) {
                fetchVolunteers();
            }
        } catch (error) {
            console.error("Failed to update volunteer", error);
        } finally {
            setUpdating(null);
        }
    };

    const handleSearch = () => {
        fetchVolunteers();
    };

    if (sessionLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    const unverifiedCount = volunteers.filter((v) => !v.isVerified).length;

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
                            <h1 className="text-2xl font-bold">Volunteer Management</h1>
                            <p className="text-gray-400">Verify and manage volunteers</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Pending Verification Alert */}
                {unverifiedCount > 0 && (
                    <Card className="mb-6 border-yellow-500 border-2 bg-yellow-50 dark:bg-yellow-900/20">
                        <CardContent className="pt-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-yellow-500 text-white flex items-center justify-center">
                                    <UserCheck className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-yellow-700">
                                        {unverifiedCount} Volunteers Pending Verification
                                    </h3>
                                    <p className="text-sm text-gray-600">Review and verify new volunteer applications</p>
                                </div>
                            </div>
                            <Button
                                className="bg-yellow-600 hover:bg-yellow-700"
                                onClick={() => setVerifiedFilter("false")}
                            >
                                View Pending
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Filters */}
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="flex flex-wrap gap-4">
                            <div className="flex-1 min-w-[200px]">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        placeholder="Search by name, phone, or email..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Verification Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Volunteers</SelectItem>
                                    <SelectItem value="true">Verified</SelectItem>
                                    <SelectItem value="false">Pending Verification</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button onClick={handleSearch}>Search</Button>
                            <Button variant="outline" onClick={() => { setSearch(""); setVerifiedFilter(""); }}>
                                Clear
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Volunteers List */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                ) : volunteers.length === 0 ? (
                    <Card className="text-center py-16">
                        <CardContent>
                            <UserCheck className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                            <h2 className="text-xl font-bold">No Volunteers Found</h2>
                            <p className="text-gray-500">No volunteers match your current filters</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                        {volunteers.map((volunteer) => (
                            <Card key={volunteer.id} className={!volunteer.isVerified ? "border-yellow-300 border-2" : ""}>
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="font-semibold text-lg">{volunteer.displayName}</h3>
                                                <Badge className={rankColors[volunteer.rank]}>
                                                    {volunteer.rank.toUpperCase()}
                                                </Badge>
                                                {volunteer.isVerified ? (
                                                    <Badge className="bg-green-500">
                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                        Verified
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                                                        Pending
                                                    </Badge>
                                                )}
                                            </div>

                                            {volunteer.user?.email && (
                                                <p className="text-sm text-gray-500">{volunteer.user.email}</p>
                                            )}

                                            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Phone className="w-3 h-3" />
                                                    {volunteer.phone}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    {volunteer.district}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Star className="w-3 h-3 text-yellow-500" />
                                                    {volunteer.rating.toFixed(1)}
                                                </span>
                                                <span>
                                                    {volunteer.totalResolves} issues resolved
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 ml-4">
                                            {!volunteer.isVerified && (
                                                <Button
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700"
                                                    onClick={() => updateVolunteer(volunteer.id, { isVerified: true })}
                                                    disabled={updating === volunteer.id}
                                                >
                                                    {updating === volunteer.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <CheckCircle className="w-4 h-4 mr-1" />
                                                            Verify
                                                        </>
                                                    )}
                                                </Button>
                                            )}
                                            <Select
                                                value={volunteer.rank}
                                                onValueChange={(rank) => updateVolunteer(volunteer.id, { rank })}
                                                disabled={updating === volunteer.id}
                                            >
                                                <SelectTrigger className="w-[130px]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="beginner">Beginner</SelectItem>
                                                    <SelectItem value="trained">Trained</SelectItem>
                                                    <SelectItem value="advanced">Advanced</SelectItem>
                                                    <SelectItem value="expert">Expert</SelectItem>
                                                    <SelectItem value="leader">Leader</SelectItem>
                                                </SelectContent>
                                            </Select>
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
