import mongoose from "mongoose";
import Album from "../models/album.mjs";
import Event from "../models/event.mjs";
import PhotoComment from "../models/photo-comment.mjs";
import Photo from "../models/photo.mjs";

const invalidIdError = () => {
  const error = new Error("Identifiant invalide");
  error.status = 400;
  return error;
};

const getPhotoContext = async (photoId) => {
  if (!mongoose.isValidObjectId(photoId)) {
    throw invalidIdError();
  }

  const photo = await Photo.findById(photoId);
  if (!photo) {
    const error = new Error("Photo introuvable");
    error.status = 404;
    throw error;
  }

  const album = await Album.findById(photo.albumId);
  if (!album) {
    const error = new Error("Album introuvable");
    error.status = 404;
    throw error;
  }

  const event = await Event.findById(album.eventId);
  if (!event) {
    const error = new Error("Événement introuvable");
    error.status = 404;
    throw error;
  }

  return { photo, event };
};

const ensureParticipant = (event, userId) => {
  const isParticipant = event.participants.some(
    (participantId) => participantId.toString() === userId.toString()
  );

  if (!isParticipant) {
    const error = new Error("Accès refusé : vous devez participer à l'événement");
    error.status = 403;
    throw error;
  }
};

const populateComment = (query) => query.populate(
  "authorId",
  "firstName lastName email"
);

const photoCommentService = {
  getComments: async (photoId, userId) => {
    const { photo, event } = await getPhotoContext(photoId);
    ensureParticipant(event, userId);

    return await populateComment(
      PhotoComment.find({ photoId: photo._id }).sort({ createdAt: 1 })
    ).lean();
  },

  createComment: async (photoId, userId, content) => {
    if (typeof content !== "string" || !content.trim()) {
      const error = new Error("Le contenu du commentaire est obligatoire");
      error.status = 400;
      throw error;
    }

    const { photo, event } = await getPhotoContext(photoId);
    ensureParticipant(event, userId);

    const comment = await new PhotoComment({
      photoId: photo._id,
      authorId: userId,
      content: content.trim(),
    }).save();

    return await populateComment(PhotoComment.findById(comment._id)).lean();
  },
};

export default photoCommentService;