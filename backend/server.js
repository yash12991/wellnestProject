// import dotenv from "dotenv";
// import express from "express";
// import mongoose from "mongoose";
// import cors from "cors";
// import userRoutes from "./routes/user.routes.js";

// dotenv.config();

// const app = express();
// app.use(express.json());
// app.use(cors());

// app.use("/api/user", userRoutes);

// app.get("/", (req, res) => {
//     res.send("WellNest Dashboard");
// });

// const PORT = process.env.PORT || 5000;

// mongoose
//     .connect(process.env.MONGODB_URI, {
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//     })
//     .then(() => {
//         console.log("MongoDB connected");
//         app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
//     })
//     .catch((err) => {
//         console.error("Mongo connection error:", err);
//     });

//
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./src/routes/user.routes.js";
import app from "./index.js";
dotenv.config();


const PORT = process.env.PORT || 5000;

mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("MongoDB connected");
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => {
        console.error("Mongo connection error:", err);
    });
