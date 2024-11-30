import { User } from "@/lib/model/register";
import connectDb from "@/lib/mongoose";
import { NextResponse } from "next/server";

export async function POST(req) {
    const {email} = await req.json();
    await connectDb()
    const user = await User.findOne({email});
    if(user){
        return NextResponse.json({success:true,message:"User found",user:user})
    }
    return NextResponse.json({success:false,message:"User not found"})
}