import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import serverless from 'serverless-http';

import { connectMongoDB } from '../config/mongodb';
import { connectRedis } from '../config/redis';
import { registerToolRoutes } from '../routes/tools';

// Load environment variables
dotenv.config();

const app = express();
app.use(bodyParser.json());

// Connect to databases
connectMongoDB();
connectRedis();

// Register routes
registerToolRoutes(app);

// Only listen locally if not in serverless (i.e., local dev)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🔧 MCP Server running locally on http://localhost:${PORT}`);
  });
}

// ✅ Export serverless handler for Vercel
export const handler = serverless(app);
