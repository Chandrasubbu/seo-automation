import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
    console.log("Registration attempt started. DB URL present:", !!process.env.DATABASE_URL)
    try {
        const { name, email, password } = await req.json()

        // Validation
        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            )
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: "Password must be at least 8 characters" },
                { status: 400 }
            )
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return NextResponse.json(
                { error: "An account with this email already exists" },
                { status: 400 }
            )
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12)

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: "user",
            },
        })

        return NextResponse.json(
            {
                message: "Account created successfully",
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                },
            },
            { status: 201 }
        )
    } catch (error: any) {
        console.error("Registration error details:", {
            message: error.message,
            code: error.code,
            meta: error.meta,
            stack: error.stack
        })

        // Check for specific Prisma errors
        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: "An account with this email already exists" },
                { status: 400 }
            )
        }

        return NextResponse.json(
            {
                error: "An error occurred during registration",
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        )
    }
}
