import photoCommentService from "../services/photo-comments.mjs";

const getUserId = (req) => {
  const userId = req.user?._id;
  if (!userId) {
    const error = new Error("Unauthorized");
    error.status = 401;
    throw error;
  }
  return userId;
};

export const getComments = async (req, res) => {
  try {
    const comments = await photoCommentService.getComments(
      req.params.photoId,
      getUserId(req)
    );
    res.status(200).json(comments);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
  }
};

export const createComment = async (req, res) => {
  try {
    const comment = await photoCommentService.createComment(
      req.params.photoId,
      getUserId(req),
      req.body?.content
    );
    res.status(201).json(comment);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
  }
};