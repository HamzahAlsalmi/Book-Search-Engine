import { AuthenticationError } from "apollo-server-express";
import User from "../models/User";
import { signToken } from "../services/auth";

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
      const user = await User.findOne({ email });
      if (!user || !(await user.isCorrectPassword(password))) {
        throw new AuthenticationError("Incorrect credentials");
      }
      const token = signToken(user.username, user.email, user._id.toString());
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
      const user = await User.create({ username, email, password });
      const token = signToken(user.username, user.email, user._id.toString());
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
