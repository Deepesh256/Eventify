import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import API from "../services/api";

// =========================
// DEPARTMENTS
// =========================

const departments = [
  "CSE",
  "IT",
  "EEE",
  "ECE",
  "MECH",
  "CIVIL",
];

// =========================
// YEARS
// =========================

const years = [
  "I",
  "II",
  "III",
  "IV",
];

// =========================
// PROFESSIONAL INTERESTS
// =========================

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

// =========================
// PROFILE
// =========================

const Profile = () => {
  const storedUser = (() => {
    try {
      return JSON.parse(
        localStorage.getItem("user")
      );
    } catch {
      return null;
    }
  })();

  const [profile, setProfile] =
    useState({
      name: "",
      email: "",
      department: "",
      year: "",
      interests: [],
    });

  const [editing, setEditing] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [
    profilePhoto,
    setProfilePhoto,
  ] = useState("");

  const [
    coverPhoto,
    setCoverPhoto,
  ] = useState("");

  const profileInputRef =
    useRef(null);

  const coverInputRef =
    useRef(null);

  const profilePhotoKey =
    storedUser?._id
      ? `eventify_profile_${storedUser._id}`
      : "";

  const coverPhotoKey =
    storedUser?._id
      ? `eventify_cover_${storedUser._id}`
      : "";

  // =========================
  // LOAD PROFILE
  // =========================

  useEffect(() => {
    const loadProfile =
      async () => {
        if (!storedUser?._id) {
          setLoading(false);
          return;
        }

        // Load stored photos

        const savedProfilePhoto =
          localStorage.getItem(
            profilePhotoKey
          );

        const savedCoverPhoto =
          localStorage.getItem(
            coverPhotoKey
          );

        if (savedProfilePhoto) {
          setProfilePhoto(
            savedProfilePhoto
          );
        }

        if (savedCoverPhoto) {
          setCoverPhoto(
            savedCoverPhoto
          );
        }

        try {
          const res =
            await API.get(
              `/users/${storedUser._id}`
            );

          const user =
            res.data?.user ||
            res.data;

          setProfile({
            name:
              user?.name || "",

            email:
              user?.email || "",

            department:
              user?.department ||
              "",

            year:
              user?.year || "",

            interests:
              user?.interests ||
              [],
          });

          localStorage.setItem(
            "user",
            JSON.stringify(user)
          );
        } catch (error) {
          console.error(
            "Profile fetch error:",
            error
          );

          setProfile({
            name:
              storedUser?.name ||
              "",

            email:
              storedUser?.email ||
              "",

            department:
              storedUser
                ?.department ||
              "",

            year:
              storedUser?.year ||
              "",

            interests:
              storedUser
                ?.interests ||
              [],
          });
        } finally {
          setLoading(false);
        }
      };

    loadProfile();
  }, []);

  // =========================
  // NORMAL INPUT CHANGE
  // =========================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================
  // INTEREST CHANGE
  // =========================

  const handleInterestChange =
    (interest) => {
      setProfile(
        (previous) => {
          const selected =
            previous.interests.includes(
              interest
            );

          return {
            ...previous,

            interests: selected
              ? previous.interests.filter(
                  (item) =>
                    item !==
                    interest
                )
              : [
                  ...previous.interests,
                  interest,
                ],
          };
        }
      );
    };

  // =========================
  // IMAGE READER
  // =========================

  const readImage = (
    file,
    setter,
    storageKey
  ) => {
    if (!file) {
      return;
    }

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      alert(
        "Please select an image file."
      );

      return;
    }

    if (
      file.size >
      2 * 1024 * 1024
    ) {
      alert(
        "Please select an image smaller than 2 MB."
      );

      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {
      const result =
        reader.result;

      setter(result);

      try {
        localStorage.setItem(
          storageKey,
          result
        );
      } catch {
        alert(
          "Image is too large to save in this browser. Please choose a smaller image."
        );
      }
    };

    reader.readAsDataURL(file);
  };

  // =========================
  // PROFILE PHOTO
  // =========================

  const handleProfilePhoto =
    (event) => {
      readImage(
        event.target.files?.[0],
        setProfilePhoto,
        profilePhotoKey
      );

      event.target.value = "";
    };

  // =========================
  // COVER PHOTO
  // =========================

  const handleCoverPhoto =
    (event) => {
      readImage(
        event.target.files?.[0],
        setCoverPhoto,
        coverPhotoKey
      );

      event.target.value = "";
    };

  // =========================
  // REMOVE PROFILE PHOTO
  // =========================

  const removeProfilePhoto =
    () => {
      setProfilePhoto("");

      localStorage.removeItem(
        profilePhotoKey
      );
    };

  // =========================
  // REMOVE COVER
  // =========================

  const removeCoverPhoto =
    () => {
      setCoverPhoto("");

      localStorage.removeItem(
        coverPhotoKey
      );
    };

  // =========================
  // SAVE PROFILE
  // =========================

  const handleSave = async () => {
    if (!storedUser?._id) {
      alert(
        "Please login first."
      );

      return;
    }

    if (
      !profile.name.trim()
    ) {
      alert(
        "Name is required."
      );

      return;
    }

    if (
      !profile.department
    ) {
      alert(
        "Please select your department."
      );

      return;
    }

    if (!profile.year) {
      alert(
        "Please select your year."
      );

      return;
    }

    if (
      profile.interests.length ===
      0
    ) {
      alert(
        "Please select at least one area of interest."
      );

      return;
    }

    try {
      setSaving(true);

      const res =
        await API.put(
          `/users/${storedUser._id}`,
          {
            name:
              profile.name.trim(),

            department:
              profile.department,

            year:
              profile.year,

            interests:
              profile.interests,
          }
        );

      const updatedUser =
        res.data?.user ||
        res.data;

      const finalUser = {
        ...storedUser,
        ...updatedUser,
      };

      localStorage.setItem(
        "user",
        JSON.stringify(
          finalUser
        )
      );

      setProfile({
        name:
          finalUser.name ||
          "",

        email:
          finalUser.email ||
          "",

        department:
          finalUser.department ||
          "",

        year:
          finalUser.year ||
          "",

        interests:
          finalUser.interests ||
          [],
      });

      setEditing(false);

      alert(
        "Profile updated successfully!"
      );
    } catch (error) {
      console.error(
        "Profile update error:",
        error
      );

      alert(
        error.response?.data
          ?.message ||
          "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="eventify-page-loading">

        <div className="eventify-loading-spinner" />

        <p>
          Loading profile...
        </p>

      </div>
    );
  }

  // =========================
  // NOT LOGGED IN
  // =========================

  if (!storedUser?._id) {
    return (
      <div className="eventify-empty-state">

        Please login to view your
        profile.

      </div>
    );
  }

  // =========================
  // UI
  // =========================

  return (
    <div className="eventify-user-page">

      {/* =========================
          PAGE HEADER
      ========================= */}

      <div className="eventify-page-header">

        <div>

          <p className="eventify-section-label">
            ACCOUNT
          </p>

          <h1 className="eventify-user-title">
            My Profile
          </h1>

          <p className="eventify-user-subtitle">
            Manage your personal
            information and event
            preferences.
          </p>

        </div>

      </div>

      {/* =========================
          PROFILE CARD
      ========================= */}

      <div className="eventify-profile-card">

        {/* =========================
            COVER
        ========================= */}

        <div
          className="eventify-profile-cover"
          style={
            coverPhoto
              ? {
                  backgroundImage:
                    `linear-gradient(rgba(7,11,20,.2),rgba(7,11,20,.65)), url("${coverPhoto}")`,
                }
              : undefined
          }
        >

          <div className="eventify-cover-pattern" />

          <div className="eventify-photo-actions">

            <button
              type="button"
              onClick={() =>
                coverInputRef.current?.click()
              }
              className="eventify-photo-button"
            >
              📷 Change Cover
            </button>

            {coverPhoto && (
              <button
                type="button"
                onClick={
                  removeCoverPhoto
                }
                className="eventify-photo-remove"
              >
                Remove
              </button>
            )}

          </div>

          <input
            ref={coverInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={
              handleCoverPhoto
            }
            className="hidden"
          />

        </div>

        {/* =========================
            PROFILE HEADER
        ========================= */}

        <div className="eventify-profile-header">

          <div className="eventify-profile-identity">

            <div className="eventify-profile-avatar-wrap">

              {profilePhoto ? (
                <img
                  src={
                    profilePhoto
                  }
                  alt={
                    profile.name
                  }
                  className="eventify-profile-avatar-image"
                />
              ) : (
                <div className="eventify-profile-avatar-fallback">

                  {profile.name
                    ?.charAt(0)
                    .toUpperCase() ||
                    "U"}

                </div>
              )}

              <button
                type="button"
                onClick={() =>
                  profileInputRef.current?.click()
                }
                className="eventify-avatar-edit"
                title="Change profile photo"
              >
                📷
              </button>

              <input
                ref={
                  profileInputRef
                }
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={
                  handleProfilePhoto
                }
                className="hidden"
              />

            </div>

            <div className="eventify-profile-name-block">

              <h2>
                {profile.name}
              </h2>

              <p>
                {profile.email}
              </p>

              <div className="flex flex-wrap gap-2 mt-3">

                {profile.department && (
                  <span className="eventify-profile-tag">
                    🎓{" "}
                    {
                      profile.department
                    }
                  </span>
                )}

                {profile.year && (
                  <span className="eventify-profile-tag">
                    📚 Year{" "}
                    {profile.year}
                  </span>
                )}

                <span className="eventify-profile-tag">
                  🎯{" "}
                  {
                    profile
                      .interests
                      .length
                  }{" "}
                  Interests
                </span>

              </div>

              {profilePhoto && (
                <button
                  type="button"
                  onClick={
                    removeProfilePhoto
                  }
                  className="text-xs text-slate-500 hover:text-red-400 mt-3 transition"
                >
                  Remove profile photo
                </button>
              )}

            </div>

          </div>

          {!editing && (
            <button
              type="button"
              onClick={() =>
                setEditing(
                  true
                )
              }
              className="eventify-button-primary"
            >
              ✏️ Edit Profile
            </button>
          )}

        </div>

        {/* =========================
            PROFILE BODY
        ========================= */}

        <div className="eventify-profile-body">

          {/* PERSONAL INFO */}

          <div className="mb-7">

            <h3 className="eventify-profile-section-title">
              Personal Information
            </h3>

            <p className="eventify-profile-section-description">
              Your account and
              academic information.
            </p>

          </div>

          <div className="grid md:grid-cols-2 gap-5">

            {/* NAME */}

            <div>

              <label className="eventify-label">
                Full name
              </label>

              <input
                type="text"
                name="name"
                value={
                  profile.name
                }
                onChange={
                  handleChange
                }
                disabled={
                  !editing
                }
                className="eventify-input"
              />

            </div>

            {/* EMAIL */}

            <div>

              <label className="eventify-label">
                Email address
              </label>

              <input
                type="email"
                value={
                  profile.email
                }
                disabled
                className="eventify-input"
              />

            </div>

            {/* DEPARTMENT */}

            <div>

              <label className="eventify-label">
                Department
              </label>

              <select
                name="department"
                value={
                  profile.department
                }
                onChange={
                  handleChange
                }
                disabled={
                  !editing
                }
                className="eventify-input eventify-select"
              >

                <option value="">
                  Select Department
                </option>

                {departments.map(
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

            {/* YEAR */}

            <div>

              <label className="eventify-label">
                Year
              </label>

              <select
                name="year"
                value={
                  profile.year
                }
                onChange={
                  handleChange
                }
                disabled={
                  !editing
                }
                className="eventify-input eventify-select"
              >

                <option value="">
                  Select Year
                </option>

                {years.map(
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
              INTERESTS
          ========================= */}

          <div className="eventify-profile-interests">

            <div className="flex items-start justify-between gap-4">

              <div>

                <h3 className="eventify-profile-section-title">
                  Areas of Interest
                </h3>

                <p className="eventify-profile-section-description">
                  Eventify uses these
                  preferences to recommend
                  relevant events.
                </p>

              </div>

              <span className="text-xs text-purple-300 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full">

                {
                  profile
                    .interests
                    .length
                }{" "}
                selected

              </span>

            </div>

            {/* GROUPED INTERESTS */}

            <div className="space-y-5 mt-6">

              {interestGroups.map(
                (group) => (

                  <div
                    key={
                      group.name
                    }
                    className="border border-white/10 rounded-xl p-4 bg-white/[0.02]"
                  >

                    {/* CATEGORY */}

                    <div className="flex items-center gap-2 mb-3">

                      <span className="text-lg">
                        {group.icon}
                      </span>

                      <h4 className="text-sm font-semibold text-slate-200">
                        {group.name}
                      </h4>

                    </div>

                    {/* INTERESTS */}

                    <div className="flex flex-wrap gap-2">

                      {group.options.map(
                        (interest) => {

                          const selected =
                            profile.interests.includes(
                              interest
                            );

                          return (
                            <button
                              key={
                                interest
                              }
                              type="button"
                              disabled={
                                !editing
                              }
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
              SAVE / CANCEL
          ========================= */}

          {editing && (
            <div className="eventify-profile-save-row">

              <button
                type="button"
                onClick={() => {
                  setEditing(
                    false
                  );

                  setProfile({
                    name:
                      storedUser
                        .name ||
                      "",

                    email:
                      storedUser
                        .email ||
                      "",

                    department:
                      storedUser
                        .department ||
                      "",

                    year:
                      storedUser
                        .year ||
                      "",

                    interests:
                      storedUser
                        .interests ||
                      [],
                  });
                }}
                className="eventify-button-secondary"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleSave
                }
                disabled={
                  saving
                }
                className="eventify-button-primary"
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default Profile;