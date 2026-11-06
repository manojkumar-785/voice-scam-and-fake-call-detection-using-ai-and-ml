import { useState } from "react";

function Login() {
  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const handleLogin = () => {
    if (
      username.trim() === "admin" &&
      password.trim() === "admin123"
    ) {
      localStorage.setItem(
        "isLoggedIn",
        "true"
      );

      window.location.href = "/";
    } else {
      setError(
        "Invalid Username or Password"
      );
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background:
          "linear-gradient(135deg,#dbeafe,#eff6ff)",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "20px",
          boxShadow:
            "0 10px 30px rgba(0,0,0,.1)",
          width: "350px",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "25px",
            color: "#0f2b6b",
          }}
        >
          🔐 Admin Login
        </h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) =>
            setUsername(e.target.value)
          }
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "15px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            boxSizing: "border-box",
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "15px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            boxSizing: "border-box",
          }}
        />

        {error && (
          <p
            style={{
              color: "red",
              textAlign: "center",
            }}
          >
            {error}
          </p>
        )}

        <button
          className="analyze-btn"
          onClick={handleLogin}
          style={{
            width: "100%",
          }}
        >
          Login
        </button>

        <p
          style={{
            marginTop: "20px",
            textAlign: "center",
            color: "#64748b",
            fontSize: "14px",
          }}
        >
          Demo Credentials:
          <br />
          Username: <b>admin</b>
          <br />
          Password: <b>admin123</b>
        </p>
      </div>
    </div>
  );
}

export default Login;