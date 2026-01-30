"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    User,
    Loader2,
    Save,
    ArrowLeft,
    MapPin,
    Phone,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

const BIHAR_DISTRICTS = [
    "Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur",
    "Buxar", "Darbhanga", "East Champaran", "Gaya", "Gopalganj", "Jamui",
    "Jehanabad", "Kaimur", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai",
    "Madhepura", "Madhubani", "Munger", "Muzaffarpur", "Nalanda", "Nawada",
    "Patna", "Purnia", "Rohtas", "Saharsa", "Samastipur", "Saran", "Sheikhpura",
    "Sheohar", "Sitamarhi", "Siwan", "Supaul", "Vaishali", "West Champaran"
];

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function ProfilePage() {
    const router = useRouter();
    const { data: session, isPending: sessionLoading } = authClient.useSession();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        phone: "",
        alternatePhone: "",
        gender: "",
        bloodGroup: "",
        district: "",
        address: "",
        pincode: "",
        emergencyContactName: "",
        emergencyContactPhone: "",
        emergencyContactRelation: "",
    });

    useEffect(() => {
        if (session?.user) {
            fetchProfile();
        }
    }, [session]);

    const fetchProfile = async () => {
        try {
            const res = await fetch("/api/user/profile");
            if (res.ok) {
                const data = await res.json();
                if (data.profile) {
                    setFormData({
                        phone: data.profile.phone || "",
                        alternatePhone: data.profile.alternatePhone || "",
                        gender: data.profile.gender || "",
                        bloodGroup: data.profile.bloodGroup || "",
                        district: data.profile.district || "",
                        address: data.profile.address || "",
                        pincode: data.profile.pincode || "",
                        emergencyContactName: data.profile.emergencyContactName || "",
                        emergencyContactPhone: data.profile.emergencyContactPhone || "",
                        emergencyContactRelation: data.profile.emergencyContactRelation || "",
                    });
                }
            }
        } catch (error) {
            console.error("Failed to fetch profile", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/user/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                router.push("/dashboard");
            }
        } catch (error) {
            console.error("Failed to save profile", error);
        } finally {
            setSaving(false);
        }
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
                        <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
                        <Button onClick={() => router.push("/auth/login")}>Sign In</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <div className="max-w-3xl mx-auto px-4 py-6">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-white/20"
                            onClick={() => router.push("/dashboard")}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Profile Settings</h1>
                            <p className="text-white/80">Update your personal information</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-8">
                <div className="space-y-6">
                    {/* Contact Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Phone className="w-5 h-5" />
                                Contact Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        value={formData.phone}
                                        onChange={(e) =>
                                            setFormData({ ...formData, phone: e.target.value })
                                        }
                                        placeholder="10-digit mobile number"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="alternatePhone">Alternate Phone</Label>
                                    <Input
                                        id="alternatePhone"
                                        value={formData.alternatePhone}
                                        onChange={(e) =>
                                            setFormData({ ...formData, alternatePhone: e.target.value })
                                        }
                                        placeholder="Optional"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Personal Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Personal Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="gender">Gender</Label>
                                    <Select
                                        value={formData.gender}
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, gender: value })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">Male</SelectItem>
                                            <SelectItem value="female">Female</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="bloodGroup">Blood Group</Label>
                                    <Select
                                        value={formData.bloodGroup}
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, bloodGroup: value })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select blood group" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {BLOOD_GROUPS.map((bg) => (
                                                <SelectItem key={bg} value={bg}>
                                                    {bg}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Location */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="w-5 h-5" />
                                Location
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="district">District</Label>
                                <Select
                                    value={formData.district}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, district: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select district" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {BIHAR_DISTRICTS.map((d) => (
                                            <SelectItem key={d} value={d}>
                                                {d}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="address">Address</Label>
                                <Input
                                    id="address"
                                    value={formData.address}
                                    onChange={(e) =>
                                        setFormData({ ...formData, address: e.target.value })
                                    }
                                    placeholder="Your full address"
                                />
                            </div>
                            <div>
                                <Label htmlFor="pincode">Pincode</Label>
                                <Input
                                    id="pincode"
                                    value={formData.pincode}
                                    onChange={(e) =>
                                        setFormData({ ...formData, pincode: e.target.value })
                                    }
                                    placeholder="6-digit pincode"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Emergency Contact */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Emergency Contact</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="emergencyContactName">Contact Name</Label>
                                    <Input
                                        id="emergencyContactName"
                                        value={formData.emergencyContactName}
                                        onChange={(e) =>
                                            setFormData({ ...formData, emergencyContactName: e.target.value })
                                        }
                                        placeholder="Emergency contact name"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
                                    <Input
                                        id="emergencyContactPhone"
                                        value={formData.emergencyContactPhone}
                                        onChange={(e) =>
                                            setFormData({ ...formData, emergencyContactPhone: e.target.value })
                                        }
                                        placeholder="10-digit mobile number"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="emergencyContactRelation">Relation</Label>
                                <Select
                                    value={formData.emergencyContactRelation}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, emergencyContactRelation: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select relation" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="parent">Parent</SelectItem>
                                        <SelectItem value="spouse">Spouse</SelectItem>
                                        <SelectItem value="sibling">Sibling</SelectItem>
                                        <SelectItem value="friend">Friend</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <Button onClick={handleSave} disabled={saving} className="w-full">
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Profile
                            </>
                        )}
                    </Button>
                </div>
            </main>
        </div>
    );
}
