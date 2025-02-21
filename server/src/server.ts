import express from "express";
import { ApolloServer } from "apollo-server-express";
import mongoose from "mongoose";
import path from "node:path";
import dotenv from "dotenv";
import typeDefs from "./schemas/typeDefs";
import resolvers from "./schemas/resolvers";
import { authMiddleware } from "./services/auth";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Initialize Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => authMiddleware(req), // Pass only req for GraphQL
});

async function startServer() {
  await server.start();
  server.applyMiddleware({ app });

  // MongoDB connection
  mongoose.connect(
    process.env.MONGODB_URI || "mongodb://localhost/googlebooks"
  );

  mongoose.connection.once("open", () => {
    console.log("🚀 Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(
        `🌍 Server running at http://localhost:${PORT}${server.graphqlPath}`
      );
    });
  });
}

// Serve static assets in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));
}

startServer();
