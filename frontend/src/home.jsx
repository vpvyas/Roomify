import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next"; // Important Import
import "./index.css"; 
import Footer from "./components/footer";
import Header from "./components/header";
import Chatbot from "./components/Chatbot";
import axios from "axios";

export default function Home() {
  const { t } = useTranslation(); // Initialize translation hook
  const [search, setSearch] = useState("");
  const [pgListData, setPgListData] = useState([]);
  const [showLoginOptions, setShowLoginOptions] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();

  const backendUrl = "http://localhost:3000";

  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");
  const user = JSON.parse(localStorage.getItem("user"));
  const showChat = !!token && userRole === "user";

  useEffect(() => {
    fetch(`${backendUrl}/pg/all`)
      .then((res) => res.json())
      .then((data) => {
        setPgListData(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error("Error fetching PGs:", err));
  }, []);

  // Fetch user's favorites
  useEffect(() => {
    if (user && token) {
      axios.get(`${backendUrl}/api/users/${user.id || user._id}/favorites`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        const favIds = res.data.favorites.map(fav => fav._id || fav);
        setFavorites(favIds);
      })
      .catch((err) => console.error("Error fetching favorites:", err));
    }
  }, [token, user]);

  const toggleFavorite = async (pgId, e) => {
    e.stopPropagation();
    
    if (!user || !token) {
      alert("Please login to add favorites!");
      navigate('/login');
      return;
    }

    try {
      if (favorites.includes(pgId)) {
        // Remove from favorites
        await axios.delete(`${backendUrl}/api/users/${user.id || user._id}/favorites/${pgId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFavorites(favorites.filter(id => id !== pgId));
      } else {
        // Add to favorites
        await axios.post(`${backendUrl}/api/users/${user.id || user._id}/favorites/${pgId}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFavorites([...favorites, pgId]);
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

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
        {/* Hero Banner with Translation */}
        <header className="hero">
          <h1>{t("home.hero_title")}</h1>
          <p>{t("home.hero_sub")}</p>
        </header>

        {/* Listings Grid */}
        <section className="pg-section">
          <h2 className="section-title">{t("home.section_title")}</h2>
          <div className="pg-grid">
            {filteredPGs.length > 0 ? (
              filteredPGs.map((pg) => (
                <div key={pg._id} className="pg-card">
                  <div className="image-container">
                    <img
                      src={pg.images && pg.images.length > 0 ? pg.images[0].url : "/no-image.png"}
                      alt={pg.name}
                      className="pg-image"
                      onError={(e) => { e.target.src = "/no-image.png"; }}
                    />
                    <button 
                      className={`favorite-btn ${favorites.includes(pg._id) ? 'active' : ''}`}
                      onClick={(e) => toggleFavorite(pg._id, e)}
                      title={favorites.includes(pg._id) ? "Remove from favorites" : "Add to favorites"}
                    >
                      ♥
                    </button>
                  </div>
                  <div className="card-info">
                    <div className="card-header-row">
                        <h3>{pg.name}</h3>
                        <p className="city-label">{pg.address?.city}</p>
                    </div>
                    <div className="price-row">
                      <span className="pg-price">₹{pg.price}</span>
                      <span className="per-month">{t("home.per_month")}</span>
                    </div>
                    <button className="view-btn" onClick={() => navigate(`/pg/${pg._id}`)}>
                      {t("home.view_details")}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-results">{t("home.no_results")}</p>
            )}
          </div>
        </section>
      </main>

      {showChat && <Chatbot />}
      <Footer />
    </div>
  );
}