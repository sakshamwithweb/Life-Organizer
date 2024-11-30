import { Otp } from "@/lib/model/otp";
import connectDb from "@/lib/mongoose";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { uid, otp, email, password, name, omi_userid } = await req.json();
        await connectDb();
        const check = await Otp.findOne({ uid: uid })
        if (!check) return NextResponse.json({ message: "Error verifying OTP", success: false })
        if (check.otp != otp) return NextResponse.json({ message: "Invalid OTP", success: false });
        if(check.time < Date.now() - 300000){
            await Otp.deleteOne({ uid: uid });
            return NextResponse.json({ message: "OTP expired, Reload page", success: false })
        }
        await Otp.deleteOne({ uid: uid });
        const req1 = await fetch(`${process.env.URL}/api/enter/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email, password, name, omi_userid
            })
        });

        const res = await req1.json();

        if (!res.success) return NextResponse.json({ message: "Error registring user", success: false })
        return NextResponse.json({ message: "User registered successfully", success: true })
    } catch (error) {
        return NextResponse.json({ message: "Error verifying OTP", success: false })
    }
}