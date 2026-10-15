import Client from '../models/client.model.js';
import mongoose from "mongoose";
const getClient = async (req, res) => {
    
    try {
        const clients = await Client.find();
        return res.status(200).json({
            message: "Clients retrieved successfully",
            clients
        });
    } catch (error) {
        console.error("Error retrieving clients:", error);
        return res.status(500).json({
            message: "An internal server error occurred",
        });
    } 
}
const getClientById = async (req, res) => {
    const { id } = req.params;
      if (!mongoose.isObjectIdOrHexString(id)) {
          return res.status(400).json({
            message: "Invalid client ID",
          });
      }
    try {
        const client = await Client.findById(id);

        if (!client) {
            return res.status(404).json({
                message: "Client not found",
            });
        }

        return res.status(200).json({
            message: "Client retrieved successfully",
            client,
        });
    } catch (error) {
        console.error("Error retrieving client:", error);
        return res.status(500).json({
            message: "An internal server error occurred",
        });
    }
};

const createClient = async (req, res) => {
    const { name, email, phone, address, companyName } = req.body ?? {};

    if (
        typeof name !== "string" ||
        typeof email !== "string" ||
        typeof phone !== "string" ||
        !name.trim() ||
        !email.trim() ||
        !phone.trim()
    ) {
        return res.status(400).json({
            message: "Name, email, and phone are required",
        });
    }

    try {
        const newClient = new Client({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            address: address?.trim() || "",
            companyName: companyName?.trim() || "",
        });

        await newClient.save();

        return res.status(201).json({
            message: "Client created successfully",
            client: newClient,
        });
    } catch (error) {
        console.error("Error creating client:", error);
        return res.status(500).json({
            message: "An internal server error occurred",
        });
    }
};

const updateClient = async (req, res) => {
    const { id } = req.params;
    const { name, email, phone, address, companyName } = req.body ?? {};
      if (!mongoose.isObjectIdOrHexString(id)) {
          return res.status(400).json({
            message: "Invalid client ID",
          });
      }
    if (
        typeof name !== "string" ||
        typeof email !== "string" ||
        typeof phone !== "string" ||
        !name.trim() ||
        !email.trim() ||
        !phone.trim()
    ) {
        return res.status(400).json({
            message: "Name, email, and phone are required",
        });
    }

    try {
        const updatedClient = await Client.findByIdAndUpdate(
            id,
            {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                phone: phone.trim(),
                address: address?.trim() || "",
                companyName: companyName?.trim() || "",
            },
            { new: true }
        );

        if (!updatedClient) {
            return res.status(404).json({
                message: "Client not found",
            });
        }

        return res.status(200).json({
            message: "Client updated successfully",
            client: updatedClient,
        });
    } catch (error) {
        console.error("Error updating client:", error);
        return res.status(500).json({
            message: "An internal server error occurred",
        });
    }
};

const deleteClient = async (req, res) => {
    const { id } = req.params;
      if (!mongoose.isObjectIdOrHexString(id)) {
          return res.status(400).json({
            message: "Invalid client ID",
          });
      }
    try {
        const deletedClient = await Client.findByIdAndDelete(id);

        if (!deletedClient) {
            return res.status(404).json({
                message: "Client not found",
            });
        }

        return res.status(200).json({
            message: "Client deleted successfully",
            client: deletedClient,
        });
    } catch (error) {
        console.error("Error deleting client:", error);
        return res.status(500).json({
            message: "An internal server error occurred",
        });
    }
};

export { getClient, createClient, updateClient, deleteClient, getClientById };

