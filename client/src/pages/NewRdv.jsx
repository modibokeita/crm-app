import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./newRdv.css";

const CLIENTS_API = "http://localhost:3000/api/clients";
const RDV_API = "http://localhost:3000/api/rdv/newRdv";

const initialForm = {
  user: "",
  client: "",
  title: "",
  date: "",
  status: "scheduled",
  location: "",

};

// Read the connected user from localStorage.
const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

function NewRdv() {
  const navigate = useNavigate();

  
  const [clients, setClients] = useState([]);
  const [currentUser] = useState(getStoredUser);

  const [formData, setFormData] = useState(() => ({
    ...initialForm,
    user: currentUser?._id || currentUser?.id || "",
  }));

  const [loadingClients, setLoadingClients] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load clients from the backend.
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setError("");

        const response = await fetch(CLIENTS_API, {
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load clients."
          );
        }

        setClients(
          Array.isArray(data) ? data : data.clients || []
        );
      } catch (err) {
        setError(err.message || "Unable to load clients.");
      } finally {
        setLoadingClients(false);
      }
    };

    fetchClients();
  }, []);

  // Update form fields.
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Submit the appointment.
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.user) {
      setError(
        "Connected user not found. Please log in again."
      );
      return;
    }

    if (!formData.client) {
      setError("Please select a client.");
      return;
    }

    if (!formData.title.trim() || formData.title.trim().length < 2) {
      setError("The appointment title must contain at least 2 characters.");
      return;
    }

    if (!formData.date) {
      setError("Please select an appointment date and time.");
      return;
    }

    const selectedDate = new Date(formData.date);

    if (Number.isNaN(selectedDate.getTime())) {
      setError("Please enter a valid appointment date.");
      return;
    }

    if (selectedDate <= new Date()) {
      setError("The appointment must be in the future.");
      return;
    }

    const duration = Number(formData.duration);

    if (
      !Number.isInteger(duration) ||
      duration < 5 ||
      duration > 480
    ) {
      setError("Duration must be between 5 and 480 minutes.");
      return;
    }

    const payload = {
      user: formData.user,
      client: formData.client,
      title: formData.title.trim(),
      date: selectedDate.toISOString(),
      status: formData.status,
      location: formData.location.trim(),
  
    };

    try {
      setSubmitting(true);

      const response = await fetch(RDV_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create the appointment."
        );
      }

      setSuccess("Appointment created successfully!");

      // Reset the form but keep the connected user.
      setFormData({
        ...initialForm,
        user: currentUser?._id || currentUser?.id || "",
      });

      // Navigate to the appointment list.
      setTimeout(() => {
        navigate("/dashboard/rdv");
      }, 1000);
    } catch (err) {
      setError(
        err.message || "An unexpected error occurred."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Format the current local time for the date input's minimum.
  const minDateTime = new Date(
    Date.now() - new Date().getTimezoneOffset() * 60000
  )
    .toISOString()
    .slice(0, 16);

  return (
    <div className="content-dash new-rdv-page">

      <form className="rdv-form" onSubmit={handleSubmit}>
        {error && (
          <div className="rdv-alert rdv-alert-error" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="rdv-alert rdv-alert-success" role="status">
            {success}
          </div>
        )}

        <section className="rdv-form-section">
          <h2>RDV information</h2>

          <p className="rdv-section-description">
            Complete the details below to create your RDV.
          </p>

          <div className="rdv-form-grid">
            {/* Connected user */}
            <div className="rdv-field rdv-field-full">
              <label htmlFor="bookedBy">Booked by</label>

              <input
                id="bookedBy"
                type="text"
                value={currentUser?.name || "User not found"}
                readOnly
              />

              {!formData.user && (
                <small className="rdv-user-error">
                  User ID not found. Please log in again.
                </small>
              )}
            </div>

            {/* Appointment title */}
            <div className="rdv-field rdv-field-full">
              <label htmlFor="title">RDV title *</label>

              <input
                id="title"
                name="title"
                type="text"
                placeholder="e.g. Discuss service proposal"
                value={formData.title}
                onChange={handleChange}
                minLength={2}
                maxLength={150}
                required
              />
            </div>

            {/* Client */}
            <div className="rdv-field">
              <label htmlFor="client">Client *</label>

              <select
                id="client"
                name="client"
                value={formData.client}
                onChange={handleChange}
                required
                disabled={
                  loadingClients || clients.length === 0
                }
              >
                <option value="">
                  {loadingClients
                    ? "Loading clients..."
                    : clients.length === 0
                    ? "No clients available"
                    : "Select a client"}
                </option>

                {clients.map((client) => (
                  <option
                    key={client._id}
                    value={client._id}
                  >
                    {client.name}
                    {client.companyName
                      ? ` — ${client.companyName}`
                      : ""}
                  </option>
                ))}
              </select>

              {!loadingClients && clients.length === 0 && (
                <small>
                  Create a client first.{" "}
                  <Link to="/clients">Go to clients</Link>
                </small>
              )}
            </div>

            {/* Date and time */}
            <div className="rdv-field">
              <label htmlFor="date">Date and time *</label>

              <input
                id="date"
                name="date"
                type="datetime-local"
                value={formData.date}
                onChange={handleChange}
                min={minDateTime}
                required
              />
            </div>


            {/* Status */}
            <div className="rdv-field">
              <label htmlFor="status">Status</label>

              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                    <option value="scheduled">Programmé</option>
                    <option value="confirmed">Confirmé</option>
                    <option value="completed">Complété</option>
                    <option value="cancelled">Annulé</option>
              </select>
            </div>

            {/* Location */}
            <div className="rdv-field rdv-field-full">
              <label htmlFor="location">Location</label>

              <input
                id="location"
                name="location"
                type="text"
                placeholder="Office address or meeting location"
                value={formData.location}
                onChange={handleChange}
                maxLength={200}
              />
            </div>
          </div>
        </section>

        <div className="rdv-form-footer">
          <Link
            to="/dashboard/rdv"
            className="rdv-cancel-btn"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="rdv-submit-btn"
            disabled={
              submitting ||
              loadingClients ||
              clients.length === 0 ||
              !formData.user
            }
          >
            {submitting
              ? "Creating..."
              : "Create RDV"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default NewRdv;