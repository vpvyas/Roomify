import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";
import Footer from "./components/footer";

export default function Home() {
  const [search, setSearch] = useState("");
  const [pgListData, setPgListData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:3000/pg/all")
      .then((res) => res.json())
      .then((data) => setPgListData(data))
      .catch((err) => console.log("Error fetching PGs:", err));
  }, []);

  const filteredPGs = pgListData.filter(
    (pg) =>
      pg.name?.toLowerCase().includes(search.toLowerCase()) ||
      pg.address?.city?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app-container">
      {/* Navbar */}
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
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </button>
          </div>

          <div className="nav-auth">
            <button className="loginbtn-link">Login</button>
            <button className="ownerbtn-primary">Start as Owner</button>
          </div>
        </div>
      </nav>

      <main className="maincontent">
        {/* Hero Section */}
        <header className="hero">
          <h1>Find your perfect stay with Roomify</h1>
          <p>Discover comfortable PGs and Hostels tailored to your lifestyle.</p>
        </header>

        {/* PG LIST */}
        <section className="pg-section">
          <h2 className="section-title">Available PGs</h2>
          <div className="pg-grid">
            {filteredPGs.length > 0 ? (
              filteredPGs.map((pg) => (
                <div key={pg._id} className="pg-card">
                  <div className="image-container">
                    <img
                      src={pg.images?.length ? pg.images[0] : "/no-image.png"}
                      alt={pg.name}
                      className="pg-image"
                    />
                  </div>
                  <div className="card-info">
                    <h3>{pg.name}</h3>
                    <p className="city-label">{pg.address?.city}</p>
                    <div className="price-row">
                      <span className="pg-price">₹{pg.price}</span>
                      <span className="per-month">/mo</span>
                    </div>
                    <button
                      className="view-btn"
                      onClick={() => navigate(`/pg/${pg._id}`)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-results">No PGs found matching your search.</p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}