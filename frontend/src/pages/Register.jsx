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
    role: "user",
  });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false); // New State

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Start blur

    try {
      const res = await axios.post("http://localhost:3000/api/users/register", formData);
      alert(res.data.message);   // ✅ popup shown here
     /* setTimeout(() => {
        setIsLoading(false);
        navigate("/login/user");
      }, 2000);*/
    } catch (err) {
      setIsLoading(false); // Remove blur on error
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
            
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="user">Login as User</option>
              <option value="owner">Login as Owner</option>
            </select>

            <button type="submit" className="primary-btn">
              {isLoading ? "Signing up..." : "Register"}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?
            <span onClick={() => navigate("/login")}> Login</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;