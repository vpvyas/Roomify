import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";

function Header({ search, setSearch, showLoginOptions, setShowLoginOptions }) {
  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Get user from local storage
  const user = JSON.parse(localStorage.getItem("user"));

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setShowProfileDropdown(false);
    navigate("/");
    window.location.reload(); // Ensures state is cleared across the app
  };

  const handleNavigation = (path) => {
    setShowLoginOptions(false);
    setShowProfileDropdown(false);
    navigate(path);
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-content">
          <h1 className="logo" onClick={() => navigate("/")}>Roomify</h1>

          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search by city or PG name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="search-icon-btn">🔍</button>
          </div>

          <div className="nav-auth" ref={dropdownRef}>
            {user ? (
              /* RECTIFIED: Profile Circle with Dropdown */
              <div className="nav-profile-area" style={{ position: 'relative' }}>
                <div 
                  className="avatar-trigger" 
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  style={{ cursor: 'pointer' }}
                >
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>

                {showProfileDropdown && (
                  <div className="gfg-dropdown" style={{ top: '50px', right: '0' }}>
                    <div className="dropdown-user-summary">
                      <div className="summary-avatar">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="summary-details">
                        <span className="user-name-bold">{user.name}</span>
                        <span className="user-email-muted">{user.email}</span>
                      </div>
                    </div>
                    <div className="dropdown-divider"></div>
                    <ul className="dropdown-list">
                      <li onClick={() => handleNavigation(user.role === "owner" ? "/owner-dashboard" : "/user-dashboard")}>
                        My Dashboard
                      </li>
                      <li onClick={() => handleNavigation("/")}>Home</li>
                      <div className="dropdown-divider"></div>
                      <li className="logout-action" onClick={handleLogout}>
                        Log out
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button className="loginbtn-link" onClick={() => setShowLoginOptions(true)}>
                  Login
                </button>
                <button className="ownerbtn-primary" onClick={() => navigate("/register")} style={{color: 'white', cursor: 'pointer'}}>
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Login Modal (Remains exactly as provided) */}
      {showLoginOptions && (
        <div className="login-modal-overlay">
          <div className="login-box">
            <div className="login-header">
               <h2 className="logo-small">🏠 Roomify</h2>
               <h3>Welcome Back</h3>
               <p>How would you like to sign in?</p>
            </div>
           <div className="login-options-container">
              <button className="login-option user" onClick={() => { setShowLoginOptions(false); navigate("/login", { state: { role: 'user' } }); }}>
                <strong>Login as User</strong>
              </button>
              <button className="login-option owner" onClick={() => { setShowLoginOptions(false); navigate("/login", { state: { role: 'owner' } }); }}>
                <strong>Login as Owner</strong>
              </button>
            </div>
            <div className="login-footer">
               <p>Don't have an account? <span className="register-link" onClick={() => handleNavigation("/register")}> Register</span></p>
               <button className="close-btn" onClick={() => setShowLoginOptions(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;