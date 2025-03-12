import { AuthenticationError } from 'apollo-server-errors';
import User from '../models/User.js';
import { signToken } from '../services/auth.js';

interface BookInput {
  bookId: string;
  authors?: string[];
  description?: string;
  title: string;
  image?: string;
  link?: string;
}

interface ContextType {
  user?: { _id: string };
}

export const resolvers = {
  Query: {
    me: async (_parent: unknown, _args: unknown, context: ContextType) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in!');
      }
      return User.findById(context.user._id);
    },
  },

  Mutation: {
    addUser: async (
      _parent: unknown,
      { username, email, password }: { username: string; email: string; password: string }
    ) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user.username, user.email, String(user._id)); // Ensure _id is a string
      return { token, user };
    },

    login: async (_parent: unknown, { email, password }: { email: string; password: string }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError("Can't find this user");
      }

      const correctPw = await user.isCorrectPassword(password);
      if (!correctPw) {
        throw new AuthenticationError('Wrong password!');
      }

      const token = signToken(user.username, user.email, String(user._id)); // Ensure _id is a string
      return { token, user };
    },

    saveBook: async (_parent: unknown, { book }: { book: BookInput }, context: ContextType) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to save books!');
      }

      return User.findByIdAndUpdate(
        context.user._id,
        { $addToSet: { savedBooks: book } },
        { new: true, runValidators: true }
      );
    },

    removeBook: async (_parent: unknown, { bookId }: { bookId: string }, context: ContextType) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to remove books!');
      }

      return User.findByIdAndUpdate(
        context.user._id,
        { $pull: { savedBooks: { bookId } } },
        { new: true }
      );
    },
  },
};
