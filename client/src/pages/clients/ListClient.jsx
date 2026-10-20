
import { Fragment, useEffect, useState } from "react";
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

function ListClient() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [actionLoading, setActionLoading] = useState(false);

  // RDV modal state
  const [showRdvModal, setShowRdvModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [rdvForm, setRdvForm] = useState(initialRdvForm);
  const [rdvLoading, setRdvLoading] = useState(false);
  const [rdvError, setRdvError] = useState("");
  const [currentUser] = useState(getStoredUser);

  // Fetch clients from the backend
  async function fetchClients() {
    try {
      setError("");

      const response = await fetch(API_URL);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Failed to load clients.");
      }

      setClients(
        Array.isArray(data) ? data : data.clients ?? []
      );
    } catch (err) {
      setError(err.message || "Failed to load clients.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchClients();
  }, []);

  // Open the client edit form
  function handleEdit(client) {
    setError("");
    setMessage("");
    setEditingId(client._id);

    setEditForm({
      name: client.name || "",
      email: client.email || "",
      phone: client.phone || "",
      address: client.address || "",
      companyName: client.companyName || "",
      notes: client.notes || "",
    });
  }

  function handleEditChange(e) {
    const { name, value } = e.target;

    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // Update a client
  async function handleUpdate(e) {
    e.preventDefault();

    if (!editingId || actionLoading) return;

    setError("");
    setMessage("");
    setActionLoading(true);

    try {
      const response = await fetch(`${API_URL}/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Failed to update client.");
      }

      const returnedClient = data.client ?? data;

      const updatedClient = {
        ...editForm,
        ...returnedClient,
        _id: editingId,
      };

      setClients((prev) =>
        prev.map((client) =>
          client._id === editingId
            ? { ...client, ...updatedClient }
            : client
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
  }

  // Delete a client
  async function handleDelete(client) {
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer ${client.name}? Cette action ne peut pas être annulée.`
    );

    if (!confirmed || actionLoading) return;

    setError("");
    setMessage("");
    setActionLoading(true);

    try {
      const response = await fetch(`${API_URL}/${client._id}`, {
        method: "DELETE",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete client.");
      }

      setClients((prev) =>
        prev.filter((item) => item._id !== client._id)
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

  // Open the RDV modal for the selected client
  function openRdvModal(client) {
    setSelectedClient(client);
    setRdvForm(initialRdvForm);
    setRdvError("");
    setError("");
    setMessage("");
    setShowRdvModal(true);
  }

  // Close the RDV modal
  function closeRdvModal() {
    if (rdvLoading) return;

    setShowRdvModal(false);
    setSelectedClient(null);
    setRdvForm(initialRdvForm);
    setRdvError("");
  }

  // Update RDV form fields
  function handleRdvChange(e) {
    const { name, value } = e.target;

    setRdvForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // Create an appointment associated with the selected client and user
  async function handleCreateRdv(e) {
    e.preventDefault();
    setRdvError("");

    const userId = currentUser?._id || currentUser?.id;
    const clientId = selectedClient?._id;

    if (!userId) {
      setRdvError("User ID not found. Please log in again.");
      return;
    }

    if (!clientId) {
      setRdvError("Please select a valid client.");
      return;
    }

    if (!rdvForm.title.trim() || rdvForm.title.trim().length < 2) {
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
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          user: userId,
          client: clientId,
          title: rdvForm.title.trim(),
          date: appointmentDate.toISOString(),
          status: rdvForm.status,
          location: rdvForm.location.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create the appointment."
        );
      }

      setMessage(
        `Rendez-vous créé avec succès pour ${selectedClient.name}.`
      );

      setShowRdvModal(false);
      setSelectedClient(null);
      setRdvForm(initialRdvForm);
      setRdvError("");
    } catch (err) {
      setRdvError(err.message || "Something went wrong.");
    } finally {
      setRdvLoading(false);
    }
  }

  // Minimum date/time for the datetime-local input
  const minRdvDateTime = new Date(
    Date.now() - new Date().getTimezoneOffset() * 60000
  )
    .toISOString()
    .slice(0, 16);

  // Search clients by name, email, or phone
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
        <p className="clients-error" role="alert">
          {error}
        </p>

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
          <p>Gérez et consultez tous vos clients.</p>
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
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search clients"
          />
        </div>
      </div>

      {error && (
        <p className="clients-error" role="alert">
          {error}
        </p>
      )}

      {message && (
        <p className="clients-success" role="status">
          {message}
        </p>
      )}

      <div className="clients-table-wrapper">
        <table className="clients-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Phone</th>
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
                      <td colSpan={4}>
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
                              Addresse
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
                              {actionLoading
                                ? "Saving..."
                                : "Save changes"}
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
                        {client.createdAt
                          ? new Date(
                              client.createdAt
                            ).toLocaleDateString()
                          : "—"}
                      </td>

                      <td>
                        <div className="client-actions">
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
                            className="client-action-btn client-action-rdv"
                            disabled={actionLoading || rdvLoading}
                            onClick={() => openRdvModal(client)}
                          >
                            + Créer RDV
                          </button>

                          <button
                            type="button"
                            className="client-action-btn client-action-delete"
                            disabled={actionLoading || rdvLoading}
                            onClick={() => handleDelete(client)}
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="clients-empty">
                  {search
                    ? "No clients match your search."
                    : "No clients found. Add your first client."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="clients-footer">
        Showing {filteredClients.length} of {clients.length} clients
      </div>

      {/* Create RDV modal */}
      {showRdvModal && selectedClient && (
        <div
          className="rdv-modal-overlay"
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget &&
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
                <h2 id="create-client-rdv-title">
                  Créer RDV
                </h2>

                <p>
                  Client:{" "}
                  <strong>
                    {selectedClient.name || "Unnamed client"}
                  </strong>
                </p>

                <p>
                  commercial:{" "}
                  <strong>
                    {currentUser?.name || "User not found"}
                  </strong>
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
                  <p className="clients-error" role="alert">
                    {rdvError}
                  </p>
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
                    placeholder="e.g. G-Clinic product presentation"
                    minLength={2}
                    maxLength={150}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="client-rdv-date">
                    Date et heure *
                  </label>

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
                  <label htmlFor="client-rdv-status">
                    Status
                  </label>

                  <select
                    id="client-rdv-status"
                    name="status"
                    value={rdvForm.status}
                    onChange={handleRdvChange}
                  >
                    <option value="scheduled">programmé</option>
                    <option value="confirmed">Confirmé</option>
                    <option value="completed">complété</option>
                    <option value="cancelled">annulé</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="client-rdv-location">
                    Emplacement
                  </label>

                  <input
                    id="client-rdv-location"
                    name="location"
                    value={rdvForm.location}
                    onChange={handleRdvChange}
                    maxLength={200}
                    placeholder="e.g. Client's office"
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
                  disabled={
                    rdvLoading ||
                    (!currentUser?._id && !currentUser?.id)
                  }
                >
                  {rdvLoading
                    ? "Creating..."
                    : "Créer RDV"}
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
