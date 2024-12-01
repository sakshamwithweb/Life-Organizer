import { Commitment } from "@/lib/model/commitment";
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

            const filteredData = prevDayData.data.find(item => item.date.toISOString() === prevDay.toISOString());

            if (!filteredData) return NextResponse.json({ success: false });
            const simplifiedConversation = filteredData.conversation.map(({ text, speaker, is_user }) => ({
                text,
                speaker,
                is_user,
            }));

            const req2 = await fetch(`${process.env.URL}/api/summarize`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    data: simplifiedConversation
                })
            })
            const res2 = await req2.json();
            if (res2.message) {
                filteredData.summary = res2.message;
                await Data.findOneAndUpdate(
                    { uid, "data.date": prevDay },
                    {
                        $set: { "data.$.conversation": filteredData.conversation, "data.$.summary": res2.message },
                    },
                    { new: true }
                );
                const req3 = await fetch(`${process.env.URL}/api/commitment`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        data: simplifiedConversation
                    })
                })
                const res3 = await req3.json();
                if (res3.message && res3.success) {
                    const findCommit = await Commitment.findOne({ uid })
                    if (!findCommit) {
                        const newCommit = new Commitment({
                            uid,
                            commitments: res3.message
                        });
                        await newCommit.save();
                        return NextResponse.json({ success: true, data: newData }, { status: 201 });
                    }
                    res3.message.forEach(commitment => {
                        findCommit.commitments.push(commitment);
                    });
                    await findCommit.save();
                    console.log("commitment made")
                    return NextResponse.json({ success: true, data: newData }, { status: 201 });
                }
                console.log(res3)
                console.log("commitment not made")
                return NextResponse.json({ success: true });
            }
            return NextResponse.json({ success: true, data: newData }, { status: 201 });
        }

        return NextResponse.json({ success: true, data: updatedData }, { status: 200 });
    } catch (error) {
        console.error("Error in POST /api/backend/webhook:", error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}