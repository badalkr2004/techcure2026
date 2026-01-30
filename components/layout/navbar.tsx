"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Menu,
    X,
    Globe,
    ChevronLeft,
    User,
    LogIn,
    LogOut,
    LayoutDashboard,
    FileText,
    HandHeart,
    ChevronDown,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

interface NavbarProps {
    showBackButton?: boolean;
    title?: string;
    lang?: "en" | "hi";
    onLangChange?: (lang: "en" | "hi") => void;
}

const translations = {
    en: {
        home: "Home",
        disasters: "Disasters",
        teams: "Teams",
        joinVolunteer: "Join as Volunteer",
        volunteerDashboard: "Volunteer Dashboard",
        login: "Login",
        signup: "Sign Up",
        dashboard: "Dashboard",
        profile: "Profile",
        myIssues: "My Issues",
        logout: "Logout",
    },
    hi: {
        home: "होम",
        disasters: "आपदाएं",
        teams: "टीमें",
        joinVolunteer: "स्वयंसेवक बनें",
        volunteerDashboard: "स्वयंसेवक डैशबोर्ड",
        login: "लॉगिन",
        signup: "साइन अप",
        dashboard: "डैशबोर्ड",
        profile: "प्रोफ़ाइल",
        myIssues: "मेरी समस्याएं",
        logout: "लॉगआउट",
    },
};

export function Navbar({ showBackButton = false, title, lang: propLang, onLangChange }: NavbarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);
    const [lang, setLang] = useState<"en" | "hi">(propLang || "en");
    const [isVolunteer, setIsVolunteer] = useState(false);
    const { data: session, isPending: sessionLoading } = authClient.useSession();

    const t = translations[lang];

    // Sync with prop lang
    useEffect(() => {
        if (propLang) setLang(propLang);
    }, [propLang]);

    // Check volunteer status
    useEffect(() => {
        if (sessionLoading) return;

        const checkVolunteerStatus = async () => {
            if (!session?.user) {
                setIsVolunteer(false);
                return;
            }

            try {
                const res = await fetch("/api/volunteer/profile");
                if (res.ok) {
                    setIsVolunteer(true);
                } else {
                    setIsVolunteer(false);
                }
            } catch {
                setIsVolunteer(false);
            }
        };

        checkVolunteerStatus();
    }, [sessionLoading, session?.user?.id]);

    const handleLangChange = (newLang: "en" | "hi") => {
        setLang(newLang);
        onLangChange?.(newLang);
    };

    const handleLogout = async () => {
        await authClient.signOut();
        router.refresh();
    };

    const isActive = (path: string) => pathname === path;

    return (
        <>
            {/* Desktop & Mobile Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                {/* Top bar */}
                <div className="bg-[#1a365d] text-white text-xs py-1">
                    <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
                        <span>
                            {lang === "en"
                                ? "Emergency Helpline: 112 | Disaster Management: 1078"
                                : "आपातकालीन हेल्पलाइन: 112 | आपदा प्रबंधन: 1078"}
                        </span>
                        <button
                            onClick={() => handleLangChange(lang === "en" ? "hi" : "en")}
                            className="flex items-center gap-1 hover:text-orange-300 transition-colors"
                        >
                            <Globe className="w-3 h-3" />
                            {lang === "en" ? "हिंदी" : "English"}
                        </button>
                    </div>
                </div>

                {/* Main nav */}
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        {/* Left side */}
                        <div className="flex items-center gap-3">
                            {showBackButton && (
                                <button
                                    onClick={() => router.back()}
                                    className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
                                    aria-label="Go back"
                                >
                                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                                </button>
                            )}
                            
                            <Link href="/" className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-[#1a365d] rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">BS</span>
                                </div>
                                <div className="hidden sm:block">
                                    <h1 className="font-bold text-[#1a365d] text-lg leading-tight">
                                        {title || "Bihar Sahayata"}
                                    </h1>
                                    <p className="text-xs text-gray-500">
                                        {lang === "en" ? "Disaster Relief" : "आपदा राहत"}
                                    </p>
                                </div>
                            </Link>
                        </div>

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex items-center gap-6">
                            <Link
                                href="/"
                                className={`text-sm font-medium transition-colors ${
                                    isActive("/") ? "text-[#f97316]" : "text-gray-600 hover:text-[#f97316]]"
                                }`}
                            >
                                {t.home}
                            </Link>
                            <Link
                                href="/disasters"
                                className={`text-sm font-medium transition-colors ${
                                    isActive("/disasters") ? "text-[#f97316] border-b-2 border-[#f97316] pb-1" : "text-gray-600 hover:text-[#f97316]] "
                                }`}
                            >
                                {t.disasters}
                            </Link>
                            <Link
                                href="/teams"
                                className={`text-sm font-medium transition-colors ${
                                    isActive("/teams") ? "text-[#f97316] border-b-2 border-[#f97316] pb-1" : "text-gray-600 hover:text-[#f97316]] "
                                }`}
                            >
                                {t.teams}
                            </Link>
                            {session?.user && isVolunteer ? (
                                <Link
                                    href="/volunteer/dashboard"
                                    className={`text-sm font-medium transition-colors ${
                                        pathname.startsWith("/volunteer") ? "text-[#f97316] border-b-2 border-[#f97316] pb-1" : "text-gray-600 hover:text-[#f97316]] "
                                    }`}
                                >
                                    {t.volunteerDashboard}
                                </Link>
                            ) : (
                                <Link
                                    href="/volunteer/onboard"
                                    className={`text-sm font-medium transition-colors ${
                                        pathname.startsWith("/volunteer/onboard") ? "text-[#f97316] border-b-2 border-[#f97316] pb-1" : "text-gray-600 hover:text-[#f97316]] "
                                    }`}
                                >
                                    {t.joinVolunteer}
                                </Link>
                            )}
                        </nav>

                        {/* Right side */}
                        <div className="flex items-center gap-2">
                            {/* Desktop Auth */}
                            <div className="hidden md:flex items-center gap-2">
                                {session?.user ? (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm" className="gap-2">
                                                <User className="w-4 h-4" />
                                                <span className="max-w-[100px] truncate">
                                                    {session.user.name || session.user.email}
                                                </span>
                                                <ChevronDown className="w-3 h-3" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48">
                                            <DropdownMenuItem asChild>
                                                <Link href="/dashboard" className="cursor-pointer">
                                                    <LayoutDashboard className="w-4 h-4 mr-2" />
                                                    {t.dashboard}
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link href="/profile" className="cursor-pointer">
                                                    <User className="w-4 h-4 mr-2" />
                                                    {t.profile}
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link href="/my-issues" className="cursor-pointer">
                                                    <FileText className="w-4 h-4 mr-2" />
                                                    {t.myIssues}
                                                </Link>
                                            </DropdownMenuItem>
                                            {isVolunteer && (
                                                <DropdownMenuItem asChild>
                                                    <Link href="/volunteer/dashboard" className="cursor-pointer">
                                                        <HandHeart className="w-4 h-4 mr-2" />
                                                        {t.volunteerDashboard}
                                                    </Link>
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={handleLogout}
                                                className="cursor-pointer text-red-600"
                                            >
                                                <LogOut className="w-4 h-4 mr-2" />
                                                {t.logout}
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
                                            <Link href="/auth/login">
                                                <LogIn className="w-4 h-4 mr-1" />
                                                {t.login}
                                            </Link>
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="bg-[#f97316] hover:bg-[#ea580c] text-white"
                                            asChild
                                        >
                                            <Link href="/auth/signup">{t.signup}</Link>
                                        </Button>
                                    </>
                                )}
                            </div>

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {menuOpen && (
                    <div className="md:hidden border-t bg-white animate-in slide-in-from-top-2 duration-200">
                        <div className="p-4 space-y-1">
                            <Link
                                href="/"
                                className="flex items-center gap-3 px-4 py-3 rounded hover:bg-gray-100"
                                onClick={() => setMenuOpen(false)}
                            >
                                {t.home}
                            </Link>
                            <Link
                                href="/disasters"
                                className="flex items-center gap-3 px-4 py-3 rounded hover:bg-gray-100"
                                onClick={() => setMenuOpen(false)}
                            >
                                {t.disasters}
                            </Link>
                            <Link
                                href="/teams"
                                className="flex items-center gap-3 px-4 py-3 rounded hover:bg-gray-100"
                                onClick={() => setMenuOpen(false)}
                            >
                                {t.teams}
                            </Link>
                            {session?.user && isVolunteer ? (
                                <Link
                                    href="/volunteer/dashboard"
                                    className="flex items-center gap-3 px-4 py-3 rounded hover:bg-gray-100"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    {t.volunteerDashboard}
                                </Link>
                            ) : (
                                <Link
                                    href="/volunteer/onboard"
                                    className="flex items-center gap-3 px-4 py-3 rounded hover:bg-gray-100"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    {t.joinVolunteer}
                                </Link>
                            )}

                            <hr className="my-2" />

                            {session?.user ? (
                                <>
                                    <div className="px-4 py-2 text-sm text-gray-500">
                                        {session.user.email}
                                    </div>
                                    <Link
                                        href="/dashboard"
                                        className="flex items-center gap-3 px-4 py-3 rounded hover:bg-gray-100"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        <LayoutDashboard className="w-5 h-5 text-gray-500" />
                                        {t.dashboard}
                                    </Link>
                                    <Link
                                        href="/profile"
                                        className="flex items-center gap-3 px-4 py-3 rounded hover:bg-gray-100"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        <User className="w-5 h-5 text-gray-500" />
                                        {t.profile}
                                    </Link>
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setMenuOpen(false);
                                        }}
                                        className="flex items-center gap-3 px-4 py-3 rounded hover:bg-gray-100 text-red-600 w-full text-left"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        {t.logout}
                                    </button>
                                </>
                            ) : (
                                <div className="flex gap-2 px-4 py-2">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        asChild
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        <Link href="/auth/login">{t.login}</Link>
                                    </Button>
                                    <Button
                                        className="flex-1 bg-[#f97316] hover:bg-[#ea580c]"
                                        asChild
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        <Link href="/auth/signup">{t.signup}</Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </header>
        </>
    );
}
