"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const body_parser_1 = __importDefault(require("body-parser"));
const serverless_http_1 = __importDefault(require("serverless-http"));
const mongodb_1 = require("../config/mongodb");
const redis_1 = require("../config/redis");
const tools_1 = require("../routes/tools");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
// Connect to databases
(0, mongodb_1.connectMongoDB)();
(0, redis_1.connectRedis)();
// Register routes
(0, tools_1.registerToolRoutes)(app);
// Only listen locally if not in serverless (i.e., local dev)
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🔧 MCP Server running locally on http://localhost:${PORT}`);
    });
}
// ✅ Export serverless handler for Vercel
exports.handler = (0, serverless_http_1.default)(app);
