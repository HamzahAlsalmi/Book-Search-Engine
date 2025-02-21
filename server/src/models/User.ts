import mongoose, { Document, Schema, Model } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Define User Interface
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId; // ✅ Use ObjectId type instead of string
  username: string;
  email: string;
  password: string;
  savedBooks: Array<{ bookId: string; title: string; authors: string[] }>;
  isCorrectPassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
}

// Define Schema
const UserSchema: Schema<IUser> = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  savedBooks: [
    {
      bookId: { type: String, required: true },
      title: { type: String, required: true },
      authors: [{ type: String }],
    },
  ],
});

// Hash password before saving
UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ✅ Rename `comparePassword` to `isCorrectPassword`
UserSchema.methods.isCorrectPassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ✅ Generate Auth Token (convert `_id` to string)
UserSchema.methods.generateAuthToken = function (): string {
  return jwt.sign(
    { id: this._id.toString(), email: this.email, username: this.username }, // ✅ Convert `_id` to string
    process.env.JWT_SECRET || "default_secret",
    {
      expiresIn: "1h",
    }
  );
};

// Create User Model
const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);

export default User;
