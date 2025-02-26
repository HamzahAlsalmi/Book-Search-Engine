import { AuthenticationError } from "apollo-server-express";
import User, { IUser } from "../models/User"; // ✅ Ensure IUser is imported
import { signToken } from "../services/auth";

const resolvers = {
  Query: {
    me: async (
      _parent: any,
      _args: any,
      context: { user?: { _id: string } }
    ) => {
      console.log("🔍 Full context:", context); // Log the full context to verify if user data is being passed

      if (context.user) {
        console.log("✅ User found in context:", context.user); // Log user data
        return await User.findById(context.user._id); // Fetch user from DB
      }
      console.log("❌ No user found in context");
      throw new AuthenticationError("Not logged in");
    },
  },

  Mutation: {
    login: async (
      _parent: any,
      { email, password }: { email: string; password: string }
    ) => {
      console.log("🔍 Login Attempt:", email); // ✅ Debugging log

      const user: IUser | null = await User.findOne({ email });

      if (!user) {
        console.log("❌ User not found in DB");
        throw new AuthenticationError("Incorrect credentials");
      }

      console.log("✅ User found:", user.username);
      console.log("🔍 Hashed Password in DB:", user.password);
      console.log("🔍 Plain Password Entered:", password);

      // ✅ Ensure `isCorrectPassword` function exists
      if (!user.isCorrectPassword) {
        console.error("❌ isCorrectPassword function missing in User model");
        throw new AuthenticationError("Internal error");
      }

      // ✅ Debug: Check password comparison
      const isMatch = await user.isCorrectPassword(password);
      console.log("🔍 Password Match Result:", isMatch);

      if (!isMatch) {
        console.log("❌ Incorrect password");
        throw new AuthenticationError("Incorrect credentials");
      }

      console.log("✅ Password match, generating token...");
      const userId = user._id.toString();
      const token = signToken(user.username, user.email, userId);

      return { token, user };
    },

    addUser: async (
      _parent: any,
      {
        username,
        email,
        password,
      }: { username: string; email: string; password: string }
    ) => {
      console.log("🔍 Creating new user:", username, email);

      const user: IUser = await User.create({ username, email, password });

      const userId = user._id.toString();
      const token = signToken(user.username, user.email, userId);

      console.log("✅ User created successfully:", user.username);

      return { token, user };
    },

    saveBook: async (
      _parent: any,
      { book }: { book: any },
      context: { user?: { _id: string } }
    ) => {
      if (context.user) {
        console.log(`📚 Saving book for user ${context.user._id}:`, book);
        return await User.findByIdAndUpdate(
          context.user._id,
          { $addToSet: { savedBooks: book } },
          { new: true, runValidators: true }
        );
      }
      throw new AuthenticationError("Not logged in");
    },

    removeBook: async (
      _parent: any,
      { bookId }: { bookId: string },
      context: { user?: { _id: string } }
    ) => {
      if (context.user) {
        console.log(`🗑 Removing book for user ${context.user._id}:`, bookId);
        return await User.findByIdAndUpdate(
          context.user._id,
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        );
      }
      throw new AuthenticationError("Not logged in");
    },
  },
};

export default resolvers;
