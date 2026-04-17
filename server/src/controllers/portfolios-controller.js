import { asyncHandler } from "../utils/async-handler.js";
import { ApiError, createNotFoundMessage } from "../utils/api-error.js";
import { parseBoolean } from "../utils/request.js";
import { serializeDocument } from "../utils/serializers.js";
import { Portfolio } from "../models/portfolio.js";

export const listPortfolios = asyncHandler(async (req, res) => {
  const isPublic = parseBoolean(req.query.isPublic);
  const filter = {};

  if (isPublic !== undefined) {
    filter.isPublic = isPublic;
  }

  const portfolios = await Portfolio.find(filter).sort({ updatedAt: -1 });
  res.json({ portfolios: portfolios.map(serializeDocument) });
});

export const getPortfolio = asyncHandler(async (req, res) => {
  const portfolio = await Portfolio.findById(req.params.portfolioId);

  if (!portfolio) {
    throw new ApiError(404, createNotFoundMessage("Portfolio"));
  }

  res.json({ portfolio: serializeDocument(portfolio) });
});

export const createPortfolio = asyncHandler(async (req, res) => {
  const portfolio = await Portfolio.create({
    ...req.body,
    updatedBy: req.auth.user._id,
  });

  res.status(201).json({ portfolio: serializeDocument(portfolio) });
});

export const updatePortfolio = asyncHandler(async (req, res) => {
  const portfolio = await Portfolio.findByIdAndUpdate(
    req.params.portfolioId,
    { ...req.body, updatedBy: req.auth.user._id },
    { new: true, runValidators: true }
  );

  if (!portfolio) {
    throw new ApiError(404, createNotFoundMessage("Portfolio"));
  }

  res.json({ portfolio: serializeDocument(portfolio) });
});

export const deletePortfolio = asyncHandler(async (req, res) => {
  const portfolio = await Portfolio.findByIdAndDelete(req.params.portfolioId);

  if (!portfolio) {
    throw new ApiError(404, createNotFoundMessage("Portfolio"));
  }

  res.json({ message: "Portfolio deleted successfully." });
});
