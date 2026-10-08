import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.mjs';

const authService = {
  registerUser: async ({ firstName, lastName, email, password }) => {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error("Cet email est déjà associé à un compte");
      error.status = 400;
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    const userObj = newUser.toObject();
    delete userObj.password;

    return userObj;
  },

  login: async ({ email, password }) => {
    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error("Email ou mot de passe incorrect");
      error.status = 401;
      throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const error = new Error("Email ou mot de passe incorrect");
      error.status = 401;
      throw error;
    }

    const user_obj = user.toObject();
    delete user_obj.password;
    const token = jwt.sign(user_obj, process.env.JWT_SECRET, { expiresIn: '1h' });

    return token;
  }
};

export default authService;