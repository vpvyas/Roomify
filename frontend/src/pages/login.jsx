import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast"; 
import "../styles/credential.css";

function Login() {
  const location = useLocation();
  const navigate = useNavigate();

  const [role, setRole] = useState(location.state?.role || "user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.role) {
      setRole(location.state.role);
    }
  }, [location.state]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("http://localhost:3000/api/users/login", { 
          email, 
          password, 
          role 
      });

      // Save credentials
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("role", response.data.user.role); 

      toast.success(`Welcome back, ${response.data.user.name}!`);

      // ✅ RECTIFIED REDIRECT LOGIC
      // 1. Check if user was redirected from a specific page (like a PG details page)
      // 2. If not, check their role and send them to the appropriate dashboard
      const redirectTo = location.state?.from || 
                         (response.data.user.role === "owner" ? "/owner-dashboard" : "/");

      setTimeout(() => {
        navigate(redirectTo, { replace: true });
      }, 1000);

    } catch (err) {
      const errorMsg = err.response?.data?.message || "Invalid credentials.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-box">
        <div className="role-badge">{role} Account</div>
        <h2>Welcome Back</h2>
        <p>Enter your details to access Roomify</p>

        {error && <div className="error-message" style={{color: 'red', marginBottom: '10px'}}>{error}</div>}

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="auth-switch">
          Don't have an account? 
          <span onClick={() => navigate("/register")} style={{color: 'blue', cursor: 'pointer'}}> Sign Up</span>
        </div>
      </div>
    </div>
  );
}

export default Login;