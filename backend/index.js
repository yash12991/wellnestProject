import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import connectDB from './src/config/db.js';

// Routes
import mealplanRoutes from './src/routes/mealplan_routes.js';
import messageRoutes from './src/routes/message_routes.js';
import chatRoutes from './src/routes/chat_routes.js';
import authRoutes from './src/routes/user.routes.js';
import ecommerceRoutes from './src/routes/ecommerce.routes.js'; // <-- new
import productRoutes from "./src/routes/productRoutes.js";

import path from "path";
import { fileURLToPath } from "url";

// Needed because __dirname is not defined in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();


// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

// Base routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Wellnest API' });
});

// Simple DB health endpoint
app.get('/health/db', (_req, res) => {
  const stateNames = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const state = mongoose.connection?.readyState ?? 0;
  res.json({ status: stateNames[state] || String(state) });
});

// API Routes
app.use('/v1/api/mealplan', mealplanRoutes);
app.use('/v1/api/message', messageRoutes);
app.use('/v1/api/chat', chatRoutes);
app.use('/v1/api/auth', authRoutes);
import favouritesRouter from "./src/routes/favourites.routes.js";
app.use("/v1/api", favouritesRouter);

// **E-commerce routes**
app.use('/v1/api/ecommerce', ecommerceRoutes);
app.use("/api/products", productRoutes);

// Start server when not running as a Vercel serverless function
const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
