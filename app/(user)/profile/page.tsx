"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    User,
    Loader2,
    Save,
    ArrowLeft,
    MapPin,
    Phone,
    Shield,
    Mail,
    Calendar,
    Heart,
    AlertTriangle,
    CheckCircle,
    Home,
    Bell,
    HandHeart,
    LogOut,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { PageWrapper } from "@/components/layout";

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
    const [saved, setSaved] = useState(false);

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
        setSaved(false);
        try {
            const res = await fetch("/api/user/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            }
        } catch (error) {
            console.error("Failed to save profile", error);
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        await authClient.signOut();
        router.push("/");
    };

    // Calculate profile completion percentage
    const calculateCompletion = () => {
        const fields = [
            formData.phone,
            formData.gender,
            formData.bloodGroup,
            formData.district,
            formData.address,
            formData.pincode,
            formData.emergencyContactName,
            formData.emergencyContactPhone,
        ];
        const filled = fields.filter(f => f && f.trim() !== "").length;
        return Math.round((filled / fields.length) * 100);
    };

    if (sessionLoading || loading) {
        return (
            <PageWrapper>
                <div className="min-h-[50vh] flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[#1a365d]" />
                </div>
            </PageWrapper>
        );
    }

    if (!session?.user) {
        return (
            <PageWrapper showBackButton>
                <div className="min-h-[50vh] flex items-center justify-center p-4">
                    <Card className="w-full max-w-md text-center">
                        <CardContent className="pt-8 pb-8">
                            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h1 className="text-2xl font-bold mb-4 text-[#1a365d]">Sign In Required</h1>
                            <p className="text-gray-600 mb-6">Please sign in to access your profile</p>
                            <Button onClick={() => router.push("/auth/login")} className="bg-[#1a365d]">
                                Sign In
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </PageWrapper>
        );
    }

    const completion = calculateCompletion();

    return (
        <PageWrapper showBackButton>
            {/* Header */}
            <header className="bg-[#1a365d] text-white">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <User className="w-5 h-5" />
                        My Profile
                    </h1>
                    <p className="text-sm text-blue-100 mt-1">Manage your account settings</p>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-6">
                {/* User Info Card */}
                <Card className="mb-6 border-l-4 border-l-[#1a365d]">
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="w-16 h-16 rounded-lg bg-[#1a365d] text-white flex items-center justify-center text-2xl font-bold">
                                {session.user.name?.[0]?.toUpperCase() || "U"}
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl font-bold text-gray-900">{session.user.name}</h2>
                                <p className="text-gray-600 flex items-center gap-1">
                                    <Mail className="w-4 h-4" />
                                    {session.user.email}
                                </p>
                                {formData.phone && (
                                    <p className="text-gray-600 flex items-center gap-1">
                                        <Phone className="w-4 h-4" />
                                        {formData.phone}
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Profile Completion</p>
                                    <p className="text-2xl font-bold text-[#1a365d]">{completion}%</p>
                                </div>
                                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full transition-all ${completion === 100 ? 'bg-green-500' : 'bg-[#f97316]'}`}
                                        style={{ width: `${completion}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Success Message */}
                {saved && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-green-700 font-medium">Profile saved successfully!</span>
                    </div>
                )}

                <div className="grid gap-6">
                    {/* Contact Information */}
                    <Card>
                        <CardHeader className="border-b bg-gray-50">
                            <CardTitle className="flex items-center gap-2 text-[#1a365d]">
                                <Phone className="w-5 h-5" />
                                Contact Information
                            </CardTitle>
                            <CardDescription>Your phone numbers for contact</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6 space-y-4">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="phone">Phone Number *</Label>
                                    <Input
                                        id="phone"
                                        value={formData.phone}
                                        onChange={(e) =>
                                            setFormData({ ...formData, phone: e.target.value })
                                        }
                                        placeholder="10-digit mobile number"
                                        className="mt-1"
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
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Personal Details */}
                    <Card>
                        <CardHeader className="border-b bg-gray-50">
                            <CardTitle className="flex items-center gap-2 text-[#1a365d]">
                                <User className="w-5 h-5" />
                                Personal Details
                            </CardTitle>
                            <CardDescription>Basic information about you</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6 space-y-4">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="gender">Gender *</Label>
                                    <Select
                                        value={formData.gender}
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, gender: value })
                                        }
                                    >
                                        <SelectTrigger className="mt-1">
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
                                    <Label htmlFor="bloodGroup">Blood Group *</Label>
                                    <Select
                                        value={formData.bloodGroup}
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, bloodGroup: value })
                                        }
                                    >
                                        <SelectTrigger className="mt-1">
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
                        <CardHeader className="border-b bg-gray-50">
                            <CardTitle className="flex items-center gap-2 text-[#1a365d]">
                                <MapPin className="w-5 h-5" />
                                Location Details
                            </CardTitle>
                            <CardDescription>Your residential address</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6 space-y-4">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="district">District *</Label>
                                    <Select
                                        value={formData.district}
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, district: value })
                                        }
                                    >
                                        <SelectTrigger className="mt-1">
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
                                    <Label htmlFor="pincode">Pincode *</Label>
                                    <Input
                                        id="pincode"
                                        value={formData.pincode}
                                        onChange={(e) =>
                                            setFormData({ ...formData, pincode: e.target.value })
                                        }
                                        placeholder="6-digit pincode"
                                        className="mt-1"
                                        maxLength={6}
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="address">Full Address *</Label>
                                <Input
                                    id="address"
                                    value={formData.address}
                                    onChange={(e) =>
                                        setFormData({ ...formData, address: e.target.value })
                                    }
                                    placeholder="House no, Street, Area, Landmark"
                                    className="mt-1"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Emergency Contact */}
                    <Card className="border-orange-200">
                        <CardHeader className="border-b bg-orange-50">
                            <CardTitle className="flex items-center gap-2 text-orange-700">
                                <AlertTriangle className="w-5 h-5" />
                                Emergency Contact
                            </CardTitle>
                            <CardDescription>Person to contact in case of emergency</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6 space-y-4">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="emergencyContactName">Contact Name *</Label>
                                    <Input
                                        id="emergencyContactName"
                                        value={formData.emergencyContactName}
                                        onChange={(e) =>
                                            setFormData({ ...formData, emergencyContactName: e.target.value })
                                        }
                                        placeholder="Full name"
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="emergencyContactPhone">Contact Phone *</Label>
                                    <Input
                                        id="emergencyContactPhone"
                                        value={formData.emergencyContactPhone}
                                        onChange={(e) =>
                                            setFormData({ ...formData, emergencyContactPhone: e.target.value })
                                        }
                                        placeholder="10-digit mobile number"
                                        className="mt-1"
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
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select relation" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="parent">Parent</SelectItem>
                                        <SelectItem value="spouse">Spouse</SelectItem>
                                        <SelectItem value="sibling">Sibling</SelectItem>
                                        <SelectItem value="child">Child</SelectItem>
                                        <SelectItem value="friend">Friend</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button 
                            onClick={handleSave} 
                            disabled={saving} 
                            className="flex-1 bg-[#1a365d] hover:bg-[#1e4070]"
                        >
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
                        
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Logout
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to logout from your account?
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleLogout} className="bg-red-600">
                                        Logout
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </main>
        </PageWrapper>
    );
}
