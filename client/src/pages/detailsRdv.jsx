import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./detailsRdv.css";

const API_URL = "http://localhost:3000/api/rdv";

function DetailsRdv() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const fetchAppointment = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/${id}`, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to retrieve this appointment."
        );
      }

      setAppointment(data.appointment);
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAppointment();
  }, [fetchAppointment]);

  const formatDate = (date) => {
    if (!date) return "Not specified";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Invalid date";
    }

    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "full",
      timeStyle: "short",
    }).format(parsedDate);
  };

  const formatStatus = (status) => {
    if (!status) return "Unknown";

    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this appointment? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setError("");

      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete appointment.");
      }

      navigate("/dashboard/rdv", {
        state: { message: "Appointment deleted successfully." },
      });
    } catch (err) {
      setError(err.message || "Unable to delete this appointment.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <main className="rdv-details-page">
        <div className="rdv-details-message">
          <span className="rdv-spinner" />
          <p>Loading appointment details...</p>
        </div>
      </main>
    );
  }

  if (error && !appointment) {
    return (
      <main className="rdv-details-page">
        <div className="rdv-details-message rdv-details-error">
          <span className="rdv-details-message-icon">!</span>
          <h2>RDV not found</h2>
          <p>{error}</p>
          <button
            className="rdv-btn rdv-btn-primary"
            onClick={() => navigate("/dashboard/rdv")}
          >
            Back to rdv
          </button>
        </div>
      </main>
    );
  }

  if (!appointment) return null;

  const client = appointment.client;
  const user = appointment.user;

  return (
    <main className="rdv-details-page">
      

      {error && (
        <div className="rdv-alert rdv-alert-error" role="alert">
          {error}
        </div>
      )}

      <section className="rdv-details-grid">
        <article className="rdv-details-card rdv-details-main-card">
          <div className="rdv-card-heading">
            <div className="rdv-card-icon">▦</div>
            <div>
              <h2>RDV information</h2>
              <p>Schedule and meeting details</p>
            </div>
          </div>

          <div className="rdv-detail-item">
            <span className="rdv-detail-label">Title</span>
            <span className="rdv-detail-value">{appointment.title}</span>
          </div>

          <div className="rdv-detail-item">
            <span className="rdv-detail-label">Date and time</span>
            <span className="rdv-detail-value">
              {formatDate(appointment.date)}
            </span>
          </div>



          <div className="rdv-detail-item">
            <span className="rdv-detail-label">Status</span>
            <span
              className={`rdv-status-badge rdv-status-${appointment.status || "unknown"}`}
            >
              <span className="rdv-status-dot" />
              {formatStatus(appointment.status)}
            </span>
          </div>

          <div className="rdv-detail-item">
            <span className="rdv-detail-label">Location</span>
            <span className="rdv-detail-value">
              {appointment.location || "No location specified"}
            </span>
          </div>

          <div className="rdv-detail-item">
            <span className="rdv-detail-label">Notes</span>
            <p className="rdv-detail-notes">
              {appointment.notes || "No notes added to this appointment."}
            </p>
          </div>
        </article>

        <div className="rdv-details-side">
          <article className="rdv-details-card">
            <div className="rdv-card-heading">
              <div className="rdv-card-icon rdv-client-icon">♙</div>
              <div>
                <h2>Client information</h2>
                <p>Who is this appointment for?</p>
              </div>
            </div>

            {client && typeof client === "object" ? (
              <>
                <div className="rdv-profile">
                  <div className="rdv-avatar">
                    {client.name?.charAt(0)?.toUpperCase() || "C"}
                  </div>
                  <div>
                    <h3>{client.name || "Unnamed client"}</h3>
                    <p>{client.companyName || "Client"}</p>
                  </div>
                </div>

                <div className="rdv-detail-item">
                  <span className="rdv-detail-label">Email</span>
                  <span className="rdv-detail-value">
                    {client.email || "Not provided"}
                  </span>
                </div>

                <div className="rdv-detail-item">
                  <span className="rdv-detail-label">Phone</span>
                  <span className="rdv-detail-value">
                    {client.phone || "Not provided"}
                  </span>
                </div>

                <div className="rdv-detail-item">
                  <span className="rdv-detail-label">Address</span>
                  <span className="rdv-detail-value">
                    {client.address || "Not provided"}
                  </span>
                </div>
              </>
            ) : (
              <p className="rdv-empty-related">
                Client information is unavailable.
              </p>
            )}
          </article>

          <article className="rdv-details-card">
            <div className="rdv-card-heading">
              <div className="rdv-card-icon rdv-user-icon">♙</div>
              <div>
                <h2>Booked by</h2>
                <p>User who created the appointment</p>
              </div>
            </div>

            {user && typeof user === "object" ? (
              <div className="rdv-profile">
                <div className="rdv-avatar rdv-avatar-user">
                  {user.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div>
                  <h3>{user.name || "Unknown user"}</h3>
                  <p>{user.email || "No email provided"}</p>
                </div>
              </div>
            ) : (
              <p className="rdv-empty-related">
                Booking user information is unavailable.
              </p>
            )}
          </article>

          <article className="rdv-details-card rdv-metadata-card">
            <h2>Record information</h2>

            <div className="rdv-detail-item">
              <span className="rdv-detail-label">Created</span>
              <span className="rdv-detail-value">
                {appointment.createdAt
                  ? new Date(appointment.createdAt).toLocaleDateString()
                  : "Not available"}
              </span>
            </div>

            <div className="rdv-detail-item">
              <span className="rdv-detail-label">Last updated</span>
              <span className="rdv-detail-value">
                {appointment.updatedAt
                  ? new Date(appointment.updatedAt).toLocaleDateString()
                  : "Not available"}
              </span>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}

export default DetailsRdv;