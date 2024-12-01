import { Commitment } from "@/lib/model/commitment";
import connectDb from "@/lib/mongoose";

export async function POST(req) {
    try {
        const { uid } = await req.json();
        await connectDb()
        const find = await Commitment.findOne({ uid: uid })
        if (!find) return NextResponse.json({ success: false })
        return NextResponse.json({ success: true, commitments: find.commitments })
    } catch (error) {
        return NextResponse.json({ success: false })
    }
}