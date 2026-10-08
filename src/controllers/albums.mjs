import albumService from "../services/albums.mjs";

const getUserId = (req) => {
  const userId = req.user?._id;
  if (!userId) {
    const error = new Error("Unauthorized");
    error.status = 401;
    throw error;
  }
  return userId;
};

export const getAlbum = async (req, res) => {
  try {
    const album = await albumService.getAlbum(req.params.eventId, getUserId(req));
    res.status(200).json(album);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
  }
};

export const addPhoto = async (req, res) => {
  try {
    const photo = await albumService.addPhoto(
      req.params.eventId,
      getUserId(req),
      req.body || {}
    );
    res.status(201).json(photo);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
  }
};

export const deletePhoto = async (req, res) => {
  try {
    await albumService.deletePhoto(req.params.photoId, getUserId(req));
    res.status(200).json({ message: "Photo supprimée avec succès" });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
  }
};