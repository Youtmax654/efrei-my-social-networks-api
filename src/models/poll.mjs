import mongoose from "mongoose";

const optionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
}, { _id: false });

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
  },
  options: {
    type: [optionSchema],
    required: true,
    validate: {
      validator: (options) => options.length >= 2
        && new Set(options.map((option) => option.id)).size === options.length,
      message: "Chaque question doit avoir au moins deux options aux identifiants uniques",
    },
  },
});

const pollSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  questions: {
    type: [questionSchema],
    required: true,
    validate: {
      validator: (questions) => questions.length > 0,
      message: "Le sondage doit contenir au moins une question",
    },
  },
  isClosed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  collection: "polls",
  minimize: false,
  versionKey: false,
});

const Poll = mongoose.model("Poll", pollSchema);

export default Poll;