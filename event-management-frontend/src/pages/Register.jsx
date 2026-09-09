import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

const interestGroups = [
  {
    name: "Technology & Innovation",
    icon: "💻",
    options: [
      "Programming & Development",
      "AI & Machine Learning",
      "Web Development",
      "App Development",
      "Data Science",
      "Cybersecurity",
      "Hackathons",
    ],
  },

  {
    name: "Sports & Athletics",
    icon: "🏆",
    options: [
      "Cricket",
      "Kabaddi",
      "Football",
      "Volleyball",
      "Basketball",
      "Badminton",
      "Athletics",
      "Chess",
    ],
  },

  {
    name: "Arts & Culture",
    icon: "🎭",
    options: [
      "Music",
      "Dance",
      "Singing",
      "Drama & Theatre",
      "Fine Arts",
      "Cultural Festivals",
    ],
  },

  {
    name: "Workshops & Learning",
    icon: "🧑‍💻",
    options: [
      "Technical Workshops",
      "Skill Development",
      "Career Workshops",
      "Hands-on Training",
    ],
  },

  {
    name: "Seminars & Conferences",
    icon: "🎤",
    options: [
      "Seminars",
      "Guest Lectures",
      "Conferences",
      "Expert Talks",
    ],
  },

  {
    name: "Gaming & Esports",
    icon: "🎮",
    options: [
      "Esports",
      "PC Gaming",
      "Mobile Gaming",
    ],
  },

  {
    name: "Photography & Media",
    icon: "📷",
    options: [
      "Photography",
      "Videography",
      "Content Creation",
      "Short Film",
    ],
  },

  {
    name: "Clubs & Community",
    icon: "🤝",
    options: [
      "Club Activities",
      "Volunteering",
      "Community Programs",
      "Networking Events",
    ],
  },
];

const departmentOptions = [
  "CSE",
  "IT",
  "ECE",
  "EEE",
  "MECH",
  "CIVIL",
];

const yearOptions = [
  "I",
  "II",
  "III",
  "IV",
];

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] =
    useState({
      name: "",
      email: "",
      password: "",
      interests: [],
      department: "",
      year: "",
    });

  const [loading, setLoading] =
    useState(false);

  // =========================
  // INPUT CHANGE
  // =========================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // INTEREST CHANGE
  // =========================

  const handleInterestChange =
    (interest) => {
      setForm((prev) => {
        const selected =
          prev.interests.includes(
            interest
          );

        return {
          ...prev,

          interests: selected
            ? prev.interests.filter(
                (item) =>
                  item !== interest
              )
            : [
                ...prev.interests,
                interest,
              ],
        };
      });
    };

  // =========================
  // REGISTER
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    if (!form.department) {
      toast.error("Please select your department");

      return;
    }

    if (!form.year) {
      toast.error("Please select your year");

      return;
    }

    if (
      form.interests.length === 0
    ) {
      toast.error("Please select at least one area of interest");

      return;
    }

    try {
      setLoading(true);

      // =========================
      // REGISTER USER
      // =========================

      await API.post(
        "/users/register",
        {
          name:
            form.name.trim(),

          email:
            form.email
              .trim()
              .toLowerCase(),

          password:
            form.password,

          interests:
            form.interests,

          department:
            form.department,

          year:
            form.year,
        }
      );

      // =========================
      // AUTO LOGIN
      // =========================

      const loginRes =
        await API.post(
          "/users/login",
          {
            email:
              form.email
                .trim()
                .toLowerCase(),

            password:
              form.password,
          }
        );

      // =========================
      // SAVE USER
      // =========================

      localStorage.setItem(
        "user",
        JSON.stringify(
          loginRes.data.user
        )
      );

      // =========================
      // SAVE JWT
      // =========================

      localStorage.setItem(
        "token",
        loginRes.data.token
      );

      // =========================
      // GO TO EVENTS
      // =========================

      navigate("/events");
    } catch (error) {
      console.error(
        "REGISTRATION ERROR:",
        error.response?.data ||
          error.message
      );

      toast.error(error.response?.data
          ?.message ||
          "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="eventify-auth-page">
      {/* =========================
          LEFT PANEL
      ========================= */}

      <div className="eventify-auth-brand-panel">
        <div className="eventify-auth-glow" />

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

        <div className="relative z-10 max-w-lg my-auto">

          <div className="eventify-pill mb-6">
            ✨ Join the community
          </div>

          <h1 className="text-4xl lg:text-5xl font-black leading-tight">
            Your events.

            <span className="eventify-gradient-text block">
              Your interests.
            </span>
          </h1>

          <p className="text-lg text-slate-300 mt-6 leading-relaxed">
            Choose the areas you are
            genuinely interested in and
            Eventify will recommend relevant
            events for you.
          </p>

          <div className="space-y-4 mt-10">

            {[
              "Interest-based event recommendations",
              "Eligibility-aware registration",
              "Easy booking management",
              "Results and winner updates",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 text-slate-300"
              >
                <span className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 flex items-center justify-center text-sm">
                  ✓
                </span>

                {item}
              </div>
            ))}

          </div>

        </div>

        <p className="relative z-10 text-sm text-slate-500">
          Discover. Join. Experience.
        </p>
      </div>

      {/* =========================
          RIGHT PANEL
      ========================= */}

      <div className="eventify-auth-form-panel eventify-register-panel">

        <div className="w-full max-w-2xl py-10">

          {/* MOBILE LOGO */}

          <button
            type="button"
            onClick={() =>
              navigate("/")
            }
            className="lg:hidden flex items-center gap-3 mb-8"
          >
            <div className="eventify-logo">
              E
            </div>

            <span className="text-xl font-bold text-white">
              Eventify
            </span>
          </button>

          {/* HEADER */}

          <div className="mb-7">

            <p className="eventify-section-label">
              CREATE YOUR PROFILE
            </p>

            <h2 className="text-3xl font-bold text-white mt-2">
              Create your account
            </h2>

            <p className="text-slate-400 mt-3">
              Tell us about yourself and
              select your preferred areas
              of interest.
            </p>

          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {/* =========================
                NAME + EMAIL
            ========================= */}

            <div className="grid sm:grid-cols-2 gap-5">

              <div>
                <label className="eventify-label">
                  Full name
                </label>

                <input
                  type="text"
                  name="name"
                  placeholder="Your name"
                  value={form.name}
                  onChange={
                    handleChange
                  }
                  className="eventify-input"
                  required
                />
              </div>

              <div>
                <label className="eventify-label">
                  Email address
                </label>

                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={
                    handleChange
                  }
                  className="eventify-input"
                  required
                />
              </div>

            </div>

            {/* =========================
                PASSWORD
            ========================= */}

            <div>

              <label className="eventify-label">
                Password
              </label>

              <input
                type="password"
                name="password"
                placeholder="Minimum 6 characters"
                value={
                  form.password
                }
                onChange={
                  handleChange
                }
                minLength={6}
                className="eventify-input"
                required
              />

            </div>

            {/* =========================
                DEPARTMENT + YEAR
            ========================= */}

            <div className="grid sm:grid-cols-2 gap-5">

              <div>

                <label className="eventify-label">
                  Department
                </label>

                <select
                  name="department"
                  value={
                    form.department
                  }
                  onChange={
                    handleChange
                  }
                  className="eventify-input eventify-select"
                  required
                >

                  <option value="">
                    Select Department
                  </option>

                  {departmentOptions.map(
                    (department) => (
                      <option
                        key={
                          department
                        }
                        value={
                          department
                        }
                      >
                        {department}
                      </option>
                    )
                  )}

                </select>

              </div>

              <div>

                <label className="eventify-label">
                  Year
                </label>

                <select
                  name="year"
                  value={
                    form.year
                  }
                  onChange={
                    handleChange
                  }
                  className="eventify-input eventify-select"
                  required
                >

                  <option value="">
                    Select Year
                  </option>

                  {yearOptions.map(
                    (year) => (
                      <option
                        key={year}
                        value={year}
                      >
                        Year {year}
                      </option>
                    )
                  )}

                </select>

              </div>

            </div>

            {/* =========================
                AREAS OF INTEREST
            ========================= */}

            <div>

              <div className="flex items-center justify-between gap-3 mb-2">

                <label className="eventify-label mb-0">
                  Areas of Interest
                </label>

                <span className="text-xs text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-full">
                  {
                    form.interests.length
                  }{" "}
                  selected
                </span>

              </div>

              <p className="text-xs text-slate-500 mb-5">
                Select all topics you are
                interested in. These will
                be used for personalized
                recommendations.
              </p>

              <div className="space-y-5">

                {interestGroups.map(
                  (group) => (

                    <div
                      key={
                        group.name
                      }
                      className="border border-white/10 rounded-xl p-4 bg-white/[0.02]"
                    >

                      {/* GROUP TITLE */}

                      <div className="flex items-center gap-2 mb-3">

                        <span className="text-lg">
                          {group.icon}
                        </span>

                        <h3 className="text-sm font-semibold text-slate-200">
                          {group.name}
                        </h3>

                      </div>

                      {/* OPTIONS */}

                      <div className="flex flex-wrap gap-2">

                        {group.options.map(
                          (interest) => {

                            const selected =
                              form.interests.includes(
                                interest
                              );

                            return (
                              <button
                                key={
                                  interest
                                }
                                type="button"
                                onClick={() =>
                                  handleInterestChange(
                                    interest
                                  )
                                }
                                className={
                                  selected
                                    ? "eventify-interest eventify-interest-selected"
                                    : "eventify-interest"
                                }
                              >
                                {selected &&
                                  "✓ "}

                                {
                                  interest
                                }
                              </button>
                            );
                          }
                        )}

                      </div>

                    </div>

                  )
                )}

              </div>

            </div>

            {/* =========================
                SUBMIT
            ========================= */}

            <button
              type="submit"
              disabled={loading}
              className="eventify-button-primary w-full py-3.5 mt-2"
            >
              {loading
                ? "Creating Account..."
                : "Create Account"}
            </button>

          </form>

          <p className="text-center text-sm text-slate-500 mt-7">

            Already have an account?{" "}

            <button
              type="button"
              onClick={() =>
                navigate("/login")
              }
              className="text-purple-400 font-semibold hover:text-purple-300"
            >
              Login
            </button>

          </p>

        </div>

      </div>

    </div>
  );
};

export default Register;