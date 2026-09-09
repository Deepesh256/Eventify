import axios from "axios";

const AdminAPI = axios.create({
  baseURL: "https://eventify-backend-s1n6.onrender.com/api",

  headers: {
    "Content-Type": "application/json",
  },
});

// ========================================
// ADD ADMIN JWT TO EVERY ADMIN REQUEST
// ========================================

AdminAPI.interceptors.request.use(
  (config) => {
    const adminToken =
      localStorage.getItem("adminToken");

    if (adminToken) {
      config.headers.Authorization =
        `Bearer ${adminToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ========================================
// HANDLE EXPIRED / INVALID ADMIN TOKEN
// ========================================

AdminAPI.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("admin");
      localStorage.removeItem("adminToken");

      if (
        window.location.pathname !==
        "/admin-login"
      ) {
        window.location.href =
          "/admin-login";
      }
    }

    return Promise.reject(error);
  }
);

export default AdminAPI;