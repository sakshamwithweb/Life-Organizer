import { User } from "@/lib/model/register";
import connectDb from "@/lib/mongoose";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { email } = await req.json();

        await connectDb();

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return NextResponse.json({
                success: false,
                message: "Email already exists, please use a different one",
            });
        }
        const req1 = await fetch(`${process.env.URL}/api/enter/send_otp`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email
            })
        })
        const res = await req1.json()
        
        if (!res.success) {
            console.error(res);
            return NextResponse.json({ success: false, message: "Error signing up user, contact to team : websaksham39@gmail.com" })
        }

        return NextResponse.json({
            success: true,
            message: "Otp sent successfully",
            uid: res.uid
        });
    } catch (error) {
        console.error("Error in user sign up:", error);
        return NextResponse.json({
            success: false,
            message: "Error signing up user, contact to team : websaksham39@gmail.com",
        });
    }
}