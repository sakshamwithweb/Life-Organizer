import { Commitment } from "@/lib/model/commitment";
import { Data } from "@/lib/model/data";
import { User } from "@/lib/model/register";
import connectDb from "@/lib/mongoose";
import { NextResponse } from "next/server";

async function findUserByUid(uid) {
    const user = await User.findOne({ omi_userid: uid });
    if (!user) throw new Error("User not found");
    return user;
}

function getStartOfTodayInTimeZone(timeZone) {
    const now = new Date();
    return new Date(
        new Intl.DateTimeFormat("en-US", {
            timeZone,
            year: "numeric",
            month: "numeric",
            day: "numeric",
        }).format(now)
    );
}

async function fetchSummary(data) {
    const response = await fetch(`${process.env.URL}/api/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
    });
    const result = await response.json();
    return result.message || null;
}

async function fetchCommitments(data) {
    const response = await fetch(`${process.env.URL}/api/commitment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
    });
    const result = await response.json();
    if (result.success) return result.message;
    throw new Error("Failed to fetch commitments");
}

async function handleNewData(uid, date, segments) {
    const newData = await Data.findOneAndUpdate(
        { uid },
        {
            $push: { data: { date, conversation: segments } },
        },
        { new: true, upsert: true }
    );
    return newData;
}

async function processPreviousDayData(uid, previousDate) {
    const prevDayData = await Data.findOne({
        uid,
        "data.date": previousDate,
    });

    if (!prevDayData) return null;

    const filteredData = prevDayData.data.find(
        (item) => item.date.toISOString() === previousDate.toISOString()
    );

    if (!filteredData) return null;

    const simplifiedConversation = filteredData.conversation.map(({ text, speaker, is_user }) => ({
        text,
        speaker,
        is_user,
    }));

    const summary = await fetchSummary(simplifiedConversation);

    if (summary) {
        filteredData.summary = summary;
        await Data.findOneAndUpdate(
            { uid, "data.date": previousDate },
            {
                $set: { "data.$.summary": summary },
            },
            { new: true }
        );

        const commitments = await fetchCommitments(simplifiedConversation);

        const existingCommitments = await Commitment.findOne({ uid });

        if (!existingCommitments) {
            const newCommitment = new Commitment({ uid, commitments });
            await newCommitment.save();
        } else {
            commitments.forEach((commitment) => existingCommitments.commitments.push(commitment));
            await existingCommitments.save();
        }
    }
}

export async function POST(request) {
    try {
        await connectDb();

        const { searchParams } = new URL(request.url);
        const uid = searchParams.get("uid");

        if (!uid) return NextResponse.json({ success: false, message: "Missing 'uid' parameter." }, { status: 400 });

        const user = await findUserByUid(uid);
        const userTimeZone = user.timeZone || "UTC";

        const body = await request.json();
        const { segments } = body;

        if (!segments) {
            return NextResponse.json({ success: false, message: "Missing 'segments' in request body." }, { status: 400 });
        }

        const startOfToday = getStartOfTodayInTimeZone(userTimeZone);

        const updatedData = await Data.findOneAndUpdate(
            { uid, "data.date": startOfToday },
            { $push: { "data.$.conversation": { $each: segments } } },
            { new: true }
        );

        if (!updatedData) {
            const newData = await handleNewData(uid, startOfToday, segments);
            const prevDay = new Date(startOfToday);
            prevDay.setDate(prevDay.getDate() - 1);
            await processPreviousDayData(uid, prevDay);
            return NextResponse.json({ success: true, data: newData }, { status: 201 });
        }

        return NextResponse.json({ success: true, data: updatedData }, { status: 200 });
    } catch (error) {
        console.error("Error in POST /api/backend/webhook:", error.message);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
