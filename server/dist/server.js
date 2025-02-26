"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const server_1 = require("@apollo/server");
const express4_1 = require("@apollo/server/express4");
const mongoose_1 = __importDefault(require("mongoose"));
const node_path_1 = __importDefault(require("node:path"));
const dotenv_1 = __importDefault(require("dotenv"));
const typeDefs_1 = __importDefault(require("./schemas/typeDefs"));
const resolvers_1 = __importDefault(require("./schemas/resolvers"));
const auth_1 = require("./services/auth"); // ✅ Use the updated function
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
const server = new server_1.ApolloServer({
    typeDefs: typeDefs_1.default,
    resolvers: resolvers_1.default,
});
async function startServer() {
    await server.start();
    // Debugging log to confirm Apollo middleware is applied
    app.use("/graphql", (req, res, next) => {
        console.log("📌 Apollo Server Middleware is being called"); // Debugging log
        next();
    }, (0, express4_1.expressMiddleware)(server, { context: auth_1.authContext })); // ✅ Ensure it's async
    mongoose_1.default
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
    app.use(express_1.default.static(node_path_1.default.join(__dirname, "../client/build")));
}
startServer();
