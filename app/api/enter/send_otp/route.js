import { Otp } from "@/lib/model/otp";
import connectDb from "@/lib/mongoose";
import { NextResponse } from "next/server";
import uuid4 from "uuid4";

export async function POST(req) {
    try {
        const { email } = await req.json();
        const otp = Math.floor(100000 + Math.random() * 999999);
        const uid = uuid4()
        await connectDb();
        const newOtp = new Otp({
            uid: uid,
            otp: otp
        })
        newOtp.save()
        const req1 = await fetch(`${process.env.URL}/api/sendEmail`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                to: email,
                subject: "OTP Verification for Life Organizer",
                text: `Your OTP is ${otp}\n\nOnly valid for 5 minute\n\nIf you did not request this, please ignore this email and delete\n\nThank you for using Life Organizer!`
            })
        });
        const res = await req1.json()
        if(!res.success) return NextResponse.json({ message: "Error sending OTP", success: false})

        return NextResponse.json({ message: "OTP sent successfully", success: true, uid: uid })
    } catch (error) {
        return NextResponse.json({ message: "Error sending OTP", success: false})
    }
}