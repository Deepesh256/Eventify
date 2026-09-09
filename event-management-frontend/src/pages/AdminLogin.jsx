import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [
    username,
    setUsername,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const navigate =
    useNavigate();

  const handleLogin =
    async (e) => {
      e.preventDefault();

      try {
        setLoading(true);
        setMessage("");

        const res =
          await fetch(
            "http://localhost:5000/api/admin/login",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                username,
                password,
              }),
            }
          );

        const data =
          await res.json();

        if (res.ok) {
          if (!data.token) {
            setMessage(
              "Admin token was not received"
            );

            return;
          }

          localStorage.setItem(
            "admin",
            JSON.stringify(
              data.admin
            )
          );

          localStorage.setItem(
            "adminToken",
            data.token
          );

          navigate(
            "/admin/dashboard"
          );
        } else {
          setMessage(
            data.message ||
              "Login failed"
          );
        }
      } catch (err) {
        console.error(
          "ADMIN LOGIN ERROR:",
          err
        );

        setMessage(
          "Server error"
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="eventify-auth-page">
      {/* LEFT */}

      <div className="eventify-auth-brand-panel eventify-admin-brand">
        <div className="eventify-admin-glow" />

        <button
          type="button"
          onClick={() =>
            navigate("/")
          }
          className="relative z-10 flex items-center gap-3"
        >
          <div className="eventify-logo">
            E
          </div>

          <span className="text-xl font-bold">
            Eventify
          </span>
        </button>

        <div className="relative z-10 my-auto max-w-lg">
          <div className="eventify-pill mb-6">
            🔐 Administration Portal
          </div>

          <h1 className="text-4xl lg:text-5xl font-black leading-tight">
            Manage Eventify
            <span className="eventify-gradient-text block">
              with confidence.
            </span>
          </h1>

          <p className="text-lg text-slate-300 mt-6 leading-relaxed">
            Create events, manage
            participants and publish
            winners from your secure
            administration dashboard.
          </p>

          <div className="grid grid-cols-2 gap-4 mt-10">
            <div className="eventify-auth-stat">
              <span className="text-2xl">
                📅
              </span>

              <p className="font-semibold mt-2">
                Events
              </p>

              <p className="text-sm text-slate-400">
                Create & manage
              </p>
            </div>

            <div className="eventify-auth-stat">
              <span className="text-2xl">
                🏆
              </span>

              <p className="font-semibold mt-2">
                Results
              </p>

              <p className="text-sm text-slate-400">
                Manage winners
              </p>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-sm text-slate-500">
          Secure administrator access
        </p>
      </div>

      {/* RIGHT */}

      <div className="eventify-auth-form-panel">
        <div className="w-full max-w-md">
          <button
            type="button"
            onClick={() =>
              navigate("/")
            }
            className="lg:hidden flex items-center gap-3 mb-10"
          >
            <div className="eventify-logo">
              E
            </div>

            <span className="text-xl font-bold text-white">
              Eventify
            </span>
          </button>

          <div className="mb-8">
            <p className="eventify-section-label">
              ADMIN ACCESS
            </p>

            <h2 className="text-3xl font-bold text-white mt-2">
              Welcome, Admin
            </h2>

            <p className="text-slate-400 mt-3">
              Sign in securely to manage
              the Eventify platform.
            </p>
          </div>

          <form
            onSubmit={
              handleLogin
            }
            className="space-y-5"
          >
            <div>
              <label className="eventify-label">
                Username
              </label>

              <input
                type="text"
                placeholder="Admin username"
                value={username}
                onChange={(e) =>
                  setUsername(
                    e.target.value
                  )
                }
                required
                className="eventify-input"
              />
            </div>

            <div>
              <label className="eventify-label">
                Password
              </label>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                required
                className="eventify-input"
              />
            </div>

            {message && (
              <div className="eventify-error-box">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="eventify-button-primary w-full py-3.5"
            >
              {loading
                ? "Signing in..."
                : "Login as Admin"}
            </button>
          </form>

          <div className="eventify-divider">
            <span>
              Not an administrator?
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/login")
            }
            className="eventify-button-secondary w-full py-3.5"
          >
            Go to User Login
          </button>

          <p className="text-center text-xs text-slate-600 mt-7">
            Authorized administrators
            only.
          </p>
        </div>
      </div>
    </div>
  );
}