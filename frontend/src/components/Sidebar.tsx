import {
  FaHome,
  FaUpload,
  FaHistory,
  FaFileAlt,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

import { Link, useNavigate } from "react-router-dom";

function Sidebar() {

  const navigate = useNavigate();

  const handleLogout = () => {

    const confirmLogout = window.confirm(
      "Are you sure you want to logout?"
    );

    if (confirmLogout) {

      localStorage.removeItem("isLoggedIn");

      navigate("/login");

      window.location.reload();

    }

  };

  return (

    <div className="sidebar">

      <div className="logo">

        📞 Voice Scam AI

      </div>

      <ul>

        <li>
          <Link to="/">
            <FaHome />
            Dashboard
          </Link>
        </li>

        <li>
          <Link to="/">
            <FaUpload />
            Upload
          </Link>
        </li>

        <li>
          <Link to="/history">
            <FaHistory />
            History
          </Link>
        </li>

        <li>
          <Link to="/reports">
            <FaFileAlt />
            Reports
          </Link>
        </li>

        <li>
          <Link to="/settings">
            <FaCog />
            Settings
          </Link>
        </li>

      </ul>

      <div
        className="logout-btn"
        onClick={handleLogout}
        style={{
          marginTop: "auto",
          cursor: "pointer",
          padding: "15px 20px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          color: "white",
          fontWeight: "bold",
        }}
      >
        <FaSignOutAlt />
        Logout
      </div>

    </div>

  );

}

export default Sidebar;