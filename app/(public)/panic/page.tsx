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

/* ---------------- TYPES ---------------- */

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

/* ---------------- PAGE ---------------- */

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

    /* ---------------- LOCATION ---------------- */

    useEffect(() => {
        if (!navigator.geolocation) {
            setLocation({
                latitude: null,
                longitude: null,
                accuracy: null,
                error: "Geolocation not supported",
                loading: false,
            });
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) =>
                setLocation({
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                    accuracy: pos.coords.accuracy,
                    error: null,
                    loading: false,
                }),
            (err) =>
                setLocation((p) => ({
                    ...p,
                    error: err.message,
                    loading: false,
                })),
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }, []);

    /* ---------------- COUNTDOWN ---------------- */

    useEffect(() => {
        if (countdown === null) return;
        if (countdown === 0) submitPanicAlert();

        const t = setTimeout(() => setCountdown((c) => (c ? c - 1 : c)), 1000);
        return () => clearTimeout(t);
    }, [countdown]);

    /* ---------------- SUBMIT ---------------- */

    const submitPanicAlert = useCallback(async () => {
        setIsSubmitting(true);
        setIsConfirming(false);
        setCountdown(null);

        try {
            const res = await fetch("/api/panic", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    victimPhone: phone,
                    victimName: name || undefined,
                    latitude: location.latitude,
                    longitude: location.longitude,
                    description: description || "Emergency panic alert",
                }),
            });

            setAlertResponse(await res.json());
        } catch {
            setAlertResponse({
                success: false,
                error: "Failed to send alert. Please call emergency services.",
            });
        } finally {
            setIsSubmitting(false);
        }
    }, [phone, name, location, description]);

    const handlePanicClick = () => {
        if (!phone) return alert("Please enter your phone number");
        if (!location.latitude) return alert("Location not available");
        setIsConfirming(true);
        setCountdown(5);
    };

    /* ---------------- SUCCESS ---------------- */

    if (alertResponse?.success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex flex-col">
                <SuccessCard alert={alertResponse} />
                <MobileBottomNav />
            </div>
        );
    }

    /* ---------------- ERROR ---------------- */

    if (alertResponse?.error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex flex-col">
                <ErrorCard error={alertResponse.error} onRetry={() => setAlertResponse(null)} />
                <MobileBottomNav />
            </div>
        );
    }

    /* ---------------- MAIN ---------------- */

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 flex flex-col pb-24">

            {/* HEADER */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b">
                <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
                    <Link href="/" className="p-1 rounded hover:bg-gray-100">
                        <ChevronLeft />
                    </Link>
                    <AlertTriangle className="text-red-600" />
                    <div>
                        <h1 className="font-bold">Emergency SOS</h1>
                        <p className="text-xs text-gray-500">Immediate assistance</p>
                    </div>
                </div>
            </header>

            <main className="max-w-lg mx-auto p-4 space-y-6">

                {/* LOCATION */}
                <Card className="rounded-2xl">
                    <CardContent className="flex items-center gap-3 p-4">
                        {location.loading ? (
                            <Loader2 className="animate-spin text-blue-600" />
                        ) : location.error ? (
                            <XCircle className="text-red-600" />
                        ) : (
                            <MapPin className="text-green-600" />
                        )}
                        <p className="text-sm text-gray-600">
                            {location.loading
                                ? "Detecting location…"
                                : location.error
                                    ? location.error
                                    : `Location locked (±${Math.round(location.accuracy || 0)}m)`}
                        </p>
                    </CardContent>
                </Card>

                {/* CONTACT */}
                <Card className="rounded-2xl">
                    <CardHeader>
                        <CardTitle>Contact Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            placeholder="Phone number *"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            disabled={isConfirming}
                        />
                        <Input
                            placeholder="Name (optional)"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={isConfirming}
                        />
                        <Textarea
                            placeholder="Describe emergency (optional)"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={2}
                            disabled={isConfirming}
                        />
                    </CardContent>
                </Card>

                {/* PANIC BUTTON */}
                {isConfirming ? (
                    <div className="w-full flex items-center justify-between">
                        <BuzzerButton label={`Sending in ${countdown}s`} loading />
                        <Button variant="outline" className="w-32 px-20 py-7" onClick={() => setIsConfirming(false)}>
                            Cancel
                        </Button>
                    </div>
                ) : (
                    <BuzzerButton label="PANIC ALERT" onClick={handlePanicClick} />
                )}

                {/* NUMBERS */}
                <div className="text-center text-sm text-gray-500 pt-4">
                    Emergency Numbers: 112 • 100 • 108
                </div>
            </main>

            <MobileBottomNav />
        </div>
    );
}

/* ---------------- COMPONENTS ---------------- */

const BuzzerButton = ({
    label,
    onClick,
    loading,
}: {
    label: string;
    onClick?: () => void;
    loading?: boolean;
}) => (
    <Button
        onClick={onClick}
        disabled={loading}
        className="w-32 px-20 py-7"
    >
        {loading ? (
            <Loader2 className="w-10 h-10 animate-spin text-white" />
        ) : (
            <span className="flex justify-between items-center gap-2 text-white font-bold text-sm">
                <AlertTriangle className="w-10 h-10" />
                {label}
            </span>
        )}

    </Button >
);

const SuccessCard = ({ alert }: any) => (
    <div className="flex-1 flex items-center justify-center p-4">
        <Card className="rounded-2xl text-center p-6">
            <CheckCircle className="w-20 h-20 mx-auto text-green-600 animate-pulse mb-4" />
            <h2 className="text-xl font-bold mb-2">Help is on the way</h2>
            <p className="text-gray-600 mb-4">
                {alert.nearbyVolunteersCount} volunteers notified
            </p>
            <Link href="/">
                <Button>Return Home</Button>
            </Link>
        </Card>
    </div>
);

const ErrorCard = ({ error, onRetry }: any) => (
    <div className="flex-1 flex items-center justify-center p-4">
        <Card className="rounded-2xl text-center p-6">
            <XCircle className="w-20 h-20 mx-auto text-red-600 mb-4" />
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={onRetry} className="bg-red-600 hover:bg-red-700">
                Try Again
            </Button>
        </Card>
    </div>
);
