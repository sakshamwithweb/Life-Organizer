import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
    uid: { type: String, required: true, unique: true },
    otp: { type: Number, required: true },
    time: { type: Date, required: true, default: Date.now },
})

export const Otp =
    mongoose.models.otps || mongoose.model("otps", otpSchema);