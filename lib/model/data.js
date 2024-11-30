
import mongoose from "mongoose";

const dataSchema = new mongoose.Schema({
    uid: { type: String, required: true, unique: true },
    data: { type: Array , required: true }
})

export const Data =
    mongoose.models.datas || mongoose.model("datas", dataSchema);