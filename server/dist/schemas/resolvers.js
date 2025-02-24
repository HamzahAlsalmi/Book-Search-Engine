import { AuthenticationError } from "apollo-server-express";
import User from "../models/User.js"; // ✅ Ensure IUser is imported
import { signToken } from "../services/auth.js";
const resolvers = {
    Query: {
        me: async (_parent, _args, context) => {
            if (context.user) {
                return await User.findById(context.user._id);
            }
            throw new AuthenticationError("Not logged in");
        },
    },
    Mutation: {
        login: async (_parent, { email, password }) => {
            const user = await User.findOne({ email });
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
        addUser: async (_parent, { username, email, password, }) => {
            const user = await User.create({ username, email, password });
            const userId = user._id.toString();
            const token = signToken(user.username, user.email, userId);
            return { token, user };
        },
        saveBook: async (_parent, { book }, context) => {
            if (context.user) {
                return await User.findByIdAndUpdate(context.user._id, { $addToSet: { savedBooks: book } }, { new: true, runValidators: true });
            }
            throw new AuthenticationError("Not logged in");
        },
        removeBook: async (_parent, { bookId }, context) => {
            if (context.user) {
                return await User.findByIdAndUpdate(context.user._id, { $pull: { savedBooks: { bookId } } }, { new: true });
            }
            throw new AuthenticationError("Not logged in");
        },
    },
};
export default resolvers;
