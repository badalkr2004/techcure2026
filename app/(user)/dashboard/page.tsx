"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
} from "@/components/ui/dialog";
import {
    User,
    AlertTriangle,
    Heart,
    MapPin,
    Phone,
    Clock,
    Loader2,
    Settings,
    Shield,
    Plus,
    CheckCircle,
    IndianRupee,
    ArrowRight,
    Home,
    Bell,
    HandHeart,
    FileText,
    Navigation,
    X,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

interface UserProfile {
    hasProfile: boolean;
    profile?: {
        phone: string | null;
        district: string | null;
        address: string | null;
        emergencyContactName: string | null;
        emergencyContactPhone: string | null;
    };
    user: {
        id: string;
        name: string;
        email: string;
        image: string | null;
    };
}

interface Issue {
    id: string;
    title: string | null;
    description: string | null;
    severity: string;
    status: string;
    createdAt: string;
    issueType: {
        name: string;
    } | null;
}

interface Donation {
    id: string;
    amount: number;
    paymentStatus: string;
    createdAt: string;
    campaign: {
        title: string;
    } | null;
}

const statusColors: Record<string, string> = {
    pending: "bg-yellow-500",
    acknowledged: "bg-blue-500",
    assigned: "bg-indigo-500",
    in_progress: "bg-purple-500",
    resolved: "bg-green-500",
    cancelled: "bg-gray-500",
};

const BIHAR_DISTRICTS = [
    "Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur",
    "Buxar", "Darbhanga", "East Champaran", "Gaya", "Gopalganj", "Jamui",
    "Jehanabad", "Kaimur", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai",
    "Madhepura", "Madhubani", "Munger", "Muzaffarpur", "Nalanda", "Nawada",
    "Patna", "Purnia", "Rohtas", "Saharsa", "Samastipur", "Saran", "Sheikhpura",
    "Sheohar", "Sitamarhi", "Siwan", "Supaul", "Vaishali", "West Champaran"
];

const ISSUE_TYPES = [
    { code: "medical_emergency", name: "Medical Emergency", icon: "🏥", color: "text-red-600" },
    { code: "accident", name: "Road Accident", icon: "🚗", color: "text-orange-600" },
    { code: "fire", name: "Fire Emergency", icon: "🔥", color: "text-red-600" },
    { code: "flood", name: "Flood/Water Logging", icon: "🌊", color: "text-blue-600" },
    { code: "harassment", name: "Harassment/Safety", icon: "⚠️", color: "text-purple-600" },
    { code: "elderly_assistance", name: "Elderly Assistance", icon: "👴", color: "text-green-600" },
    { code: "child_missing", name: "Missing Person", icon: "🔍", color: "text-yellow-600" },
    { code: "general", name: "General Help", icon: "🆘", color: "text-gray-600" },
];

const SEVERITY_OPTIONS = [
    { value: "low", label: "Low", description: "Non-urgent, can wait" },
    { value: "medium", label: "Medium", description: "Needs attention soon" },
    { value: "high", label: "High", description: "Urgent, immediate help needed" },
    { value: "critical", label: "Critical", description: "Life-threatening emergency" },
];

export default function UserDashboard() {
    const router = useRouter();
    const { data: session, isPending: sessionLoading } = authClient.useSession();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [issues, setIssues] = useState<Issue[]>([]);
    const [donations, setDonations] = useState<Donation[]>([]);
    const [totalDonated, setTotalDonated] = useState(0);
    const [loading, setLoading] = useState(true);

    // Report Issue Dialog State
    const [showReportDialog, setShowReportDialog] = useState(false);
    const [reportStep, setReportStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Report Form Data
    const [reportForm, setReportForm] = useState({
        issueTypeCode: "",
        title: "",
        description: "",
        severity: "medium",
        victimName: "",
        victimPhone: "",
        victimAge: "",
        victimGender: "",
        reporterRelation: "self",
        district: "",
        address: "",
        landmark: "",
        latitude: 0,
        longitude: 0,
    });

    const [locationStatus, setLocationStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

    useEffect(() => {
        if (session?.user) {
            fetchData();
        }
    }, [session]);

    // Pre-fill form with profile data
    useEffect(() => {
        if (profile?.profile && profile?.user) {
            setReportForm(prev => ({
                ...prev,
                victimName: profile.user.name || "",
                victimPhone: profile.profile?.phone || "",
                district: profile.profile?.district || "",
                address: profile.profile?.address || "",
            }));
        }
    }, [profile]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch profile
            const profileRes = await fetch("/api/user/profile");
            if (profileRes.ok) {
                const profileData = await profileRes.json();
                setProfile(profileData);
            }

            // Fetch issues
            const issuesRes = await fetch("/api/user/issues");
            if (issuesRes.ok) {
                const issuesData = await issuesRes.json();
                setIssues(issuesData.issues || []);
            }

            // Fetch donations
            const donationsRes = await fetch("/api/user/donations");
            if (donationsRes.ok) {
                const donationsData = await donationsRes.json();
                setDonations(donationsData.donations || []);
                setTotalDonated(donationsData.totalAmount || 0);
            }
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    const getLocation = () => {
        if (!navigator.geolocation) {
            setLocationStatus("error");
            return;
        }

        setLocationStatus("loading");
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setReportForm(prev => ({
                    ...prev,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                }));
                setLocationStatus("success");
            },
            () => {
                setLocationStatus("error");
            },
            { enableHighAccuracy: true }
        );
    };

    const handleSubmitReport = async () => {
        setSubmitError(null);

        // Validation
        if (!reportForm.issueTypeCode) {
            setSubmitError("Please select issue type");
            return;
        }
        if (!reportForm.victimPhone) {
            setSubmitError("Phone number is required");
            return;
        }
        if (!reportForm.latitude || !reportForm.longitude) {
            setSubmitError("Please capture your location");
            return;
        }

        setSubmitting(true);

        try {
            const res = await fetch("/api/issues", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    issueTypeCode: reportForm.issueTypeCode,
                    title: reportForm.title || null,
                    description: reportForm.description || null,
                    severity: reportForm.severity,
                    victimName: reportForm.victimName || null,
                    victimPhone: reportForm.victimPhone,
                    victimAge: reportForm.victimAge ? parseInt(reportForm.victimAge) : null,
                    victimGender: reportForm.victimGender || null,
                    reporterRelation: reportForm.reporterRelation,
                    district: reportForm.district || null,
                    address: reportForm.address || null,
                    landmark: reportForm.landmark || null,
                    latitude: reportForm.latitude,
                    longitude: reportForm.longitude,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to submit report");
            }

            setSubmitSuccess(true);
            // Refresh issues list
            fetchData();
        } catch (err) {
            setSubmitError(err instanceof Error ? err.message : "Failed to submit report");
        } finally {
            setSubmitting(false);
        }
    };

    const resetReportDialog = () => {
        setShowReportDialog(false);
        setReportStep(1);
        setSubmitSuccess(false);
        setSubmitError(null);
        setLocationStatus("idle");
        setReportForm({
            issueTypeCode: "",
            title: "",
            description: "",
            severity: "medium",
            victimName: profile?.user?.name || "",
            victimPhone: profile?.profile?.phone || "",
            victimAge: "",
            victimGender: "",
            reporterRelation: "self",
            district: profile?.profile?.district || "",
            address: profile?.profile?.address || "",
            landmark: "",
            latitude: 0,
            longitude: 0,
        });
    };

    const formatAmount = (paisa: number) =>
        `₹${(paisa / 100).toLocaleString("en-IN")}`;

    if (sessionLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-[#1a365d]" />
            </div>
        );
    }

    if (!session?.user) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
                <Card className="w-full max-w-md text-center">
                    <CardContent className="pt-8 pb-8">
                        <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold mb-4 text-[#1a365d]">Dashboard</h1>
                        <p className="text-gray-600 mb-6">Please sign in to view your dashboard</p>
                        <Button onClick={() => router.push("/auth/login")} className="w-full bg-[#1a365d]">
                            Sign In
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const activeIssues = issues.filter(
        (i) => !["resolved", "cancelled"].includes(i.status)
    ).length;

    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
            {/* Top Bar */}
            <div className="bg-[#1a365d] text-white text-xs hidden sm:block">
                <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between">
                    <span>Government of Bihar Initiative</span>
                    <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        Emergency: 112
                    </span>
                </div>
            </div>

            {/* Header */}
            <header className="bg-white border-b-4 border-[#f97316]">
                <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded bg-[#1a365d] text-white flex items-center justify-center flex-shrink-0 font-bold text-xl">
                                {profile?.user.name?.[0]?.toUpperCase() || "U"}
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-xl sm:text-2xl font-bold text-[#1a365d] truncate">
                                    {profile?.user.name || "User"}
                                </h1>
                                <p className="text-gray-600 text-sm truncate">{profile?.user.email}</p>
                            </div>
                        </div>
                        <Button
                            onClick={() => setShowReportDialog(true)}
                            className="bg-[#f97316] hover:bg-[#ea580c] hidden sm:flex"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Report Issue
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-6">
                {/* Profile Completion Banner */}
                {!profile?.hasProfile && (
                    <Card className="mb-6 border-l-4 border-l-blue-500 bg-blue-50">
                        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
                                    <User className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-blue-700">Complete Your Profile</h3>
                                    <p className="text-sm text-gray-600">
                                        Add your contact info for faster assistance
                                    </p>
                                </div>
                            </div>
                            <Button asChild size="sm" className="bg-[#1a365d]">
                                <Link href="/profile">Complete Profile</Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Mobile Report Button */}
                <Button
                    onClick={() => setShowReportDialog(true)}
                    className="w-full mb-6 bg-[#f97316] hover:bg-[#ea580c] sm:hidden h-12"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Report New Issue
                </Button>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between gap-2">
                                <div>
                                    <p className="text-xs text-gray-500">Total Issues</p>
                                    <p className="text-2xl font-bold">{issues.length}</p>
                                </div>
                                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-orange-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between gap-2">
                                <div>
                                    <p className="text-xs text-gray-500">Active</p>
                                    <p className="text-2xl font-bold">{activeIssues}</p>
                                </div>
                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between gap-2">
                                <div>
                                    <p className="text-xs text-gray-500">Donations</p>
                                    <p className="text-2xl font-bold">{donations.length}</p>
                                </div>
                                <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center">
                                    <Heart className="w-5 h-5 text-pink-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between gap-2">
                                <div>
                                    <p className="text-xs text-gray-500">Donated</p>
                                    <p className="text-xl font-bold text-green-600">
                                        {formatAmount(totalDonated)}
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                    <IndianRupee className="w-5 h-5 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Recent Issues */}
                    <Card>
                        <CardHeader className="border-b bg-gray-50">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-[#1a365d]">
                                    <AlertTriangle className="w-5 h-5" />
                                    My Issues
                                </CardTitle>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href="/my-issues">
                                        View All <ArrowRight className="w-4 h-4 ml-1" />
                                    </Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4">
                            {issues.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                                    <p className="mb-4">No issues reported yet</p>
                                    <Button
                                        size="sm"
                                        onClick={() => setShowReportDialog(true)}
                                        className="bg-[#f97316]"
                                    >
                                        <Plus className="w-4 h-4 mr-1" />
                                        Report Issue
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {issues.slice(0, 5).map((issue) => (
                                        <div
                                            key={issue.id}
                                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                                        >
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-medium truncate">
                                                        {issue.title || issue.issueType?.name || "Issue"}
                                                    </span>
                                                    <Badge className={`${statusColors[issue.status]} text-white text-xs`}>
                                                        {issue.status.replace("_", " ")}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {new Date(issue.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Donations */}
                    <Card>
                        <CardHeader className="border-b bg-gray-50">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-[#1a365d]">
                                    <Heart className="w-5 h-5" />
                                    My Donations
                                </CardTitle>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href="/disasters">
                                        Donate <ArrowRight className="w-4 h-4 ml-1" />
                                    </Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4">
                            {donations.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <Heart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                    <p className="mb-4">No donations yet</p>
                                    <Button size="sm" asChild className="bg-[#1a365d]">
                                        <Link href="/disasters">
                                            <Heart className="w-4 h-4 mr-1" />
                                            Browse Campaigns
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {donations.slice(0, 5).map((donation) => (
                                        <div
                                            key={donation.id}
                                            className="flex items-center justify-between p-3 border rounded-lg"
                                        >
                                            <div>
                                                <p className="font-medium">
                                                    {donation.campaign?.title || "Campaign"}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(donation.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <span className="font-bold text-green-600">
                                                {formatAmount(donation.amount)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                    <Card
                        className="cursor-pointer hover:shadow-md transition border-2 border-transparent hover:border-[#f97316]"
                        onClick={() => setShowReportDialog(true)}
                    >
                        <CardContent className="p-4 text-center">
                            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                            <p className="font-medium text-sm">Report Issue</p>
                        </CardContent>
                    </Card>

                    <Card
                        className="cursor-pointer hover:shadow-md transition"
                        onClick={() => router.push("/disasters")}
                    >
                        <CardContent className="p-4 text-center">
                            <Heart className="w-8 h-8 mx-auto mb-2 text-pink-500" />
                            <p className="font-medium text-sm">Donate</p>
                        </CardContent>
                    </Card>

                    <Card
                        className="cursor-pointer hover:shadow-md transition"
                        onClick={() => router.push("/volunteer/onboard")}
                    >
                        <CardContent className="p-4 text-center">
                            <Shield className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                            <p className="font-medium text-sm">Be Volunteer</p>
                        </CardContent>
                    </Card>

                    <Card
                        className="cursor-pointer hover:shadow-md transition"
                        onClick={() => router.push("/profile")}
                    >
                        <CardContent className="p-4 text-center">
                            <Settings className="w-8 h-8 mx-auto mb-2 text-gray-500" />
                            <p className="font-medium text-sm">Settings</p>
                        </CardContent>
                    </Card>
                </div>
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50">
                <div className="flex items-center justify-around py-2">
                    <Link href="/" className="flex flex-col items-center py-2 px-3 text-gray-500">
                        <Home className="w-5 h-5" />
                        <span className="text-[10px] mt-0.5">Home</span>
                    </Link>
                    <Link href="/disasters" className="flex flex-col items-center py-2 px-3 text-gray-500">
                        <Bell className="w-5 h-5" />
                        <span className="text-[10px] mt-0.5">Alerts</span>
                    </Link>
                    <Link href="/panic" className="-mt-5">
                        <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center border-4 border-white shadow-lg">
                            <AlertTriangle className="w-6 h-6 text-white" />
                        </div>
                    </Link>
                    <Link href="/volunteer/dashboard" className="flex flex-col items-center py-2 px-3 text-gray-500">
                        <HandHeart className="w-5 h-5" />
                        <span className="text-[10px] mt-0.5">Volunteer</span>
                    </Link>
                    <Link href="/dashboard" className="flex flex-col items-center py-2 px-3 text-[#f97316]">
                        <User className="w-5 h-5" />
                        <span className="text-[10px] mt-0.5 font-medium">Profile</span>
                    </Link>
                </div>
            </nav>

            {/* Report Issue Dialog */}
            <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    {submitSuccess ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <h2 className="text-xl font-bold text-green-600 mb-2">Issue Reported!</h2>
                            <p className="text-gray-600 mb-6">
                                Your issue has been submitted. Nearby volunteers will be notified.
                            </p>
                            <Button onClick={resetReportDialog} className="bg-[#1a365d]">
                                Close
                            </Button>
                        </div>
                    ) : (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-[#1a365d]">
                                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                                    Report an Issue
                                </DialogTitle>
                                <DialogDescription>
                                    {reportStep === 1 && "Select the type of issue you want to report"}
                                    {reportStep === 2 && "Provide details about the issue"}
                                    {reportStep === 3 && "Confirm location and contact details"}
                                </DialogDescription>
                            </DialogHeader>

                            {/* Step Indicator */}
                            <div className="flex items-center justify-center gap-2 py-2">
                                {[1, 2, 3].map((step) => (
                                    <div
                                        key={step}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                            reportStep === step
                                                ? "bg-[#f97316] text-white"
                                                : reportStep > step
                                                ? "bg-green-500 text-white"
                                                : "bg-gray-200 text-gray-600"
                                        }`}
                                    >
                                        {reportStep > step ? "✓" : step}
                                    </div>
                                ))}
                            </div>

                            {submitError && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                    {submitError}
                                </div>
                            )}

                            {/* Step 1: Issue Type */}
                            {reportStep === 1 && (
                                <div className="space-y-4 py-4">
                                    <Label className="font-medium">Select Issue Type *</Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {ISSUE_TYPES.map((type) => (
                                            <button
                                                key={type.code}
                                                type="button"
                                                onClick={() => setReportForm(prev => ({ ...prev, issueTypeCode: type.code }))}
                                                className={`p-3 border-2 rounded-lg text-left transition ${
                                                    reportForm.issueTypeCode === type.code
                                                        ? "border-[#f97316] bg-orange-50"
                                                        : "border-gray-200 hover:border-gray-300"
                                                }`}
                                            >
                                                <span className="text-2xl">{type.icon}</span>
                                                <p className="font-medium text-sm mt-1">{type.name}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Details */}
                            {reportStep === 2 && (
                                <div className="space-y-4 py-4">
                                    <div>
                                        <Label>Title (Optional)</Label>
                                        <Input
                                            value={reportForm.title}
                                            onChange={(e) => setReportForm(prev => ({ ...prev, title: e.target.value }))}
                                            placeholder="Brief title for your issue"
                                            className="mt-1"
                                        />
                                    </div>

                                    <div>
                                        <Label>Description</Label>
                                        <Textarea
                                            value={reportForm.description}
                                            onChange={(e) => setReportForm(prev => ({ ...prev, description: e.target.value }))}
                                            placeholder="Describe the issue in detail..."
                                            rows={3}
                                            className="mt-1"
                                        />
                                    </div>

                                    <div>
                                        <Label>Severity Level *</Label>
                                        <Select
                                            value={reportForm.severity}
                                            onValueChange={(value) => setReportForm(prev => ({ ...prev, severity: value }))}
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {SEVERITY_OPTIONS.map((opt) => (
                                                    <SelectItem key={opt.value} value={opt.value}>
                                                        <div>
                                                            <span className="font-medium">{opt.label}</span>
                                                            <span className="text-gray-500 text-xs ml-2">- {opt.description}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label>Who needs help? *</Label>
                                        <Select
                                            value={reportForm.reporterRelation}
                                            onValueChange={(value) => setReportForm(prev => ({ ...prev, reporterRelation: value }))}
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="self">Myself</SelectItem>
                                                <SelectItem value="family">Family Member</SelectItem>
                                                <SelectItem value="friend">Friend</SelectItem>
                                                <SelectItem value="bystander">Someone I saw</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Contact & Location */}
                            {reportStep === 3 && (
                                <div className="space-y-4 py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Name</Label>
                                            <Input
                                                value={reportForm.victimName}
                                                onChange={(e) => setReportForm(prev => ({ ...prev, victimName: e.target.value }))}
                                                placeholder="Full name"
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label>Phone *</Label>
                                            <Input
                                                value={reportForm.victimPhone}
                                                onChange={(e) => setReportForm(prev => ({ ...prev, victimPhone: e.target.value }))}
                                                placeholder="10-digit number"
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Age</Label>
                                            <Input
                                                type="number"
                                                value={reportForm.victimAge}
                                                onChange={(e) => setReportForm(prev => ({ ...prev, victimAge: e.target.value }))}
                                                placeholder="Age"
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label>Gender</Label>
                                            <Select
                                                value={reportForm.victimGender}
                                                onValueChange={(value) => setReportForm(prev => ({ ...prev, victimGender: value }))}
                                            >
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="male">Male</SelectItem>
                                                    <SelectItem value="female">Female</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div>
                                        <Label>District</Label>
                                        <Select
                                            value={reportForm.district}
                                            onValueChange={(value) => setReportForm(prev => ({ ...prev, district: value }))}
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Select district" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {BIHAR_DISTRICTS.map((d) => (
                                                    <SelectItem key={d} value={d}>{d}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label>Address / Landmark</Label>
                                        <Input
                                            value={reportForm.landmark}
                                            onChange={(e) => setReportForm(prev => ({ ...prev, landmark: e.target.value }))}
                                            placeholder="Nearby landmark or address"
                                            className="mt-1"
                                        />
                                    </div>

                                    <div>
                                        <Label>GPS Location *</Label>
                                        <div className="flex items-center gap-3 mt-1">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={getLocation}
                                                disabled={locationStatus === "loading"}
                                                className="flex-1"
                                            >
                                                {locationStatus === "loading" ? (
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                ) : (
                                                    <Navigation className="w-4 h-4 mr-2" />
                                                )}
                                                {locationStatus === "success" ? "Location Captured" : "Capture Location"}
                                            </Button>
                                            {locationStatus === "success" && (
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                            )}
                                            {locationStatus === "error" && (
                                                <span className="text-red-600 text-sm">Failed</span>
                                            )}
                                        </div>
                                        {reportForm.latitude !== 0 && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                📍 {reportForm.latitude.toFixed(4)}, {reportForm.longitude.toFixed(4)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            <DialogFooter className="gap-2 sm:gap-0">
                                {reportStep > 1 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setReportStep(reportStep - 1)}
                                    >
                                        Back
                                    </Button>
                                )}
                                {reportStep < 3 ? (
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            if (reportStep === 1 && !reportForm.issueTypeCode) {
                                                setSubmitError("Please select an issue type");
                                                return;
                                            }
                                            setSubmitError(null);
                                            setReportStep(reportStep + 1);
                                        }}
                                        className="bg-[#1a365d]"
                                    >
                                        Next
                                    </Button>
                                ) : (
                                    <Button
                                        type="button"
                                        onClick={handleSubmitReport}
                                        disabled={submitting}
                                        className="bg-[#f97316] hover:bg-[#ea580c]"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <AlertTriangle className="w-4 h-4 mr-2" />
                                                Submit Report
                                            </>
                                        )}
                                    </Button>
                                )}
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
