import { signAuthToken } from "../lib/auth.js";

export const serializeDocument = (document) => {
  if (!document) {
    return null;
  }

  const source = typeof document.toObject === "function" ? document.toObject() : document;

  if (source._id) {
    source.id = source._id.toString();
    delete source._id;
  }

  delete source.__v;

  return source;
};

export const serializeUser = (user) => {
  const data = serializeDocument(user);

  if (!data) {
    return null;
  }

  delete data.passwordHash;
  return data;
};

export const buildAuthPayload = (user) => ({
  token: signAuthToken(user),
  user: serializeUser(user),
});
