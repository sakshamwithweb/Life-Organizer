import { Data } from "@/lib/model/data";
import { User } from "@/lib/model/register";
import connectDb from "@/lib/mongoose";
import { NextResponse } from "next/server";



export async function POST(req) {
    try {
        const { email } = await req.json();
        console.log(email)
        await connectDb()
        const find1 = await User.findOne({ email: email });
        if (!find1) return NextResponse.json({ message: "User not found" })
        const find2 = await Data.findOne({ uid: find1.omi_userid });
        if (!find2) return NextResponse.json({ message: "User not found" })
        console.log(find2)
        return NextResponse.json({ message: "Help page" });
    } catch (error) {
        return NextResponse.json({ message: "Error" })
    }
}