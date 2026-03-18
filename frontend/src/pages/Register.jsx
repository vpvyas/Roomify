import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/login.css";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user", // Default role
  });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

 const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post("http://localhost:3000/api/users/register", formData);
      
      // 1. Save Token and User info to localStorage (This "Logs them in")
      // Make sure your backend sends 'token' and 'user' in the response!
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user)); 
      }

      alert(res.data.message);

      const userRole = res.data.user.role;

      setTimeout(() => {
        setIsLoading(false);
        
        // 2. Redirect based on role (SKIPPING login page)
        if (userRole === "owner") {
          navigate("/owner-dashboard");
        } else {
          navigate("/"); 
        }
      }, 1500);

    } catch (err) {
      setIsLoading(false);
      setMessage(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="auth-page-wrapper">
      {isLoading && <div className="loading-overlay">Creating your Roomify account...</div>}
      
      <div className={`auth-container ${isLoading ? "blur-effect" : ""}`}>
        <div className="auth-box">
          <h2>Create Account</h2>
          {message && <p className="auth-message">{message}</p>}

          <form onSubmit={handleSubmit}>
            <input name="name" placeholder="Full Name" onChange={handleChange} required />
            <input name="email" type="email" placeholder="Email Address" onChange={handleChange} required />
            <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
            
            <label style={{ fontSize: "14px", color: "#666", marginBottom: "5px", display: "block" }}>
              Register as:
            </label>
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="user">User (Looking for PG)</option>
              <option value="owner">Owner (Listing a PG)</option>
            </select>

            <button type="submit" className="primary-btn">
              {isLoading ? "Signing up..." : "Register"}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?
            <span onClick={() => navigate("/login")} style={{ cursor: "pointer", color: "#007bff" }}> Login</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;