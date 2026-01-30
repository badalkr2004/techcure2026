"use client";

import { ReactNode, useEffect, useState } from "react";
import { Navbar } from "./navbar";
import { MobileBottomNav } from "./mobile-bottom-nav";

interface PageWrapperProps {
    children: ReactNode;
    showNavbar?: boolean;
    showBackButton?: boolean;
    showBottomNav?: boolean;
    title?: string;
    lang?: "en" | "hi";
    onLangChange?: (lang: "en" | "hi") => void;
    className?: string;
}

export function PageWrapper({
    children,
    showNavbar = true,
    showBackButton = false,
    showBottomNav = true,
    title,
    lang = "en",
    onLangChange,
    className = "",
}: PageWrapperProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Trigger animation on mount
        setMounted(true);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {showNavbar && (
                <Navbar
                    showBackButton={showBackButton}
                    title={title}
                    lang={lang}
                    onLangChange={onLangChange}
                />
            )}

            {/* Main content with transition */}
            <main
                className={`flex-1 transition-all duration-300 ease-out ${
                    mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                } ${showBottomNav ? "pb-20 md:pb-0" : ""} ${className}`}
            >
                {children}
            </main>

            {showBottomNav && <MobileBottomNav lang={lang} />}
        </div>
    );
}
