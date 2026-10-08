import mongoose from "mongoose";
import Event from "../models/event.mjs";
import Group from "../models/group.mjs";
import Message from "../models/message.mjs";
import Thread from "../models/thread.mjs";

const invalidIdError = () => {
  const error = new Error("Identifiant invalide");
  error.status = 400;
  return error;
};

const invalidTargetTypeError = () => {
  const error = new Error("Le type de cible doit être 'Group' ou 'Event'");
  error.status = 400;
  return error;
};

const ensureContent = (content) => {
  if (typeof content !== "string" || !content.trim()) {
    const error = new Error("Le contenu du message est obligatoire");
    error.status = 400;
    throw error;
  }
};

const getTarget = async (targetType, targetId) => {
  if (!["Group", "Event"].includes(targetType)) {
    throw invalidTargetTypeError();
  }

  if (!mongoose.isValidObjectId(targetId)) {
    throw invalidIdError();
  }

  const TargetModel = targetType === "Group" ? Group : Event;
  const target = await TargetModel.findById(targetId);
  if (!target) {
    const error = new Error(targetType === "Group" ? "Groupe introuvable" : "Événement introuvable");
    error.status = 404;
    throw error;
  }

  return target;
};

const isIdInList = (ids, userId) => ids.some((id) => id.toString() === userId.toString());

const ensureCanRead = (targetType, target, userId) => {
  const allowed = targetType === "Group"
    ? isIdInList(target.members, userId)
    : isIdInList(target.participants, userId);

  if (!allowed) {
    const error = new Error(
      targetType === "Group"
        ? "Accès refusé : vous devez être membre du groupe"
        : "Accès refusé : vous devez participer à l'événement"
    );
    error.status = 403;
    throw error;
  }
};

const ensureCanPost = (targetType, target, userId) => {
  ensureCanRead(targetType, target, userId);

  if (targetType === "Group" && target.canMembersPost !== true) {
    const error = new Error("Accès refusé : les membres ne peuvent pas publier dans ce groupe");
    error.status = 403;
    throw error;
  }
};

const getOrCreateThread = async (targetType, targetId) => Thread.findOneAndUpdate(
  { targetType, targetId },
  { $setOnInsert: { targetType, targetId } },
  { new: true, upsert: true, setDefaultsOnInsert: true }
);

const populateMessage = (query) => query
  .populate("authorId", "firstName lastName email")
  .populate("parentMessageId", "authorId content createdAt");

const threadService = {
  getMessages: async (targetType, targetId, userId) => {
    const target = await getTarget(targetType, targetId);
    ensureCanRead(targetType, target, userId);

    const thread = await Thread.findOne({ targetType, targetId });
    if (!thread) {
      return [];
    }

    return await populateMessage(
      Message.find({ threadId: thread._id }).sort({ createdAt: 1 })
    ).lean();
  },

  createMessage: async (targetType, targetId, userId, content) => {
    ensureContent(content);
    const target = await getTarget(targetType, targetId);
    ensureCanPost(targetType, target, userId);

    const thread = await getOrCreateThread(targetType, targetId);
    const message = await new Message({
      threadId: thread._id,
      authorId: userId,
      content: content.trim(),
    }).save();

    return await populateMessage(Message.findById(message._id)).lean();
  },

  createReply: async (messageId, userId, content) => {
    ensureContent(content);

    if (!mongoose.isValidObjectId(messageId)) {
      throw invalidIdError();
    }

    const parentMessage = await Message.findById(messageId);
    if (!parentMessage) {
      const error = new Error("Message introuvable");
      error.status = 404;
      throw error;
    }

    const thread = await Thread.findById(parentMessage.threadId);
    if (!thread) {
      const error = new Error("Fil de discussion introuvable");
      error.status = 404;
      throw error;
    }

    const target = await getTarget(thread.targetType, thread.targetId);
    ensureCanPost(thread.targetType, target, userId);

    const reply = await new Message({
      threadId: thread._id,
      authorId: userId,
      content: content.trim(),
      parentMessageId: parentMessage._id,
    }).save();

    return await populateMessage(Message.findById(reply._id)).lean();
  },
};

export default threadService;