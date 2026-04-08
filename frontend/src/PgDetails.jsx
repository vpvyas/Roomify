import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next"; // Added for i18n
import axios from "axios";
import toast from "react-hot-toast";
import { Rating } from 'react-simple-star-rating'; 
import "./styles/pgstyle.css";

// --- Sub-Component: Detailed Request Form ---
const RequestForm = ({ pg, user, onClose, onFinish }) => {
  const { t } = useTranslation(); // Initialize translation
  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    phone: "",
    email: user?.email || "",
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

      toast.success("Request sent successfully!");
      onFinish(); 
    } catch (err) {
      toast.error(err.response?.data?.message || "Error sending request");
    }
  };

  return (
    <div className="premium-modal-overlay">
      <div className="premium-modal-card">
        <h2 style={{ marginBottom: '20px', color: '#333', textAlign: 'center' }}>{t("pg.booking_details")}</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>{t("pg.full_name")}</label>
            <input type="text" value={formData.fullName} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>{t("pg.phone")}</label>
              <input type="tel" required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                onChange={(e) => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>{t("pg.email")}</label>
              <input type="email" value={formData.email} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>{t("pg.occupation")}</label>
            <input type="text" placeholder="e.g. Student" required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
              onChange={(e) => setFormData({...formData, occupation: e.target.value})} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>{t("pg.move_in_date")}</label>
              <input type="date" required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                onChange={(e) => setFormData({...formData, moveInDate: e.target.value})} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>{t("pg.duration")}</label>
              <input type="text" placeholder="e.g. 6 Months" required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                onChange={(e) => setFormData({...formData, stayDuration: e.target.value})} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>{t("pg.message_owner")}</label>
            <textarea 
              rows="3" 
              placeholder="Any special requests or questions?" 
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', resize: 'none' }}
              onChange={(e) => setFormData({...formData, message: e.target.value})} 
            />
          </div>

          <button type="submit" className="btn-primary-blue-large">{t("pg.send_request")}</button>
          <button type="button" onClick={onClose} style={{ padding: '10px', background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>{t("pg.cancel")}</button>
        </form>
      </div>
    </div>
  );
};

// --- Main Component ---
export default function PgDetails() {
  const { t } = useTranslation(); // Initialize translation
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [pg, setPg] = useState(null);
  const [error, setError] = useState("");
  const [hasRequested, setHasRequested] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const BACKEND_URL = "http://localhost:3000";
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const fetchPgData = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/pg/${id}`);
      setPg(res.data);
    } catch (err) {
      setError("PG not found or server error");
    }
  };

  useEffect(() => {
    const checkStatus = async () => {
      if (user && token) {
        try {
          const res = await axios.get(`${BACKEND_URL}/api/requests/user/${user.id || user._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setHasRequested(res.data.some(req => req.pgId?._id === id || req.pgId === id));
        } catch (err) { console.error("Status check failed", err); }
      }
    };

    fetchPgData();
    checkStatus();
  }, [id, user?.id, user?._id, token]);

  if (error) return <div className="error-state"><h2>{error}</h2></div>;
  if (!pg) return <div className="loading-state"><h2>Loading...</h2></div>;

  const images = (pg.images?.length ? pg.images : [{ url: "/no-image.png" }]);

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user || !token) {
      toast.error("Please login to leave a review");
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    if (rating === 0) return toast.error("Select a rating");
    setIsSubmitting(true);
    try {
      await axios.post(`${BACKEND_URL}/pg/${id}/reviews`, { rating, message }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Review Posted!");
      setRating(0); setMessage(""); fetchPgData();
    } catch (err) { toast.error("Error posting review"); } 
    finally { setIsSubmitting(false); }
  };

  const handleReserveClick = () => {
    if (!user || !token) {
      toast.error("Please login to reserve this PG");
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    setShowForm(true);
  };

  return (
    <div className="pg-container">
      <div className="pg-header">
        <h1 className="pg-title">{pg.name}</h1>
        <p className="pg-location">📍 {pg.address?.location || pg.location}, {pg.address?.city || ""}</p>
      </div>

      <div className="details-images">
        <div className="main-image-container">
          <img src={images[currentImage].url || images[currentImage]} alt="main" className="main-image" />
          <button className="img-prev" onClick={prevImage}>‹</button>
          <button className="img-next" onClick={nextImage}>›</button>
        </div>
        <div className="thumbnail-row">
          {images.slice(0, 5).map((img, i) => (
            <img key={i} src={img.url || img} alt={`thumb-${i}`} className={`thumb ${currentImage === i ? "active" : ""}`} onClick={() => setCurrentImage(i)} />
          ))}
        </div>
      </div>

      <div className="pg-content-layout">
        <div className="pg-main-info">
          <section className="info-section">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="host-avatar-blue">{pg.owner?.name?.charAt(0).toUpperCase()}</div>
              <div>
                <h2 style={{ fontSize: '1.2rem', margin: 0 }}>{t("pg.hosted_by")} {pg.owner?.name}</h2>
                <p style={{ color: '#666', margin: 0, fontSize: '0.9rem' }}>{pg.owner?.email}</p>
              </div>
            </div>
          </section>
          <hr />
          <section className="info-section">
            <h3>{t("pg.about")}</h3>
            <p className="description-text">{pg.description}</p>
          </section>
          <hr />
          <section className="info-section">
            <h3>{t("pg.rules")}</h3>
            {pg.rules?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                {pg.rules.map((rule, i) => (
                  <div key={i} style={{ fontSize: '0.95rem', color: '#475569', display: 'flex', alignItems: 'start', gap: '8px' }}>
                    <span style={{ color: '#ef4444' }}>•</span> {rule}
                  </div>
                ))}
              </div>
            ) : <p className="description-text">{t("pg.no_rules")}</p>}
          </section>
          <hr />
          <section className="info-section">
            <h3>{t("pg.amenities")}</h3>
            <div className="amenity-grid">
              {pg.amenities?.map((a, i) => (<div key={i} className="amenity-item"><span className="dot"></span> {a}</div>))}
            </div>
          </section>

          <section className="info-section reviews-section">
            <div className="reviews-header">
              <h3>{t("pg.reviews")} ({pg.reviews?.length || 0})</h3>
              <div className="avg-pill">★ {pg.reviews?.length > 0 ? (pg.reviews.reduce((a,b)=>a+b.rating,0)/pg.reviews.length).toFixed(1) : t("pg.new")}</div>
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
            <div className="review-form-card">
              <h4>{t("pg.leave_review")}</h4>
              <Rating onClick={setRating} initialValue={rating} size={30} fillColor="#FFD700" transition />
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="How was your stay?" />
              <button onClick={handleReview} disabled={isSubmitting} className="btn-post-review">{isSubmitting ? t("pg.posting") : t("pg.post_review")}</button>
            </div>
          </section>
        </div>

        <div className="pg-sidebar">
          <div className="booking-card-sticky">
            <div className="card-header">
              <h3>₹{pg.price} <span className="unit">{t("pg.per_month")}</span></h3>
              <span className={`status-badge ${pg.availableRooms > 0 ? "available" : "full"}`}>
                {pg.availableRooms > 0 ? t("pg.available") : t("pg.full")}
              </span>
            </div>
            <button className="btn-primary-blue-large" onClick={handleReserveClick} disabled={pg.availableRooms <= 0 || hasRequested}>
              {hasRequested ? t("pg.request_sent") : t("pg.reserve_now")}
            </button>
          </div>
        </div>
      </div>

      {showForm && <RequestForm pg={pg} user={user} onClose={() => setShowForm(false)} onFinish={() => { setShowForm(false); setHasRequested(true); }} />}
      <button className="back-btn-blue" onClick={() => navigate(-1)}>← {t("pg.back")}</button>
    </div>
  );
}