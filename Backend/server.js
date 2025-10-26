import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { Sequelize } from "sequelize";
import authRoutes from "./src/routes/auth.js";
import weatherRoutes from "./src/routes/weather.js";
import userRoutes from "./src/routes/user.js";
import User from "./src/models/user.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// DB Connection
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST, 
  dialect: "mysql",
  logging: console.log // Enable SQL query logging
});

async function initDatabase() {
  try {
    await sequelize.authenticate();
    console.log("Database connected");
    
    // Force sync database - this will create tables
    await sequelize.sync({ force: true });
    console.log("Database tables created");
  } catch (err) {
    console.error("Database initialization error:", err);
    process.exit(1); // Exit if database fails
  }
}

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/user", userRoutes);

app.get("/", (req, res) => res.send("Backend working"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
