import bcrypt from 'bcrypt';
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
};

export default authService;