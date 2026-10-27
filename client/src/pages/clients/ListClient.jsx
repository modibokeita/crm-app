
import { Fragment, useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./clients.css";

const API_URL = "http://localhost:3000/api/clients";
const RDV_API = "http://localhost:3000/api/rdv/newRdv";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
  companyName: "",
  notes: "",
};

const initialRdvForm = {
  user:"",
  client: "",
  title: "",
  date: "",
  status: "scheduled",
  location: "",
};

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

function getUserId(user) {
  return String(user?._id || user?.id || "");
}

function getClientOwnerId(client) {
  const owner = client?.user;

  if (owner && typeof owner === "object") {
    return String(owner._id || owner.id || "");
  }

  return String(owner || "");
}

async function readResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "The request failed.");
  }

  return data;
}

function ListClient() {
  const [clients, setClients] = useState([]);
  const [currentUser, setCurrentUser] = useState(getStoredUser);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [actionLoading, setActionLoading] = useState(false);
  const [editingImageFile, setEditingImageFile] = useState(null);

  const [showRdvModal, setShowRdvModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [rdvForm, setRdvForm] = useState(initialRdvForm);
  const [rdvLoading, setRdvLoading] = useState(false);
  const [rdvError, setRdvError] = useState("");

  const currentUserId = getUserId(currentUser);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL, {
        method: "GET",
        credentials: "include",
      });

      const data = await readResponse(response);
      const list = Array.isArray(data)
        ? data
        : data.clients || [];

      // Do not filter by owner: every connected user sees all clients.
      setClients(list);
    } catch (err) {
      setError(err.message || "Failed to load clients.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setCurrentUser(getStoredUser());
    fetchClients();
  }, [fetchClients]);

  // Re-read the display user if localStorage changes in another tab.
  useEffect(() => {
    function syncUser() {
      setCurrentUser(getStoredUser());
    }

    window.addEventListener("storage", syncUser);

    return () => window.removeEventListener("storage", syncUser);
  }, []);

  const isOwner = (client) =>
    Boolean(currentUserId) &&
    getClientOwnerId(client) === currentUserId;

  function handleEdit(client) {
    if (!isOwner(client)) {
      setError("You can only edit clients you own.");
      return;
    }

    setError("");
    setMessage("");
    setEditingId(client._id);
    setEditingImageFile(null);

    setEditForm({
      name: client.name || "",
      email: client.email || "",
      phone: client.phone || "",
      address: client.address || "",
      companyName: client.companyName || "",
      notes: client.notes || "",
    });
  }

  function handleEditChange(event) {
    const { name, value } = event.target;

    setEditForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleUpdate(event) {
    event.preventDefault();

    if (!editingId || actionLoading) return;

    const client = clients.find((item) => item._id === editingId);

    if (!client || !isOwner(client)) {
      setError("You cannot edit a client owned by another user.");
      setEditingId(null);
      return;
    }

    setError("");
    setMessage("");
    setActionLoading(true);

    try {
      const payload = new FormData();

      Object.entries(editForm).forEach(([key, value]) => {
        payload.append(key, value);
      });

      if (editingImageFile) {
        payload.append("image", editingImageFile);
      }

      const response = await fetch(`${API_URL}/${editingId}`, {
        method: "PUT",
        credentials: "include",
        body: payload,
      });

      const data = await readResponse(response);

      setClients((previous) =>
        previous.map((item) =>
          item._id === editingId
            ? data.client
            : item
        )
      );

      setEditingId(null);
      setEditForm(emptyForm);
      setMessage("Client updated successfully.");
    } catch (err) {
      setError(err.message || "Failed to update client.");
    } finally {
      setActionLoading(false);
    }
  }

  function handleCancelEdit() {
    setEditingId(null);
    setEditForm(emptyForm);
    setError("");
    setMessage("");
    setEditingImageFile(null);
  }

  async function handleDelete(client) {
    if (!isOwner(client)) {
      setError("You cannot delete a client owned by another user.");
      return;
    }

    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer ${client.name} ? Cette action ne peut pas être annulée.`
    );

    if (!confirmed || actionLoading) return;

    setError("");
    setMessage("");
    setActionLoading(true);

    try {
      const response = await fetch(`${API_URL}/${client._id}`, {
        method: "DELETE",
        credentials: "include",
      });

      await readResponse(response);

      setClients((previous) =>
        previous.filter((item) => item._id !== client._id)
      );

      if (editingId === client._id) {
        setEditingId(null);
        setEditForm(emptyForm);
      }

      setMessage("Client supprimé avec succès.");
    } catch (err) {
      setError(err.message || "Failed to delete client.");
    } finally {
      setActionLoading(false);
    }
  }

  function openRdvModal(client) {
    setSelectedClient(client);
    setRdvForm(initialRdvForm);
    setRdvError("");
    setError("");
    setMessage("");
    setShowRdvModal(true);
  }

  function closeRdvModal() {
    if (rdvLoading) return;

    setShowRdvModal(false);
    setSelectedClient(null);
    setRdvForm(initialRdvForm);
    setRdvError("");
  }

  function handleRdvChange(event) {
    const { name, value } = event.target;

    setRdvForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleCreateRdv(event) {
    event.preventDefault();
    setRdvError("");

    if (!currentUserId) {
      setRdvError("User not found. Please log in again.");
      return;
    }

    if (!selectedClient?._id) {
      setRdvError("Please select a valid client.");
      return;
    }

    if (rdvForm.title.trim().length < 2) {
      setRdvError("The appointment title must contain at least 2 characters.");
      return;
    }

    const appointmentDate = new Date(rdvForm.date);

    if (
      !rdvForm.date ||
      Number.isNaN(appointmentDate.getTime()) ||
      appointmentDate.getTime() <= Date.now()
    ) {
      setRdvError("Please select a valid future date and time.");
      return;
    }

    setRdvLoading(true);

    try {
      const response = await fetch(RDV_API, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: currentUserId,
          client: selectedClient._id,
          title: rdvForm.title.trim(),
          date: appointmentDate.toISOString(),
          status: rdvForm.status,
          location: rdvForm.location.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));

      console.log("Create RDV status:", response.status);
      console.log("Create RDV response:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to create appointment.");
      };

      setMessage(
        `Rendez-vous créé avec succès pour ${selectedClient.name}.`
      );

      setShowRdvModal(false);
      setSelectedClient(null);
      setRdvForm(initialRdvForm);
    } catch (err) {
      setRdvError(err.message || "Failed to create appointment.");
    } finally {
      setRdvLoading(false);
    }
  }

  const minRdvDateTime = new Date(
    Date.now() - new Date().getTimezoneOffset() * 60000
  )
    .toISOString()
    .slice(0, 16);

  const query = search.trim().toLowerCase();

  const filteredClients = clients.filter((client) =>
    [client.name, client.email, client.phone].some((value) =>
      String(value ?? "").toLowerCase().includes(query)
    )
  );

  if (loading) {
    return <p className="clients-message">Loading clients...</p>;
  }

  if (error && clients.length === 0) {
    return (
      <div>
        <p className="clients-error" role="alert">{error}</p>
        <button type="button" onClick={fetchClients}>
          Try again
        </button>
      </div>
    );
  }

  return (
    <section className="clients-container">
      <div className="clients-header">
        <div>
          <h2>Clients</h2>
          <p>Consultez tous les clients et gérez ceux que vous possédez.</p>
        </div>

        <span className="clients-count">
          {clients.length} clients
        </span>
      </div>

      <div className="clients-toolbar">
        <div className="clients-search">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search clients"
          />
        </div>
      </div>

      {error && (
        <p className="clients-error" role="alert">{error}</p>
      )}

      {message && (
        <p className="clients-success" role="status">{message}</p>
      )}

      <div className="clients-table-wrapper">
        <table className="clients-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Phone</th>
              <th>Commercial</th>
              <th>Date de création</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredClients.length > 0 ? (
              filteredClients.map((client) => (
                <Fragment key={client._id}>
                  {editingId === client._id ? (
                    <tr className="client-edit-row">
                      <td colSpan={5}>
                        <form
                          className="client-edit-form"
                          onSubmit={handleUpdate}
                        >
                          <h3>Edit client</h3>

                          <div className="client-edit-grid">
                            <label>
                              Nom et prénom
                              <input
                                name="name"
                                value={editForm.name}
                                onChange={handleEditChange}
                                minLength={2}
                                maxLength={100}
                                required
                              />
                            </label>

                            <label>
                              Email
                              <input
                                name="email"
                                type="email"
                                value={editForm.email}
                                onChange={handleEditChange}
                                maxLength={254}
                                required
                              />
                            </label>

                            <label>
                              Phone
                              <input
                                name="phone"
                                type="tel"
                                value={editForm.phone}
                                onChange={handleEditChange}
                                maxLength={15}
                                required
                              />
                            </label>

                            <label>
                              Adresse
                              <input
                                name="address"
                                value={editForm.address}
                                onChange={handleEditChange}
                                maxLength={200}
                              />
                            </label>

                            <label>
                              Nom de l'entreprise
                              <input
                                name="companyName"
                                value={editForm.companyName}
                                onChange={handleEditChange}
                                maxLength={100}
                              />
                            </label>
                            <label className="client-edit-full">
                              Photo / logo de l'entreprise

                              <input
                                type="file"
                                name="image"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                onChange={(event) => {
                                  const file = event.target.files?.[0];

                                  if (!file) {
                                    setEditingImageFile(null);
                                    return;
                                  }

                                  const allowedTypes = [
                                    "image/jpeg",
                                    "image/png",
                                    "image/webp",
                                    "image/gif",
                                  ];

                                  if (!allowedTypes.includes(file.type)) {
                                    setError("Choose a JPG, PNG, WEBP, or GIF image.");
                                    event.target.value = "";
                                    setEditingImageFile(null);
                                    return;
                                  }

                                  if (file.size > 5 * 1024 * 1024) {
                                    setError("The image must be smaller than 5 MB.");
                                    event.target.value = "";
                                    setEditingImageFile(null);
                                    return;
                                  }

                                  setError("");
                                  setEditingImageFile(file);
                                }}
                              />

                              {editingImageFile && (
                                <small>New image: {editingImageFile.name}</small>
                              )}
                            </label>
                            <label className="client-edit-full">
                              Notes
                              <textarea
                                name="notes"
                                value={editForm.notes}
                                onChange={handleEditChange}
                                maxLength={2000}
                                rows={4}
                              />
                            </label>
                          </div>

                          <div className="client-actions">
                            <button
                              type="submit"
                              className="client-action-btn client-action-save"
                              disabled={actionLoading}
                            >
                              {actionLoading ? "Saving..." : "Save changes"}
                            </button>

                            <button
                              type="button"
                              className="client-action-btn client-action-cancel"
                              disabled={actionLoading}
                              onClick={handleCancelEdit}
                            >
                              Annuler
                            </button>
                          </div>
                        </form>
                      </td>
                    </tr>
                  ) : (
                    <tr>
                      <td>
                        <div className="client-identity">
                          <div className="client-avatar">
                            {(client.name || "?")
                              .trim()
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="client-details">
                            <Link
                              to={`/dashboard/clients/${client._id}`}
                              className="client-name client-details-link"
                            >
                              {client.name || "Unnamed client"}
                            </Link>

                            <Link
                              to={`/dashboard/clients/${client._id}`}
                              className="client-email client-details-link"
                            >
                              {client.email || "No email"}
                            </Link>
                          </div>
                        </div>
                      </td>

                      <td>{client.phone || "—"}</td>

                      <td>
                        {client.user?.name ||
                          (isOwner(client) ? currentUser?.name : null) ||
                          "Unknown"}
                      </td>

                      <td>
                        {client.createdAt
                          ? new Date(client.createdAt).toLocaleDateString()
                          : "—"}
                      </td>

                      <td>
                        <div className="client-actions">
                          <Link
                            to={`/dashboard/clients/${client._id}`}
                            className="client-action-btn"
                          >
                            Details
                          </Link>

                          {isOwner(client) && (
                            <>
                              <button
                                type="button"
                                className="client-action-btn client-action-edit"
                                disabled={actionLoading || rdvLoading}
                                onClick={() => handleEdit(client)}
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                className="client-action-btn client-action-delete"
                                disabled={actionLoading || rdvLoading}
                                onClick={() => handleDelete(client)}
                              >
                                Supprimer
                              </button>
                              <button
                                type="button"
                                className="client-action-btn client-action-rdv"
                                disabled={actionLoading || rdvLoading}
                                onClick={() => openRdvModal(client)}
                              >
                                + Créer RDV
                              </button>
                            </>
                          )}


                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="clients-empty">
                  {query
                    ? "No clients match your search."
                    : "No clients found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="clients-footer">
        Showing {filteredClients.length} of {clients.length} clients
      </div>

      {showRdvModal && selectedClient && (
        <div
          className="rdv-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !rdvLoading
            ) {
              closeRdvModal();
            }
          }}
        >
          <section
            className="rdv-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-client-rdv-title"
          >
            <div className="rdv-modal-header">
              <div>
                <h2 id="create-client-rdv-title">Créer RDV</h2>
                <p>
                  Client: <strong>{selectedClient.name}</strong>
                </p>
                <p>
                  Commercial: <strong>{currentUser?.name || "User"}</strong>
                </p>
              </div>

              <button
                type="button"
                className="rdv-modal-close"
                aria-label="Close modal"
                onClick={closeRdvModal}
                disabled={rdvLoading}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateRdv}>
              <div className="rdv-modal-body">
                {rdvError && (
                  <p className="clients-error" role="alert">{rdvError}</p>
                )}

                <div className="form-group">
                  <label htmlFor="client-rdv-title">
                    Titre du rendez-vous*
                  </label>
                  <input
                    id="client-rdv-title"
                    name="title"
                    value={rdvForm.title}
                    onChange={handleRdvChange}
                    minLength={2}
                    maxLength={150}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="client-rdv-date">Date et heure *</label>
                  <input
                    id="client-rdv-date"
                    name="date"
                    type="datetime-local"
                    value={rdvForm.date}
                    onChange={handleRdvChange}
                    min={minRdvDateTime}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="client-rdv-status">Status</label>
                  <select
                    id="client-rdv-status"
                    name="status"
                    value={rdvForm.status}
                    onChange={handleRdvChange}
                  >
                    <option value="scheduled">Programmé</option>
                    <option value="confirmed">Confirmé</option>
                    <option value="completed">Terminé</option>
                    <option value="cancelled">Annulé</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="client-rdv-location">Emplacement</label>
                  <input
                    id="client-rdv-location"
                    name="location"
                    value={rdvForm.location}
                    onChange={handleRdvChange}
                    maxLength={200}
                    placeholder="Bureau du client"
                  />
                </div>
              </div>

              <div className="rdv-modal-actions">
                <button
                  type="button"
                  className="client-action-btn client-action-cancel"
                  onClick={closeRdvModal}
                  disabled={rdvLoading}
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="client-action-btn client-action-save"
                  disabled={rdvLoading || !currentUserId}
                >
                  {rdvLoading ? "Creating..." : "Créer RDV"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}

export default ListClient;
