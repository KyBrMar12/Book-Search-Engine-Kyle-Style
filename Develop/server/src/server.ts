import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import mongoose from 'mongoose';
import { json } from 'express';
import dotenv from 'dotenv';

import { typeDefs, resolvers } from './schemas/index.js';
import { context } from './services/auth.js';

dotenv.config({ path: './.env' });

const app = express();
const PORT = process.env.PORT || 3001;
const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/googlebooks';

// Apollo Server Setup
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const startApolloServer = async () => {
  try {
    await server.start();
    console.log('✅ Apollo Server started successfully.');

    app.use(json());
    app.use(cors());

    // Apply Apollo Middleware
    app.use('/graphql', expressMiddleware(server, { context }));

    console.log('🟡 Attempting to connect to MongoDB...');

    // Ensure MongoDB connection works just like in test-db.js
    mongoose
      .connect(mongoURI)
      .then(() => {
        console.log('✅ MongoDB connected successfully.');
        app.listen(PORT, () => {
          console.log(`🚀 Server running on http://localhost:${PORT}/graphql`);
        });
      })
      .catch((err) => {
        console.error('❌ MongoDB connection error:', err);
      });

  } catch (error) {
    console.error('❌ Error starting Apollo Server:', error);
  }
};

startApolloServer();
