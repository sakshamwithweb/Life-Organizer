import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req) {
    try {
        const { data } = await req.json();

        if (!data) {
            throw new Error("No data provided.");
        }

        const openai = new OpenAI({
            apiKey: process.env.OPENAI,
        });

        if (!process.env.OPENAI) {
            throw new Error("OpenAI API key is missing.");
        }

        const completion = await openai.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant who summarizes the day based on the conversations done that day. You write plain text, No formatting.",
                },
                { role: "user", content: `Summarize the following in short detailed 1 paragraph:\n${JSON.stringify(data)}` },
            ],
            model: "gpt-4",
        });

        const summary = completion.choices[0]?.message?.content

        if (!summary) {
            throw new Error("Summary generation failed.");
        }
        return NextResponse.json({ message: summary });
    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json({ error: "An unexpected error occurred." + error }, { status: 500 });
    }
}
