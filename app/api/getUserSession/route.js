import { getUserSession } from "@/lib/getUserSession";
import { NextResponse } from "next/server";

export async function GET(req) {
    const userSession = getUserSession(req);

    if (!userSession) {
        return NextResponse.json({ message: "User is not logged in", success: false });
    }

    const { userEmail } = userSession;

    return NextResponse.json({ message: `Welcome back, ${userEmail}`, success: true , email: userEmail});
}
