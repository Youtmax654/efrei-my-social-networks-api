import mongoose from "mongoose";
import Group from "../models/group.mjs";
import User from "../models/user.mjs";

const invalidIdError = () => {
  const error = new Error("Identifiant invalide");
  error.status = 400;
  return error;
};

const getGroupOrThrow = async (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw invalidIdError();
  }

  const group = await Group.findById(id);
  if (!group) {
    const error = new Error("Groupe introuvable");
    error.status = 404;
    throw error;
  }

  return group;
};

const ensureAdmin = (group, userId) => {
  const isAdmin = group.admins.some((adminId) => adminId.toString() === userId.toString());
  if (!isAdmin) {
    const error = new Error("Accès refusé : vous devez être administrateur du groupe");
    error.status = 403;
    throw error;
  }
};

const ensureUserExists = async (userId) => {
  if (!userId || !mongoose.isValidObjectId(userId)) {
    throw invalidIdError();
  }

  const user = await User.exists({ _id: userId });
  if (!user) {
    const error = new Error("Utilisateur introuvable");
    error.status = 404;
    throw error;
  }
};

const groupService = {
  createGroup: async ({ name, description, type, createdBy }) => {
    const newGroup = new Group({
      name,
      description,
      type,
      admins: [createdBy],
      members: [createdBy]
    });
    return await newGroup.save();
  },

  getGroups: async ({ userId }) => {
    const query = {
      $or: [
        { type: 'public' },
        { members: userId },
        { admins: userId }
      ]
    };

    return await Group.find(query)
      .populate('admins', 'firstName lastName email')
      .populate('members', 'firstName lastName email')
      .lean();
  },

  getGroupById: async ({ id, userId }) => {
    return await Group.findOne({
      _id: id,
      $or: [
        { type: 'public' },
        { members: userId },
        { admins: userId }
      ]
    })
      .populate('admins', 'firstName lastName email')
      .populate('members', 'firstName lastName email')
      .lean();
  },

  updateGroup: async (id, updateData, userId) => {
    const group = await Group.findById(id);

    if (!group) {
      const error = new Error('Groupe introuvable');
      error.status = 404;
      throw error;
    }

    const isAdmin = group.admins.some((adminId) => adminId.toString() === userId.toString());

    if (!isAdmin) {
      const error = new Error('Accès refusé : vous devez être administrateur du groupe pour le modifier');
      error.status = 403;
      throw error;
    }

    const allowedUpdates = ['name', 'description', 'iconUrl', 'coverUrl', 'type', 'canMembersPost', 'canMembersCreateEvents'];

    for (const key of Object.keys(updateData)) {
      if (allowedUpdates.includes(key)) {
        group[key] = updateData[key];
      }
    }

    return await group.save()
  },

  deleteGroup: async (id, userId) => {
    const group = await getGroupOrThrow(id);
    ensureAdmin(group, userId);

    await group.deleteOne();

    return { message: 'Groupe supprimé avec succès' };
  },

  joinGroup: async (id, userId) => {
    const group = await getGroupOrThrow(id);
    if (group.type !== 'public') {
      const error = new Error('Seuls les groupes publics peuvent être rejoints directement');
      error.status = 403;
      throw error;
    }

    if (group.members.some((memberId) => memberId.toString() === userId.toString())) {
      const error = new Error('Vous êtes déjà membre de ce groupe');
      error.status = 409;
      throw error;
    }

    group.members.push(userId);
    return await group.save();
  },

  leaveGroup: async (id, userId) => {
    const group = await getGroupOrThrow(id);
    const memberIndex = group.members.findIndex((memberId) => memberId.toString() === userId.toString());
    if (memberIndex === -1) {
      const error = new Error('Vous n\'êtes pas membre de ce groupe');
      error.status = 404;
      throw error;
    }

    const isAdmin = group.admins.some((adminId) => adminId.toString() === userId.toString());
    if (isAdmin && group.admins.length === 1) {
      const error = new Error('Le dernier administrateur ne peut pas quitter le groupe');
      error.status = 400;
      throw error;
    }

    group.members.splice(memberIndex, 1);
    group.admins = group.admins.filter((adminId) => adminId.toString() !== userId.toString());
    return await group.save();
  },

  addMember: async (id, userId, targetUserId) => {
    const group = await getGroupOrThrow(id);
    ensureAdmin(group, userId);
    await ensureUserExists(targetUserId);

    if (group.members.some((memberId) => memberId.toString() === targetUserId.toString())) {
      const error = new Error('Cet utilisateur est déjà membre de ce groupe');
      error.status = 409;
      throw error;
    }

    group.members.push(targetUserId);
    return await group.save();
  },

  updateAdmin: async (id, userId, targetUserId, action) => {
    const group = await getGroupOrThrow(id);
    ensureAdmin(group, userId);
    await ensureUserExists(targetUserId);

    const isMember = group.members.some((memberId) => memberId.toString() === targetUserId.toString());
    if (!isMember) {
      const error = new Error('L\'utilisateur doit être membre du groupe');
      error.status = 400;
      throw error;
    }

    const adminIndex = group.admins.findIndex((adminId) => adminId.toString() === targetUserId.toString());
    if (action === 'promote') {
      if (adminIndex === -1) {
        group.admins.push(targetUserId);
      }
    } else if (action === 'demote') {
      if (adminIndex === -1) {
        const error = new Error('Cet utilisateur n\'est pas administrateur du groupe');
        error.status = 400;
        throw error;
      }
      if (group.admins.length === 1) {
        const error = new Error('Le dernier administrateur ne peut pas être rétrogradé');
        error.status = 400;
        throw error;
      }
      group.admins.splice(adminIndex, 1);
    } else {
      const error = new Error("L'action doit être 'promote' ou 'demote'");
      error.status = 400;
      throw error;
    }

    return await group.save();
  }
}

export default groupService;