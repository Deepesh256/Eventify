import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: "✨",
      title: "Personalized Events",
      description:
        "Discover events that match your interests, department and year.",
    },
    {
      icon: "🎟️",
      title: "Easy Registration",
      description:
        "Register for eligible events and manage all your bookings in one place.",
    },
    {
      icon: "🏆",
      title: "Results & Winners",
      description:
        "Stay updated with event results and winner announcements.",
    },
  ];

  const categories = [
    "💻 Coding",
    "🤖 AI",
    "🎵 Music",
    "💃 Dance",
    "🏏 Cricket",
    "🎮 Gaming",
  ];

  return (
    <div className="eventify-page text-white">
      {/* ================= NAVBAR ================= */}

      <header className="relative z-30">
        <nav className="eventify-container flex items-center justify-between py-6">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-3"
          >
            <div className="eventify-logo">
              E
            </div>

            <div className="text-left">
              <h1 className="text-xl font-bold tracking-tight">
                Eventify
              </h1>

              <p className="text-[11px] text-slate-400">
                Discover. Join. Experience.
              </p>
            </div>
          </button>

          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="eventify-button-secondary"
            >
              User Login
            </button>

            <button
              type="button"
              onClick={() => navigate("/register")}
              className="eventify-button-primary"
            >
              Create Account
            </button>
          </div>
        </nav>
      </header>

      {/* ================= HERO ================= */}

      <main>
        <section className="relative overflow-hidden">
          <div className="eventify-glow eventify-glow-left" />
          <div className="eventify-glow eventify-glow-right" />

          <div className="eventify-container relative z-10 py-20 md:py-28">
            <div className="grid lg:grid-cols-2 gap-14 items-center">
              {/* LEFT */}

              <div>
                <div className="eventify-pill mb-6">
                  <span>🎉</span>
                  Smart Event Discovery Platform
                </div>

                <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.08] tracking-tight">
                  Discover events
                  <span className="eventify-gradient-text block">
                    made for you.
                  </span>
                </h1>

                <p className="mt-7 text-lg md:text-xl text-slate-300 leading-relaxed max-w-xl">
                  Find exciting college events, register
                  instantly and keep track of everything
                  from one beautiful dashboard.
                </p>

                <div className="flex flex-wrap gap-4 mt-9">
                  <button
                    type="button"
                    onClick={() => navigate("/register")}
                    className="eventify-button-primary eventify-button-large"
                  >
                    Get Started
                    <span>→</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="eventify-button-secondary eventify-button-large"
                  >
                    Explore Events
                  </button>
                </div>

                <div className="flex flex-wrap gap-5 mt-10 text-sm text-slate-400">
                  <span className="flex items-center gap-2">
                    <span className="text-emerald-400">
                      ✓
                    </span>
                    Personalized recommendations
                  </span>

                  <span className="flex items-center gap-2">
                    <span className="text-emerald-400">
                      ✓
                    </span>
                    Secure registration
                  </span>

                  <span className="flex items-center gap-2">
                    <span className="text-emerald-400">
                      ✓
                    </span>
                    Easy booking management
                  </span>
                </div>
              </div>

              {/* RIGHT */}

              <div className="relative hidden lg:block">
                <div className="eventify-hero-card">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-sm text-slate-400">
                        Recommended for you
                      </p>

                      <h3 className="text-xl font-bold mt-1">
                        Trending Events
                      </h3>
                    </div>

                    <div className="w-11 h-11 rounded-xl bg-purple-500/20 border border-purple-400/20 flex items-center justify-center">
                      ✨
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="eventify-mini-event">
                      <div className="eventify-mini-icon">
                        💻
                      </div>

                      <div className="flex-1">
                        <p className="font-semibold">
                          CodeSprint 2026
                        </p>

                        <p className="text-sm text-slate-400 mt-1">
                          Coding • Tech
                        </p>
                      </div>

                      <span className="eventify-status">
                        Upcoming
                      </span>
                    </div>

                    <div className="eventify-mini-event">
                      <div className="eventify-mini-icon">
                        🤖
                      </div>

                      <div className="flex-1">
                        <p className="font-semibold">
                          AI Innovation Day
                        </p>

                        <p className="text-sm text-slate-400 mt-1">
                          AI • Workshop
                        </p>
                      </div>

                      <span className="eventify-status">
                        Upcoming
                      </span>
                    </div>

                    <div className="eventify-mini-event">
                      <div className="eventify-mini-icon">
                        🎵
                      </div>

                      <div className="flex-1">
                        <p className="font-semibold">
                          Campus Music Fest
                        </p>

                        <p className="text-sm text-slate-400 mt-1">
                          Music • Cultural
                        </p>
                      </div>

                      <span className="eventify-status">
                        Upcoming
                      </span>
                    </div>
                  </div>
                </div>

                <div className="absolute -top-7 -right-7 eventify-floating-card">
                  <span className="text-xl">
                    🎟️
                  </span>

                  <div>
                    <p className="text-xs text-slate-400">
                      One click
                    </p>

                    <p className="font-semibold text-sm">
                      Event Booking
                    </p>
                  </div>
                </div>

                <div className="absolute -bottom-8 -left-8 eventify-floating-card">
                  <span className="text-xl">
                    🏆
                  </span>

                  <div>
                    <p className="text-xs text-slate-400">
                      Instant updates
                    </p>

                    <p className="font-semibold text-sm">
                      Results & Winners
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= CATEGORIES ================= */}

        <section className="eventify-section">
          <div className="eventify-container">
            <div className="text-center max-w-2xl mx-auto">
              <p className="eventify-section-label">
                EXPLORE
              </p>

              <h2 className="eventify-section-title">
                Events for every interest
              </h2>

              <p className="eventify-section-description">
                Explore technical, cultural, sports and
                creative events happening around you.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 mt-10">
              {categories.map((category) => (
                <div
                  key={category}
                  className="eventify-category"
                >
                  {category}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= FEATURES ================= */}

        <section className="eventify-section">
          <div className="eventify-container">
            <div className="text-center max-w-2xl mx-auto">
              <p className="eventify-section-label">
                WHY EVENTIFY
              </p>

              <h2 className="eventify-section-title">
                Everything you need in one place
              </h2>

              <p className="eventify-section-description">
                Eventify makes discovering, joining and
                managing events simple.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-12">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="eventify-feature-card"
                >
                  <div className="eventify-feature-icon">
                    {feature.icon}
                  </div>

                  <h3 className="text-xl font-bold mt-5">
                    {feature.title}
                  </h3>

                  <p className="text-slate-400 leading-relaxed mt-3">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= CTA ================= */}

        <section className="eventify-section">
          <div className="eventify-container">
            <div className="eventify-cta">
              <div>
                <p className="text-purple-300 font-semibold text-sm mb-2">
                  READY TO GET STARTED?
                </p>

                <h2 className="text-3xl md:text-4xl font-bold">
                  Your next experience is waiting.
                </h2>

                <p className="text-slate-300 mt-3">
                  Create your Eventify account and start
                  discovering events today.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="eventify-button-primary eventify-button-large"
                >
                  Create Account
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/admin-login")}
                  className="eventify-button-secondary eventify-button-large"
                >
                  Admin Login
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}

      <footer className="border-t border-white/10 mt-10">
        <div className="eventify-container py-8 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="eventify-logo eventify-logo-small">
              E
            </div>

            <span className="font-semibold">
              Eventify
            </span>
          </div>

          <p className="text-sm text-slate-500">
            Discover. Join. Experience.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;