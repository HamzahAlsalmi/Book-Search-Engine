import express from "express";
import { ApolloServer } from "apollo-server-express";
import mongoose from "mongoose";
import path from "node:path";
import dotenv from "dotenv";
import typeDefs from "./schemas/typeDefs.js";
import resolvers from "./schemas/resolvers.js";
import { authMiddleware } from "./services/auth.js";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
        const modifiedReq = authMiddleware(req); // ✅ Ensure it remains a Request
        return { user: modifiedReq?.user || null }; // ✅ Safe access to user
    },
});
async function startServer() {
    await server.start();
    server.applyMiddleware({ app: app }); // ✅ Type override for Apollo
    mongoose
        .connect(process.env.MONGODB_URI || "mongodb://localhost/googlebooks")
        .then(() => {
        console.log("🚀 Connected to MongoDB");
        app.listen(PORT, () => {
            console.log(`🌍 Server running at http://localhost:${PORT}${server.graphqlPath}`);
        });
    })
        .catch((error) => console.error("❌ MongoDB Connection Error:", error));
}
// Serve static assets in production
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../client/build")));
}
startServer();
