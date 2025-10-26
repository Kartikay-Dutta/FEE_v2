import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: "mysql",
  logging: console.log
});

// Initialize database and create tables
async function initDB() {
  try {
    await sequelize.authenticate();
    console.log("Database connected");
    
    // Force sync will drop existing tables and create new ones
    await sequelize.sync({ force: true });
    console.log("All tables created successfully");
  } catch (error) {
    console.error("Database initialization error:", error);
    throw error;
  }
}

// Run initialization
initDB().catch(console.error);

export default sequelize;
