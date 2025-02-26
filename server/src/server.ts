import express, { Application } from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import mongoose from "mongoose";
import path from "node:path";
import dotenv from "dotenv";
import typeDefs from "./schemas/typeDefs";
import resolvers from "./schemas/resolvers";
import { authContext } from "./services/auth"; // ✅ Use the updated function

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

async function startServer() {
  await server.start();

  // Debugging log to confirm Apollo middleware is applied
  app.use(
    "/graphql",
    (req, res, next) => {
      console.log("📌 Apollo Server Middleware is being called"); // Debugging log
      next();
    },
    expressMiddleware(server, { context: authContext })
  ); // ✅ Ensure it's async

  mongoose
    .connect(process.env.MONGODB_URI || "mongodb://localhost/googlebooks")
    .then(() => {
      console.log("🚀 Connected to MongoDB");
      app.listen(PORT, () => {
        console.log(`🌍 Server running at http://localhost:${PORT}/graphql`);
      });
    })
    .catch((error) => console.error("❌ MongoDB Connection Error:", error));
}

// Serve static assets in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));
}

startServer();
