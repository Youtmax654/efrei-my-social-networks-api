import pollService from "../services/polls.mjs";

const getUserId = (req) => {
  const userId = req.user?._id;
  if (!userId) {
    const error = new Error("Unauthorized");
    error.status = 401;
    throw error;
  }
  return userId;
};

export const createPoll = async (req, res) => {
  try {
    const poll = await pollService.createPoll(
      req.params.eventId,
      getUserId(req),
      req.body || {}
    );
    res.status(201).json(poll);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
  }
};

export const closePoll = async (req, res) => {
  try {
    const poll = await pollService.closePoll(req.params.pollId, getUserId(req));
    res.status(200).json(poll);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
  }
};

export const votePoll = async (req, res) => {
  try {
    const vote = await pollService.vote(
      req.params.pollId,
      getUserId(req),
      req.body?.answers
    );
    res.status(201).json(vote);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
  }
};

export const getPollResults = async (req, res) => {
  try {
    const results = await pollService.getResults(req.params.pollId, getUserId(req));
    res.status(200).json(results);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
  }
};