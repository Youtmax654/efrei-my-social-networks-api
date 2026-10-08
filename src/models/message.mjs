import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  threadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Thread",
    required: true,
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  parentMessageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message",
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  collection: "messages",
  minimize: false,
  versionKey: false,
});

messageSchema.index({ threadId: 1, createdAt: 1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;