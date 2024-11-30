import { Data } from "@/lib/model/data";
import connectDb from "@/lib/mongoose";
import { NextResponse } from "next/server";
import { startOfToday } from "date-fns"; // Utility for date manipulation

export async function POST(request) {
    try {
        // Connect to the database
        await connectDb();

        // Parse URL and extract 'uid'
        const { searchParams } = new URL(request.url);
        const uid = searchParams.get('uid');

        if (!uid) {
            return NextResponse.json(
                { success: false, message: "Missing 'uid' parameter." },
                { status: 400 }
            );
        }

        // Parse and validate request body
        const body = await request.json();
        const { segments } = body;

        if (!segments) {
            return NextResponse.json(
                { success: false, message: "Missing 'segments' in request body." },
                { status: 400 }
            );
        }

        // Define the start of today for date comparison
        const today = startOfToday();

        // Attempt to find and update the document atomically
        const updatedData = await Data.findOneAndUpdate(
            { uid, "data.date": today },
            {
                $push: { "data.$.conversation": segments },
            },
            { new: true }
        );

        if (!updatedData) {
            // If today's data doesn't exist, push a new entry
            const newData = await Data.findOneAndUpdate(
                { uid },
                {
                    $push: { data: { date: today, conversation: [segments] } },
                },
                { new: true, upsert: true }
            );

            return NextResponse.json({ success: true, data: newData }, { status: 201 });
        }

        return NextResponse.json({ success: true, data: updatedData }, { status: 200 });
    } catch (error) {
        console.error("Error in POST https://life-organizer-eta.vercel.app/api/backend/webhook:", error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error." },
            { status: 500 }
        );
    }
}