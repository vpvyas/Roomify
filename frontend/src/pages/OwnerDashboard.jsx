import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import "../styles/dashboard.css"; 

// --- AXIOS INTERCEPTOR ---
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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
    signature: null 
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
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File must be less than 2MB");
        return;
      }
      setFormData(prev => ({ ...prev, signature: file }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "charges") {
          data.append("charges", JSON.stringify(formData.charges));
        } else if (key !== "signature") {
          data.append(key, formData[key]);
        }
      });
      if (formData.signature instanceof File) {
        data.append("signature", formData.signature);
      }
      await axios.post('http://localhost:3000/api/receipts/generate', data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success("Receipt Saved!");
      onSuccess();
    } catch (err) { toast.error("Failed to save receipt"); }
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
        <input type="file" accept="image/*" onChange={handleSignatureUpload} style={{ fontSize: '11px' }} />
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
      <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', width: '90%', maxWidth: '450px' }}>
        <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Request Details</h3>
        <p><strong>Name:</strong> {data.fullName}</p>
        <p><strong>Phone:</strong> {data.phone}</p>
        <p><strong>Move-in:</strong> {new Date(data.moveInDate).toLocaleDateString()}</p>
        <div style={{ background: '#f9f9f9', padding: '10px', marginTop: '10px' }}>
            <strong>Message:</strong> "{data.message || "No message"}"
        </div>
        <button onClick={onClose} style={{ marginTop: '20px', width: '100%', padding: '10px', background: '#333', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Close</button>
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

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    const ownerId = user.id || user._id;
    try {
      const reqRes = await axios.get(`http://localhost:3000/api/requests/owner/${ownerId}`);
      setRequests(reqRes.data);
      // Notice: No "/api" here.
      const pgRes = await axios.get(`http://localhost:3000/pg/owner/${ownerId}`); 
      setMyPgs(pgRes.data);
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (!user || user.role !== 'owner') { navigate("/login"); return; }
    fetchData();
  }, []);

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      await axios.put(`http://localhost:3000/api/requests/${requestId}/status`, { status: newStatus });
      setRequests(prev => prev.map(req => req._id === requestId ? { ...req, status: newStatus } : req ));
      toast.success(`Request ${newStatus}`);
    } catch (err) { toast.error("Update failed."); }
  };

  const handleDeleteRequest = async (requestId) => {
    if (!window.confirm("Delete this request?")) return;
    try {
      await axios.delete(`http://localhost:3000/api/requests/${requestId}`);
      setRequests(prev => prev.filter(req => req._id !== requestId));
      toast.success("Request Deleted");
    } catch (err) { toast.error("Delete failed."); }
  };

  // ✅ RECTIFIED: CASCADE DELETE LOGIC
  const handleDeletePg = async (id) => {
    if (!window.confirm("Delete listing and Cloudinary images permanently?")) return;
    try {
      // Adjusted URL to match your backend PG route pattern (removing /api)
      await axios.delete(`http://localhost:3000/pg/${id}`); 
      
      setMyPgs(prev => prev.filter(pg => pg._id !== id));
      setRequests(prev => prev.filter(req => req.pgId?._id !== id && req.pgId !== id));
      toast.success("Deleted!");
    } catch (err) {
      console.error("DELETE ERROR:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to delete property");
    }
  };

  const handleLogout = () => { localStorage.clear(); navigate("/"); };

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

        <section style={{ marginBottom: '50px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>Incoming Booking Requests</h3>
          {loading ? (
            <div className="empty-state">Loading...</div>
          ) : requests.length === 0 ? (
            <div className="empty-state">No requests.</div>
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
                    <p className="user-email-muted">Requester: {req.userId?.name}</p>
                    <button onClick={() => setSelectedRequest(req)} style={{ color: '#007bff', background: 'none', border: 'none', textDecoration: 'underline', fontSize: '12px', cursor: 'pointer' }}>View Details</button>
                    <div style={{ marginTop: '10px' }}>
                      <span className={`status-pill ${req.status}`}>{req.status.toUpperCase()}</span>
                    </div>

                    {activeReceiptId === req._id ? (
                      <InlineReceiptForm req={req} user={user} onCancel={() => setActiveReceiptId(null)} onSuccess={() => setActiveReceiptId(null)} />
                    ) : (
                      <div className="split-btns" style={{ marginTop: '15px' }}>
                        {req.status === 'pending' ? (
                          <>
                            <button className="view-btn" onClick={() => handleStatusUpdate(req._id, 'approved')}>Approve</button>
                            <button className="btn-soft-delete" onClick={() => handleStatusUpdate(req._id, 'rejected')}>Reject</button>
                          </>
                        ) : req.status === 'rejected' ? (
                          <button className="btn-soft-delete" style={{ width: '100%', background: '#ff4d4d', color: '#fff' }} onClick={() => handleDeleteRequest(req._id)}>
                            Delete Card
                          </button>
                        ) : (
                          <>
                            <button className="view-btn" onClick={() => setActiveReceiptId(req._id)} style={{ background: '#2e7d32', color: '#fff' }}>Receipt</button>
                            <button className="view-btn" onClick={() => navigate(`/pg/${req.pgId?._id}`)}>View PG</button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <hr style={{ margin: '40px 0', border: 'none', borderTop: '1px solid #eee' }} />

        <section>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>My Published PG Listings</h3>
          <div className="pg-grid-compact">
            {myPgs.map((pg) => (
              <div key={pg._id} className="pg-card-compact">
                <img src={pg.images?.[0]?.url || "/no-image.png"} alt={pg.name} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
                <div className="card-body-content">
                  <h3 className="user-name-bold">{pg.name}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                    <span style={{ fontWeight: 'bold' }}>₹{pg.price}/mo</span>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button className="view-btn" onClick={() => navigate(`/pg/${pg._id}`)}>View</button>
                      <button className="view-btn" onClick={() => navigate(`/pg/update/${pg._id}`)} style={{ background: '#f3f4f6', color: '#333' }}>Edit</button>
                      <button className="view-btn" onClick={() => handleDeletePg(pg._id)} style={{ background: '#fee2e2', color: '#dc2626' }}>Delete</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {selectedRequest && <ViewDetailsModal request={selectedRequest} onClose={() => setSelectedRequest(null)} />}
    </div>
  );
}

export default OwnerDashboard;