import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link } from "react-router-dom";
import "./rdvList.css";

const RDV_API = "http://localhost:3000/api/rdv";

function RdvList() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // Fetch appointments from the backend
  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(RDV_API, {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load appointments."
        );
      }

      setAppointments(
        Array.isArray(data)
          ? data
          : data.appointments || data.rdvs || []
      );
    } catch (err) {
      setError(err.message || "Unable to load appointments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Filter appointments by text, date, and status
  const filteredAppointments = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return appointments.filter((appointment) => {
      const client = appointment.client;
      const user = appointment.user;

      // Text search
      const matchesSearch =
        !searchTerm ||
        [
          appointment.title,
          client?.name,
          client?.companyName,
          client?.email,
          client?.phone,
          user?.name,
          user?.email,
          appointment.location,
        ].some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(searchTerm)
        );

      // Status filter
      const matchesStatus =
        statusFilter === "all" ||
        appointment.status === statusFilter;

      // Date filter using the browser's local calendar date
      let matchesDate = true;

      if (selectedDate) {
        const appointmentDate = new Date(appointment.date);

        if (Number.isNaN(appointmentDate.getTime())) {
          matchesDate = false;
        } else {
          const year = appointmentDate.getFullYear();
          const month = String(
            appointmentDate.getMonth() + 1
          ).padStart(2, "0");
          const day = String(
            appointmentDate.getDate()
          ).padStart(2, "0");

          const localDate = `${year}-${month}-${day}`;

          matchesDate = localDate === selectedDate;
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [appointments, search, statusFilter, selectedDate]);

  // Delete an appointment
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this RDV?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError("");

      const response = await fetch(`${RDV_API}/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete appointment."
        );
      }

      setAppointments((previous) =>
        previous.filter(
          (appointment) => appointment._id !== id
        )
      );
    } catch (err) {
      setError(err.message || "Unable to delete appointment.");
    } finally {
      setDeletingId(null);
    }
  };

  // Format appointment date and time
  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Invalid date";
    }

    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(parsedDate);
  };

  // Format duration in minutes or hours
  const formatDuration = (duration) => {
    const minutes = Number(duration);

    if (!Number.isFinite(minutes)) return "—";
    if (minutes < 60) return `${minutes} min`;

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return remainingMinutes
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  // Format status for display
  const formatStatus = (status) => {
    if (!status) return "Unknown";

    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearch("");
    setSelectedDate("");
    setStatusFilter("all");
  };

  return (
    <div className="content-dash rdv-list-page">
      {/* Page header */}
      <div className="rdv-list-header">
        <div>
          <h2>Rendez-vous</h2>
          <p>Gérez et suivez vos rendez-vous.</p>
        </div>

        <div className="rdv-list-header-actions">
          <button
            type="button"
            className="rdv-refresh-btn"
            onClick={fetchAppointments}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>

          <Link
            to="/dashboard/newRdv"
            className="rdv-create-btn"
          >
            + New RDV
          </Link>
        </div>
      </div>

      {/* Statistics */}
      <div className="rdv-list-stats">
        <div className="rdv-stat-card">
          <span>Total RDV</span>
          <strong>{appointments.length}</strong>
        </div>

        <div className="rdv-stat-card">
          <span>Programmé</span>
          <strong>
            {
              appointments.filter(
                (item) => item.status === "scheduled"
              ).length
            }
          </strong>
        </div>

        <div className="rdv-stat-card">
          <span>Confirmé</span>
          <strong>
            {
              appointments.filter(
                (item) => item.status === "confirmed"
              ).length
            }
          </strong>
        </div>

        <div className="rdv-stat-card">
          <span>Complété</span>
          <strong>
            {
              appointments.filter(
                (item) => item.status === "completed"
              ).length
            }
          </strong>
        </div>
      </div>

      {/* Appointment table and filters */}
      <div className="rdv-list-card">
        <div className="rdv-list-toolbar">
          {/* Search by title, client, user, etc. */}
          <div className="rdv-search-box">
            <span aria-hidden="true">⌕</span>

            <input
              type="search"
              placeholder="Search title, client, or user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search appointments"
            />
          </div>

          {/* Filter by date */}
          <input
            type="date"
            className="rdv-date-filter"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            aria-label="Filter appointments by date"
          />

          {/* Filter by status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter appointments by status"
            className="rdv-status-filter"
          >
            <option value="all">All statuses</option>
            <option value="scheduled">Programmé</option>
            <option value="confirmed">Confirmé</option>
            <option value="completed">Complété</option>
            <option value="cancelled">Annulé</option>
          </select>

          {/* Clear filters */}
          {(search || selectedDate || statusFilter !== "all") && (
            <button
              type="button"
              className="rdv-clear-filter-btn"
              onClick={clearFilters}
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Errors */}
        {error && (
          <div className="rdv-list-error" role="alert">
            <span>{error}</span>

            <button
              type="button"
              onClick={fetchAppointments}
            >
              Try again
            </button>
          </div>
        )}

        {/* Loading state or table */}
        {loading ? (
          <div className="rdv-list-message">
            Loading appointments...
          </div>
        ) : (
          <div className="rdv-table-wrapper">
            <table className="rdv-table">
              <thead>
                <tr>
                  <th>RDV</th>
                  <th>Client</th>
                  <th>Commercial</th>
                  <th>Date et heure</th>
                  <th></th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="rdv-empty-cell">
                      {appointments.length === 0
                        ? "No RDV yet. Create your first RDV."
                        : "No appointments match your filters."}
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((appointment) => (
                    <tr key={appointment._id}>
                      {/* Appointment title */}
                      <td>
                        <div className="rdv-title-cell">
                          <strong>
                            {appointment.title || "Untitled RDV"}
                          </strong>

                          {appointment.location && (
                            <small>{appointment.location}</small>
                          )}
                        </div>
                      </td>

                      {/* Client information */}
                      <td>
                        {appointment.client?._id ? (
                          <Link
                            className="rdv-client-link"
                            to={`/dashboard/clients/${appointment.client._id}`}
                          >
                            {appointment.client.name || "View client"}
                          </Link>
                        ) : (
                          appointment.client?.name ||
                          "Client unavailable"
                        )}

                        {appointment.client?.companyName && (
                          <small className="rdv-secondary-text">
                            {appointment.client.companyName}
                          </small>
                        )}
                      </td>

                      {/* User who booked the appointment */}
                      <td>
                        {appointment.user?.name || "Unknown user"}
                      </td>

                      {/* Appointment date */}
                      <td>{formatDate(appointment.date)}</td>

                      {/* Appointment duration */}
                      <td>
                        {formatDuration(appointment.duration)}
                      </td>

                      {/* Appointment status */}
                      <td>
                        <span
                          className={`rdv-status-badge rdv-status-${appointment.status || "unknown"}`}
                        >
                          {formatStatus(appointment.status)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="rdv-row-actions">
                          <Link
                            to={`/dashboard/rdv/${appointment._id}`}
                            className="rdv-view-btn"
                            aria-label={`View ${appointment.title}`}
                          >
                            View
                          </Link>

                          <button
                            type="button"
                            className="rdv-delete-btn"
                            onClick={() =>
                              handleDelete(appointment._id)
                            }
                            disabled={
                              deletingId === appointment._id
                            }
                            aria-label={`Delete ${appointment.title}`}
                          >
                            {deletingId === appointment._id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Results count */}
        <div className="rdv-list-footer">
          Showing {filteredAppointments.length} of{" "}
          {appointments.length} RDV
        </div>
      </div>
    </div>
  );
}

export default RdvList;
