import User from "../models/user.mjs";

const userService = {
  getUserById: async (userId) => {
    try {
      const user = await User.findById(userId).select('-password');
      return user;
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      throw new Error("Error fetching user by ID");
    }
  }
}

export default userService;