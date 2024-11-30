import { Data } from "@/lib/model/data";
import { User } from "@/lib/model/register";
import connectDb from "@/lib/mongoose";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email } = await req.json();
    await connectDb();

    const user = await User.findOne({ email: email });
    if (!user) return NextResponse.json({ message: "User not found" });

    const userData = await Data.findOne({ uid: user.omi_userid });
    if (!userData) return NextResponse.json({ message: "No data found for user" });

    return NextResponse.json({ message: "Help page", data: userData.data });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json({ message: "Error fetching data", success: false });
  }
}
