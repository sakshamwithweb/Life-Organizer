import { Data } from "@/lib/model/data";
import { User } from "@/lib/model/register";
import connectDb from "@/lib/mongoose";
import { startOfDay } from "date-fns";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        await connectDb();

        const { searchParams } = new URL(request.url);
        const uid = searchParams.get("uid");

        if (!uid) {
            return NextResponse.json(
                { success: false, message: "Missing 'uid' parameter." },
                { status: 400 }
            );
        }

        const findUser = await User.findOne({ omi_userid: uid });
        if (!findUser) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }
        const userTimeZone = findUser.timeZone || "UTC";

        const body = await request.json();
        const { segments } = body;

        if (!segments) {
            return NextResponse.json(
                { success: false, message: "Missing 'segments' in request body." },
                { status: 400 }
            );
        }

        const now = new Date();
        const startOfTodayInTimeZone = new Date(
            new Intl.DateTimeFormat("en-US", {
                timeZone: userTimeZone,
                year: "numeric",
                month: "numeric",
                day: "numeric",
            }).format(now)
        );

        const isSegmentsArray = Array.isArray(segments);
        const conversationData = isSegmentsArray ? { $each: segments } : segments;

        const updatedData = await Data.findOneAndUpdate(
            { uid, "data.date": startOfTodayInTimeZone },
            {
                $push: { "data.$.conversation": conversationData },
            },
            { new: true }
        );

        if (!updatedData) {
            const newConversation = isSegmentsArray ? segments : [segments];
            const newData = await Data.findOneAndUpdate(
                { uid },
                {
                    $push: {
                        data: { date: startOfTodayInTimeZone, conversation: newConversation },
                    },
                },
                { new: true, upsert: true }
            );
            const prevDay = new Date(startOfTodayInTimeZone);
            prevDay.setDate(prevDay.getDate() - 1);

            const prevDayData = await Data.findOne({
                uid,
                "data.date": prevDay,
            });
            if (!prevDayData) return NextResponse.json({ success: false });
            console.log(prevDayData);

            return NextResponse.json({ success: true, data: newData }, { status: 201 });
        }

        return NextResponse.json({ success: true, data: updatedData }, { status: 200 });
    } catch (error) {
        console.error("Error in POST /api/backend/webhook:", error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error." },
            { status: 500 }
        );
    }
}
