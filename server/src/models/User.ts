import mongoose, { Document, Schema, Model, CallbackError } from "mongoose"; // ✅ Import `CallbackError`
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Define User Interface
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
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

// ✅ Fix Type Error in `pre("save")`
UserSchema.pre<IUser>(
  "save",
  async function (next: (err?: CallbackError) => void) {
    if (!this.isModified("password")) return next();

    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next(); // ✅ Call next() without an error
    } catch (error) {
      console.error("❌ Error hashing password:", error);
      next(error as CallbackError); // ✅ Ensure next() receives a valid error type
    }
  }
);

// ✅ Compare passwords safely
UserSchema.methods.isCorrectPassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error("❌ Error comparing password:", error);
    return false;
  }
};

// ✅ Generate Auth Token
UserSchema.methods.generateAuthToken = function (): string {
  return jwt.sign(
    { id: this._id.toString(), email: this.email, username: this.username },
    process.env.JWT_SECRET || "default_secret",
    { expiresIn: "1h" }
  );
};

// Create User Model
const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);

export default User;
