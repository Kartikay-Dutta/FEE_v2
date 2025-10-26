import { DataTypes } from "sequelize";
import bcrypt from "bcrypt";
import sequelize from "./index.js";

const User = sequelize.define("User", {
  name: { 
    type: DataTypes.STRING,
    allowNull: false
  },
  email: { 
    type: DataTypes.STRING, 
    unique: true, 
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  password_hash: { 
    type: DataTypes.STRING, 
    allowNull: false
  }
});

// Hash password before saving
User.beforeCreate(async (user) => {
  if (user.password_hash) {
    console.log('Hashing password for new user');
    user.password_hash = await bcrypt.hash(user.password_hash, 10);
  }
});

export default User;
