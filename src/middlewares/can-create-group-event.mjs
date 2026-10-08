import mongoose from "mongoose";
import Group from "../models/group.mjs";

export default async function canCreateGroupEvent(req, res, next) {
  try {
    const userId = req.user?._id;
    const { groupId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!mongoose.isValidObjectId(groupId)) {
      return res.status(400).json({ message: "Identifiant invalide" });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Groupe introuvable" });
    }

    const isMember = group.members.some((memberId) => memberId.toString() === userId.toString());
    if (!isMember) {
      return res.status(403).json({ message: "Accès refusé : vous devez être membre du groupe" });
    }

    const isAdmin = group.admins.some((adminId) => adminId.toString() === userId.toString());
    if (!isAdmin && !group.canMembersCreateEvents) {
      return res.status(403).json({ message: "Accès refusé : vous ne pouvez pas créer d'événement dans ce groupe" });
    }

    req.group = group;
    next();
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
  }
}