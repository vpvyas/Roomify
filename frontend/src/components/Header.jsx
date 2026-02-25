import React from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";

function Header({ search, setSearch, showLoginOptions, setShowLoginOptions }) {
  const navigate = useNavigate();

  // Helper function to handle navigation and close modal
  const handleNavigation = (path) => {
    setShowLoginOptions(false);
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
            <button className="search-icon-btn">
              🔍
            </button>
          </div>

          <div className="nav-auth">
            <button
              className="loginbtn-link"
              onClick={() => setShowLoginOptions(true)}
            >
              Login
            </button>

            <button
              className="ownerbtn-primary"
              onClick={() => navigate("/signup-owner")}
            >
              Start as Owner
            </button>
          </div>
        </div>
      </nav>

      {showLoginOptions && (
        <div className="login-modal-overlay">
          <div className="login-box">
            <div className="login-header">
               <h2 className="logo-small">🏠 Roomify</h2>
               <h3>Welcome Back</h3>
               <p>How would you like to sign in?</p>
            </div>

           <div className="login-options-container">
              <button
                className="login-option user"
                // We pass 'user' as the state
                onClick={() => {
                  setShowLoginOptions(false);
                  navigate("/login", { state: { role: 'user' } });
                }}
              >
                <strong>Login as User</strong>
              </button>

              <button
                className="login-option owner"
                // We pass 'owner' as the state
                onClick={() => {
                  setShowLoginOptions(false);
                  navigate("/login", { state: { role: 'owner' } });
                }}
              >
                <strong>Login as Owner</strong>
              </button>
</div>

            {/* Added Register Link here */}
            <div className="login-footer">
               <p>Don't have an account? 
                  <span 
                    className="register-link" 
                    onClick={() => handleNavigation("/register")}
                  >   Register</span>
               </p>
               <button
                 className="close-btn"
                 onClick={() => setShowLoginOptions(false)}
               >
                 Cancel
               </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;