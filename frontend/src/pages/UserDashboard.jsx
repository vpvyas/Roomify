import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import html2pdf from 'html2pdf.js';
import "../styles/dashboard.css"; 

// ==========================================
// 1. RECEIPT MODAL: Blue Theme & White BG
// ==========================================
const ReceiptModal = ({ receipt, onClose }) => {
  if (!receipt) return null;

  const handleDownload = () => {
    const element = document.getElementById('printable-receipt');
    const options = {
      margin: 0,
      filename: `Receipt_${receipt.receipt_no}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { 
        scale: 4, 
        useCORS: true, 
        backgroundColor: '#ffffff' // Forced white background for PDF
      },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(options).from(element).save();
  };

  return (
    <div className="receipt-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 5000, display: 'flex', justifyContent: 'center', alignItems: 'center', overflowY: 'auto', padding: '20px' }}>
      
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <filter id="remove-white">
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  -1 -1 -1 1 0" />
        </filter>
      </svg>

      <div className="receipt-modal-content" style={{ background: '#fff', maxWidth: '650px', width: '100%', borderRadius: '12px', position: 'relative', overflow: 'hidden' }}>
        
        {/* Modal Toolbar: Blue with Red Close */}
        <div className="no-print" style={{ padding: '15px 25px', background: '#191970', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{fontWeight: 'bold'}}>Rent Receipt - {receipt.receipt_no}</span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleDownload} style={{ background: '#fff', color: '#2563eb', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>📥 Download PDF</button>
            <button onClick={onClose} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Close</button>
          </div>
        </div>

        {/* Printable Area: White Background with Blue Borders */}
        <div id="printable-receipt" style={{ padding: '40px', background: '#ffffff', border: '2px solid #191970', margin: '20px', fontFamily: '"Courier New", Courier, monospace', color: '#1a1a1a' }}>
          <div style={{ textAlign: 'center', borderBottom: '2px solid #191970', marginBottom: '25px' }}>
            <h1 style={{ letterSpacing: '6px', margin: '0 0 10px 0', fontSize: '28px', color: '#191970' }}>RENT RECEIPT</h1>
          </div>
          
          <div style={{ marginBottom: '20px', fontSize: '18px' }}>
            <strong>Owner:</strong> <span style={{borderBottom: '1px solid #333', display: 'inline-block', width: '80%'}}>{receipt.owner}</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <span><strong>Receipt No:</strong> {receipt.receipt_no}</span>
            <span><strong>Dated:</strong> {new Date(receipt.date).toLocaleDateString()}</span>
          </div>

          <p style={{ borderBottom: '1px dashed #999', paddingBottom: '10px', margin: '20px 0' }}>Received with thanks from: <strong>{receipt.tenant_name}</strong></p>
          <p style={{ borderBottom: '1px dashed #999', paddingBottom: '10px', margin: '20px 0' }}>Address: {receipt.property_address}</p>
          <p style={{ borderBottom: '1px dashed #999', paddingBottom: '10px', margin: '20px 0' }}>The sum of Rs: <strong>{receipt.total_amount}</strong></p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '25px', fontSize: '14px' }}>
            <div>Monthly Rent: ₹{receipt.rent_amount}</div>
            <div>Water Charges: ₹{receipt.charges?.water || 0}</div>
            <div>Electricity: ₹{receipt.charges?.electricity || 0}</div>
            <div>House Tax: ₹{receipt.charges?.tax || 0}</div>
          </div>

          <div style={{ marginTop: '35px', padding: '12px 25px', border: '3px solid #000', display: 'inline-block', fontSize: '26px', fontWeight: '900' }}>
            Rs. {receipt.total_amount}
          </div>

          {/* Signature: Attached directly above text, no line */}
          <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: '200px', textAlign: 'center', position: 'relative' }}>
              {receipt.signature && (
                <div style={{ height: '65px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: '5px' }}>
                  <img 
                    src={receipt.signature} 
                    alt="Owner Signature" 
                    crossOrigin="anonymous"
                    style={{ 
                      maxHeight: '100%', 
                      maxWidth: '180px',
                      filter: 'url(#remove-white) contrast(1.5)',
                      mixBlendMode: 'multiply'
                    }} 
                  />
                </div>
              )}
              <strong style={{ borderTop: '1px solid #ddd', display: 'block', paddingTop: '5px' }}>Signature of Owner</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. DASHBOARD: Profile & Blue Theme
// ==========================================
function UserDashboard() {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const [user] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!user) return navigate("/login");
    const fetchRequests = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/requests/user/${user.id || user._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRequests(response.data);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchRequests();
  }, [user, navigate, token]);

  const fetchReceipt = async (requestId) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/receipts/request/${requestId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedReceipt(response.data);
    } catch (err) { toast.error("Receipt not generated yet."); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel?")) return;
    try {
      await axios.delete(`http://localhost:3000/api/requests/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(requests.filter(r => r._id !== id));
      toast.success("Cancelled successfully");
    } catch (err) { toast.error("Failed to cancel"); }
  };

  if (!user) return null;

  return (
    <div className="dashboard-wrapper">
      <nav className="dash-nav" style={{ borderBottom: '2px solid #e5e7eb' }}>
        <div className="nav-inner">
          <div className="logo-text" onClick={() => navigate("/")} style={{cursor: 'pointer', color: '#2563eb', fontWeight: 'bold'}}>Roomify</div>
          <div className="nav-profile-area">
            <div className="avatar-trigger" onClick={() => setShowDropdown(!showDropdown)} style={{ background: '#2563eb' }}>
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
                  <li onClick={() => navigate("/")}>Home / Explore</li>
                  <li className="logout-action" style={{ color: '#ef4444' }} onClick={() => { localStorage.clear(); navigate("/"); }}>Logout</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="dash-main-body">
        <div className="page-head">
          <h2>My PG Requests</h2>
          <button className="btn-primary-add" onClick={() => navigate("/")} style={{ background: '#2563eb' }}>Browse More</button>
        </div>

        {loading ? <div className="empty-state">Loading...</div> : (
          <div className="pg-grid-compact">
            {requests.map((req) => (
              <div key={req._id} className="pg-card-compact" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                <div className="card-img-container">
                  <img src={req.pgId?.images?.[0]?.url || "/no-image.png"} alt="PG" />
                  <div className="price-overlay-badge" style={{ background: '#2563eb' }}>₹{req.pgId?.price}/mo</div>
                </div>
                <div className="card-body-content">
                  <h3 className="user-name-bold">{req.pgId?.name}</h3>
                  <p className="user-email-muted">{req.pgId?.location || "Address not specified"}</p>
                  
                  <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ 
                      padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', alignSelf: 'flex-start',
                      background: req.status === 'approved' ? '#dbeafe' : req.status === 'rejected' ? '#fee2e2' : '#fef9c3',
                      color: req.status === 'approved' ? '#2563eb' : req.status === 'rejected' ? '#ef4444' : '#854d0e'
                    }}>
                      Status: {req.status.toUpperCase()}
                    </span>

                    {req.status === 'approved' && (
                      <button onClick={() => fetchReceipt(req._id)} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                        📄 Download Receipt
                      </button>
                    )}
                  </div>
                  
                  <div className="split-btns" style={{ marginTop: '20px' }}>
                    <button className="view-btn" onClick={() => navigate(`/pg/${req.pgId?._id}`)} style={{ borderColor: '#2563eb', color: '#2563eb' }}>Details</button>
                    {req.status === 'pending' && (
                      <button className="btn-soft-delete" onClick={() => handleCancel(req._id)} style={{ background: '#ef4444', color: '#fff' }}>Cancel</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {selectedReceipt && <ReceiptModal receipt={selectedReceipt} onClose={() => setSelectedReceipt(null)} />}
    </div>
  );
}

export default UserDashboard;