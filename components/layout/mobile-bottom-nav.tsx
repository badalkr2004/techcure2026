"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home,
    AlertTriangle,
    Users,
    User,
    LayoutDashboard,
    HandHeart,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";

interface MobileBottomNavProps {
    lang?: "en" | "hi";
}

const translations = {
    en: {
        home: "Home",
        emergency: "SOS",
        teams: "Teams",
        dashboard: "Dashboard",
        profile: "Profile",
        volunteer: "Volunteer",
    },
    hi: {
        home: "होम",
        emergency: "SOS",
        teams: "टीमें",
        dashboard: "डैशबोर्ड",
        profile: "प्रोफ़ाइल",
        volunteer: "स्वयंसेवक",
    },
};

export function MobileBottomNav({ lang = "en" }: MobileBottomNavProps) {
    const pathname = usePathname();
    const { data: session } = authClient.useSession();
    const [isVolunteer, setIsVolunteer] = useState(false);
    const t = translations[lang];

    // Check volunteer status
    useEffect(() => {
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
    }, [session?.user?.id]);

    const isActive = (path: string) => {
        if (path === "/") return pathname === "/";
        return pathname.startsWith(path);
    };

    const navItems = [
        {
            href: "/",
            icon: Home,
            label: t.home,
            active: isActive("/") && !pathname.startsWith("/dashboard") && !pathname.startsWith("/profile"),
        },
        {
            href: "/panic",
            icon: AlertTriangle,
            label: t.emergency,
            active: isActive("/panic"),
            emergency: true,
        },
        {
            href: "/teams",
            icon: Users,
            label: t.teams,
            active: isActive("/teams"),
        },
        ...(session?.user
            ? [
                  ...(isVolunteer
                      ? [
                            {
                                href: "/volunteer/dashboard",
                                icon: HandHeart,
                                label: t.volunteer,
                                active: isActive("/volunteer"),
                            },
                        ]
                      : []),
                  {
                      href: "/dashboard",
                      icon: LayoutDashboard,
                      label: t.dashboard,
                      active: isActive("/dashboard") || isActive("/my-issues"),
                  },
                  {
                      href: "/profile",
                      icon: User,
                      label: t.profile,
                      active: isActive("/profile"),
                  },
              ]
            : [
                  {
                      href: "/auth/login",
                      icon: User,
                      label: t.profile,
                      active: isActive("/auth"),
                  },
              ]),
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-inset-bottom">
            <div className="flex items-center justify-around h-16 px-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center flex-1 h-full px-1 transition-all duration-200 ${
                                item.active
                                    ? "text-[#1a365d]"
                                    : item.emergency
                                    ? "text-red-500"
                                    : "text-gray-500"
                            }`}
                        >
                            <div
                                className={`p-1.5 rounded-xl transition-all duration-200 ${
                                    item.active
                                        ? "bg-blue-50 scale-110"
                                        : item.emergency
                                        ? "bg-red-50"
                                        : ""
                                }`}
                            >
                                <Icon
                                    className={`w-5 h-5 ${
                                        item.emergency && !item.active ? "animate-pulse" : ""
                                    }`}
                                />
                            </div>
                            <span
                                className={`text-[10px] mt-0.5 font-medium transition-all duration-200 ${
                                    item.active ? "text-[#1a365d]" : ""
                                }`}
                            >
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
