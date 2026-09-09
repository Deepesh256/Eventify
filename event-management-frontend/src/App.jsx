import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import { Toaster } from "react-hot-toast";

import Layout from "./components/layout/Layout";
import AdminProtectedRoute from "./components/AdminProtectedRoute";

import Landing from "./pages/Landing";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import Register from "./pages/Register";
import UserLogin from "./pages/UserLogin";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import MyBookings from "./pages/MyBookings";
import AllEvents from "./pages/AllEvents";
import Profile from "./pages/Profile";
import UserDashboard from "./pages/UserDashboard";

function App() {
  return (
    <BrowserRouter>

      {/* ========================= */}
      {/* GLOBAL TOAST NOTIFICATIONS */}
      {/* ========================= */}

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#171725",
            color: "#ffffff",
            border: "1px solid rgba(168, 85, 247, 0.35)",
            borderRadius: "12px",
            padding: "14px 18px",
            fontSize: "14px",
            fontWeight: "500",
          },

          success: {
            duration: 3000,
          },

          error: {
            duration: 4000,
          },
        }}
      />

      <Routes>
        {/* ========================= */}
        {/* PUBLIC ROUTES */}
        {/* ========================= */}

        <Route
          path="/"
          element={<Landing />}
        />

        <Route
          path="/login"
          element={<UserLogin />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/admin-login"
          element={<AdminLogin />}
        />

        {/* ========================= */}
        {/* PROTECTED ADMIN ROUTE */}
        {/* ========================= */}

        <Route
          path="/admin/dashboard"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />

        {/* ========================= */}
        {/* USER ROUTES */}
        {/* ========================= */}

        <Route
          path="/events"
          element={
            <Layout>
              <Events />
            </Layout>
          }
        />

        <Route
          path="/dashboard"
          element={
            <Layout>
              <UserDashboard />
            </Layout>
          }
        />

        <Route
          path="/bookings"
          element={
            <Layout>
              <MyBookings />
            </Layout>
          }
        />

        <Route
          path="/all-events"
          element={
            <Layout>
              <AllEvents />
            </Layout>
          }
        />

        <Route
          path="/event/:id"
          element={
            <Layout>
              <EventDetails />
            </Layout>
          }
        />

        <Route
          path="/profile"
          element={
            <Layout>
              <Profile />
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;