import mongoose from "mongoose";

const threadSchema = new mongoose.Schema({
  targetType: {
    type: String,
    enum: ["Group", "Event"],
    required: true,
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "targetType",
    required: true,
  },
}, {
  collection: "threads",
  minimize: false,
  versionKey: false,
});

threadSchema.index({ targetType: 1, targetId: 1 }, { unique: true });

const Thread = mongoose.model("Thread", threadSchema);

export default Thread;