import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  selectedOptionId: {
    type: String,
    required: true,
  },
}, { _id: false });

const pollVoteSchema = new mongoose.Schema({
  pollId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Poll",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  answers: {
    type: [answerSchema],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  collection: "pollVotes",
  minimize: false,
  versionKey: false,
});

pollVoteSchema.index({ pollId: 1, userId: 1 }, { unique: true });

const PollVote = mongoose.model("PollVote", pollVoteSchema);

export default PollVote;