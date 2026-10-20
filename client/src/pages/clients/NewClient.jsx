
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./newClient.css";

const CLIENTS_API = "http://localhost:3000/api/clients/newClient";
const RDV_API = "http://localhost:3000/api/rdv/newRdv";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
  region: "",
  companyName: "",
  user: "",
  objections: "interesse",
  produits: "gclinic",
  notes: "",
};

const initialRdv = {
  title: "",
  date: "",
  status: "Programmé",
  location: "",
};

const regions = [
  "Bamako",
  "Kayes",
  "Koulikoro",
  "Sikasso",
  "Ségou",
  "Mopti",
  "Tombouctou",
  "Gao",
  "Kidal",
  "Ménaka",
  "Taoudénit",
];

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

function NewClient() {
  const navigate = useNavigate();
  const [currentUser] = useState(getStoredUser);

  const [formData, setFormData] = useState(() => ({
    ...initialForm,
    user: currentUser?._id || currentUser?.id || "",
  }));

  const [rdvData, setRdvData] = useState(initialRdv);
  const [showRdvModal, setShowRdvModal] = useState(false);
  const [rdvAdded, setRdvAdded] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const minDateTime = new Date(
    Date.now() - new Date().getTimezoneOffset() * 60000
  )
    .toISOString()
    .slice(0, 16);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleRdvChange(e) {
    const { name, value } = e.target;
    setRdvData((prev) => ({ ...prev, [name]: value }));
  }

  function saveRdvDetails(e) {
    e.preventDefault();

    if (!rdvData.title.trim() || !rdvData.date) {
      setError("Enter an RDV title and date, or cancel to skip the RDV.");
      return;
    }

    if (new Date(rdvData.date).getTime() <= Date.now()) {
      setError("The RDV date must be in the future.");
      return;
    }

    setError("");
    setRdvAdded(true);
    setShowRdvModal(false);
  }

  function cancelRdv() {
    setShowRdvModal(false);
    setRdvData(initialRdv);
    setRdvAdded(false);
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.user) {
      setError("User ID not found. Please log in again.");
      return;
    }

    if (rdvAdded && (!rdvData.title.trim() || !rdvData.date)) {
      setError("Please enter the RDV title and date.");
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create the client.
      const clientResponse = await fetch(CLIENTS_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const clientResult = await clientResponse.json().catch(() => ({}));

      if (!clientResponse.ok) {
        throw new Error(
          clientResult.message || "Failed to create client."
        );
      }

      const clientId =
        clientResult.client?._id ||
        clientResult._id;

      if (!clientId) {
        throw new Error(
          "The client was created, but the API did not return its ID. Check your client controller response."
        );
      }

      // Step 2: Create an RDV only if the user added one.
      if (rdvAdded) {
        const rdvResponse = await fetch(RDV_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            ...rdvData,
            user: formData.user,
            client: clientId,
          }),
        });

        const rdvResult = await rdvResponse.json().catch(() => ({}));

        if (!rdvResponse.ok) {
          throw new Error(
            `Client created, but RDV creation failed: ${
              rdvResult.message || "Please create the appointment separately."
            }`
          );
        }
      }

      setSuccess(
        rdvAdded
          ? "Client and RDV created successfully!"
          : "Client created successfully!"
      );

      setTimeout(() => {
        navigate("/dashboard/clients");
      }, 1200);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="content-dash new-client-page">
      <form className="new-client-form" onSubmit={handleSubmit}>
        <div className="form-section-heading">
          <div className="form-section-icon">C</div>
          <div>
            <h2>Client information</h2>
            <p>Enter the client's contact and commercial details.</p>
          </div>
        </div>

        {error && (
          <div className="form-alert form-alert-error" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="form-alert form-alert-success" role="status">
            {success}
          </div>
        )}

        <div className="client-form-grid">
          <div className="form-group">
            <label htmlFor="name">Nom et prénom  <span>*</span></label>
            <input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              minLength={2}
              maxLength={100}
              autoComplete="name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Adresse email  <span>*</span></label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              maxLength={254}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Téléphone  <span>*</span></label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              maxLength={15}
              autoComplete="tel"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="companyName">Nom de l'entreprise</label>
            <input
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              maxLength={100}
              autoComplete="organization"
            />
          </div>

          <div className="form-group">
            <label htmlFor="region">Région  <span>*</span></label>
            <select
              id="region"
              name="region"
              value={formData.region}
              onChange={handleChange}
              required
            >
              <option value="">-- Choisir une région --</option>
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="address">Adresse</label>
            <input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              maxLength={200}
              autoComplete="street-address"
            />
          </div>

          <div className="form-group form-group-full">
            <label htmlFor="bookedBy">
              Représentant commercial
            </label>
            <input
              id="bookedBy"
              value={currentUser?.name || "Utilisateur non trouvé"}
              readOnly
            />
            {!formData.user && (
              <small className="rdv-user-error">
                Identifiant introuvable. Veuillez vous reconnecter.
              </small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="objections">Objections</label>
            <select
              id="objections"
              name="objections"
              value={formData.objections}
              onChange={handleChange}
            >
              <option value="interesse">Intéressé</option>
              <option value="pasinteresse">Pas intéressé</option>
              <option value="logicieldispo">
                Logiciel déjà disponible
              </option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="produits">Produit proposé</label>
            <select
              id="produits"
              name="produits"
              value={formData.produits}
              onChange={handleChange}
            >
              <option value="gclinic">G-Clinic</option>
              <option value="gboutique">G-Boutique</option>
              <option value="csdss">CSDSS</option>
            </select>
          </div>

          <div className="form-group form-group-full">
            <label htmlFor="notes">Notes sur le client</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              maxLength={2000}
              rows={4}
            />
            <small>{formData.notes.length}/2000 caractères</small>
          </div>
        </div>

        {/* Optional appointment section */}
        <section className="rdv-optional-section">
          <div>
            <h2>Rendez-vous (facultatif)</h2>
            <p>
              Vous pouvez prendre rendez-vous dès maintenant, ou ignorer cette étape.
            </p>
          </div>

          <button
            type="button"
            className="client-btn client-btn-light"
            onClick={() => {
              setError("");
              setShowRdvModal(true);
            }}
            disabled={loading}
          >
            {rdvAdded ? "Modifier le RDV" : "+ Créer un RDV"}
          </button>

          {rdvAdded && (
            <p className="rdv-draft-success">
              RDV ajouté : {rdvData.title} —{" "}
              {new Date(rdvData.date).toLocaleString()}
            </p>
          )}
        </section>

        <div className="new-client-form-footer">
          <p> <span>*</span>Champs obligatoires</p>
          <div className="client-form-actions">
            <button
              type="button"
              className="client-btn client-btn-light"
              onClick={() => navigate("/dashboard/clients")}
              disabled={loading}
            >
              Annuler
            </button>

            <button
              type="submit"
              className="client-btn client-btn-primary"
              disabled={loading || !formData.user}
            >
              {loading
                ? "Enregistrement..."
                : rdvAdded
                ? "Créer le client et le RDV"
                : "Créer le client"}
            </button>
          </div>
        </div>
      </form>

      {/* RDV modal */}
      {showRdvModal && (
        <div
          className="rdv-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setShowRdvModal(false);
            }
          }}
        >
          <section
            className="rdv-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="rdv-modal-title"
          >
            <div className="rdv-modal-header">
              <div>
                <h2 id="rdv-modal-title">Créer un rendez-vous</h2>
              </div>
              <button
                type="button"
                className="rdv-modal-close"
                aria-label="Fermer"
                onClick={() => setShowRdvModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={saveRdvDetails}>
              <div className="rdv-modal-body">
                <div className="form-group">
                  <label htmlFor="rdv-title">Titre de la discussion *</label>
                  <input
                    id="rdv-title"
                    name="title"
                    value={rdvData.title}
                    onChange={handleRdvChange}
                    minLength={2}
                    maxLength={150}
                    placeholder="Ex. Présentation de G-Clinic"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="rdv-date">Date et heure *</label>
                  <input
                    id="rdv-date"
                    name="date"
                    type="datetime-local"
                    value={rdvData.date}
                    onChange={handleRdvChange}
                    min={minDateTime}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="rdv-status">Statut</label>
                  <select
                    id="rdv-status"
                    name="status"
                    value={rdvData.status}
                    onChange={handleRdvChange}
                  >
                    <option value="scheduled">Programmé</option>
                    <option value="confirmed">Confirmé</option>
                    <option value="completed">Complété</option>
                    <option value="cancelled">Annulé</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="rdv-location">Lieu</label>
                  <input
                    id="rdv-location"
                    name="location"
                    value={rdvData.location}
                    onChange={handleRdvChange}
                    maxLength={200}
                  />
                </div>
              </div>

              <div className="rdv-modal-actions">
                <button
                  type="button"
                  className="client-btn client-btn-light"
                  onClick={cancelRdv}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="client-btn client-btn-primary"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

export default NewClient;
