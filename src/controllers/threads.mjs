import threadService from "../services/threads.mjs";

const getUserId = (req) => {
  const userId = req.user?._id;
  if (!userId) {
    const error = new Error("Unauthorized");
    error.status = 401;
    throw error;
  }
  return userId;
};

export const getMessages = async (req, res) => {
  try {
    const messages = await threadService.getMessages(
      req.params.targetType,
      req.params.targetId,
      getUserId(req)
    );
    res.status(200).json(messages);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
  }
};

export const createMessage = async (req, res) => {
  try {
    const message = await threadService.createMessage(
      req.params.targetType,
      req.params.targetId,
      getUserId(req),
      req.body?.content
    );
    res.status(201).json(message);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
  }
};

export const createReply = async (req, res) => {
  try {
    const message = await threadService.createReply(
      req.params.messageId,
      getUserId(req),
      req.body?.content
    );
    res.status(201).json(message);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
  }
};