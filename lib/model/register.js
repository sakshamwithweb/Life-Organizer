import mongoose from "mongoose"; 

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, match: /.+\@.+\..+/ },
  password: { type: String, required: true },
  name:{ type: String, required: true },
  omi_userid:{ type: String, required: true },
});

export const User =
  mongoose.models.users || mongoose.model("users", userSchema);