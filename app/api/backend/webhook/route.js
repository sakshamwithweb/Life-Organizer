import { Data } from "@/lib/model/data";
import connectDb from "@/lib/mongoose";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const { searchParams } = new URL(request.url);
        const uid = searchParams.get('uid');
        const body = await request.json();
        console.log(body)
        const { segments } = body;
        console.log(segments, uid)
        await connectDb()
        //Find the data 
        const findData = await Data.findOne({ uid: uid })
        if (!findData) {
            console.log("new data")
            const newData = new Data({
                uid: uid,
                data: [{ date: new Date(), conversation: [segments] }]
            })
            await newData.save()
            return NextResponse.json({ success: true })
        } else {
            console.log("old data")
            //Here check whether today's data is present or not
            const todayData = findData.data.find((item) => item.date.toDateString() === new Date().toDateString())
            if (!todayData) {
                console.log("today's data not found")
                //if not find, make and push
                findData.data.push({ date: new Date(), conversation: [segments] })
                await findData.save()
                return NextResponse.json({ success: true })
            } else {
                console.log("today's data found")
                //else push only the transcript
                todayData.conversation.push(segments)
                await findData.save()
                return NextResponse.json({ success: true })
            }
        }
    } catch (error) {
        return NextResponse.json({ success: false })
    }
}