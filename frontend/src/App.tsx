import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import Reports from "./pages/Reports";
import Login from "./pages/Login";
import Settings from "./pages/Settings";

function App() {

  // Apply saved theme when app starts
  useEffect(() => {

    const darkMode =
      localStorage.getItem("darkMode") === "true";

    document.body.classList.toggle(
      "dark-mode",
      darkMode
    );

  }, []);

  const isLoggedIn =
    localStorage.getItem("isLoggedIn") === "true";

  if (!isLoggedIn) {

    return (

      <BrowserRouter>

        <Routes>

          <Route
            path="*"
            element={<Login />}
          />

        </Routes>

      </BrowserRouter>

    );

  }

  return (

    <BrowserRouter>

      <div className="app-layout">

        <Sidebar />

        <div className="main-content">

          <Topbar />

          <Routes>

            <Route
              path="/"
              element={<Dashboard />}
            />

            <Route
              path="/history"
              element={<History />}
            />

            <Route
              path="/reports"
              element={<Reports />}
            />

            <Route
              path="/settings"
              element={<Settings />}
            />

            <Route
              path="/login"
              element={<Navigate to="/" />}
            />

            {/* Redirect unknown routes */}

            <Route
              path="*"
              element={<Navigate to="/" />}
            />

          </Routes>

        </div>

      </div>

    </BrowserRouter>

  );

}

export default App;