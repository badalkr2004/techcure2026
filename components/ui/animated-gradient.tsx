"use client";

import { cn } from "@/lib/utils";

interface AnimatedGradientProps {
    children: React.ReactNode;
    className?: string;
    containerClassName?: string;
}

export function AnimatedGradientBorder({
    children,
    className,
    containerClassName,
}: AnimatedGradientProps) {
    return (
        <div className={cn("relative group", containerClassName)}>
            <div
                className={cn(
                    "absolute -inset-0.5 bg-gradient-to-r from-orange-500 via-red-500 to-green-500 rounded-xl blur opacity-60 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-gradient-xy",
                    className
                )}
            />
            <div className="relative bg-white dark:bg-gray-900 rounded-xl">
                {children}
            </div>
        </div>
    );
}

export function AnimatedGradientText({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <span
            className={cn(
                "bg-gradient-to-r from-orange-500 via-red-500 to-green-500 bg-clip-text text-transparent bg-300% animate-gradient",
                className
            )}
        >
            {children}
        </span>
    );
}

export function SpotlightCard({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-2xl bg-gradient-to-b from-gray-100 to-white dark:from-gray-800 dark:to-gray-900 p-px",
                className
            )}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/10 to-transparent -translate-x-full animate-shimmer" />
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-6">
                {children}
            </div>
        </div>
    );
}

export function GlowingCard({
    children,
    className,
    glowColor = "orange",
}: {
    children: React.ReactNode;
    className?: string;
    glowColor?: "orange" | "green" | "red" | "blue";
}) {
    const glowColors = {
        orange: "shadow-orange-500/20 hover:shadow-orange-500/40",
        green: "shadow-green-500/20 hover:shadow-green-500/40",
        red: "shadow-red-500/20 hover:shadow-red-500/40",
        blue: "shadow-blue-500/20 hover:shadow-blue-500/40",
    };

    return (
        <div
            className={cn(
                "rounded-2xl bg-white dark:bg-gray-900 shadow-xl transition-all duration-500",
                glowColors[glowColor],
                "hover:shadow-2xl hover:-translate-y-1",
                className
            )}
        >
            {children}
        </div>
    );
}
