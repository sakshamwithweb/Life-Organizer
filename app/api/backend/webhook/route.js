import { Data } from "@/lib/model/data";
import connectDb from "@/lib/mongoose";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const { searchParams } = new URL(request.url);
        const uid = searchParams.get('uid');
        const body = await request.json();
        console.log(body)
        const { transcript_segments } = body;
        console.log(transcript_segments, uid)
        await connectDb()
        //Find the data 
        const findData = await Data.findOne({ uid: uid })
        if (!findData) {
            const newData = new Data({
                uid: uid,
                data: [{ date: new Date(), conversation: [transcript_segments] }]
            })
            await newData.save()
            return NextResponse.json({ success: true })
        } else {
            //Here check whether today's data is present or not
            const todayData = findData.data.find((item) => item.date.toDateString() === new Date().toDateString())
            if (!todayData) {
                //if not find, make and push
                findData.data.push({ date: new Date(), conversation: [transcript_segments] })
                await findData.save()
                return NextResponse.json({ success: true })
            } else {
                //else push only the transcript
                todayData.conversation.push(transcript_segments)
                await findData.save()
                return NextResponse.json({ success: true })
            }
        }
    } catch (error) {
        return NextResponse.json({ success: false })
    }
}