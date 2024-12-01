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
                    content: "You are a helpful assistant who extracts the commitment from the conversations done today. You write plain text, No formatting.",
                },
                {
                    role: "user", content: `Today is ${new Date().toDateString()}.Extract all commitments from the following text. For each identified commitment, create an array of objects with the following structure: [{ dueOn: "deadline", title: "string" }, { dueOn: "deadline", title: "string" }]. If no commitments are found in the text, return the message Null. Do not use any formatting like Markdown or special characters, just plain text.EIther give a plain array or Null , nothing else ,not even a space.\nConversations:${JSON.stringify(data)}`
                },
            ],
            model: "gpt-4",
        });

        const commitment = completion.choices[0]?.message?.content

        console.log(commitment)

        if (!commitment) {
            throw new Error("Commitment generation failed.");
        }
        if (commitment.trim().toLowerCase() == "null") return NextResponse.json({ message: "No commitments found.", success: false });
        return NextResponse.json({ message: JSON.parse(commitment), success: true });
    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json({ error: "An unexpected error occurred." + error }, { status: 500 });
    }
}
