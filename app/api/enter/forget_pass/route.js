import { NextResponse } from "next/server"

export async function POST(req) {
    try {
        const { email } = await req.json();
        console.log(process.env.URL)
        const req1 = await fetch(`${process.env.URL}/api/getUserData`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email
            })
        });
        
        const res1 = await req1.json();

        const req2 = await fetch(`${process.env.URL}/api/sendEmail`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                to: email,
                subject: "Reset Password",
                text: `You are receiving this because you have requested the password for your account.\n\nPassword - ${res1.user.password}\n\nIf you did not request this, please ignore this email and delete\n\nThank you for using our app!`
            })
        });

        const res2 = await req2.json();

        return NextResponse.json({ data: res2, message: "Email sent successfully", success: true });
    } catch (error) {
        return NextResponse.json({ message: "Error sending email", error: error.message, success: false });
    }
}
