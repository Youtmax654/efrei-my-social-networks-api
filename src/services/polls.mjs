import mongoose from "mongoose";
import Event from "../models/event.mjs";
import PollVote from "../models/poll-vote.mjs";
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

const getPollOrThrow = async (pollId) => {
  if (!mongoose.isValidObjectId(pollId)) {
    throw invalidIdError();
  }

  const poll = await Poll.findById(pollId);
  if (!poll) {
    const error = new Error("Sondage introuvable");
    error.status = 404;
    throw error;
  }

  return poll;
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
    const poll = await getPollOrThrow(pollId);

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

  vote: async (pollId, userId, answers) => {
    const poll = await getPollOrThrow(pollId);
    const event = await getEventOrThrow(poll.eventId);
    ensureParticipant(event, userId);

    if (poll.isClosed) {
      const error = new Error("Le sondage est fermé");
      error.status = 409;
      throw error;
    }

    if (!Array.isArray(answers) || answers.length !== poll.questions.length) {
      const error = new Error("Une réponse doit être fournie pour chaque question");
      error.status = 400;
      throw error;
    }

    const questionsById = new Map(
      poll.questions.map((question) => [question._id.toString(), question])
    );
    const answeredQuestionIds = new Set();

    const normalizedAnswers = answers.map((answer) => {
      if (!mongoose.isValidObjectId(answer?.questionId)
        || typeof answer?.selectedOptionId !== "string"
        || !answer.selectedOptionId.trim()) {
        const error = new Error("Chaque réponse doit contenir une question et une option valide");
        error.status = 400;
        throw error;
      }

      const questionId = answer.questionId.toString();
      const question = questionsById.get(questionId);
      if (!question || answeredQuestionIds.has(questionId)) {
        const error = new Error("Chaque question doit être répondue une seule fois");
        error.status = 400;
        throw error;
      }
      answeredQuestionIds.add(questionId);

      const selectedOptionId = answer.selectedOptionId.trim();
      if (!question.options.some((option) => option.id === selectedOptionId)) {
        const error = new Error("L'option sélectionnée n'appartient pas à la question");
        error.status = 400;
        throw error;
      }

      return { questionId: question._id, selectedOptionId };
    });

    if (answeredQuestionIds.size !== poll.questions.length) {
      const error = new Error("Une réponse doit être fournie pour chaque question");
      error.status = 400;
      throw error;
    }

    const existingVote = await PollVote.exists({ pollId: poll._id, userId });
    if (existingVote) {
      const error = new Error("Vous avez déjà répondu à ce sondage");
      error.status = 409;
      throw error;
    }

    try {
      return await new PollVote({
        pollId: poll._id,
        userId,
        answers: normalizedAnswers,
      }).save();
    } catch (error) {
      if (error?.code === 11000) {
        const duplicateVoteError = new Error("Vous avez déjà répondu à ce sondage");
        duplicateVoteError.status = 409;
        throw duplicateVoteError;
      }
      throw error;
    }
  },

  getResults: async (pollId, userId) => {
    const poll = await getPollOrThrow(pollId);
    const event = await getEventOrThrow(poll.eventId);
    ensureParticipant(event, userId);

    const votes = await PollVote.aggregate([
      { $match: { pollId: poll._id } },
      { $unwind: "$answers" },
      {
        $group: {
          _id: {
            questionId: "$answers.questionId",
            selectedOptionId: "$answers.selectedOptionId",
          },
          votes: { $sum: 1 },
        },
      },
    ]);

    const voteCounts = new Map(votes.map((vote) => [
      `${vote._id.questionId.toString()}:${vote._id.selectedOptionId}`,
      vote.votes,
    ]));

    return {
      pollId: poll._id,
      title: poll.title,
      totalVotes: await PollVote.countDocuments({ pollId: poll._id }),
      questions: poll.questions.map((question) => ({
        questionId: question._id,
        questionText: question.questionText,
        options: question.options.map((option) => ({
          id: option.id,
          text: option.text,
          votes: voteCounts.get(`${question._id.toString()}:${option.id}`) || 0,
        })),
      })),
    };
  },
};

export default pollService;