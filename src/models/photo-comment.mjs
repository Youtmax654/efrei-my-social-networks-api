import mongoose from "mongoose";

const photoCommentSchema = new mongoose.Schema({
  photoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Photo",
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  collection: "photoComments",
  minimize: false,
  versionKey: false,
});

photoCommentSchema.index({ photoId: 1, createdAt: 1 });

const PhotoComment = mongoose.model("PhotoComment", photoCommentSchema);

export default PhotoComment;