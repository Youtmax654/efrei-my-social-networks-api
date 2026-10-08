import mongoose from "mongoose";
import Album from "../models/album.mjs";
import Event from "../models/event.mjs";
import Photo from "../models/photo.mjs";

const invalidIdError = () => {
  const error = new Error("Identifiant invalide");
  error.status = 400;
  return error;
};

const getEventOrThrow = async (eventId) => {
  if (!mongoose.isValidObjectId(eventId)) {
    throw invalidIdError();
  }

  const event = await Event.findById(eventId);
  if (!event) {
    const error = new Error("Événement introuvable");
    error.status = 404;
    throw error;
  }

  return event;
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

const isOrganizer = (event, userId) => event.organizers.some(
  (organizerId) => organizerId.toString() === userId.toString()
);

const getOrCreateAlbum = async (event) => Album.findOneAndUpdate(
  { eventId: event._id },
  { $setOnInsert: { eventId: event._id, title: event.title } },
  { new: true, upsert: true, setDefaultsOnInsert: true }
);

const populatePhoto = (query) => query.populate(
  "uploaderId",
  "firstName lastName email"
);

const albumService = {
  getAlbum: async (eventId, userId) => {
    const event = await getEventOrThrow(eventId);
    ensureParticipant(event, userId);

    const album = await getOrCreateAlbum(event);
    const photos = await populatePhoto(
      Photo.find({ albumId: album._id }).sort({ createdAt: 1 })
    ).lean();

    return { album: album.toObject(), photos };
  },

  addPhoto: async (eventId, userId, { url, caption }) => {
    if (typeof url !== "string" || !url.trim()) {
      const error = new Error("L'URL de la photo est obligatoire");
      error.status = 400;
      throw error;
    }

    const event = await getEventOrThrow(eventId);
    ensureParticipant(event, userId);

    const album = await getOrCreateAlbum(event);
    const photo = await new Photo({
      albumId: album._id,
      uploaderId: userId,
      url: url.trim(),
      caption: typeof caption === "string" ? caption.trim() : "",
    }).save();

    return await populatePhoto(Photo.findById(photo._id)).lean();
  },

  deletePhoto: async (photoId, userId) => {
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

    const event = await getEventOrThrow(album.eventId);
    const canDelete = photo.uploaderId.toString() === userId.toString()
      || isOrganizer(event, userId);

    if (!canDelete) {
      const error = new Error("Accès refusé : vous devez être l'auteur de la photo ou organisateur de l'événement");
      error.status = 403;
      throw error;
    }

    await photo.deleteOne();
  },
};

export default albumService;