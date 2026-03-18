import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Rating } from 'react-simple-star-rating'; 
import "./styles/pgstyle.css";

// --- Detailed Request Form (Modal) ---
const RequestForm = ({ pg, user, onClose, onFinish }) => {
  const [formData, setFormData] = useState({
    fullName: user.name || "",
    phone: "",
    email: user.email || "",
    occupation: "",
    moveInDate: "",
    stayDuration: "",
    message: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const BACKEND_URL = "http://localhost:3000";
    
    try {
      await axios.post(`${BACKEND_URL}/api/requests/send`, {
        pgId: pg._id,
        userId: user.id || user._id,
        ownerId: pg.owner?._id || pg.owner,
        formData: formData 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success("Request and details sent successfully!");
      onFinish(); 
    } catch (err) {
      toast.error(err.response?.data?.message || "Error sending request");
    }
  };

  return (
    <div className="premium-modal-overlay">
      <div className="premium-modal-card">
        <h2 style={{ marginBottom: '20px', color: '#333', textAlign: 'center' }}>Booking Details</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Full Name</label>
            <input type="text" value={formData.fullName} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Phone</label>
              <input type="tel" required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                onChange={(e) => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email</label>
              <input type="email" value={formData.email} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Occupation</label>
            <input type="text" placeholder="e.g. Student" required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
              onChange={(e) => setFormData({...formData, occupation: e.target.value})} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Move-in Date</label>
              <input type="date" required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                onChange={(e) => setFormData({...formData, moveInDate: e.target.value})} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Duration</label>
              <input type="text" placeholder="e.g. 6 Months" required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                onChange={(e) => setFormData({...formData, stayDuration: e.target.value})} />
            </div>
          </div>

          <button type="submit" className="btn-primary-blue-large">Send Request</button>
          <button type="button" onClick={onClose} style={{ padding: '10px', background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
        </form>
      </div>
    </div>
  );
};

export default function PgDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pg, setPg] = useState(null);
  const [error, setError] = useState("");
  const [hasRequested, setHasRequested] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const BACKEND_URL = "http://localhost:3000";
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const fetchPgData = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/pg/${id}`);
      if (!res.ok) throw new Error("PG not found");
      const data = await res.json();
      setPg(data);
    } catch (err) { setError(err.message); }
  };

  useEffect(() => {
    fetchPgData();
    const checkStatus = async () => {
      if (user && token) {
        try {
          const res = await axios.get(`${BACKEND_URL}/api/requests/user/${user.id || user._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setHasRequested(res.data.some(req => req.pgId?._id === id || req.pgId === id));
        } catch (err) { console.error(err); }
      }
    };
    checkStatus();
  }, [id]);

  const nextSlide = () => setCurrentIndex((prev) => (prev === pg.images.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentIndex((prev) => (prev === 0 ? pg.images.length - 1 : prev - 1));

  const handleReview = async (e) => {
    e.preventDefault();
    if (!token) return toast.error("Login to review");
    if (rating === 0) return toast.error("Select a rating");
    setIsSubmitting(true);
    try {
      await axios.post(`${BACKEND_URL}/pg/${id}/reviews`, { rating, message }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Review Posted!");
      setRating(0); setMessage(""); fetchPgData();
    } catch (err) { toast.error("Error posting review"); }
    finally { setIsSubmitting(false); }
  };

  if (error) return <div className="error-state"><h2>{error}</h2></div>;
  if (!pg) return <div className="loading-state"><h2>Loading...</h2></div>;

  return (
    <div className="pg-container">
      <div className="pg-header">
        <h1 className="pg-title">{pg.name}</h1>
        <p className="pg-location">📍 {pg.address?.location}, {pg.address?.city}</p>
      </div>

      {/* MODERN PROFESSIONAL SLIDER */}
      <div className="pro-slider-container compact">
        <div className="pro-slider-track" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
          {pg.images.map((img, i) => (
            <div className="pro-slide" key={i}>
              <div className="image-overlay-shadow"></div>
              <img src={img.url} alt="Room View" />
            </div>
          ))}
        </div>
        <button className="pro-nav-btn prev" onClick={prevSlide}>
          <svg viewBox="0 0 32 32"><path d="m20 28-11.29-11.29c-.39-.39-.39-1.02 0-1.41l11.29-11.29" fill="none" stroke="#222" strokeWidth="3.5"/></svg>
        </button>
        <button className="pro-nav-btn next" onClick={nextSlide}>
          <svg viewBox="0 0 32 32"><path d="m12 4 11.29 11.29c.39.39.39 1.02 0 1.41l-11.29 11.29" fill="none" stroke="#222" strokeWidth="3.5"/></svg>
        </button>
        <div className="pro-slider-pagination">
          {pg.images.map((_, i) => (
            <div key={i} className={`pro-dot ${currentIndex === i ? 'active' : ''}`} onClick={() => setCurrentIndex(i)} />
          ))}
        </div>
        <div className="pro-image-count">{currentIndex + 1} / {pg.images.length}</div>
      </div>

      <div className="pg-content-layout">
        <div className="pg-main-info">
          <section className="info-section">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="host-avatar-blue">{pg.owner?.name?.charAt(0).toUpperCase()}</div>
              <div>
                <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Hosted by {pg.owner?.name}</h2>
                <p style={{ color: '#666', margin: 0, fontSize: '0.9rem' }}>{pg.owner?.email}</p>
              </div>
            </div>
          </section>
          <hr />
          <section className="info-section">
            <h3>About this place</h3>
            <p className="description-text">{pg.description}</p>
          </section>
          <hr />
          <section className="info-section">
            <h3>Amenities</h3>
            <div className="amenity-grid">
              {pg.amenities?.map((a, i) => (<div key={i} className="amenity-item"><span className="dot"></span> {a}</div>))}
            </div>
          </section>

          {/* REVIEWS SECTION */}
          <section className="info-section reviews-section">
            <div className="reviews-header">
              <h3>Reviews ({pg.reviews?.length || 0})</h3>
              <div className="avg-pill">★ {pg.reviews?.length > 0 ? (pg.reviews.reduce((a,b)=>a+b.rating,0)/pg.reviews.length).toFixed(1) : "New"}</div>
            </div>
            <div className="reviews-grid">
              {pg.reviews?.map((rev, i) => (
                <div key={i} className="modern-rev-card">
                  <strong>{rev.user?.name}</strong>
                  <Rating initialValue={rev.rating} readonly size={16} fillColor="#FFD700" />
                  <p>{rev.message}</p>
                </div>
              ))}
            </div>
            {/* Stylish Review Form */}
            <div className="review-form-card">
              <h4>Leave a review</h4>
              <Rating onClick={setRating} initialValue={rating} size={30} fillColor="#FFD700" transition />
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="How was your stay?" />
              <button onClick={handleReview} disabled={isSubmitting} className="btn-post-review">
                {isSubmitting ? "Posting..." : "Post Review"}
              </button>
            </div>
          </section>
        </div>

        <div className="pg-sidebar">
          <div className="booking-card-sticky">
            <div className="card-header">
              <h3>₹{pg.price} <span className="unit">/ month</span></h3>
              <span className={`status-badge ${pg.availableRooms > 0 ? "available" : "full"}`}>{pg.availableRooms > 0 ? "Available" : "Full"}</span>
            </div>
            <button className="btn-primary-blue-large" onClick={() => setShowForm(true)} disabled={pg.availableRooms <= 0 || hasRequested}>
              {hasRequested ? "Request Sent ✅" : "Reserve Now"}
            </button>
          </div>
        </div>
      </div>

      {showForm && <RequestForm pg={pg} user={user} onClose={() => setShowForm(false)} onFinish={() => { setShowForm(false); setHasRequested(true); }} />}
      <button className="back-btn-blue" onClick={() => navigate(-1)}>← Back</button>
    </div>
  );
}