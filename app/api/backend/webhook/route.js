import { Data } from "@/lib/model/data";
import { User } from "@/lib/model/register"; // Import User model
import connectDb from "@/lib/mongoose";
import { startOfDay } from "date-fns";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        // Connect to the database
        await connectDb();

        // Parse URL and extract 'uid'
        const { searchParams } = new URL(request.url);
        const uid = searchParams.get("uid");

        if (!uid) {
            return NextResponse.json(
                { success: false, message: "Missing 'uid' parameter." },
                { status: 400 }
            );
        }

        // Fetch the user and their timezone
        const findUser = await User.findOne({ uid: uid });
        if (!findUser) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }
        const userTimeZone = findUser.timeZone || "UTC"; // Default to UTC if timeZone is not set
        console.log("User TimeZone:", userTimeZone);

        // Parse and validate request body
        const body = await request.json();
        const { segments } = body;

        if (!segments) {
            return NextResponse.json(
                { success: false, message: "Missing 'segments' in request body." },
                { status: 400 }
            );
        }

        // Calculate the start of today in the user's timezone using Intl.DateTimeFormat
        const now = new Date();
        const startOfTodayInTimeZone = new Date(
            new Intl.DateTimeFormat("en-US", {
                timeZone: userTimeZone,
                year: "numeric",
                month: "numeric",
                day: "numeric",
            }).format(now)
        );
        console.log("Start of Today (User TimeZone):", startOfTodayInTimeZone);

        // Determine if 'segments' is an array
        const isSegmentsArray = Array.isArray(segments);

        // Prepare the conversation data to be pushed
        const conversationData = isSegmentsArray ? { $each: segments } : segments;

        // Attempt to find and update the document atomically
        const updatedData = await Data.findOneAndUpdate(
            { uid, "data.date": startOfTodayInTimeZone },
            {
                // Use $each if segments is an array to prevent nested arrays
                $push: { "data.$.conversation": conversationData },
            },
            { new: true }
        );

        if (!updatedData) {
            // If today's data doesn't exist, push a new entry
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
