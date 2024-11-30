import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req) {
    try {
        const { to, subject, text } = await req.json();

        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            secure: false,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });

        const info = await transporter.sendMail({
            from: process.env.MAIL_USER,
            to: to,
            subject: subject,
            text: text,
        });

        return NextResponse.json({ message: 'Email sent successfully', success: true })
    } catch (error) {
        return NextResponse.json({ message: 'Error sending email', error: error.message, success: false })
    }
}
