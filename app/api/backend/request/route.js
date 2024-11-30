import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { User } from '@/lib/model/register';
import { Skill } from '@/lib/model/skill';
import { OpenAI } from 'openai';
import { Summary } from '@/lib/model/summary';

const mongoURI = process.env.MONGODB_URI;

if (!mongoose.connection.readyState) {
    mongoose.connect(mongoURI).then(() => {
        console.log('Connected to MongoDB');
    }).catch(err => {
        console.error('MongoDB connection error:', err);
    });
}

const openai = new OpenAI({
    apiKey: process.env.OpenAI,
});

export async function POST(request) {
    try {
        const { searchParams } = new URL(request.url);
        const uid = searchParams.get('uid');
        const body = await request.json();
        const { transcript_segments } = body;
        console.log(transcript_segments)

        const user = await User.findOne({ omi_userid: uid });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const skill = await Skill.findOne({ email: user.email });
        if (!skill) {
            return NextResponse.json({ error: 'User has set no skill' }, { status: 404 });
        }

        const findSummary = await Summary.findOne({ email: user.email });
        let currentSummary;
        if (!findSummary) {
            const summary = new Summary({ email: user.email, summary: "empty" });
            await summary.save();
            currentSummary = "";
        } else {
            currentSummary = findSummary.summary;
        }

        const prompt = `
You are a skilled mentor dedicated to helping individuals refine specific skills by analyzing their conversations and historical context. 
I am ${user.name}, and here is my background: 
- My goal is to develop the following skills and emulate these role models: ${skill.skills.map(skill => `${skill.key} like ${skill.value}`).join(", ")}. 
To provide the best guidance, consider this summary of previous advice and feedback I’ve received: 
"${currentSummary}" 
Below is a transcription of a recent conversation I participated in: 
"${JSON.stringify(transcript_segments)}" 
Based on the transcription, my skill development goals, and the historical summary:
1. Provide a concise and actionable piece of advice (maximum 20 words) tailored to align my skills with those of the role models, even if it involves hard truths or criticism. Ensure the advice is clear and actionable enough to serve as a notification and the words should be familiar. 
2. If no actionable advice is relevant or necessary, reply with only the word: "false". 
Your response must be plain text, without markdown, bullet points, or additional formatting.
`;

        const chatCompletion = await openai.chat.completions.create({
            messages: [
                { role: 'system', content: "Provide all responses in plain text only no md of any formate. Respond with the exact content requested, avoiding additional context or preamble." },
                {
                    role: 'user',
                    content: prompt
                }

            ],
            model: 'gpt-3.5-turbo',
        });
        console.log(prompt)
        console.log(chatCompletion.choices[0].message.content)

        if (chatCompletion.choices[0].message.content && chatCompletion.choices[0].message.content !== "false") {
            const latestAdvice = chatCompletion.choices[0].message.content;

            const updateSummaryCompletion = await openai.chat.completions.create({
                messages: [
                    { role: 'system', content: "Provide all responses in plain text only. Respond with the exact content requested, avoiding additional context or preamble." },
                    {
                        role: 'user',
                        content: `You are an AI assistant tasked with updating summaries to reflect new advice. 
                Here is the current summary of previous suggestions and feedback:
                "${currentSummary}"
                Below is the latest advice provided:
                "${latestAdvice}"
                Update the summary by incorporating the latest advice. Write in a concise manner, like a memory log, with clear, actionable notes. 
                Ensure your response is in plain text with no markdown, bullet points, or additional formatting.`
                    }
                ],
                model: 'gpt-3.5-turbo',
            });
            const updatedSummary = updateSummaryCompletion.choices[0].message.content;
            console.log(updatedSummary)
            const updated = await Summary.findOneAndUpdate({ email: user.email }, { summary: updatedSummary });
            await updated.save();
            return NextResponse.json({
                success: true,
                message: latestAdvice,
            })
        } else {
            return NextResponse.json({
                success: false,
            })
        }
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
