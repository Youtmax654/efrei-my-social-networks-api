import userService from "../services/users.mjs";

export const getMe = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!userId) {
      const error = new Error("User ID not found in request");
      error.status = 400;
      throw error;
    }

    const user = await userService.getUserById(userId);

    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
  }
}