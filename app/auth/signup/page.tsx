import { SignupForm } from "@/components/auth/signup-form";
import { Shield, Phone } from "lucide-react";
import Link from "next/link";

export default function SignupPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Bar */}
            <div className="bg-[#1a365d] text-white text-xs sm:text-sm">
                <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
                    <span className="hidden sm:inline">Government of Bihar Initiative</span>
                    <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        Emergency: 112
                    </span>
                </div>
            </div>

            {/* Header */}
            <header className="bg-white border-b-4 border-[#f97316]">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded bg-[#1a365d] flex items-center justify-center">
                            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg text-[#1a365d]">Bihar Sahayata</h1>
                            <p className="text-xs text-gray-600 hidden sm:block">
                                Disaster Management & Volunteer Services Portal
                            </p>
                        </div>
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex items-center justify-center py-8 sm:py-12 px-4">
                <div className="w-full max-w-md">
                    <div className="text-center mb-6">
                        <h2 className="text-xl sm:text-2xl font-bold text-[#1a365d]">
                            Register New Account
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Create an account to access portal services
                        </p>
                    </div>
                    <SignupForm />
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-gray-100 border-t py-3 text-center text-xs text-gray-500 mt-8">
                © 2026 Bihar Sahayata Portal. Government of Bihar. All rights reserved.
            </footer>
        </div>
    );
}
