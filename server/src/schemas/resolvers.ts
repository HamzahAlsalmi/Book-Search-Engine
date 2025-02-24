import { AuthenticationError } from "apollo-server-express";
import User, { IUser } from "../models/User.js"; // ✅ Ensure IUser is imported
import { signToken } from "../services/auth.js";

const resolvers = {
  Query: {
    me: async (
      _parent: any,
      _args: any,
      context: { user?: { _id: string } }
    ) => {
      if (context.user) {
        return await User.findById(context.user._id);
      }
      throw new AuthenticationError("Not logged in");
    },
  },

  Mutation: {
    login: async (
      _parent: any,
      { email, password }: { email: string; password: string }
    ) => {
      const user: IUser | null = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError("Incorrect credentials");
      }

      // ✅ Explicitly check `isCorrectPassword`
      const isMatch = await user.isCorrectPassword(password);
      if (!isMatch) {
        throw new AuthenticationError("Incorrect credentials");
      }

      // ✅ Fix `_id` unknown error
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
      const user: IUser = await User.create({ username, email, password });

      const userId = user._id.toString();
      const token = signToken(user.username, user.email, userId);

      return { token, user };
    },

    saveBook: async (
      _parent: any,
      { book }: { book: any },
      context: { user?: { _id: string } }
    ) => {
      if (context.user) {
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
