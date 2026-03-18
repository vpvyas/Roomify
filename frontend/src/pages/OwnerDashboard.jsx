import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import "../styles/dashboard.css"; 

// --- COMPONENT: Inline Mini Receipt Form ---
const InlineReceiptForm = ({ req, user, onCancel, onSuccess }) => {
  const [formData, setFormData] = useState({
    owner: user.name,
    ownerId: user.id || user._id,
    requestId: req._id,
    receipt_no: `REC-${Math.floor(1000 + Math.random() * 9000)}`,
    date: new Date().toISOString().split('T')[0],
    tenant_name: req.formData?.fullName || req.userId?.name,
    property_address: req.pgId?.name || "Roomify PG",
    rent_amount: req.pgId?.price || 0,
    charges: { water: 0, electricity: 0, tax: 0 },
    total_amount: req.pgId?.price || 0,
    signature: "" 
  });

  const handleChargeChange = (e) => {
    const { name, value } = e.target;
    const val = parseFloat(value) || 0;
    
    setFormData(prev => {
      const updatedCharges = { ...prev.charges, [name]: val };
      const newTotal = prev.rent_amount + updatedCharges.water + updatedCharges.electricity + updatedCharges.tax;
      return { ...prev, charges: updatedCharges, total_amount: newTotal };
    });
  };

  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, signature: reader.result })); 
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post('http://localhost:3000/api/receipts/generate', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Receipt Saved with Signature!");
      onSuccess();
    } catch (err) {
      toast.error("Failed to save receipt");
    }
  };

  return (
    <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '8px', border: '1px solid #bbf7d0', marginTop: '10px' }}>
      <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#166534' }}>Generate Rent Receipt</h4>
      <form onSubmit={handleSave} style={{ display: 'grid', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '5px' }}>
          <input type="number" placeholder="Water ₹" name="water" onChange={handleChargeChange} style={{ width: '100%', padding: '6px', fontSize: '12px', border: '1px solid #ccc', borderRadius: '4px' }} />
          <input type="number" placeholder="Elec ₹" name="electricity" onChange={handleChargeChange} style={{ width: '100%', padding: '6px', fontSize: '12px', border: '1px solid #ccc', borderRadius: '4px' }} />
          <input type="number" placeholder="Tax ₹" name="tax" onChange={handleChargeChange} style={{ width: '100%', padding: '6px', fontSize: '12px', border: '1px solid #ccc', borderRadius: '4px' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <label style={{ fontSize: '10px', color: '#166534', fontWeight: 'bold' }}>Upload Signature:</label>
          <input type="file" accept="image/*" onChange={handleSignatureUpload} style={{ fontSize: '11px' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold', color: '#166534', fontSize: '14px' }}>
          <span>Total: ₹{formData.total_amount}</span>
          <div style={{ display: 'flex', gap: '5px' }}>
            <button type="submit" style={{ background: '#166534', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Save</button>
            <button type="button" onClick={onCancel} style={{ background: '#666', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Cancel</button>
          </div>
        </div>
      </form>
    </div>
  );
};

// --- COMPONENT: ViewDetailsModal ---
const ViewDetailsModal = ({ request, onClose }) => {
  if (!request || !request.formData) return null;
  const data = request.formData;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000 }}>
      <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', width: '90%', maxWidth: '450px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
        <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>Request Details</h3>
        <div style={{ display: 'grid', gap: '10px', fontSize: '0.95rem' }}>
          <p><strong>Name:</strong> {data.fullName}</p>
          <p><strong>Phone:</strong> {data.phone}</p>
          <p><strong>Email:</strong> {data.email}</p>
          <p><strong>Move-in Date:</strong> {new Date(data.moveInDate).toLocaleDateString()}</p>
          <p><strong>Stay Duration:</strong> {data.stayDuration}</p>
          <div style={{ marginTop: '10px', padding: '10px', background: '#f9f9f9', borderRadius: '6px', borderLeft: '4px solid #333' }}>
            <strong>Message:</strong> <br />
            <span style={{ fontStyle: 'italic' }}>"{data.message || "No message provided"}"</span>
          </div>
        </div>
        <button onClick={onClose} style={{ marginTop: '20px', width: '100%', padding: '10px', background: '#333', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Close Details</button>
      </div>
    </div>
  );
};

function OwnerDashboard() {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [requests, setRequests] = useState([]);
  const [myPgs, setMyPgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [activeReceiptId, setActiveReceiptId] = useState(null); 

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    const ownerId = user.id || user._id;
    try {
      // Fetch Requests
      const reqRes = await axios.get(`http://localhost:3000/api/requests/owner/${ownerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(reqRes.data);

      // Fetch Published PGs
      const pgRes = await axios.get(`http://localhost:3000/pg/owner/${ownerId}`);
      setMyPgs(pgRes.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'owner') {
      toast.error("Access denied.");
      navigate("/login");
      return;
    }
    fetchData();
  }, []);

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      await axios.put(`http://localhost:3000/api/requests/${requestId}/status`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
      setRequests(requests.map(req => req._id === requestId ? { ...req, status: newStatus } : req ));
      toast.success(`Request ${newStatus}`);
    } catch (err) {
      toast.error("Update failed.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <div className="dashboard-wrapper">
      <nav className="dash-nav">
        <div className="nav-inner">
          <div className="logo-text" onClick={() => navigate("/")} style={{cursor: 'pointer'}}>Roomify</div>
          <div className="nav-profile-area">
            <div className="avatar-trigger" onClick={() => setShowDropdown(!showDropdown)}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            {showDropdown && (
              <div className="gfg-dropdown">
                <div className="dropdown-user-summary">
                  <div className="summary-avatar">{user.name.charAt(0).toUpperCase()}</div>
                  <div className="summary-details">
                    <span className="user-name-bold">{user.name}</span>
                    <span className="user-email-muted">{user.email}</span>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <ul className="dropdown-list">
                  <li onClick={() => navigate("/")}>Home</li>
                  <li className="logout-action" onClick={handleLogout}>Logout</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="dash-main-body">
        <div className="page-head">
          <h2 style={{ fontSize: '28px', fontWeight: 'bold' }}>Owner Dashboard</h2>
          <button className="btn-primary-add" onClick={() => navigate("/pg/add")}>+ Add New PG</button>
        </div>

        {/* --- CATEGORY 1: BOOKING REQUESTS --- */}
        <section style={{ marginBottom: '50px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#333' }}>Incoming Booking Requests</h3>
          {loading ? (
            <div className="empty-state">Loading requests...</div>
          ) : requests.length === 0 ? (
            <div className="empty-state">No requests found yet.</div>
          ) : (
            <div className="pg-grid-compact">
              {requests.map((req) => (
                <div key={req._id} className="pg-card-compact">
                  <div className="card-img-container">
                    <img src={req.pgId?.images?.[0]?.url || "/no-image.png"} alt="PG" />
                    <div className="price-overlay-badge">₹{req.pgId?.price}</div>
                  </div>
                  <div className="card-body-content">
                    <h3 className="user-name-bold">{req.pgId?.name}</h3>
                    <p className="user-email-muted">Requester: <strong>{req.userId?.name}</strong></p>
                    
                    <button onClick={() => setSelectedRequest(req)} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', padding: 0, textDecoration: 'underline', fontSize: '0.85rem' }}>
                      View Detailed Form
                    </button>
                    
                    {activeReceiptId === req._id ? (
                      <InlineReceiptForm req={req} user={user} onCancel={() => setActiveReceiptId(null)} onSuccess={() => setActiveReceiptId(null)} />
                    ) : (
                      <div style={{ marginTop: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className={`status-pill ${req.status}`}>{req.status.toUpperCase()}</span>
                        {req.status === 'approved' && (
                          <button onClick={() => setActiveReceiptId(req._id)} style={{ backgroundColor: '#2e7d32', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>
                            Generate Receipt
                          </button>
                        )}
                      </div>
                    )}
                    
                    <div className="split-btns" style={{ marginTop: '20px' }}>
                      {req.status === 'pending' ? (
                        <>
                          <button className="view-btn" onClick={() => handleStatusUpdate(req._id, 'approved')}>Approve</button>
                          <button className="btn-soft-delete" onClick={() => handleStatusUpdate(req._id, 'rejected')}>Reject</button>
                        </>
                      ) : (
                        <button className="view-btn" style={{width: '100%'}} onClick={() => navigate(`/pg/${req.pgId?._id}`)}>View PG Page</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '40px 0' }} />

        {/* --- CATEGORY 2: PUBLISHED LISTINGS --- */}
        <section>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#333' }}>My Published PG Listings</h3>
          {loading ? (
            <p>Loading your PGs...</p>
          ) : myPgs.length === 0 ? (
            <p className="empty-state">You haven't listed any PGs yet.</p>
          ) : (
            <div className="pg-grid-compact">
              {myPgs.map((pg) => (
                <div key={pg._id} className="pg-card-compact">
                  <img src={pg.images?.[0]?.url || "/no-image.png"} alt={pg.name} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
                  <div className="card-body-content">
                    <h3 className="user-name-bold">{pg.name}</h3>
                    <p className="user-email-muted">{pg.address?.city}, {pg.address?.state}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                      <span style={{ fontWeight: 'bold', color: '#166534' }}>₹{pg.price}/mo</span>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button className="view-btn" onClick={() => navigate(`/pg/${pg._id}`)}>View</button>
                        <button className="view-btn" onClick={() => navigate(`/pg/update/${pg._id}`)} style={{ background: '#f3f4f6', color: '#333' }}>Edit</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {selectedRequest && <ViewDetailsModal request={selectedRequest} onClose={() => setSelectedRequest(null)} />}
    </div>
  );
}

export default OwnerDashboard;