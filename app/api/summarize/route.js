import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req) {
    try {
        const { data } = await req.json();

        if (!data) {
            return NextResponse.json({ error: "No transcription data provided." }, { status: 400 });
        }

        const openai = new OpenAI({
            apiKey: process.env.OPENAI,
        });

        if (!process.env.OPENAI) {
            return NextResponse.json({ error: "OpenAI API key is missing." }, { status: 500 });
        }

        const completion = await openai.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant who summarizes the day based on the conversations done that day. You write plain text, No formatting.",
                },
                { role: "user", content: `Summarize the following in short but detailed:\n${data}` },
            ],
            model: "gpt-4",
        });

        const summary = completion.choices[0]?.message?.content;

        if (!summary) {
            return NextResponse.json({ error: "Failed to generate summary." }, { status: 500 });
        }

        console.log(summary);
        return NextResponse.json({ message: summary });
    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json({ error: "An unexpected error occurred."+error }, { status: 500 });
    }
}
