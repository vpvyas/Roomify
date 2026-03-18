import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";
import Footer from "./components/footer";
import Header from "./components/header";

export default function Home() {
  const [search, setSearch] = useState("");
  const [pgListData, setPgListData] = useState([]);
  const [showLoginOptions, setShowLoginOptions] = useState(false);
  const navigate = useNavigate();

  const backendUrl = "http://localhost:3000"; // Used for API calls, not images anymore

  useEffect(() => {
    fetch(`${backendUrl}/pg/all`)
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
      <Header
        search={search}
        setSearch={setSearch}
        showLoginOptions={showLoginOptions}
        setShowLoginOptions={setShowLoginOptions}
      />

      <main className="maincontent">
        <header className="hero">
          <h1>Find your perfect stay with Roomify</h1>
          <p>Discover comfortable PGs and Hostels tailored to your lifestyle.</p>
        </header>

        <section className="pg-section">
          <h2 className="section-title">Available PGs</h2>
          <div className="pg-grid">
            {filteredPGs.length > 0 ? (
              filteredPGs.map((pg) => (
                <div key={pg._id} className="pg-card">
                  <div className="image-container">
                    <img
                      /* RECTIFIED: 
                         1. We check if images[0] exists.
                         2. We access .url because it's now an object.
                         3. We DON'T prefix with backendUrl because Cloudinary is external.
                      */
                      src={
                        pg.images && pg.images.length > 0 
                          ? pg.images[0].url 
                          : "/no-image.png"
                      }
                      alt={pg.name}
                      className="pg-image"
                      onError={(e) => { e.target.src = "/no-image.png"; }}
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