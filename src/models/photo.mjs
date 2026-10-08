import mongoose from "mongoose";

const photoSchema = new mongoose.Schema({
  albumId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Album",
    required: true,
  },
  uploaderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  caption: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  collection: "photos",
  minimize: false,
  versionKey: false,
});

photoSchema.index({ albumId: 1, createdAt: 1 });

const Photo = mongoose.model("Photo", photoSchema);

export default Photo;