import Group from "../models/group.mjs";

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
    const group = await Group.findById(id);

    if (!group) {
      const error = new Error('Groupe introuvable');
      error.status = 404;
      throw error;
    }

    const isAdmin = group.admins.some((adminId) => adminId.toString() === userId.toString());

    if (!isAdmin) {
      const error = new Error('Accès refusé : vous devez être administrateur du groupe pour le supprimer');
      error.status = 403;
      throw error;
    }

    await group.deleteOne();

    return { message: 'Groupe supprimé avec succès' };
  }
}

export default groupService;