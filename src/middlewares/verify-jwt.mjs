import jwt from "jsonwebtoken";

export default function verifyJWT(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({
      code: 401,
      message: "Unauthorized"
    });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      code: 401,
      message: "Unauthorized"
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT verification error: ", err);
    return res.status(403).json({
      code: 403,
      message: "Forbidden"
    });
  }
}