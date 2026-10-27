
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./login.css";

function Login() {
  const [userValue, setUserValue] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;

    setUserValue((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    const res = await fetch("http://localhost:3000/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email: userValue.email.trim(),
        password: userValue.password,
      }),
    });

    // Safely parse the response, even if the server returns non-JSON text.
    const responseText = await res.text();
    let data = {};

    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      data = { message: "The server returned an invalid response." };
    }

    if (!res.ok) {
      setError(data.message || `Login failed (${res.status}).`);
      return;
    }

    if (!data.user) {
      setError("Login succeeded, but the server did not return user information.");
      return;
    }

    // Keep user information for the frontend.
    localStorage.setItem("user", JSON.stringify(data.user));

    // Do not store the JWT in localStorage when using an HttpOnly cookie.
    localStorage.removeItem("token");

    navigate("/dashboard", { replace: true });
  } catch (err) {
    console.error("Login error:", err);
    setError("Cannot connect to the server. Check that your backend is running.");
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <h1>Login</h1>

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        <div className="form-group email">
          <label htmlFor="email" id="formMail">
            Email
          </label>

          <input
            type="email"
            id="email"
            name="email"
            placeholder="Enter your email"
            value={userValue.email}
            onChange={handleChange}
            autoComplete="username"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password" id="formPass">
            Password
          </label>

          <input
            type="password"
            id="password"
            name="password"
            value={userValue.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="message">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
