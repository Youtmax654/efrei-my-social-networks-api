import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  iconUrl: {
    type: String,
    default: ""
  },
  coverUrl: {
    type: String,
    default: ""
  },
  type: {
    type: String,
    enum: ["public", "private", "secret"],
    required: true,
  },
  canMembersPost: {
    type: Boolean,
    default: true,
  },
  canMembersCreateEvents: {
    type: Boolean,
    default: true,
  },
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }],
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  }
}, {
  collection: "groups",
  minimize: false,
  versionKey: false,
});

const Group = mongoose.model("Group", groupSchema);

export default Group;