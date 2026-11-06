import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaBell,
  FaUserCircle,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

function Topbar() {

  const [showProfile, setShowProfile] = useState(false);

  const navigate = useNavigate();

  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {

    const handleClickOutside = (event: MouseEvent) => {

      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setShowProfile(false);
      }

    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {

      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

    };

  }, []);

  const logout = () => {

    const confirmLogout = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmLogout) return;

    localStorage.removeItem("isLoggedIn");

    navigate("/login");

    window.location.reload();

  };

  return (

    <div className="topbar">

      <h2>Dashboard Overview</h2>

      <div
        className="top-icons"
        style={{ position: "relative" }}
      >

        <span
          style={{ cursor: "pointer" }}
        >
          <FaBell />
        </span>

        <span
          style={{ cursor: "pointer" }}
          onClick={() =>
            setShowProfile(!showProfile)
          }
        >
          <FaUserCircle />
        </span>

        {showProfile && (

          <div
            ref={profileRef}
            className="profile-menu"
          >

            <div className="profile-header">

              <FaUserCircle />

              <h3>Admin</h3>

              <p>Administrator</p>

            </div>

            <hr />

            <p>
              📧 admin@gmail.com
            </p>

            <p>
              🕒 Last Login
            </p>

            <button
              className="profile-btn"
              onClick={() => {

                setShowProfile(false);

                navigate("/settings");

              }}
            >

              <FaCog />

              <span>Settings</span>

            </button>

            <button
              className="profile-btn logout"
              onClick={logout}
            >

              <FaSignOutAlt />

              <span>Logout</span>

            </button>

          </div>

        )}

      </div>

    </div>

  );

}

export default Topbar;