import mongoose from "mongoose";

const albumSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
}, {
  collection: "albums",
  minimize: false,
  versionKey: false,
});

const Album = mongoose.model("Album", albumSchema);

export default Album;