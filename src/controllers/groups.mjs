import groupService from "../services/groups.mjs";

export const createGroup = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      const error = new Error("Unauthorized");
      error.status = 401;
      throw error;
    }

    const { name, description, type } = req.body || {};

    if (!name || !description || !type) {
      const error = new Error("Tous les champs obligatoires doivent être renseignés");
      error.status = 400;
      throw error;
    }

    if (!["public", "private", "secret"].includes(type)) {
      const error = new Error("Le type de groupe doit être 'public', 'private' ou 'secret'");
      error.status = 400;
      throw error;
    }

    const newGroup = await groupService.createGroup({ name, description, type, createdBy: userId });
    res.status(201).json(newGroup);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
  }
};

export const getGroups = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      const error = new Error("Unauthorized");
      error.status = 401;
      throw error;
    }

    const groups = await groupService.getGroups({ userId });
    res.status(200).json(groups);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
  }
};

export const getGroupById = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      const error = new Error("Unauthorized");
      error.status = 401;
      throw error;
    }

    const { id } = req.params;

    const group = await groupService.getGroupById({ id, userId });
    if (!group) {
      const error = new Error("Groupe non trouvé");
      error.status = 404;
      throw error;
    }

    res.status(200).json(group);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
  }
};

export const updateGroup = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      const error = new Error("Unauthorized");
      error.status = 401;
      throw error;
    }

    const { id } = req.params;
    const { name, description } = req.body || {};

    const updatedGroup = await groupService.updateGroup(
      id, { name, description }, userId
    );

    if (!updatedGroup) {
      const error = new Error("Groupe non trouvé");
      error.status = 404;
      throw error;
    }

    res.status(200).json(updatedGroup);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      const error = new Error("Unauthorized");
      error.status = 401;
      throw error;
    }

    const { id } = req.params;

    const deletedGroup = await groupService.deleteGroup(id, userId);
    if (!deletedGroup) {
      const error = new Error("Groupe non trouvé");
      error.status = 404;
      throw error;
    }

    res.status(200).json({ message: "Groupe supprimé avec succès" });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
  }
};

export const joinGroup = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      const error = new Error("Unauthorized");
      error.status = 401;
      throw error;
    }

    const group = await groupService.joinGroup(req.params.id, userId);
    res.status(200).json(group);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
  }
};

export const leaveGroup = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      const error = new Error("Unauthorized");
      error.status = 401;
      throw error;
    }

    const group = await groupService.leaveGroup(req.params.id, userId);
    res.status(200).json(group);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
  }
};

export const addMember = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      const error = new Error("Unauthorized");
      error.status = 401;
      throw error;
    }

    const targetUserId = req.body?.userId;
    const group = await groupService.addMember(req.params.id, userId, targetUserId);
    res.status(200).json(group);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
  }
};

export const updateAdmin = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      const error = new Error("Unauthorized");
      error.status = 401;
      throw error;
    }

    const { userId: targetUserId, action } = req.body || {};
    const group = await groupService.updateAdmin(req.params.id, userId, targetUserId, action);
    res.status(200).json(group);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
  }
};

