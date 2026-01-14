"use client"

import { Suspense } from "react"
import LoginForm from "./login-form"

export default function LoginPage() {
    return (
        <Suspense fallback={<LoginPageLoader />}>
            <LoginForm />
        </Suspense>
    )
}

function LoginPageLoader() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        SEO Automation
                    </h1>
                    <p className="text-gray-400 mt-2">Sign in to your account</p>
                </div>
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 h-80 animate-pulse" />
            </div>
        </div>
    )
}
