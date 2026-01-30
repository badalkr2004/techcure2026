"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    AlertTriangle,
    MapPin,
    Phone,
    Loader2,
    CheckCircle,
    XCircle,
    Navigation,
    ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import { MobileBottomNav } from "@/components/layout";

interface LocationState {
    latitude: number | null;
    longitude: number | null;
    accuracy: number | null;
    error: string | null;
    loading: boolean;
}

interface AlertResponse {
    success: boolean;
    alertId?: string;
    message?: string;
    nearbyVolunteersCount?: number;
    error?: string;
}

export default function PanicPage() {
    const [location, setLocation] = useState<LocationState>({
        latitude: null,
        longitude: null,
        accuracy: null,
        error: null,
        loading: true,
    });

    const [phone, setPhone] = useState("");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [alertResponse, setAlertResponse] = useState<AlertResponse | null>(null);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [isConfirming, setIsConfirming] = useState(false);

    // Get user's location
    useEffect(() => {
        if (!navigator.geolocation) {
            setLocation((prev) => ({
                ...prev,
                error: "Geolocation is not supported by your browser",
                loading: false,
            }));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    error: null,
                    loading: false,
                });
            },
            (error) => {
                setLocation((prev) => ({
                    ...prev,
                    error: `Location error: ${error.message}`,
                    loading: false,
                }));
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000,
            }
        );
    }, []);

    // Countdown timer for confirmation
    useEffect(() => {
        if (countdown === null) return;

        if (countdown === 0) {
            submitPanicAlert();
            return;
        }

        const timer = setTimeout(() => {
            setCountdown(countdown - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [countdown]);

    const submitPanicAlert = useCallback(async () => {
        setIsSubmitting(true);
        setIsConfirming(false);
        setCountdown(null);

        try {
            const response = await fetch("/api/panic", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    victimPhone: phone,
                    victimName: name || undefined,
                    latitude: location.latitude,
                    longitude: location.longitude,
                    description: description || "Emergency panic alert",
                }),
            });

            const data = await response.json();
            setAlertResponse(data);
        } catch {
            setAlertResponse({
                success: false,
                error: "Failed to send alert. Please try again or call emergency services.",
            });
        } finally {
            setIsSubmitting(false);
        }
    }, [phone, name, location, description]);

    const handlePanicClick = () => {
        if (!phone) {
            alert("Please enter your phone number first");
            return;
        }

        if (!location.latitude || !location.longitude) {
            alert("Unable to get your location. Please enable location services.");
            return;
        }

        // Start confirmation countdown
        setIsConfirming(true);
        setCountdown(5);
    };

    const cancelAlert = () => {
        setIsConfirming(false);
        setCountdown(null);
    };

    // Success state
    if (alertResponse?.success) {
        return (
            <div className="min-h-screen bg-green-50 flex flex-col pb-20 md:pb-0">
                <header className="bg-green-600 text-white py-4 px-4 shadow-lg sticky top-0 z-50">
                    <div className="max-w-lg mx-auto flex items-center gap-3">
                        <Link href="/" className="p-1 -ml-1 rounded hover:bg-green-700 transition-colors">
                            <ChevronLeft className="w-6 h-6" />
                        </Link>
                        <div>
                            <h1 className="font-bold text-xl">Alert Sent</h1>
                            <p className="text-green-100 text-sm">Help is on the way</p>
                        </div>
                    </div>
                </header>
                <div className="flex-1 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md text-center border-green-200">
                        <CardContent className="pt-8 pb-8">
                            <div className="mb-6">
                                <CheckCircle className="w-20 h-20 text-green-600 mx-auto animate-pulse" />
                            </div>
                            <h1 className="text-2xl font-bold text-green-700 mb-4">
                                Alert Sent Successfully!
                            </h1>
                            <p className="text-gray-600 mb-4">
                                Your emergency alert has been sent. Help is on the way.
                            </p>
                            <div className="bg-green-100 rounded-lg p-4 mb-6">
                                <p className="text-sm text-green-800">
                                    <strong>{alertResponse.nearbyVolunteersCount}</strong> volunteers
                                    have been notified in your area.
                                </p>
                            </div>
                            <p className="text-sm text-gray-500">
                                Alert ID: <code className="font-mono">{alertResponse.alertId}</code>
                            </p>
                            <Button asChild className="mt-4">
                                <Link href="/">Return Home</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
                <MobileBottomNav />
            </div>
        );
    }

    // Error state
    if (alertResponse?.error) {
        return (
            <div className="min-h-screen bg-red-50 flex flex-col pb-20 md:pb-0">
                <header className="bg-red-600 text-white py-4 px-4 shadow-lg sticky top-0 z-50">
                    <div className="max-w-lg mx-auto flex items-center gap-3">
                        <Link href="/" className="p-1 -ml-1 rounded hover:bg-red-700 transition-colors">
                            <ChevronLeft className="w-6 h-6" />
                        </Link>
                        <div>
                            <h1 className="font-bold text-xl">Error</h1>
                            <p className="text-red-100 text-sm">Failed to send alert</p>
                        </div>
                    </div>
                </header>
                <div className="flex-1 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md text-center border-red-200">
                        <CardContent className="pt-8 pb-8">
                            <div className="mb-6">
                                <XCircle className="w-20 h-20 text-red-600 mx-auto" />
                            </div>
                            <h1 className="text-2xl font-bold text-red-700 mb-4">
                                Failed to Send Alert
                            </h1>
                            <p className="text-gray-600 mb-6">
                                {alertResponse.error}
                            </p>
                            <div className="space-y-3">
                                <Button
                                    onClick={() => setAlertResponse(null)}
                                    className="w-full bg-red-600 hover:bg-red-700"
                                >
                                    Try Again
                                </Button>
                                <p className="text-sm text-gray-500">
                                    Emergency: <strong>112</strong> | Police: <strong>100</strong> |
                                    Ambulance: <strong>108</strong>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <MobileBottomNav />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pb-20 md:pb-0">
            {/* Header */}
            <header className="bg-red-600 text-white py-4 px-4 shadow-lg sticky top-0 z-50">
                <div className="max-w-lg mx-auto flex items-center gap-3">
                    <Link href="/" className="p-1 -ml-1 rounded hover:bg-red-700 transition-colors">
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <AlertTriangle className="w-7 h-7" />
                    <div>
                        <h1 className="font-bold text-xl">Emergency SOS</h1>
                        <p className="text-red-100 text-sm">Panic Alert System</p>
                    </div>
                </div>
            </header>

            <main className="max-w-lg mx-auto p-4 pt-8">
                {/* Location Status */}
                <Card className="mb-6 border-blue-200 dark:border-blue-800">
                    <CardContent className="pt-4 pb-4">
                        <div className="flex items-center gap-3">
                            {location.loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                                    <span className="text-sm text-gray-600 dark:text-gray-300">
                                        Getting your location...
                                    </span>
                                </>
                            ) : location.error ? (
                                <>
                                    <XCircle className="w-5 h-5 text-red-500" />
                                    <span className="text-sm text-red-600">{location.error}</span>
                                </>
                            ) : (
                                <>
                                    <MapPin className="w-5 h-5 text-green-500" />
                                    <span className="text-sm text-gray-600 dark:text-gray-300">
                                        Location captured (±{Math.round(location.accuracy || 0)}m)
                                    </span>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Phone Input */}
                <Card className="mb-6">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Phone className="w-5 h-5" />
                            Contact Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                Phone Number *
                            </label>
                            <Input
                                type="tel"
                                placeholder="Enter your phone number"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="text-lg"
                                disabled={isConfirming || isSubmitting}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                Name (Optional)
                            </label>
                            <Input
                                type="text"
                                placeholder="Your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={isConfirming || isSubmitting}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                What&apos;s happening? (Optional)
                            </label>
                            <Textarea
                                placeholder="Briefly describe your emergency..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={2}
                                disabled={isConfirming || isSubmitting}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Panic Button */}
                {isConfirming ? (
                    <div className="space-y-4">
                        <Button
                            className="w-full h-32 text-2xl font-bold bg-gradient-to-b from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 shadow-2xl animate-pulse"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-10 h-10 animate-spin" />
                            ) : (
                                <span className="flex flex-col items-center gap-2">
                                    <AlertTriangle className="w-10 h-10" />
                                    Sending in {countdown}...
                                </span>
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={cancelAlert}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                    </div>
                ) : (
                    <Button
                        onClick={handlePanicClick}
                        disabled={location.loading || !location.latitude || isSubmitting}
                        className="w-full h-32 text-2xl font-bold bg-gradient-to-b from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <span className="flex flex-col items-center gap-2">
                            <AlertTriangle className="w-12 h-12" />
                            PANIC ALERT
                        </span>
                    </Button>
                )}

                {/* Emergency Numbers */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500 mb-3">
                        You can also call emergency services directly:
                    </p>
                    <div className="flex justify-center gap-4">
                        <a
                            href="tel:112"
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                        >
                            <Phone className="w-4 h-4" />
                            <span className="font-bold">112</span>
                        </a>
                        <a
                            href="tel:100"
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                        >
                            <Phone className="w-4 h-4" />
                            <span className="font-bold">100</span>
                        </a>
                        <a
                            href="tel:108"
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                        >
                            <Navigation className="w-4 h-4" />
                            <span className="font-bold">108</span>
                        </a>
                    </div>
                </div>
            </main>

            <MobileBottomNav />
        </div>
    );
}
