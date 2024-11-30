import mongoose from "mongoose";

const summarySchema = new mongoose.Schema({
    email: { type: String, required: true},
    summary: { type: String, required: true},
})

export const Summary =
    mongoose.models.summaries || mongoose.model("summaries", summarySchema);