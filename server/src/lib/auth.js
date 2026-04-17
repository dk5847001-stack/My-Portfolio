import jwt from "jsonwebtoken";

const fallbackSecret = "portfolio-dev-secret";

export const getJwtSecret = () => process.env.JWT_SECRET || fallbackSecret;

export const signAuthToken = (user) =>
  jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    },
    getJwtSecret(),
    {
      expiresIn: "7d",
    }
  );

export const verifyAuthToken = (token) => jwt.verify(token, getJwtSecret());
