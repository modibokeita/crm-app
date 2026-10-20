
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Header from "../../components/Header"
import "./details.css";

const API_URL = "http://localhost:3000/api/clients";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
  companyName: "",
  notes: "",
};

function DetailsClient() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [client, setClient] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function fetchClient() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load client.");
      }

      const fetchedClient = data.client ?? data;

      setClient(fetchedClient);
      setEditForm({
        name: fetchedClient.name || "",
        email: fetchedClient.email || "",
        phone: fetchedClient.phone || "",
        address: fetchedClient.address || "",
        companyName: fetchedClient.companyName || "",
        notes: fetchedClient.notes || "",
      });
    } catch (err) {
      setError(err.message || "Unable to load client.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchClient();
  }, [id]);

  function handleChange(e) {
    const { name, value } = e.target;

    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleStartEdit() {
    setError("");
    setMessage("");
    setEditing(true);
  }

  function handleCancelEdit() {
    setEditForm({
      name: client.name || "",
      email: client.email || "",
      phone: client.phone || "",
      address: client.address || "",
      companyName: client.companyName || "",
      notes: client.notes || "",
    });

    setEditing(false);
    setError("");
    setMessage("");
  }

  async function handleUpdate(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/${id}`, {
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

      const updatedClient = {
        ...client,
        ...editForm,
        ...(data.client ?? data),
        _id: id,
      };

      setClient(updatedClient);
      setEditForm({
        name: updatedClient.name || "",
        email: updatedClient.email || "",
        phone: updatedClient.phone || "",
        address: updatedClient.address || "",
        companyName: updatedClient.companyName || "",
        notes: updatedClient.notes || "",
      });

      setEditing(false);
      setMessage("Client updated successfully.");
    } catch (err) {
      setError(err.message || "Failed to update client.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${client.name}? This action cannot be undone.`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete client.");
      }

      navigate("/dashboard/clients", {
        state: { message: "Client deleted successfully." },
      });
    } catch (err) {
      setError(err.message || "Failed to delete client.");
    }
  }

  if (loading) {
    return (
      <main className="client-details-page">
        <p className="details-loading">Loading client details...</p>
      </main>
    );
  }

  if (error && !client) {
    return (
      <main className="client-details-page">
        <Link to="/dashboard/clients" className="details-back-link">
          ← Back to clients 
        </Link>

        <div className="details-error" role="alert">
          {error}
        </div>

        <button
          type="button"
          className="details-btn details-btn-secondary"
          onClick={fetchClient}
        >
          Try again
        </button>
      </main>
    );
  }

  if (!client) return null;

  return (
    <main className="client-details-page">
      <div className="details-topbar">
        <Link to="/dashboard/clients" className="details-back-link">
          <span aria-hidden="true">←</span> Back to clients 
        </Link>

        {!editing && (
          <div className="details-top-actions">
            <button
              type="button"
              className="details-btn details-btn-primary"
              onClick={handleStartEdit}
            >
              Edit client
            </button>

            <button
              type="button"
              className="details-btn details-btn-danger"
              onClick={handleDelete}
            >
              Delete client
            </button>
          </div>
        )}
      </div>

        <Header />

      {error && (
        <div className="details-error" role="alert">
          {error}
        </div>
      )}

      {message && (
        <div className="details-success" role="status">
          {message}
        </div>
      )}

      {editing ? (
        <form className="details-card details-edit-form" onSubmit={handleUpdate}>
          <div className="details-card-heading">
            <h2>Edit information</h2>
            <p>Fields marked with * are required.</p>
          </div>

          <div className="details-form-grid">
            <label>
              Full name *
              <input
                name="name"
                value={editForm.name}
                onChange={handleChange}
                minLength={2}
                maxLength={100}
                required
              />
            </label>

            <label>
              Email address *
              <input
                name="email"
                type="email"
                value={editForm.email}
                onChange={handleChange}
                maxLength={254}
                required
              />
            </label>

            <label>
              Phone number *
              <input
                name="phone"
                type="tel"
                value={editForm.phone}
                onChange={handleChange}
                maxLength={15}
                required
              />
            </label>

            <label>
              Company name
              <input
                name="companyName"
                value={editForm.companyName}
                onChange={handleChange}
                maxLength={100}
              />
            </label>

            <label className="details-form-full">
              Address
              <input
                name="address"
                value={editForm.address}
                onChange={handleChange}
                maxLength={200}
              />
            </label>

            <label className="details-form-full">
              Notes
              <textarea
                name="notes"
                value={editForm.notes}
                onChange={handleChange}
                maxLength={2000}
                rows={5}
              />
              <small>{editForm.notes.length}/2000 characters</small>
            </label>
          </div>

          <div className="details-form-actions">
            <button
              type="button"
              className="details-btn details-btn-secondary"
              onClick={handleCancelEdit}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="details-btn details-btn-primary"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      ) : (
        <>
          <section className="details-profile-card" id="section-infos">
            <div className="details-avatar">
              {(client.name || "?").trim().charAt(0).toUpperCase()}
            </div>

            <div className="details-profile-info">
              <h2>{client.name || "Unnamed client"}</h2>
              <p>{client.email || "No email provided"}</p>

              <span className="details-profile-badge">
                Client
              </span>
            </div>
          </section>

          <section className="details-card">
            <div className="details-card-heading">
              <h2>Contact information</h2>
              <p>Client's primary contact details.</p>
            </div>

            <div className="details-info-grid">
              <div className="details-info-item">
                <span>Full name</span>
                <strong>{client.name || "—"}</strong>
              </div>

              <div className="details-info-item">
                <span>Email address</span>
                <strong>{client.email || "—"}</strong>
              </div>

              <div className="details-info-item">
                <span>Phone number</span>
                <strong>{client.phone || "—"}</strong>
              </div>

              <div className="details-info-item">
                <span>Company name</span>
                <strong>{client.companyName || "—"}</strong>
              </div>

              <div className="details-info-item details-info-full">
                <span>Address</span>
                <strong>{client.address || "No address provided"}</strong>
              </div>
            </div>
          </section>

          <section className="details-card">
            <div className="details-card-heading">
              <h2>Notes</h2>
              <p>Additional information about this client.</p>
            </div>

            <p className="details-notes">
              {client.notes?.trim() || "No notes have been added yet."}
            </p>
          </section>

          <section className="details-card details-meta-card">
            <div className="details-info-item">
              <span>Client since</span>
              <strong>
                {client.createdAt
                  ? new Date(client.createdAt).toLocaleDateString()
                  : "—"}
              </strong>
            </div>

            <div className="details-info-item">
              <span>Last updated</span>
              <strong>
                {client.updatedAt
                  ? new Date(client.updatedAt).toLocaleDateString()
                  : "—"}
              </strong>
            </div>

          </section>
        </>
      )}
    </main>
  );
}

export default DetailsClient;
