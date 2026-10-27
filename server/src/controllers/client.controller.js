import mongoose from "mongoose";
import Client from "../models/client.model.js";

const isValidId = (id) =>
  mongoose.isObjectIdOrHexString(String(id ?? ""));

const getUserId = (req) => req.user?._id;

const handleError = (res, error, action) => {
  console.error(`${action}:`, error);

  if (error.code === 11000) {
    return res.status(409).json({
      message: "A client with this email already exists.",
    });
  }

  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({
      message: error.message,
    });
  }

  return res.status(500).json({
    message: "An internal server error occurred.",
  });
};

// GET /api/clients
// Every authenticated user can see all clients.
const getClient = async (req, res) => {
  try {
    const clients = await Client.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Clients retrieved successfully.",
      count: clients.length,
      clients,
    });
  } catch (error) {
    return handleError(res, error, "Error retrieving clients");
  }
};

// GET /api/clients/count
const getClientsCount = async (req, res) => {
  try {
    const totalClients = await Client.countDocuments();

    return res.status(200).json({ totalClients });
  } catch (error) {
    return handleError(res, error, "Error counting clients");
  }
};

// GET /api/clients/:id
// Every authenticated user can view any client's details.
const getClientById = async (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    return res.status(400).json({
      message: "Invalid client ID.",
    });
  }

  try {
    const client = await Client.findById(id).populate(
      "user",
      "name email"
    );

    if (!client) {
      return res.status(404).json({
        message: "Client not found.",
      });
    }

    return res.status(200).json({
      message: "Client retrieved successfully.",
      client,
    });
  } catch (error) {
    return handleError(res, error, "Error retrieving client");
  }
};

// POST /api/clients
// The authenticated user becomes the owner.
// Never accept the owner from req.body.
const createClient = async (req, res) => {
  const {
    name,
    email,
    phone,
    address,
    region,
    companyName,
    objections,
    produits,
    notes,
  } = req.body ?? {};

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof phone !== "string" ||
    !name.trim() ||
    !email.trim() ||
    !phone.trim()
  ) {
    return res.status(400).json({
      message: "Name, email, and phone are required.",
    });
  }

  if (typeof region !== "string" || !region.trim()) {
    return res.status(400).json({
      message: "Region is required.",
    });
  }

  try {
    const client = await Client.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      address:
        typeof address === "string" ? address.trim() : "",
      region: region.trim(),
      companyName:
        typeof companyName === "string"
          ? companyName.trim()
          : "",
      objections,
      produits,
      image: req.file
    ? `/uploads/clients/${req.file.filename}`
    : "",
      notes: typeof notes === "string" ? notes.trim() : "",
      user: getUserId(req),
    });

    await client.populate("user", "name email");

    return res.status(201).json({
      message: "Client created successfully.",
      client,
    });
  } catch (error) {
    return handleError(res, error, "Error creating client");
  }
};

// PUT /api/clients/:id
// Only the owner can update the client.
const updateClient = async (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    return res.status(400).json({
      message: "Invalid client ID.",
    });
  }

  const {
    name,
    email,
    phone,
    address,
    region,
    companyName,
    objections,
    produits,
    image,
    notes,
  } = req.body ?? {};

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof phone !== "string" ||
    !name.trim() ||
    !email.trim() ||
    !phone.trim()
  ) {
    return res.status(400).json({
      message: "Name, email, and phone are required.",
    });
  }

  const updates = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    address:
        typeof address === "string" ? address.trim() : "",
      region: region.trim(),
      companyName:
        typeof companyName === "string"
          ? companyName.trim()
          : "",
      objections,
      produits,
      image: req.file
    ? `/uploads/clients/${req.file.filename}`
    : "",
      notes: typeof notes === "string" ? notes.trim() : "",
  };

  // Update optional fields only when they are supplied.
  const optionalFields = [
    "address",
    "region",
    "companyName",
    "objections",
    "produits",
    "image",
    "notes",
  ];

  for (const field of optionalFields) {
    if (Object.hasOwn(req.body ?? {}, field)) {
      updates[field] = req.body[field];
    }
  }

  if (
    Object.hasOwn(updates, "address") &&
    typeof updates.address === "string"
  ) {
    updates.address = updates.address.trim();
  }

  if (
    Object.hasOwn(updates, "companyName") &&
    typeof updates.companyName === "string"
  ) {
    updates.companyName = updates.companyName.trim();
  }

  if (
    Object.hasOwn(updates, "notes") &&
    typeof updates.notes === "string"
  ) {
    updates.notes = updates.notes.trim();
  }

  if (
    Object.hasOwn(updates, "region") &&
    (typeof updates.region !== "string" || !updates.region.trim())
  ) {
    return res.status(400).json({
      message: "Please select a valid region.",
    });
  }

  try {
    const client = await Client.findById(id);

    if (!client) {
      return res.status(404).json({
        message: "Client not found.",
      });
    }

    if (String(client.user) !== String(getUserId(req))) {
      return res.status(403).json({
        message: "You cannot edit a client owned by another user.",
      });
    }
    if (req.file) {
      updates.image = `/uploads/clients/${req.file.filename}`;
    }
    Object.assign(client, updates);
    await client.save();
    await client.populate("user", "name email");

    return res.status(200).json({
      message: "Client updated successfully.",
      client,
    });
  } catch (error) {
    return handleError(res, error, "Error updating client");
  }
};

// DELETE /api/clients/:id
// Only the owner can delete the client.
const deleteClient = async (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    return res.status(400).json({
      message: "Invalid client ID.",
    });
  }

  try {
    const client = await Client.findById(id);

    if (!client) {
      return res.status(404).json({
        message: "Client not found.",
      });
    }

    if (String(client.user) !== String(getUserId(req))) {
      return res.status(403).json({
        message: "You cannot delete a client owned by another user.",
      });
    }

    await client.deleteOne();

    return res.status(200).json({
      message: "Client deleted successfully.",
      client,
    });
  } catch (error) {
    return handleError(res, error, "Error deleting client");
  }
};

export {
  getClient,
  getClientsCount,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
};