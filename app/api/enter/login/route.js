import { encrypt } from "@/lib/encryption";
import { User } from "@/lib/model/register";
import { serialize } from "cookie";
import connectDb from "@/lib/mongoose";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { email, password } = await req.json();

        await connectDb();

        const checkUser = await User.findOne({ email });
        if (!checkUser) {
            return NextResponse.json({ message: "Invalid credentials", success: false });
        }

        if (checkUser.password !== password) {
            return NextResponse.json({ message: "Invalid credentials", success: false });
        }

        const sessionData = JSON.stringify({ userEmail: email, loged: true });
        const encryptedSession = encrypt(sessionData);

        const sessionCookie = serialize("userSession", encryptedSession, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24,
            path: "/",
        });

        const response = NextResponse.json({ message: "Login successful", success: true });
        response.headers.set("Set-Cookie", sessionCookie);
        return response;
    } catch (error) {
        console.error("Error in login handler:", error);
        return NextResponse.json({ message: "Something went wrong", success: false });
    }
}
