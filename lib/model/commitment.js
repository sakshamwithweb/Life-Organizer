

import mongoose from "mongoose";

const commitmentSchema = new mongoose.Schema({
    uid: { type: String, required: true, unique: true },
    commitments: { type: Array, required: true }
})

export const Commitment =
    mongoose.models.commits || mongoose.model("commits", commitmentSchema);