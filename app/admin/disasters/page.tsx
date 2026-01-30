"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertTriangle,
    Plus,
    Loader2,
    CloudRain,
    Flame,
    Wind,
    Waves,
    ShieldAlert,
    Users,
    MapPin,
    Calendar,
    Settings,
    CheckCircle,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

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

interface Team {
    id: string;
    name: string;
    teamType: string;
    district: string;
    memberCount: number;
}

const disasterTypes = [
    { value: "flood", label: "Flood", icon: <Waves className="w-4 h-4" /> },
    { value: "earthquake", label: "Earthquake", icon: <AlertTriangle className="w-4 h-4" /> },
    { value: "cyclone", label: "Cyclone", icon: <Wind className="w-4 h-4" /> },
    { value: "drought", label: "Drought", icon: <CloudRain className="w-4 h-4" /> },
    { value: "fire", label: "Fire", icon: <Flame className="w-4 h-4" /> },
    { value: "pandemic", label: "Pandemic", icon: <ShieldAlert className="w-4 h-4" /> },
    { value: "other", label: "Other", icon: <AlertTriangle className="w-4 h-4" /> },
];

const severityLevels = [
    { value: "minor", label: "Minor", color: "bg-yellow-500" },
    { value: "moderate", label: "Moderate", color: "bg-orange-500" },
    { value: "severe", label: "Severe", color: "bg-red-500" },
    { value: "catastrophic", label: "Catastrophic", color: "bg-red-700" },
];

const responseLevels = [
    { value: "local", label: "Local Response" },
    { value: "district", label: "District Level" },
    { value: "state", label: "State Level" },
    { value: "national", label: "National Emergency" },
];

const biharDistricts = [
    "Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur",
    "Buxar", "Darbhanga", "East Champaran", "Gaya", "Gopalganj", "Jamui", "Jehanabad",
    "Kaimur", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura", "Madhubani",
    "Munger", "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia", "Rohtas", "Saharsa",
    "Samastipur", "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul",
    "Vaishali", "West Champaran"
];

const statusColors: Record<string, string> = {
    active: "bg-red-500",
    contained: "bg-orange-500",
    resolved: "bg-green-500",
};

export default function AdminDisastersPage() {
    const router = useRouter();
    const { data: session, isPending: sessionLoading } = authClient.useSession();

    const [disasters, setDisasters] = useState<Disaster[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDeclareDialog, setShowDeclareDialog] = useState(false);
    const [showActivateDialog, setShowActivateDialog] = useState(false);
    const [selectedDisaster, setSelectedDisaster] = useState<Disaster | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        disasterType: "",
        title: "",
        description: "",
        affectedDistricts: [] as string[],
        severity: "",
        responseLevel: "local",
        estimatedAffectedPeople: "",
    });

    // Activation form
    const [activationData, setActivationData] = useState({
        teamId: "",
        assignedArea: "",
        responsibilities: "",
    });

    useEffect(() => {
        if (session?.user) {
            fetchData();
        }
    }, [session]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [disastersRes, teamsRes] = await Promise.all([
                fetch("/api/disasters?status=all"),
                fetch("/api/teams"),
            ]);

            if (disastersRes.ok) {
                const data = await disastersRes.json();
                setDisasters(data.disasters || []);
            }

            if (teamsRes.ok) {
                const data = await teamsRes.json();
                setTeams(data.teams || []);
            }
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeclare = async () => {
        if (!formData.disasterType || !formData.title || !formData.severity || formData.affectedDistricts.length === 0) {
            alert("Please fill all required fields");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch("/api/disasters", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    estimatedAffectedPeople: formData.estimatedAffectedPeople
                        ? parseInt(formData.estimatedAffectedPeople)
                        : null,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setShowDeclareDialog(false);
            setFormData({
                disasterType: "",
                title: "",
                description: "",
                affectedDistricts: [],
                severity: "",
                responseLevel: "local",
                estimatedAffectedPeople: "",
            });
            fetchData();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to declare disaster");
        } finally {
            setSubmitting(false);
        }
    };

    const handleActivateTeam = async () => {
        if (!selectedDisaster || !activationData.teamId) {
            alert("Please select a team");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch(`/api/disasters/${selectedDisaster.id}/teams`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(activationData),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setShowActivateDialog(false);
            setActivationData({ teamId: "", assignedArea: "", responsibilities: "" });
            fetchData();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to activate team");
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateStatus = async (disasterId: string, status: string) => {
        try {
            const res = await fetch(`/api/disasters/${disasterId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error);
            }

            fetchData();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to update status");
        }
    };

    const toggleDistrict = (district: string) => {
        setFormData((prev) => ({
            ...prev,
            affectedDistricts: prev.affectedDistricts.includes(district)
                ? prev.affectedDistricts.filter((d) => d !== district)
                : [...prev.affectedDistricts, district],
        }));
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
                        <ShieldAlert className="w-16 h-16 text-red-600 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold mb-4">Admin Access Required</h1>
                        <Button onClick={() => router.push("/auth/login")}>Sign In</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const activeDisasters = disasters.filter((d) => d.status === "active");
    const resolvedDisasters = disasters.filter((d) => d.status !== "active");

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* Header */}
            <header className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
                <div className="max-w-6xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                <Settings className="w-6 h-6" />
                                Disaster Management
                            </h1>
                            <p className="text-gray-400 mt-1">Admin Dashboard</p>
                        </div>
                        <Dialog open={showDeclareDialog} onOpenChange={setShowDeclareDialog}>
                            <DialogTrigger asChild>
                                <Button className="bg-red-600 hover:bg-red-700">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Declare Disaster
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Declare New Disaster</DialogTitle>
                                    <DialogDescription>
                                        Create a disaster alert to coordinate response efforts.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4">
                                    {/* Disaster Type */}
                                    <div>
                                        <Label>Disaster Type *</Label>
                                        <Select
                                            value={formData.disasterType}
                                            onValueChange={(v) =>
                                                setFormData((prev) => ({ ...prev, disasterType: v }))
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {disasterTypes.map((type) => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        <span className="flex items-center gap-2">
                                                            {type.icon} {type.label}
                                                        </span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Title */}
                                    <div>
                                        <Label>Title *</Label>
                                        <Input
                                            value={formData.title}
                                            onChange={(e) =>
                                                setFormData((prev) => ({ ...prev, title: e.target.value }))
                                            }
                                            placeholder="e.g., Severe Flooding in North Bihar"
                                        />
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <Label>Description *</Label>
                                        <Textarea
                                            value={formData.description}
                                            onChange={(e) =>
                                                setFormData((prev) => ({ ...prev, description: e.target.value }))
                                            }
                                            placeholder="Describe the disaster situation..."
                                            rows={3}
                                        />
                                    </div>

                                    {/* Severity & Response Level */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Severity *</Label>
                                            <Select
                                                value={formData.severity}
                                                onValueChange={(v) =>
                                                    setFormData((prev) => ({ ...prev, severity: v }))
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select severity" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {severityLevels.map((level) => (
                                                        <SelectItem key={level.value} value={level.value}>
                                                            {level.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label>Response Level</Label>
                                            <Select
                                                value={formData.responseLevel}
                                                onValueChange={(v) =>
                                                    setFormData((prev) => ({ ...prev, responseLevel: v }))
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {responseLevels.map((level) => (
                                                        <SelectItem key={level.value} value={level.value}>
                                                            {level.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Estimated Affected */}
                                    <div>
                                        <Label>Estimated Affected People</Label>
                                        <Input
                                            type="number"
                                            value={formData.estimatedAffectedPeople}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    estimatedAffectedPeople: e.target.value,
                                                }))
                                            }
                                            placeholder="e.g., 50000"
                                        />
                                    </div>

                                    {/* Affected Districts */}
                                    <div>
                                        <Label>Affected Districts * ({formData.affectedDistricts.length} selected)</Label>
                                        <div className="max-h-40 overflow-y-auto border rounded-lg p-2 mt-1">
                                            <div className="flex flex-wrap gap-2">
                                                {biharDistricts.map((district) => (
                                                    <Badge
                                                        key={district}
                                                        variant={
                                                            formData.affectedDistricts.includes(district)
                                                                ? "default"
                                                                : "outline"
                                                        }
                                                        className="cursor-pointer"
                                                        onClick={() => toggleDistrict(district)}
                                                    >
                                                        {district}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowDeclareDialog(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleDeclare}
                                        disabled={submitting}
                                        className="bg-red-600 hover:bg-red-700"
                                    >
                                        {submitting ? (
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        ) : (
                                            <AlertTriangle className="w-4 h-4 mr-2" />
                                        )}
                                        Declare Disaster
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <Card>
                        <CardContent className="pt-6 text-center">
                            <p className="text-3xl font-bold text-red-600">{activeDisasters.length}</p>
                            <p className="text-gray-500">Active Disasters</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6 text-center">
                            <p className="text-3xl font-bold text-blue-600">{teams.length}</p>
                            <p className="text-gray-500">Available Teams</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6 text-center">
                            <p className="text-3xl font-bold text-green-600">{resolvedDisasters.length}</p>
                            <p className="text-gray-500">Resolved</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Active Disasters */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="w-5 h-5" />
                            Active Disasters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {activeDisasters.length === 0 ? (
                            <p className="text-center text-gray-500 py-8">No active disasters</p>
                        ) : (
                            <div className="space-y-4">
                                {activeDisasters.map((d) => (
                                    <div
                                        key={d.id}
                                        className="flex items-center justify-between p-4 border rounded-lg"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold">{d.title}</h3>
                                                <Badge className={statusColors[d.status]}>{d.status}</Badge>
                                                <Badge variant="outline" className="capitalize">
                                                    {d.severity}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">
                                                <MapPin className="w-3 h-3 inline mr-1" />
                                                {d.affectedDistricts.join(", ")}
                                            </p>
                                            <div className="flex gap-4 mt-2 text-sm">
                                                <span><Users className="w-3 h-3 inline mr-1" />{d.stats.teamsActivated} teams</span>
                                                <span><AlertTriangle className="w-3 h-3 inline mr-1" />{d.stats.issuesReported} issues</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    setSelectedDisaster(d);
                                                    setShowActivateDialog(true);
                                                }}
                                            >
                                                <Users className="w-4 h-4 mr-1" />
                                                Activate Team
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleUpdateStatus(d.id, "contained")}
                                            >
                                                Mark Contained
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="bg-green-600 hover:bg-green-700"
                                                onClick={() => handleUpdateStatus(d.id, "resolved")}
                                            >
                                                <CheckCircle className="w-4 h-4 mr-1" />
                                                Resolve
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Resolved Disasters */}
                {resolvedDisasters.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-gray-600">
                                <CheckCircle className="w-5 h-5" />
                                Past Disasters
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {resolvedDisasters.map((d) => (
                                    <div
                                        key={d.id}
                                        className="flex items-center justify-between p-3 border rounded-lg opacity-75"
                                    >
                                        <div>
                                            <span className="font-medium">{d.title}</span>
                                            <Badge className={`ml-2 ${statusColors[d.status]}`}>{d.status}</Badge>
                                        </div>
                                        <span className="text-sm text-gray-500">
                                            <Calendar className="w-3 h-3 inline mr-1" />
                                            {new Date(d.startedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </main>

            {/* Team Activation Dialog */}
            <Dialog open={showActivateDialog} onOpenChange={setShowActivateDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Activate Team for {selectedDisaster?.title}</DialogTitle>
                        <DialogDescription>
                            Deploy a volunteer team to respond to this disaster.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label>Select Team *</Label>
                            <Select
                                value={activationData.teamId}
                                onValueChange={(v) =>
                                    setActivationData((prev) => ({ ...prev, teamId: v }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose a team" />
                                </SelectTrigger>
                                <SelectContent>
                                    {teams.map((team) => (
                                        <SelectItem key={team.id} value={team.id}>
                                            {team.name} ({team.district}) - {team.memberCount} members
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Assigned Area</Label>
                            <Input
                                value={activationData.assignedArea}
                                onChange={(e) =>
                                    setActivationData((prev) => ({ ...prev, assignedArea: e.target.value }))
                                }
                                placeholder="e.g., Darbhanga city center"
                            />
                        </div>

                        <div>
                            <Label>Responsibilities</Label>
                            <Textarea
                                value={activationData.responsibilities}
                                onChange={(e) =>
                                    setActivationData((prev) => ({
                                        ...prev,
                                        responsibilities: e.target.value,
                                    }))
                                }
                                placeholder="e.g., Search and rescue, relief distribution"
                                rows={2}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowActivateDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleActivateTeam} disabled={submitting}>
                            {submitting ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                                <Users className="w-4 h-4 mr-2" />
                            )}
                            Activate Team
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
