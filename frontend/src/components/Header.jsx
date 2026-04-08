import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next"; // Added only this
import "../index.css";

function Header({ search, setSearch, showLoginOptions, setShowLoginOptions }) {
  const { t } = useTranslation(); // Added only this
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
    window.location.reload(); 
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
              placeholder={t("header.search_placeholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="search-icon-btn">🔍</button>
          </div>

          <div className="nav-auth" ref={dropdownRef}>
            {user ? (
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
                        {t("header.my_dashboard")}
                      </li>
                      <li onClick={() => handleNavigation("/")}>{t("header.home")}</li>
                      <div className="dropdown-divider"></div>
                      <li className="logout-action" onClick={handleLogout}>
                        {t("header.logout")}
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button className="loginbtn-link" onClick={() => setShowLoginOptions(true)}>
                  {t("header.login")}
                </button>
                <button className="ownerbtn-primary" onClick={() => navigate("/register")} style={{color: 'white', cursor: 'pointer'}}>
                  {t("header.register")}
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Login Modal */}
      {showLoginOptions && (
        <div className="login-modal-overlay">
          <div className="login-box">
            <div className="login-header">
               <h2 className="logo-small">🏠 Roomify</h2>
               <h3>{t("header.welcome_back")}</h3>
               <p>{t("header.signin_prompt")}</p>
            </div>
           <div className="login-options-container">
              <button className="login-option user" onClick={() => { setShowLoginOptions(false); navigate("/login", { state: { role: 'user' } }); }}>
                <strong>{t("header.login_user")}</strong>
              </button>
              <button className="login-option owner" onClick={() => { setShowLoginOptions(false); navigate("/login", { state: { role: 'owner' } }); }}>
                <strong>{t("header.login_owner")}</strong>
              </button>
            </div>
            <div className="login-footer">
               <p>{t("header.no_account")} <span className="register-link" onClick={() => handleNavigation("/register")}> {t("header.register")}</span></p>
               <button className="close-btn" onClick={() => setShowLoginOptions(false)}>{t("header.cancel")}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;