import mongoose from "mongoose";

const skillSchema = new mongoose.Schema({
    email: { type: String, required: true },
    skills: { type: Array, required: true },
})

export const Skill =
    mongoose.models.skills || mongoose.model("skills", skillSchema);