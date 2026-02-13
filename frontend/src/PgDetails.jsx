import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./styles/pgstyle.css";

export default function PgDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pg, setPg] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`http://localhost:8080/pgs/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("PG not found");
        return res.json();
      })
      .then((data) => {
        setPg(data);
      })
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) return <div className="error-state"><h2>{error}</h2></div>;
  if (!pg) return <div className="loading-state"><h2>Loading...</h2></div>;

  return (
    <div className="pg-container">
      {/* HEADER SECTION */}
      <div className="pg-header">
        
        <h1 className="pg-title">{pg.name}</h1>
        <p className="pg-location">
          <span className="icon">📍</span> {pg.address?.location}, {pg.address?.city}, {pg.address?.state}
        </p>
      </div>

      {/* REFINED IMAGE GALLERY (1 Big, 4 Small) */}
      <div className="pg-gallery">
        <div className="main-img-box">
          <img src={pg.images[0]} alt="Main" />
        </div>
        <div className="side-imgs-grid">
          {pg.images.slice(1, 5).map((img, i) => (
            <div key={i} className="side-img-box">
              <img src={img} alt={`View ${i + 1}`} />
            </div>
          ))}
        </div>
      </div>

      <div className="pg-content-layout">
        {/* LEFT SIDE: DETAILS */}
        <div className="pg-main-info">
          <section className="info-section">
            <h3>About this place</h3>
            <p className="description">{pg.description}</p>
          </section>

          <hr />

          <section className="info-section">
            <h3>What this place offers</h3>
            <div className="amenities-list">
              {pg.amenities.map((a, i) => (
                <div key={i} className="amenity-item">
                  <span className="dot"></span> {a}
                </div>
              ))}
            </div>
          </section>

          <hr />

          <section className="info-section">
            <h3>House Rules</h3>
            <ul className="rules-list">
              {pg.rules.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </section>
        </div>

        {/* RIGHT SIDE: STICKY BOOKING CARD */}
        <div className="pg-sidebar">
          <div className="booking-card">
            <div className="card-header">
              <h3>₹{pg.price} <span className="unit">/ month</span></h3>
              <span className={`status-badge ${pg.isAvailable ? "available" : "full"}`}>
                {pg.isAvailable ? "Available Now" : "Fully Booked"}
              </span>
            </div>
            
            <div className="card-details">
              <div className="detail-row">
                <span>Rooms</span>
                <span>{pg.availableRooms} / {pg.totalRooms} left</span>
              </div>
            </div>

            <button className="book-now-btn" disabled={!pg.isAvailable}>
              {pg.isAvailable ? "Reserve Now" : "Join Waitlist"}
            </button>
            <p className="card-footer">You won't be charged yet</p>
          </div>
        </div>
      </div>
      <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
    </div>
  );
}