import mongoose from "mongoose";
import Event from "../models/event.mjs";
import Poll from "../models/poll.mjs";

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

const ensureOrganizer = (event, userId) => {
  const isOrganizer = event.organizers.some(
    (organizerId) => organizerId.toString() === userId.toString()
  );

  if (!isOrganizer) {
    const error = new Error("Accès refusé : vous devez être organisateur de l'événement");
    error.status = 403;
    throw error;
  }
};

const normalizePoll = ({ title, questions }) => {
  if (typeof title !== "string" || !title.trim()) {
    const error = new Error("Le titre du sondage est obligatoire");
    error.status = 400;
    throw error;
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    const error = new Error("Le sondage doit contenir au moins une question");
    error.status = 400;
    throw error;
  }

  const normalizedQuestions = questions.map((question) => {
    if (typeof question?.questionText !== "string" || !question.questionText.trim()) {
      const error = new Error("Le texte de chaque question est obligatoire");
      error.status = 400;
      throw error;
    }

    if (!Array.isArray(question.options) || question.options.length < 2) {
      const error = new Error("Chaque question doit avoir au moins deux options");
      error.status = 400;
      throw error;
    }

    const optionIds = new Set();
    const options = question.options.map((option) => {
      if (typeof option?.id !== "string" || !option.id.trim()
        || typeof option.text !== "string" || !option.text.trim()) {
        const error = new Error("Chaque option doit avoir un identifiant et un texte");
        error.status = 400;
        throw error;
      }

      if (optionIds.has(option.id)) {
        const error = new Error("Les identifiants des options doivent être uniques par question");
        error.status = 400;
        throw error;
      }
      optionIds.add(option.id);

      return { id: option.id.trim(), text: option.text.trim() };
    });

    return { questionText: question.questionText.trim(), options };
  });

  return { title: title.trim(), questions: normalizedQuestions };
};

const pollService = {
  createPoll: async (eventId, userId, pollData) => {
    const event = await getEventOrThrow(eventId);
    ensureOrganizer(event, userId);

    const poll = new Poll({
      ...normalizePoll(pollData),
      eventId: event._id,
    });

    return await poll.save();
  },

  closePoll: async (pollId, userId) => {
    if (!mongoose.isValidObjectId(pollId)) {
      throw invalidIdError();
    }

    const poll = await Poll.findById(pollId);
    if (!poll) {
      const error = new Error("Sondage introuvable");
      error.status = 404;
      throw error;
    }

    const event = await getEventOrThrow(poll.eventId);
    ensureOrganizer(event, userId);

    if (poll.isClosed) {
      const error = new Error("Le sondage est déjà fermé");
      error.status = 409;
      throw error;
    }

    poll.isClosed = true;
    return await poll.save();
  },
};

export default pollService;