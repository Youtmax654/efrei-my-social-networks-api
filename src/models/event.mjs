import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  coverUrl: {
    type: String,
    default: "",
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
  organizers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }],
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }],
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
  },
  ticketingEnabled: {
    type: Boolean,
    default: false,
  },
  shoppingListEnabled: {
    type: Boolean,
    default: false,
  },
  carpoolingEnabled: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  collection: "events",
  minimize: false,
  versionKey: false,
});

const Event = mongoose.model("Event", eventSchema);

export default Event;