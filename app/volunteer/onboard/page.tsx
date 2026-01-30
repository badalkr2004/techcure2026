"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
    MapPin,
    Phone,
    User,
    Loader2,
    CheckCircle,
    Heart,
    Shield,
    Waves,
    Car,
    AlertTriangle,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

const specializations = [
    { id: "first_aid", label: "First Aid", icon: Heart },
    { id: "cpr", label: "CPR Certified", icon: Heart },
    { id: "medical", label: "Medical Background", icon: Heart },
    { id: "rescue", label: "Rescue Operations", icon: Shield },
    { id: "swimming", label: "Swimming", icon: Waves },
    { id: "driving", label: "Driving", icon: Car },
    { id: "counseling", label: "Counseling", icon: User },
    { id: "firefighting", label: "Firefighting", icon: AlertTriangle },
];

const biharDistricts = [
    "Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur",
    "Bhojpur", "Buxar", "Darbhanga", "East Champaran", "Gaya", "Gopalganj",
    "Jamui", "Jehanabad", "Kaimur", "Katihar", "Khagaria", "Kishanganj",
    "Lakhisarai", "Madhepura", "Madhubani", "Munger", "Muzaffarpur",
    "Nalanda", "Nawada", "Patna", "Purnia", "Rohtas", "Saharsa",
    "Samastipur", "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan",
    "Supaul", "Vaishali", "West Champaran",
];

interface LocationState {
    latitude: number | null;
    longitude: number | null;
    error: string | null;
    loading: boolean;
}

export default function VolunteerOnboardPage() {
    const router = useRouter();
    const { data: session, isPending: sessionLoading } = authClient.useSession();

    const [location, setLocation] = useState<LocationState>({
        latitude: null,
        longitude: null,
        error: null,
        loading: false,
    });

    const [formData, setFormData] = useState({
        displayName: "",
        phone: "",
        age: "",
        district: "",
        address: "",
        bio: "",
        serviceRadius: "10",
        selectedSpecializations: [] as string[],
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Pre-fill name from session
    useEffect(() => {
        if (session?.user?.name) {
            setFormData((prev) => ({
                ...prev,
                displayName: session.user.name || "",
            }));
        }
    }, [session]);

    // Get location
    const getLocation = () => {
        if (!navigator.geolocation) {
            setLocation((prev) => ({
                ...prev,
                error: "Geolocation not supported",
            }));
            return;
        }

        setLocation((prev) => ({ ...prev, loading: true, error: null }));

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    error: null,
                    loading: false,
                });
            },
            (err) => {
                setLocation({
                    latitude: null,
                    longitude: null,
                    error: err.message,
                    loading: false,
                });
            },
            { enableHighAccuracy: true }
        );
    };

    const toggleSpecialization = (id: string) => {
        setFormData((prev) => ({
            ...prev,
            selectedSpecializations: prev.selectedSpecializations.includes(id)
                ? prev.selectedSpecializations.filter((s) => s !== id)
                : [...prev.selectedSpecializations, id],
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!formData.displayName || !formData.phone || !formData.age || !formData.district) {
            setError("Please fill in all required fields");
            return;
        }

        if (!location.latitude || !location.longitude) {
            setError("Please capture your location");
            return;
        }

        const age = parseInt(formData.age);
        if (isNaN(age) || age < 18 || age > 100) {
            setError("Age must be between 18 and 100");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch("/api/volunteer/onboard", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    displayName: formData.displayName,
                    phone: formData.phone,
                    age,
                    district: formData.district,
                    address: formData.address || null,
                    bio: formData.bio || null,
                    latitude: location.latitude,
                    longitude: location.longitude,
                    serviceRadius: parseInt(formData.serviceRadius),
                    specializations: formData.selectedSpecializations,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to register");
            }

            setSuccess(true);
            setTimeout(() => {
                router.push("/volunteer/dashboard");
            }, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Loading state
    if (sessionLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    // Not logged in
    if (!session?.user) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="w-full max-w-md text-center">
                    <CardContent className="pt-8 pb-8">
                        <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold mb-4">Become a Volunteer</h1>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Please sign in to register as a volunteer with Bihar Sahayata.
                        </p>
                        <Button onClick={() => router.push("/auth/login")} className="w-full">
                            Sign In to Continue
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Success state
    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                <Card className="w-full max-w-md text-center border-green-200">
                    <CardContent className="pt-8 pb-8">
                        <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-4 animate-pulse" />
                        <h1 className="text-2xl font-bold text-green-700 mb-4">
                            Registration Successful!
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300">
                            Your volunteer profile has been created. Redirecting to dashboard...
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 dark:from-gray-950 dark:to-gray-900 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Become a Volunteer
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">
                        Join Bihar Sahayata and help your community in times of need
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Basic Info */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Basic Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="displayName">Display Name *</Label>
                                    <Input
                                        id="displayName"
                                        value={formData.displayName}
                                        onChange={(e) =>
                                            setFormData({ ...formData, displayName: e.target.value })
                                        }
                                        placeholder="Your name"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="age">Age *</Label>
                                    <Input
                                        id="age"
                                        type="number"
                                        min={18}
                                        max={100}
                                        value={formData.age}
                                        onChange={(e) =>
                                            setFormData({ ...formData, age: e.target.value })
                                        }
                                        placeholder="Your age"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="phone">Phone Number *</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) =>
                                        setFormData({ ...formData, phone: e.target.value })
                                    }
                                    placeholder="+91 XXXXX XXXXX"
                                />
                            </div>

                            <div>
                                <Label htmlFor="bio">About You</Label>
                                <Textarea
                                    id="bio"
                                    value={formData.bio}
                                    onChange={(e) =>
                                        setFormData({ ...formData, bio: e.target.value })
                                    }
                                    placeholder="Tell us about yourself and why you want to volunteer..."
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Location */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="w-5 h-5" />
                                Location
                            </CardTitle>
                            <CardDescription>
                                We use your location to match you with nearby emergencies
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="district">District *</Label>
                                <Select
                                    value={formData.district}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, district: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select your district" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {biharDistricts.map((district) => (
                                            <SelectItem key={district} value={district}>
                                                {district}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="address">Address</Label>
                                <Textarea
                                    id="address"
                                    value={formData.address}
                                    onChange={(e) =>
                                        setFormData({ ...formData, address: e.target.value })
                                    }
                                    placeholder="Your address (optional)"
                                    rows={2}
                                />
                            </div>

                            <div>
                                <Label>GPS Location *</Label>
                                <div className="flex gap-3 items-center mt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={getLocation}
                                        disabled={location.loading}
                                    >
                                        {location.loading ? (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <MapPin className="w-4 h-4 mr-2" />
                                        )}
                                        Capture Location
                                    </Button>
                                    {location.latitude && location.longitude && (
                                        <span className="text-sm text-green-600 flex items-center gap-1">
                                            <CheckCircle className="w-4 h-4" />
                                            Location captured
                                        </span>
                                    )}
                                    {location.error && (
                                        <span className="text-sm text-red-600">{location.error}</span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="serviceRadius">Service Radius (km)</Label>
                                <Select
                                    value={formData.serviceRadius}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, serviceRadius: value })
                                    }
                                >
                                    <SelectTrigger className="w-32">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="5">5 km</SelectItem>
                                        <SelectItem value="10">10 km</SelectItem>
                                        <SelectItem value="15">15 km</SelectItem>
                                        <SelectItem value="20">20 km</SelectItem>
                                        <SelectItem value="30">30 km</SelectItem>
                                        <SelectItem value="50">50 km</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Specializations */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="w-5 h-5" />
                                Skills & Specializations
                            </CardTitle>
                            <CardDescription>
                                Select the areas where you can provide help (optional)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {specializations.map((spec) => {
                                    const Icon = spec.icon;
                                    const isSelected = formData.selectedSpecializations.includes(
                                        spec.id
                                    );
                                    return (
                                        <label
                                            key={spec.id}
                                            className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${isSelected
                                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                                                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                                                }`}
                                        >
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={() => toggleSpecialization(spec.id)}
                                            />
                                            <Icon className="w-4 h-4" />
                                            <span className="text-sm">{spec.label}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Error */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
                            {error}
                        </div>
                    )}

                    {/* Submit */}
                    <Button
                        type="submit"
                        className="w-full h-12 text-lg"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        ) : (
                            <Shield className="w-5 h-5 mr-2" />
                        )}
                        Register as Volunteer
                    </Button>
                </form>
            </div>
        </div>
    );
}
