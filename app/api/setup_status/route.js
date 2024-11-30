import { User } from "@/lib/model/register";
import connectDb from "@/lib/mongoose";
import { NextResponse } from "next/server";

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get('uid');
    await connectDb()
    const find = await User.findOne({ omi_userid: uid })
    if (find) {
        return NextResponse.json({ success: true, is_setup_completed: true })
    }
    return NextResponse.json({ success: false })
}