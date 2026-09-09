import { useState } from "react";
import {
  useNavigate,
  Link,
} from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

const UserLogin = () => {
  const navigate = useNavigate();

  const [mode, setMode] =
    useState("login");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [otp, setOtp] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [loading, setLoading] =
    useState(false);

  // =========================
  // LOGIN
  // =========================

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await API.post(
        "/users/login",
        {
          email: email
            .trim()
            .toLowerCase(),

          password,
        }
      );

      localStorage.setItem(
        "user",
        JSON.stringify(res.data.user)
      );

      localStorage.setItem(
        "token",
        res.data.token
      );

      navigate("/events");
    } catch (error) {
      console.error(
        "LOGIN ERROR:",
        error.response?.data ||
          error.message
      );

      toast.error(error.response?.data?.message ||
          "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // SEND OTP
  // =========================

  const handleSendOtp = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await API.post(
        "/users/forgot-password",
        {
          email: email
            .trim()
            .toLowerCase(),
        }
      );

      toast.success(res.data.message);

      setMode("verify");
    } catch (error) {
      console.error(
        "SEND OTP ERROR:",
        error.response?.data ||
          error.message
      );

      toast.error(error.response?.data?.message ||
          "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // VERIFY OTP
  // =========================

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await API.post(
        "/users/verify-reset-otp",
        {
          email: email
            .trim()
            .toLowerCase(),

          otp,
        }
      );

      toast.success(res.data.message);

      setMode("reset");
    } catch (error) {
      console.error(
        "VERIFY OTP ERROR:",
        error.response?.data ||
          error.message
      );

      toast.error(error.response?.data?.message ||
          "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // RESET PASSWORD
  // =========================

  const handleResetPassword =
    async (e) => {
      e.preventDefault();

      if (newPassword.length < 6) {
        toast.error("Password must be at least 6 characters");

        return;
      }

      if (
        newPassword !==
        confirmPassword
      ) {
        toast.error("Passwords do not match");

        return;
      }

      try {
        setLoading(true);

        const res = await API.post(
          "/users/reset-password",
          {
            email: email
              .trim()
              .toLowerCase(),

            newPassword,
          }
        );

        toast.success(res.data.message);

        setPassword("");
        setOtp("");
        setNewPassword("");
        setConfirmPassword("");

        setMode("login");
      } catch (error) {
        console.error(
          "RESET PASSWORD ERROR:",
          error.response?.data ||
            error.message
        );

        toast.error(error.response?.data
            ?.message ||
            "Failed to reset password");
      } finally {
        setLoading(false);
      }
    };

  const getHeaderContent = () => {
    if (mode === "forgot") {
      return {
        eyebrow: "ACCOUNT RECOVERY",
        title: "Forgot password?",
        description:
          "Enter your registered email and we'll send you a 6-digit OTP.",
      };
    }

    if (mode === "verify") {
      return {
        eyebrow: "VERIFY YOUR EMAIL",
        title: "Enter your OTP",
        description:
          "Enter the 6-digit code sent to your registered email.",
      };
    }

    if (mode === "reset") {
      return {
        eyebrow: "SECURE YOUR ACCOUNT",
        title: "Create new password",
        description:
          "Choose a strong password for your Eventify account.",
      };
    }

    return {
      eyebrow: "WELCOME BACK",
      title: "Login to Eventify",
      description:
        "Continue discovering events made for you.",
    };
  };

  const header =
    getHeaderContent();

  return (
    <div className="eventify-auth-page">
      {/* LEFT PANEL */}

      <div className="eventify-auth-brand-panel">
        <div className="eventify-auth-glow" />

        <button
          type="button"
          onClick={() => navigate("/")}
          className="relative z-10 flex items-center gap-3"
        >
          <div className="eventify-logo">
            E
          </div>

          <span className="text-xl font-bold">
            Eventify
          </span>
        </button>

        <div className="relative z-10 max-w-lg my-auto">
          <div className="eventify-pill mb-6">
            🎉 Your event journey starts here
          </div>

          <h1 className="text-4xl lg:text-5xl font-black leading-tight">
            Find experiences
            <span className="eventify-gradient-text block">
              worth remembering.
            </span>
          </h1>

          <p className="text-slate-300 text-lg mt-6 leading-relaxed">
            Discover personalized events,
            register easily and manage all
            your bookings from one place.
          </p>

          <div className="grid grid-cols-2 gap-4 mt-10">
            <div className="eventify-auth-stat">
              <span className="text-2xl">
                ✨
              </span>

              <p className="font-semibold mt-2">
                Personalized
              </p>

              <p className="text-sm text-slate-400">
                Recommendations
              </p>
            </div>

            <div className="eventify-auth-stat">
              <span className="text-2xl">
                🎟️
              </span>

              <p className="font-semibold mt-2">
                Simple
              </p>

              <p className="text-sm text-slate-400">
                Event booking
              </p>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-sm text-slate-500">
          Discover. Join. Experience.
        </p>
      </div>

      {/* FORM PANEL */}

      <div className="eventify-auth-form-panel">
        <div className="w-full max-w-md">
          <button
            type="button"
            onClick={() => navigate("/")}
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
              {header.eyebrow}
            </p>

            <h2 className="text-3xl font-bold text-white mt-2">
              {header.title}
            </h2>

            <p className="text-slate-400 mt-3 leading-relaxed">
              {header.description}
            </p>
          </div>

          {/* LOGIN */}

          {mode === "login" && (
            <>
              <form
                onSubmit={handleLogin}
                className="space-y-5"
              >
                <div>
                  <label className="eventify-label">
                    Email address
                  </label>

                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) =>
                      setEmail(
                        e.target.value
                      )
                    }
                    className="eventify-input"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="eventify-label">
                      Password
                    </label>

                    <button
                      type="button"
                      onClick={() =>
                        setMode("forgot")
                      }
                      className="text-sm font-medium text-purple-400 hover:text-purple-300"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) =>
                      setPassword(
                        e.target.value
                      )
                    }
                    className="eventify-input"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="eventify-button-primary w-full py-3.5"
                >
                  {loading
                    ? "Logging in..."
                    : "Login to Eventify"}
                </button>
              </form>

              <div className="eventify-divider">
                <span>
                  New to Eventify?
                </span>
              </div>

              <Link
                to="/register"
                className="eventify-button-secondary w-full py-3.5 text-center block"
              >
                Create an account
              </Link>

              <p className="text-center text-sm text-slate-500 mt-7">
                Are you an administrator?{" "}
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/admin-login"
                    )
                  }
                  className="text-purple-400 font-semibold hover:text-purple-300"
                >
                  Admin Login
                </button>
              </p>
            </>
          )}

          {/* FORGOT */}

          {mode === "forgot" && (
            <>
              <form
                onSubmit={handleSendOtp}
                className="space-y-5"
              >
                <div>
                  <label className="eventify-label">
                    Registered email
                  </label>

                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) =>
                      setEmail(
                        e.target.value
                      )
                    }
                    className="eventify-input"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="eventify-button-primary w-full py-3.5"
                >
                  {loading
                    ? "Sending OTP..."
                    : "Send OTP"}
                </button>
              </form>

              <button
                type="button"
                onClick={() =>
                  setMode("login")
                }
                className="eventify-back-button"
              >
                ← Back to Login
              </button>
            </>
          )}

          {/* VERIFY */}

          {mode === "verify" && (
            <>
              <form
                onSubmit={
                  handleVerifyOtp
                }
                className="space-y-5"
              >
                <div>
                  <label className="eventify-label">
                    6-digit OTP
                  </label>

                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength="6"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) =>
                      setOtp(
                        e.target.value.replace(
                          /\D/g,
                          ""
                        )
                      )
                    }
                    className="eventify-input text-center tracking-[0.5em] text-xl"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={
                    loading ||
                    otp.length !== 6
                  }
                  className="eventify-button-primary w-full py-3.5"
                >
                  {loading
                    ? "Verifying..."
                    : "Verify OTP"}
                </button>
              </form>

              <button
                type="button"
                onClick={() =>
                  setMode("forgot")
                }
                className="eventify-back-button"
              >
                ← Send OTP again
              </button>
            </>
          )}

          {/* RESET */}

          {mode === "reset" && (
            <>
              <form
                onSubmit={
                  handleResetPassword
                }
                className="space-y-5"
              >
                <div>
                  <label className="eventify-label">
                    New password
                  </label>

                  <input
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={newPassword}
                    onChange={(e) =>
                      setNewPassword(
                        e.target.value
                      )
                    }
                    minLength="6"
                    className="eventify-input"
                    required
                  />
                </div>

                <div>
                  <label className="eventify-label">
                    Confirm password
                  </label>

                  <input
                    type="password"
                    placeholder="Enter password again"
                    value={
                      confirmPassword
                    }
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }
                    minLength="6"
                    className="eventify-input"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="eventify-button-primary w-full py-3.5"
                >
                  {loading
                    ? "Resetting..."
                    : "Reset Password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserLogin;