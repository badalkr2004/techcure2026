"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertTriangle,
    Heart,
    Users,
    Shield,
    Stethoscope,
    Car,
    Package,
    MapPin,
    Phone,
    Home,
    User,
    Menu,
    X,
    Globe,
    HandHeart,
    Clock,
    CheckCircle,
    Bell,
    LogIn,
    IndianRupee,
    Loader2,
    ExternalLink,
    FileText,
    Building2,
    Mail,
    ChevronRight,
    LogOut,
    Settings,
    LayoutDashboard,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

// Translations
const translations = {
    en: {
        appName: "Bihar Sahayata",
        govtOf: "Government of Bihar Initiative",
        tagline: "Disaster Management & Volunteer Services Portal",
        switchLang: "हिंदी",
        heroTitle: "Bihar Sahayata Portal",
        heroSubtitle: "Official Platform for Disaster Relief & Community Welfare",
        heroDescription: "A unified platform connecting citizens with emergency services, verified volunteers, and relief resources during disasters and emergencies.",
        quickLinks: "Quick Links",
        joinVolunteer: "Register as Volunteer",
        reportEmergency: "Report Emergency",
        viewDisasters: "Active Disasters",
        donateNow: "Contribute to Relief Fund",
        emergencyHelpline: "Emergency Helpline",
        tollFree: "Toll Free 24x7",
        statsVolunteers: "Registered Volunteers",
        statsResolved: "Issues Resolved",
        statsDistricts: "Districts Covered",
        statsDonated: "Relief Fund Collected",
        servicesTitle: "Our Services",
        servicesSubtitle: "Comprehensive disaster management and community welfare services",
        serviceDoctor: "Medical Assistance",
        serviceDoctorDesc: "Free medical consultations and emergency healthcare support from verified medical professionals.",
        serviceDriver: "Emergency Transport",
        serviceDriverDesc: "Rapid transportation for emergencies, relief supplies, and evacuation support.",
        serviceResources: "Relief Resources",
        serviceResourcesDesc: "Distribution of food, clothing, medicines, and essential supplies to affected areas.",
        serviceRescue: "Rescue Operations",
        serviceRescueDesc: "Trained rescue teams for flood, fire, and other disaster response operations.",
        noticesTitle: "Important Notices",
        howItWorks: "How It Works",
        step1Title: "Register",
        step1Desc: "Create an account and complete your profile",
        step2Title: "Report or Volunteer",
        step2Desc: "Report emergencies or register as a volunteer",
        step3Title: "Get Help",
        step3Desc: "Receive assistance from verified responders",
        ctaTitle: "Join the Relief Network",
        ctaSubtitle: "Be part of Bihar's largest disaster response community",
        ctaVolunteer: "Register as Volunteer",
        ctaDonate: "Donate to Relief Fund",
        footerAbout: "Bihar Sahayata is an official initiative for disaster management, emergency response, and community welfare services in Bihar.",
        footerLinks: "Important Links",
        footerContact: "Contact Us",
        footerEmergency: "Emergency: 112",
        footerRights: "© 2026 Bihar Sahayata Portal. Government of Bihar. All rights reserved.",
        footerDisclaimer: "Official Government Portal",
        navHome: "Home",
        navAlerts: "Alerts",
        navSOS: "SOS",
        navVolunteer: "Volunteer",
        navProfile: "Profile",
        menuDisasters: "Disasters",
        menuTeams: "Relief Teams",
        menuDonate: "Donate",
        menuLogin: "Login",
        menuSignup: "Register",
        donateTitle: "Contribute to Relief Fund",
        donateSubtitle: "Your contribution helps disaster-affected families",
        donateAmount: "Select Amount",
        donateCustom: "Custom Amount",
        donateName: "Full Name",
        donateEmail: "Email Address",
        donatePhone: "Phone Number",
        donateMessage: "Message (Optional)",
        donateAnonymous: "Donate anonymously",
        donateButton: "Proceed to Donate",
        donateSuccess: "Thank You!",
        donateSuccessMsg: "Your contribution has been received successfully.",
        lastUpdated: "Last Updated",
    },
    hi: {
        appName: "बिहार सहायता",
        govtOf: "बिहार सरकार की पहल",
        tagline: "आपदा प्रबंधन एवं स्वयंसेवी सेवा पोर्टल",
        switchLang: "English",
        heroTitle: "बिहार सहायता पोर्टल",
        heroSubtitle: "आपदा राहत एवं सामुदायिक कल्याण का आधिकारिक मंच",
        heroDescription: "आपदाओं और आपात स्थितियों में नागरिकों को आपातकालीन सेवाओं, सत्यापित स्वयंसेवकों और राहत संसाधनों से जोड़ने वाला एकीकृत मंच।",
        quickLinks: "त्वरित लिंक",
        joinVolunteer: "स्वयंसेवक के रूप में पंजीकरण",
        reportEmergency: "आपातकाल की रिपोर्ट करें",
        viewDisasters: "सक्रिय आपदाएं",
        donateNow: "राहत कोष में योगदान",
        emergencyHelpline: "आपातकालीन हेल्पलाइन",
        tollFree: "टोल फ्री 24x7",
        statsVolunteers: "पंजीकृत स्वयंसेवक",
        statsResolved: "समस्याएं हल",
        statsDistricts: "जिले शामिल",
        statsDonated: "राहत कोष एकत्र",
        servicesTitle: "हमारी सेवाएं",
        servicesSubtitle: "व्यापक आपदा प्रबंधन और सामुदायिक कल्याण सेवाएं",
        serviceDoctor: "चिकित्सा सहायता",
        serviceDoctorDesc: "सत्यापित चिकित्सा पेशेवरों से मुफ्त चिकित्सा परामर्श और आपातकालीन स्वास्थ्य सहायता।",
        serviceDriver: "आपातकालीन परिवहन",
        serviceDriverDesc: "आपातकाल, राहत सामग्री और निकासी सहायता के लिए तीव्र परिवहन।",
        serviceResources: "राहत संसाधन",
        serviceResourcesDesc: "प्रभावित क्षेत्रों में भोजन, कपड़े, दवाइयां और आवश्यक सामग्री का वितरण।",
        serviceRescue: "बचाव अभियान",
        serviceRescueDesc: "बाढ़, आग और अन्य आपदा प्रतिक्रिया के लिए प्रशिक्षित बचाव दल।",
        noticesTitle: "महत्वपूर्ण सूचनाएं",
        howItWorks: "यह कैसे काम करता है",
        step1Title: "पंजीकरण करें",
        step1Desc: "खाता बनाएं और प्रोफाइल पूरा करें",
        step2Title: "रिपोर्ट या स्वयंसेवा",
        step2Desc: "आपातकाल की रिपोर्ट करें या स्वयंसेवक बनें",
        step3Title: "सहायता प्राप्त करें",
        step3Desc: "सत्यापित उत्तरदाताओं से सहायता प्राप्त करें",
        ctaTitle: "राहत नेटवर्क से जुड़ें",
        ctaSubtitle: "बिहार के सबसे बड़े आपदा प्रतिक्रिया समुदाय का हिस्सा बनें",
        ctaVolunteer: "स्वयंसेवक के रूप में पंजीकरण",
        ctaDonate: "राहत कोष में दान करें",
        footerAbout: "बिहार सहायता बिहार में आपदा प्रबंधन, आपातकालीन प्रतिक्रिया और सामुदायिक कल्याण सेवाओं के लिए एक आधिकारिक पहल है।",
        footerLinks: "महत्वपूर्ण लिंक",
        footerContact: "संपर्क करें",
        footerEmergency: "आपातकाल: 112",
        footerRights: "© 2026 बिहार सहायता पोर्टल। बिहार सरकार। सर्वाधिकार सुरक्षित।",
        footerDisclaimer: "आधिकारिक सरकारी पोर्टल",
        navHome: "होम",
        navAlerts: "अलर्ट",
        navSOS: "SOS",
        navVolunteer: "सेवक",
        navProfile: "प्रोफाइल",
        menuDisasters: "आपदाएं",
        menuTeams: "राहत टीमें",
        menuDonate: "दान करें",
        menuLogin: "लॉगिन",
        menuSignup: "पंजीकरण",
        donateTitle: "राहत कोष में योगदान करें",
        donateSubtitle: "आपका योगदान आपदा प्रभावित परिवारों की मदद करता है",
        donateAmount: "राशि चुनें",
        donateCustom: "अन्य राशि",
        donateName: "पूरा नाम",
        donateEmail: "ईमेल पता",
        donatePhone: "फोन नंबर",
        donateMessage: "संदेश (वैकल्पिक)",
        donateAnonymous: "गुमनाम दान करें",
        donateButton: "दान करें",
        donateSuccess: "धन्यवाद!",
        donateSuccessMsg: "आपका योगदान सफलतापूर्वक प्राप्त हो गया है।",
        lastUpdated: "अंतिम अपडेट",
    },
};

type Language = "en" | "hi";

const donationAmounts = [500, 1000, 2500, 5000, 10000, 25000];

const notices = [
    { id: 1, title: "Flood Alert: Kosi River Basin", date: "2026-01-28", type: "alert" },
    { id: 2, title: "Volunteer Registration Drive - February 2026", date: "2026-01-25", type: "notice" },
    { id: 3, title: "Relief Distribution in Darbhanga District", date: "2026-01-22", type: "update" },
];

export default function LandingPage() {
    const router = useRouter();
    const { data: session, isPending: sessionLoading } = authClient.useSession();
    const [lang, setLang] = useState<Language>("en");
    const [menuOpen, setMenuOpen] = useState(false);
    const [showDonateDialog, setShowDonateDialog] = useState(false);
    const [donationAmount, setDonationAmount] = useState(1000);
    const [customAmount, setCustomAmount] = useState("");
    const [donorName, setDonorName] = useState("");
    const [donorEmail, setDonorEmail] = useState("");
    const [donorPhone, setDonorPhone] = useState("");
    const [message, setMessage] = useState("");
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [donating, setDonating] = useState(false);
    const [donationSuccess, setDonationSuccess] = useState(false);
    const [isVolunteer, setIsVolunteer] = useState(false);
    const [checkingVolunteer, setCheckingVolunteer] = useState(false);
    const t = translations[lang];

    // Check if user is already a volunteer
    useEffect(() => {
        // Skip if session is still loading
        if (sessionLoading) {
            return;
        }

        const checkVolunteerStatus = async () => {
            if (!session?.user) {
                setIsVolunteer(false);
                setCheckingVolunteer(false);
                return;
            }
            
            setCheckingVolunteer(true);
            try {
                const res = await fetch("/api/volunteer/profile");
                // If API returns 200, user is a volunteer
                // If API returns 404, user is not a volunteer
                if (res.ok) {
                    setIsVolunteer(true);
                } else {
                    setIsVolunteer(false);
                }
            } catch {
                setIsVolunteer(false);
            } finally {
                setCheckingVolunteer(false);
            }
        };

        checkVolunteerStatus();
    }, [sessionLoading, session?.user?.id]);

    const handleLogout = async () => {
        await authClient.signOut();
        setIsVolunteer(false);
        router.refresh();
    };

    const handleDonate = async () => {
        const amount = customAmount ? parseInt(customAmount) : donationAmount;
        if (!amount || amount < 10) {
            alert(lang === "en" ? "Minimum donation is ₹10" : "न्यूनतम दान ₹10 है");
            return;
        }

        setDonating(true);
        try {
            const res = await fetch("/api/donations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount,
                    donorName: isAnonymous ? null : donorName,
                    donorEmail,
                    donorPhone,
                    isAnonymous,
                    message,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error);
            }

            setDonationSuccess(true);
        } catch (err) {
            alert(err instanceof Error ? err.message : "Donation failed");
        } finally {
            setDonating(false);
        }
    };

    const closeDonateDialog = () => {
        setShowDonateDialog(false);
        setDonationSuccess(false);
        setDonorName("");
        setDonorEmail("");
        setDonorPhone("");
        setMessage("");
        setCustomAmount("");
        setDonationAmount(1000);
        setIsAnonymous(false);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Bar - Government Style */}
            <div className="bg-[#1a365d] text-white text-xs sm:text-sm">
                <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-4">
                        <span className="hidden sm:inline">{t.govtOf}</span>
                        <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            112
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setLang(lang === "en" ? "hi" : "en")}
                            className="flex items-center gap-1 hover:underline"
                        >
                            <Globe className="w-3 h-3" />
                            {t.switchLang}
                        </button>
                        {!session?.user && (
                            <Link href="/auth/login" className="hover:underline hidden sm:inline">
                                {t.menuLogin}
                            </Link>
                        )}
                        {session?.user && (
                            <Link href="/dashboard" className="hover:underline hidden sm:inline">
                                {lang === "en" ? "My Account" : "मेरा खाता"}
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <header className="bg-white border-b-4 border-[#f97316] shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded bg-[#1a365d] flex items-center justify-center">
                                <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="font-bold text-lg sm:text-xl text-[#1a365d]">
                                    {t.appName}
                                </h1>
                                <p className="text-[10px] sm:text-xs text-gray-600 hidden sm:block">
                                    {t.tagline}
                                </p>
                            </div>
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden lg:flex items-center gap-6">
                            <Link href="/" className="text-sm font-medium text-[#f97316] border-b-2 border-[#f97316] pb-1">
                                {t.navHome}
                            </Link>
                            <Link href="/disasters" className="text-sm font-medium text-gray-600 hover:text-[#1a365d]">
                                {t.menuDisasters}
                            </Link>
                            <Link href="/teams" className="text-sm font-medium text-gray-600 hover:text-[#1a365d]">
                                {t.menuTeams}
                            </Link>
                            {session?.user ? (
                                isVolunteer ? (
                                    <Link href="/volunteer/dashboard" className="text-sm font-medium text-gray-600 hover:text-[#1a365d]">
                                        {lang === "en" ? "Volunteer Dashboard" : "स्वयंसेवक डैशबोर्ड"}
                                    </Link>
                                ) : (
                                    <Link href="/volunteer/onboard" className="text-sm font-medium text-gray-600 hover:text-[#1a365d]">
                                        {t.joinVolunteer}
                                    </Link>
                                )
                            ) : (
                                <Link href="/volunteer/onboard" className="text-sm font-medium text-gray-600 hover:text-[#1a365d]">
                                    {t.joinVolunteer}
                                </Link>
                            )}
                        </nav>

                        {/* Desktop Actions */}
                        <div className="hidden lg:flex items-center gap-3">
                            {sessionLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                            ) : session?.user ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="gap-2 border-[#1a365d]">
                                            <div className="w-6 h-6 rounded bg-[#1a365d] text-white flex items-center justify-center text-xs font-bold">
                                                {session.user.name?.[0]?.toUpperCase() || "U"}
                                            </div>
                                            <span className="max-w-[120px] truncate">{session.user.name}</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56">
                                        <div className="px-2 py-2 border-b">
                                            <p className="font-medium text-sm">{session.user.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                                        </div>
                                        <DropdownMenuItem asChild>
                                            <Link href="/dashboard" className="cursor-pointer">
                                                <LayoutDashboard className="w-4 h-4 mr-2" />
                                                {lang === "en" ? "Dashboard" : "डैशबोर्ड"}
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/profile" className="cursor-pointer">
                                                <User className="w-4 h-4 mr-2" />
                                                {lang === "en" ? "My Profile" : "मेरी प्रोफाइल"}
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/my-issues" className="cursor-pointer">
                                                <FileText className="w-4 h-4 mr-2" />
                                                {lang === "en" ? "My Issues" : "मेरी समस्याएं"}
                                            </Link>
                                        </DropdownMenuItem>
                                        {isVolunteer && (
                                            <DropdownMenuItem asChild>
                                                <Link href="/volunteer/dashboard" className="cursor-pointer">
                                                    <HandHeart className="w-4 h-4 mr-2" />
                                                    {lang === "en" ? "Volunteer Dashboard" : "स्वयंसेवक डैशबोर्ड"}
                                                </Link>
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                                            <LogOut className="w-4 h-4 mr-2" />
                                            {lang === "en" ? "Logout" : "लॉगआउट"}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-[#1a365d] text-[#1a365d] hover:bg-[#1a365d] hover:text-white"
                                        asChild
                                    >
                                        <Link href="/auth/login">{t.menuLogin}</Link>
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="bg-[#f97316] hover:bg-[#ea580c] text-white"
                                        asChild
                                    >
                                        <Link href="/auth/signup">{t.menuSignup}</Link>
                                    </Button>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden"
                            onClick={() => setMenuOpen(!menuOpen)}
                        >
                            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {menuOpen && (
                    <div className="lg:hidden border-t bg-white">
                        <nav className="flex flex-col p-4 gap-1">
                            {/* User Info Section (when logged in) */}
                            {session?.user && (
                                <>
                                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg mb-2">
                                        <div className="w-10 h-10 rounded bg-[#1a365d] text-white flex items-center justify-center font-bold">
                                            {session.user.name?.[0]?.toUpperCase() || "U"}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium text-sm truncate">{session.user.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                                        </div>
                                    </div>
                                    <Link
                                        href="/dashboard"
                                        className="flex items-center gap-3 px-4 py-3 rounded hover:bg-gray-100"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        <LayoutDashboard className="w-5 h-5 text-blue-600" />
                                        {lang === "en" ? "Dashboard" : "डैशबोर्ड"}
                                    </Link>
                                    <Link
                                        href="/profile"
                                        className="flex items-center gap-3 px-4 py-3 rounded hover:bg-gray-100"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        <Settings className="w-5 h-5 text-gray-600" />
                                        {lang === "en" ? "My Profile" : "मेरी प्रोफाइल"}
                                    </Link>
                                    <hr className="my-2" />
                                </>
                            )}
                            
                            <Link
                                href="/"
                                className="flex items-center gap-3 px-4 py-3 rounded bg-gray-100 font-medium text-[#1a365d]"
                                onClick={() => setMenuOpen(false)}
                            >
                                <Home className="w-5 h-5" />
                                {t.navHome}
                            </Link>
                            <Link
                                href="/disasters"
                                className="flex items-center gap-3 px-4 py-3 rounded hover:bg-gray-100"
                                onClick={() => setMenuOpen(false)}
                            >
                                <AlertTriangle className="w-5 h-5 text-orange-600" />
                                {t.menuDisasters}
                            </Link>
                            <Link
                                href="/teams"
                                className="flex items-center gap-3 px-4 py-3 rounded hover:bg-gray-100"
                                onClick={() => setMenuOpen(false)}
                            >
                                <Users className="w-5 h-5 text-blue-600" />
                                {t.menuTeams}
                            </Link>
                            {session?.user && isVolunteer ? (
                                <Link
                                    href="/volunteer/dashboard"
                                    className="flex items-center gap-3 px-4 py-3 rounded hover:bg-gray-100"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    <HandHeart className="w-5 h-5 text-green-600" />
                                    {lang === "en" ? "Volunteer Dashboard" : "स्वयंसेवक डैशबोर्ड"}
                                </Link>
                            ) : (
                                <Link
                                    href="/volunteer/onboard"
                                    className="flex items-center gap-3 px-4 py-3 rounded hover:bg-gray-100"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    <HandHeart className="w-5 h-5 text-green-600" />
                                    {t.joinVolunteer}
                                </Link>
                            )}
                            <hr className="my-2" />
                            
                            {session?.user ? (
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setMenuOpen(false);
                                    }}
                                    className="flex items-center gap-3 px-4 py-3 rounded hover:bg-red-50 text-red-600"
                                >
                                    <LogOut className="w-5 h-5" />
                                    {lang === "en" ? "Logout" : "लॉगआउट"}
                                </button>
                            ) : (
                                <>
                                    <Link
                                        href="/auth/login"
                                        className="flex items-center gap-3 px-4 py-3 rounded hover:bg-gray-100"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        <LogIn className="w-5 h-5" />
                                        {t.menuLogin}
                                    </Link>
                                    <Link
                                        href="/auth/signup"
                                        className="flex items-center gap-3 px-4 py-3 rounded bg-[#f97316] text-white"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        <User className="w-5 h-5" />
                                        {t.menuSignup}
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="pb-20 md:pb-0">
                {/* Hero Section */}
                <section className="bg-[#1a365d] text-white">
                    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
                        <div className="grid lg:grid-cols-2 gap-8 items-center">
                            <div>
                                <Badge className="mb-4 bg-white/20 text-white border-0 text-xs">
                                    {t.footerDisclaimer}
                                </Badge>
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">
                                    {t.heroTitle}
                                </h1>
                                <p className="text-lg sm:text-xl text-blue-100 mb-4">
                                    {t.heroSubtitle}
                                </p>
                                <p className="text-sm sm:text-base text-blue-200 mb-6 max-w-xl">
                                    {t.heroDescription}
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    {session?.user && isVolunteer ? (
                                        <Button
                                            size="lg"
                                            className="bg-[#f97316] hover:bg-[#ea580c] text-white"
                                            asChild
                                        >
                                            <Link href="/volunteer/dashboard">
                                                <HandHeart className="w-4 h-4 mr-2" />
                                                {lang === "en" ? "Volunteer Dashboard" : "स्वयंसेवक डैशबोर्ड"}
                                            </Link>
                                        </Button>
                                    ) : (
                                        <Button
                                            size="lg"
                                            className="bg-[#f97316] hover:bg-[#ea580c] text-white"
                                            asChild
                                        >
                                            <Link href="/volunteer/onboard">
                                                <HandHeart className="w-4 h-4 mr-2" />
                                                {t.joinVolunteer}
                                            </Link>
                                        </Button>
                                    )}
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="border-white text-white hover:bg-white hover:text-[#1a365d]"
                                        asChild
                                    >
                                        <Link href="/panic">
                                            <AlertTriangle className="w-4 h-4 mr-2" />
                                            {t.reportEmergency}
                                        </Link>
                                    </Button>
                                </div>
                            </div>

                            {/* Emergency Helpline Card */}
                            <div className="flex justify-center lg:justify-end">
                                <Card className="bg-white text-gray-900 w-full max-w-sm">
                                    <CardContent className="p-6">
                                        <div className="text-center mb-4">
                                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-3">
                                                <Phone className="w-8 h-8 text-red-600" />
                                            </div>
                                            <h3 className="font-bold text-lg text-red-600">
                                                {t.emergencyHelpline}
                                            </h3>
                                            <p className="text-xs text-gray-500">{t.tollFree}</p>
                                        </div>
                                        <div className="text-center mb-4">
                                            <span className="text-4xl font-bold text-[#1a365d]">112</span>
                                        </div>
                                        <Link href="/panic">
                                            <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                                                <AlertTriangle className="w-4 h-4 mr-2" />
                                                {t.reportEmergency}
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Quick Links */}
                <section className="bg-white border-b">
                    <div className="max-w-7xl mx-auto px-4 py-6">
                        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                            {t.quickLinks}
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {session?.user && isVolunteer ? (
                                <Link
                                    href="/volunteer/dashboard"
                                    className="flex items-center gap-3 p-4 border rounded-lg hover:border-[#f97316] hover:bg-orange-50 transition-colors"
                                >
                                    <div className="w-10 h-10 rounded bg-orange-100 flex items-center justify-center">
                                        <HandHeart className="w-5 h-5 text-[#f97316]" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">
                                        {lang === "en" ? "Volunteer Dashboard" : "स्वयंसेवक डैशबोर्ड"}
                                    </span>
                                </Link>
                            ) : (
                                <Link
                                    href="/volunteer/onboard"
                                    className="flex items-center gap-3 p-4 border rounded-lg hover:border-[#f97316] hover:bg-orange-50 transition-colors"
                                >
                                    <div className="w-10 h-10 rounded bg-orange-100 flex items-center justify-center">
                                        <HandHeart className="w-5 h-5 text-[#f97316]" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">{t.joinVolunteer}</span>
                                </Link>
                            )}
                            <Link
                                href="/panic"
                                className="flex items-center gap-3 p-4 border rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors"
                            >
                                <div className="w-10 h-10 rounded bg-red-100 flex items-center justify-center">
                                    <AlertTriangle className="w-5 h-5 text-red-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-700">{t.reportEmergency}</span>
                            </Link>
                            <Link
                                href="/disasters"
                                className="flex items-center gap-3 p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                            >
                                <div className="w-10 h-10 rounded bg-blue-100 flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-700">{t.viewDisasters}</span>
                            </Link>
                            <button
                                onClick={() => setShowDonateDialog(true)}
                                className="flex items-center gap-3 p-4 border rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left"
                            >
                                <div className="w-10 h-10 rounded bg-green-100 flex items-center justify-center">
                                    <Heart className="w-5 h-5 text-green-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-700">{t.donateNow}</span>
                            </button>
                        </div>
                    </div>
                </section>

                {/* Stats */}
                <section className="bg-gray-100 border-b">
                    <div className="max-w-7xl mx-auto px-4 py-8">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                            {[
                                { value: "5,000+", label: t.statsVolunteers, icon: <Users className="w-6 h-6" />, color: "text-blue-600", bg: "bg-blue-100" },
                                { value: "25,000+", label: t.statsResolved, icon: <CheckCircle className="w-6 h-6" />, color: "text-green-600", bg: "bg-green-100" },
                                { value: "38", label: t.statsDistricts, icon: <MapPin className="w-6 h-6" />, color: "text-orange-600", bg: "bg-orange-100" },
                                { value: "₹2 Cr+", label: t.statsDonated, icon: <IndianRupee className="w-6 h-6" />, color: "text-purple-600", bg: "bg-purple-100" },
                            ].map((stat, i) => (
                                <div key={i} className="bg-white rounded-lg p-4 sm:p-6 border">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`w-10 h-10 rounded ${stat.bg} ${stat.color} flex items-center justify-center`}>
                                            {stat.icon}
                                        </div>
                                    </div>
                                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stat.value}</p>
                                    <p className="text-xs sm:text-sm text-gray-500">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Main Content Grid */}
                <section className="py-8 sm:py-12">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="grid lg:grid-cols-3 gap-8">
                            {/* Services - 2 columns */}
                            <div className="lg:col-span-2">
                                <h2 className="text-xl sm:text-2xl font-bold text-[#1a365d] mb-2">
                                    {t.servicesTitle}
                                </h2>
                                <p className="text-gray-600 mb-6">{t.servicesSubtitle}</p>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    {[
                                        { icon: <Stethoscope className="w-6 h-6" />, title: t.serviceDoctor, desc: t.serviceDoctorDesc, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
                                        { icon: <Car className="w-6 h-6" />, title: t.serviceDriver, desc: t.serviceDriverDesc, color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
                                        { icon: <Package className="w-6 h-6" />, title: t.serviceResources, desc: t.serviceResourcesDesc, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
                                        { icon: <Shield className="w-6 h-6" />, title: t.serviceRescue, desc: t.serviceRescueDesc, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
                                    ].map((service, i) => (
                                        <Card key={i} className={`${service.bg} border ${service.border}`}>
                                            <CardContent className="p-4 sm:p-5">
                                                <div className={`w-12 h-12 rounded ${service.bg} ${service.color} flex items-center justify-center mb-3`}>
                                                    {service.icon}
                                                </div>
                                                <h3 className="font-semibold text-gray-900 mb-2">{service.title}</h3>
                                                <p className="text-sm text-gray-600">{service.desc}</p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>

                            {/* Notices Sidebar */}
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold text-[#1a365d] mb-2">
                                    {t.noticesTitle}
                                </h2>
                                <p className="text-gray-600 text-sm mb-4">{t.lastUpdated}: Jan 28, 2026</p>

                                <div className="space-y-3">
                                    {notices.map((notice) => (
                                        <Card key={notice.id} className="border hover:shadow-md transition-shadow cursor-pointer">
                                            <CardContent className="p-4">
                                                <div className="flex items-start gap-3">
                                                    <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${
                                                        notice.type === 'alert' ? 'bg-red-100 text-red-600' :
                                                        notice.type === 'notice' ? 'bg-blue-100 text-blue-600' :
                                                        'bg-green-100 text-green-600'
                                                    }`}>
                                                        {notice.type === 'alert' ? <AlertTriangle className="w-4 h-4" /> :
                                                         notice.type === 'notice' ? <Bell className="w-4 h-4" /> :
                                                         <FileText className="w-4 h-4" />}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-sm text-gray-900 line-clamp-2">
                                                            {notice.title}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {new Date(notice.date).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>

                                <Link
                                    href="/disasters"
                                    className="inline-flex items-center text-sm font-medium text-[#1a365d] hover:text-[#f97316] mt-4"
                                >
                                    View All Notices
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section className="bg-white border-y py-8 sm:py-12">
                    <div className="max-w-7xl mx-auto px-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-[#1a365d] text-center mb-8">
                            {t.howItWorks}
                        </h2>

                        <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
                            {[
                                { step: "1", title: t.step1Title, desc: t.step1Desc, icon: <User className="w-6 h-6" /> },
                                { step: "2", title: t.step2Title, desc: t.step2Desc, icon: <FileText className="w-6 h-6" /> },
                                { step: "3", title: t.step3Title, desc: t.step3Desc, icon: <CheckCircle className="w-6 h-6" /> },
                            ].map((item, i) => (
                                <div key={i} className="text-center">
                                    <div className="w-16 h-16 rounded-full bg-[#1a365d] text-white flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                                        {item.step}
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                                    <p className="text-sm text-gray-600">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="bg-[#1a365d] text-white py-8 sm:py-12">
                    <div className="max-w-4xl mx-auto px-4 text-center">
                        <h2 className="text-xl sm:text-2xl font-bold mb-2">{t.ctaTitle}</h2>
                        <p className="text-blue-200 mb-6">{t.ctaSubtitle}</p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            {session?.user && isVolunteer ? (
                                <Button
                                    size="lg"
                                    className="bg-[#f97316] hover:bg-[#ea580c] text-white"
                                    asChild
                                >
                                    <Link href="/volunteer/dashboard">
                                        <HandHeart className="w-4 h-4 mr-2" />
                                        {lang === "en" ? "Volunteer Dashboard" : "स्वयंसेवक डैशबोर्ड"}
                                    </Link>
                                </Button>
                            ) : (
                                <Button
                                    size="lg"
                                    className="bg-[#f97316] hover:bg-[#ea580c] text-white"
                                    asChild
                                >
                                    <Link href="/volunteer/onboard">
                                        <HandHeart className="w-4 h-4 mr-2" />
                                        {t.ctaVolunteer}
                                    </Link>
                                </Button>
                            )}
                            <Button
                                size="lg"
                                variant="outline"
                                className="border-white text-white hover:bg-white hover:text-[#1a365d]"
                                onClick={() => setShowDonateDialog(true)}
                            >
                                <Heart className="w-4 h-4 mr-2" />
                                {t.ctaDonate}
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-gray-900 text-white py-8 sm:py-12 hidden md:block">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                            <div className="sm:col-span-2 lg:col-span-1">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded bg-white flex items-center justify-center">
                                        <Shield className="w-5 h-5 text-[#1a365d]" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold">{t.appName}</h3>
                                        <p className="text-xs text-gray-400">{t.govtOf}</p>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-400">{t.footerAbout}</p>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-4">{t.footerLinks}</h4>
                                <ul className="space-y-2 text-sm text-gray-400">
                                    <li><Link href="/disasters" className="hover:text-white">Disaster Alerts</Link></li>
                                    {session?.user && isVolunteer ? (
                                        <li><Link href="/volunteer/dashboard" className="hover:text-white">Volunteer Dashboard</Link></li>
                                    ) : (
                                        <li><Link href="/volunteer/onboard" className="hover:text-white">Become Volunteer</Link></li>
                                    )}
                                    <li><Link href="/teams" className="hover:text-white">Relief Teams</Link></li>
                                    <li><Link href="/panic" className="hover:text-white">Report Emergency</Link></li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-4">{t.footerContact}</h4>
                                <ul className="space-y-2 text-sm text-gray-400">
                                    <li className="flex items-center gap-2">
                                        <Phone className="w-4 h-4" />
                                        {t.footerEmergency}
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        help@biharsahayata.gov.in
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Building2 className="w-4 h-4" />
                                        Patna, Bihar
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-4">External Links</h4>
                                <ul className="space-y-2 text-sm text-gray-400">
                                    <li>
                                        <a href="https://state.bihar.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center gap-1">
                                            Bihar Government <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </li>
                                    <li>
                                        <a href="https://ndma.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center gap-1">
                                            NDMA <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
                            {t.footerRights}
                        </div>
                    </div>
                </footer>
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50">
                <div className="flex items-center justify-around py-2">
                    <Link href="/" className="flex flex-col items-center py-2 px-3 text-[#f97316]">
                        <Home className="w-5 h-5" />
                        <span className="text-[10px] mt-0.5 font-medium">{t.navHome}</span>
                    </Link>

                    <Link href="/disasters" className="flex flex-col items-center py-2 px-3 text-gray-500">
                        <Bell className="w-5 h-5" />
                        <span className="text-[10px] mt-0.5">{t.navAlerts}</span>
                    </Link>

                    <Link href="/panic" className="-mt-5">
                        <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center border-4 border-white shadow-lg">
                            <AlertTriangle className="w-6 h-6 text-white" />
                        </div>
                    </Link>

                    <Link href="/volunteer/dashboard" className="flex flex-col items-center py-2 px-3 text-gray-500">
                        <HandHeart className="w-5 h-5" />
                        <span className="text-[10px] mt-0.5">{t.navVolunteer}</span>
                    </Link>

                    <Link href="/dashboard" className="flex flex-col items-center py-2 px-3 text-gray-500">
                        <User className="w-5 h-5" />
                        <span className="text-[10px] mt-0.5">{t.navProfile}</span>
                    </Link>
                </div>
            </nav>

            {/* Donation Dialog */}
            <Dialog open={showDonateDialog} onOpenChange={setShowDonateDialog}>
                <DialogContent className="max-w-md mx-4">
                    {donationSuccess ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <h2 className="text-xl font-bold text-green-600 mb-2">{t.donateSuccess}</h2>
                            <p className="text-gray-600 mb-6">{t.donateSuccessMsg}</p>
                            <Button onClick={closeDonateDialog} className="bg-[#1a365d]">
                                {lang === "en" ? "Close" : "बंद करें"}
                            </Button>
                        </div>
                    ) : (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <Heart className="w-5 h-5 text-red-600" />
                                    {t.donateTitle}
                                </DialogTitle>
                                <DialogDescription>{t.donateSubtitle}</DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                                <div>
                                    <Label className="text-sm font-medium">{t.donateAmount}</Label>
                                    <div className="grid grid-cols-3 gap-2 mt-2">
                                        {donationAmounts.map((amt) => (
                                            <Button
                                                key={amt}
                                                type="button"
                                                variant={donationAmount === amt && !customAmount ? "default" : "outline"}
                                                className={donationAmount === amt && !customAmount ? "bg-[#1a365d]" : ""}
                                                onClick={() => { setDonationAmount(amt); setCustomAmount(""); }}
                                            >
                                                ₹{amt.toLocaleString()}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium">{t.donateCustom}</Label>
                                    <div className="relative mt-1">
                                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <Input
                                            type="number"
                                            value={customAmount}
                                            onChange={(e) => setCustomAmount(e.target.value)}
                                            placeholder="Enter amount"
                                            className="pl-9"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="anonymous"
                                        checked={isAnonymous}
                                        onChange={(e) => setIsAnonymous(e.target.checked)}
                                        className="rounded"
                                    />
                                    <Label htmlFor="anonymous" className="cursor-pointer text-sm">{t.donateAnonymous}</Label>
                                </div>

                                {!isAnonymous && (
                                    <div>
                                        <Label className="text-sm font-medium">{t.donateName}</Label>
                                        <Input value={donorName} onChange={(e) => setDonorName(e.target.value)} className="mt-1" />
                                    </div>
                                )}

                                <div>
                                    <Label className="text-sm font-medium">{t.donateEmail}</Label>
                                    <Input type="email" value={donorEmail} onChange={(e) => setDonorEmail(e.target.value)} className="mt-1" />
                                </div>

                                <div>
                                    <Label className="text-sm font-medium">{t.donatePhone}</Label>
                                    <Input type="tel" value={donorPhone} onChange={(e) => setDonorPhone(e.target.value)} className="mt-1" />
                                </div>

                                <div>
                                    <Label className="text-sm font-medium">{t.donateMessage}</Label>
                                    <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={2} className="mt-1" />
                                </div>
                            </div>

                            <DialogFooter className="gap-2">
                                <Button variant="outline" onClick={closeDonateDialog}>
                                    {lang === "en" ? "Cancel" : "रद्द करें"}
                                </Button>
                                <Button
                                    onClick={handleDonate}
                                    disabled={donating}
                                    className="bg-[#1a365d] hover:bg-[#1e4070]"
                                >
                                    {donating ? (
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    ) : (
                                        <Heart className="w-4 h-4 mr-2" />
                                    )}
                                    {t.donateButton} ₹{(customAmount ? parseInt(customAmount) || 0 : donationAmount).toLocaleString()}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
