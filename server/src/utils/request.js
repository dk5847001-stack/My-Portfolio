export const normalizeEmail = (value = "") => value.trim().toLowerCase();

export const sanitizeText = (value = "") => value.trim().replace(/\s+/g, " ");

export const parseBoolean = (value) => {
  if (value === undefined) {
    return undefined;
  }

  if (value === true || value === "true") {
    return true;
  }

  if (value === false || value === "false") {
    return false;
  }

  return undefined;
};
