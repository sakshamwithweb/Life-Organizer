import { User } from "@/lib/model/register";
import connectDb from "@/lib/mongoose";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { email, password, name, omi_userid } = await req.json();
        
        await connectDb();

        const newUser = new User({
            email,
            password,
            name,
            omi_userid,
        });

        await newUser.save();

        return NextResponse.json({
            success: true,
            message: "User signed up successfully",
        });
    } catch (error) {
        console.error("Error in user sign up:", error);
        return NextResponse.json({
            success: false,
            message: "Error signing up user, contact to team : websaksham39@gmail.com",
        });
    }
}