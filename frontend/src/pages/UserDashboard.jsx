import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import html2pdf from 'html2pdf.js';
import "../styles/dashboard.css"; 

// ─── COMPONENT: RECEIPT MODAL (Blue & Professional) ─────────
const ReceiptModal = ({ receipt, onClose }) => {
  if (!receipt) return null;

  const handleDownload = () => {
    const element = document.getElementById('printable-receipt');
    const options = {
      margin: 0.2,
      filename: `Roomify_Receipt_${receipt.receipt_no}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        backgroundColor: '#ffffff',
        letterRendering: true
      },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(options).from(element).save();
  };

  // RECTIFIED: Helper to ensure charges show up even if saved differently
  const getVal = (key) => receipt.charges?.[key] || 0;

  return (
    <div className="receipt-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 5000, display: 'flex', justifyContent: 'center', alignItems: 'center', overflowY: 'auto', padding: '20px' }}>
      
      {/* SVG Filter to sharpen the signature */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <filter id="remove-white">
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  -1 -1 -1 1 0" />
        </filter>
      </svg>

      <div className="receipt-modal-content" style={{ background: '#fff', maxWidth: '650px', width: '100%', borderRadius: '15px', position: 'relative', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}>
        
        {/* Top Control Bar */}
        <div className="no-print" style={{ padding: '15px 25px', background: '#2563eb', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{fontWeight: '600'}}>Digital Rent Receipt</span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleDownload} style={{ background: '#fff', color: '#2563eb', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>📥 Download PDF</button>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Close</button>
          </div>
        </div>

        {/* The Actual Receipt Document */}
        <div id="printable-receipt" style={{ padding: '40px', background: '#ffffff', margin: '0', color: '#1a1a1a', position: 'relative' }}>
          
          {/* Subtle PAID Watermark */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-30deg)', fontSize: '120px', color: 'rgba(37, 99, 235, 0.05)', fontWeight: '900', zIndex: 0, pointerEvents: 'none' }}>PAID</div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ textAlign: 'center', borderBottom: '2px solid #2563eb', marginBottom: '30px', paddingBottom: '10px' }}>
              <h1 style={{ letterSpacing: '4px', margin: '0', fontSize: '26px', color: '#2563eb', fontWeight: '900' }}>RENT RECEIPT</h1>
            </div>
            
            <div style={{ marginBottom: '25px' }}>
              <strong style={{color: '#666', fontSize: '12px', textTransform: 'uppercase'}}>Property Owner</strong> 
              <div style={{borderBottom: '1px solid #eee', padding: '5px 0', fontSize: '18px', fontWeight: 'bold'}}>{receipt.owner}</div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', fontSize: '14px', background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
              <span><strong>Receipt No:</strong> {receipt.receipt_no}</span>
              <span><strong>Dated:</strong> {new Date(receipt.date).toLocaleDateString('en-IN')}</span>
            </div>

            <p style={{ borderBottom: '1px dashed #cbd5e1', padding: '12px 0', margin: '0' }}>Received with thanks from: <strong>{receipt.tenant_name}</strong></p>
            <p style={{ borderBottom: '1px dashed #cbd5e1', padding: '12px 0', margin: '0' }}>For Property: <strong>{receipt.property_address}</strong></p>

            {/* RECTIFIED BREAKDOWN SECTION */}
            <div style={{ marginTop: '30px', padding: '20px', background: '#f1f5f9', borderRadius: '10px' }}>
              <h4 style={{margin: '0 0 15px 0', fontSize: '12px', textTransform: 'uppercase', color: '#475569', letterSpacing: '1px'}}>Payment Breakdown</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '15px' }}>
                <div>Monthly Rent: <strong>₹{receipt.rent_amount}</strong></div>
                <div>Water Charges: <strong>₹{getVal('water')}</strong></div>
                <div>Electricity: <strong>₹{getVal('electricity')}</strong></div>
                <div>House Tax/Misc: <strong>₹{getVal('tax')}</strong></div>
              </div>
            </div>

            <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div style={{ padding: '15px 30px', border: '3px solid #2563eb', color: '#2563eb', display: 'inline-block', fontSize: '24px', fontWeight: '900', borderRadius: '4px' }}>
                TOTAL: ₹{receipt.total_amount}
              </div>

              <div style={{ width: '200px', textAlign: 'center' }}>
                {receipt.signature && (
                  <div style={{ height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img 
                      src={receipt.signature} 
                      alt="Owner Signature" 
                      crossOrigin="anonymous"
                      style={{ maxHeight: '100%', maxWidth: '100%', filter: 'contrast(1.2)', mixBlendMode: 'multiply' }} 
                    />
                  </div>
                )}
                <div style={{ borderTop: '2px solid #1a1a1a', paddingTop: '5px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  Signature of Owner
                </div>
              </div>
            </div>
            
            <div style={{marginTop: '60px', textAlign: 'center', color: '#94a3b8', fontSize: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '20px'}}>
              This is a digital receipt issued via Roomify India. Verified Payment.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT: USER DASHBOARD ──────────────────────────
function UserDashboard() {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [requests, setRequests] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' or 'favorites'

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!user) return navigate("/login");
    
    const fetchData = async () => {
      try {
        // Fetch requests/bookings
        const requestsResponse = await axios.get(`http://localhost:3000/api/requests/user/${user.id || user._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRequests(requestsResponse.data);

        // Fetch favorites
        const favResponse = await axios.get(`http://localhost:3000/api/users/${user.id || user._id}/favorites`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFavorites(favResponse.data.favorites);
      } catch (err) { 
        console.error(err); 
      } finally { 
        setLoading(false); 
      }
    };
    
    fetchData();
  }, [navigate, user, token]);

  const fetchReceipt = async (requestId) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/receipts/request/${requestId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Correctly handle both object or wrapped receipt keys
      setSelectedReceipt(response.data.receipt || response.data);
    } catch (err) { 
      toast.error("Receipt not found. The owner may not have generated it yet."); 
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this request?")) return;
    try {
      await axios.delete(`http://localhost:3000/api/requests/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(prev => prev.filter(r => r._id !== id));
      toast.success("Cancelled successfully");
    } catch (err) { toast.error("Failed to cancel"); }
  };

  const removeFavorite = async (pgId) => {
    try {
      await axios.delete(`http://localhost:3000/api/users/${user.id || user._id}/favorites/${pgId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavorites(prev => prev.filter(fav => fav._id !== pgId));
      toast.success("Removed from favorites");
    } catch (err) { 
      toast.error("Failed to remove from favorites"); 
    }
  };

  if (!user) return null;

  return (
    <div className="dashboard-wrapper">
      <nav className="dash-nav" style={{ sticky: 'top', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #eee' }}>
        <div className="nav-inner">
          <div className="logo-text" onClick={() => navigate("/")} style={{cursor: 'pointer', color: '#2563eb', fontWeight: 'bold', fontSize: '22px'}}>Roomify</div>
          <div className="nav-profile-area">
            <div className="avatar-trigger" onClick={() => setShowDropdown(!showDropdown)} style={{ background: '#2563eb', cursor: 'pointer' }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            {showDropdown && (
              <div className="gfg-dropdown">
                <div className="dropdown-user-summary">
                  <div className="summary-avatar" style={{ background: '#2563eb' }}>{user.name.charAt(0).toUpperCase()}</div>
                  <div className="summary-details">
                    <span className="user-name-bold">{user.name}</span>
                    <span className="user-email-muted">{user.email}</span>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <ul className="dropdown-list">
                  <li onClick={() => navigate("/")}>Home</li>
                  <li className="logout-action" onClick={() => { localStorage.clear(); navigate("/"); }}>Logout</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="dash-main-body" style={{maxWidth: '1100px', margin: '0 auto', padding: '40px 20px'}}>
        <div className="page-head" style={{display: 'flex', justifyContent: 'space-between', marginBottom: '30px', alignItems: 'center'}}>
          <h2 style={{fontWeight: '800', margin: 0}}>My Dashboard</h2>
          <button className="btn-primary-add" onClick={() => navigate("/")} style={{background: '#2563eb', borderRadius: '8px'}}>+ Find New PG</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '2px solid #f1f5f9' }}>
          <button 
            onClick={() => setActiveTab('bookings')}
            style={{
              padding: '12px 20px',
              background: activeTab === 'bookings' ? '#2563eb' : 'transparent',
              color: activeTab === 'bookings' ? 'white' : '#2563eb',
              border: 'none',
              borderRadius: '8px 8px 0 0',
              fontWeight: 'bold',
              cursor: 'pointer',
              borderBottom: activeTab === 'bookings' ? '3px solid #2563eb' : 'none',
              transition: 'all 0.2s'
            }}
          >
            📋 My Bookings ({requests.length})
          </button>
          <button 
            onClick={() => setActiveTab('favorites')}
            style={{
              padding: '12px 20px',
              background: activeTab === 'favorites' ? '#2563eb' : 'transparent',
              color: activeTab === 'favorites' ? 'white' : '#2563eb',
              border: 'none',
              borderRadius: '8px 8px 0 0',
              fontWeight: 'bold',
              cursor: 'pointer',
              borderBottom: activeTab === 'favorites' ? '3px solid #2563eb' : 'none',
              transition: 'all 0.2s'
            }}
          >
            ♥ Favorites ({favorites.length})
          </button>
        </div>

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          loading ? <div className="empty-state">Loading your bookings...</div> : (
            requests.length === 0 ? (
              <div className="empty-state" style={{ textAlign: 'center', padding: '60px 20px' }}>
                <p style={{ fontSize: '1.2rem', color: '#64748b' }}>No bookings yet. Start exploring!</p>
              </div>
            ) : (
              <div className="pg-grid-compact">
                {requests.filter(req => req.pgId).map((req) => (
                  <div key={req._id} className="pg-card-compact shadow-hover" style={{ borderRadius: '15px', overflow: 'hidden' }}>
                    <div className="card-img-container">
                      <img src={req.pgId?.images?.[0]?.url || "/no-image.png"} alt="PG" />
                      <div className="price-overlay-badge" style={{ background: '#2563eb' }}>₹{req.pgId?.price}</div>
                    </div>
                    <div className="card-body-content" style={{padding: '15px'}}>
                      <h3 className="user-name-bold" style={{fontSize: '16px'}}>{req.pgId?.name}</h3>
                      <p className="user-email-muted" style={{fontSize: '13px'}}>📍 {req.pgId?.location || "Address Hidden"}</p>
                      
                      <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <span className={`status-pill ${req.status}`} style={{
                          padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', alignSelf: 'flex-start',
                          background: req.status === 'approved' ? '#dcfce7' : req.status === 'rejected' ? '#fee2e2' : '#fef9c3',
                          color: req.status === 'approved' ? '#166534' : req.status === 'rejected' ? '#991b1b' : '#854d0e'
                        }}>
                          {req.status.toUpperCase()}
                        </span>

                        {req.status === 'approved' && (
                          <button onClick={() => fetchReceipt(req._id)} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                            📄 Download Receipt
                          </button>
                        )}
                      </div>
                      
                      <div className="split-btns" style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                        <button className="view-btn" onClick={() => navigate(`/pg/${req.pgId?._id}`)} style={{ flex: 1, border: '1px solid #2563eb', color: '#2563eb', background: 'none' }}>Details</button>
                        {req.status === 'pending' && (
                          <button className="btn-soft-delete" onClick={() => handleCancel(req._id)} style={{ flex: 1, background: '#fee2e2', color: '#ef4444' }}>Cancel</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )
        )}

        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          loading ? <div className="empty-state">Loading your favorites...</div> : (
            favorites.length === 0 ? (
              <div className="empty-state" style={{ textAlign: 'center', padding: '60px 20px' }}>
                <p style={{ fontSize: '1.2rem', color: '#64748b' }}>No favorites yet. Add some PGs to your favorites!</p>
              </div>
            ) : (
              <div className="pg-grid-compact">
                {favorites.map((pg) => (
                  <div key={pg._id} className="pg-card-compact shadow-hover" style={{ borderRadius: '15px', overflow: 'hidden' }}>
                    <div className="card-img-container">
                      <img src={pg?.images?.[0]?.url || "/no-image.png"} alt="PG" />
                      <div className="price-overlay-badge" style={{ background: '#2563eb' }}>₹{pg?.price}</div>
                    </div>
                    <div className="card-body-content" style={{padding: '15px'}}>
                      <h3 className="user-name-bold" style={{fontSize: '16px'}}>{pg?.name}</h3>
                      <p className="user-email-muted" style={{fontSize: '13px'}}>📍 {pg?.address?.city || "City"}</p>
                      
                      <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <span style={{
                          padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', alignSelf: 'flex-start',
                          background: '#fef9c3',
                          color: '#854d0e'
                        }}>
                          ♥ FAVORITE
                        </span>
                      </div>
                      
                      <div className="split-btns" style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                        <button className="view-btn" onClick={() => navigate(`/pg/${pg?._id}`)} style={{ flex: 1, border: '1px solid #2563eb', color: '#2563eb', background: 'none' }}>View</button>
                        <button className="btn-soft-delete" onClick={() => removeFavorite(pg?._id)} style={{ flex: 1, background: '#fee2e2', color: '#ef4444' }}>Remove</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )
        )}
      </main>

      {selectedReceipt && <ReceiptModal receipt={selectedReceipt} onClose={() => setSelectedReceipt(null)} />}
    </div>
  );
}

export default UserDashboard;