import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AddPGModal from "./addPG"; 
import "../styles/dashboard.css";

function OwnerDashboard() {
  const navigate = useNavigate();
  const [myRooms, setMyRooms] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [logoutMsg, setLogoutMsg] = useState("");
  
  // State to control the Modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const fetchMyRooms = () => {
    if (!user?._id) return;
    fetch(`http://localhost:3000/pg/owner/${user?._id}`)
      .then((res) => res.json())
      .then((data) => setMyRooms(data))
      .catch((err) => console.log("Error fetching PGs:", err));
  };

  useEffect(() => {
    if (!token || user?.role !== "owner") {
      navigate("/login");
      return;
    }
    fetchMyRooms();
  }, [navigate, token, user?._id, user?.role]);

  const handleLogout = () => {
    setLogoutMsg("Logout successful! Redirecting...");
    localStorage.clear();
    setTimeout(() => { navigate("/"); }, 2000);
  };

  return (
    <div className="dashboard-wrapper">
      {logoutMsg && <div className="logout-toast">{logoutMsg}</div>}

      <nav className="dash-nav">
        <h1 className="logo-text" onClick={() => navigate("/")}>Roomify</h1>
        <div className="nav-right">
          <div className="profile-container">
            <div className="profile-circle" onClick={() => setShowDropdown(!showDropdown)}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            {showDropdown && (
              <div className="profile-dropdown">
                <p className="user-name">{user?.name}</p>
                <hr />
                <button onClick={() => {navigate("/owner-dashboard"); setShowDropdown(false);}}>
                  Dashboard
                </button>
                <button className="logout-opt" onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="dash-content">
        <header className="dash-header">
          <div className="header-text">
            <h2>Welcome, {user?.name}</h2>
            <p>Here are the PGs you have listed on Roomify.</p>
          </div>
          
          {/* UPDATED: Opens the modal instead of navigating */}
          <button className="add-pg-btn" onClick={() => setIsModalOpen(true)}>
            + Add New PG
          </button>
        </header>

        <div className="pg-grid">
          {myRooms.length > 0 ? (
            myRooms.map((pg) => (
              <div key={pg._id} className="pg-dashboard-card">
                <img src={pg.images?.[0] || "/no-image.png"} alt={pg.name} />
                <div className="pg-card-info">
                  <h3>{pg.name}</h3>
                  <p>{pg.address?.city}</p>
                  <div className="pg-card-footer">
                    <span className="price">₹{pg.price}/mo</span>
                    <button onClick={() => navigate(`/pg/${pg._id}`)}>View</button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">No PGs listed yet. Start by adding one!</div>
          )}
        </div>
      </main>

      {/* The Modal Component */}
      <AddPGModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onRefresh={fetchMyRooms} 
      />
    </div>
  );
}

export default OwnerDashboard;