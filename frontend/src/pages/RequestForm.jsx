import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

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
    
    try {
      await axios.post("http://localhost:3000/api/requests/send", {
        pgId: pg._id,
        userId: user.id || user._id,
        ownerId: pg.owner._id || pg.owner,
        formData: formData // Sending all details to the backend
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success("Request sent to owner!");
      onFinish(); 
    } catch (err) {
      toast.error(err.response?.data?.message || "Error sending request");
    }
  };

  return (
    <div className="modal-overlay" style={overlayStyle}>
      <div className="form-modal" style={modalStyle}>
        <h2 style={{ marginBottom: '20px', color: '#333' }}>Booking Details</h2>
        <form onSubmit={handleSubmit} style={formStyle}>
          <div className="input-group">
            <label>Full Name</label>
            <input type="text" value={formData.fullName} required
              onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="input-group">
              <label>Phone</label>
              <input type="tel" required
                onChange={(e) => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div className="input-group">
              <label>Email</label>
              <input type="email" value={formData.email} required
                onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>
          </div>

          <div className="input-group">
            <label>Occupation</label>
            <input type="text" placeholder="e.g. Student / Software Engineer" required
              onChange={(e) => setFormData({...formData, occupation: e.target.value})} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="input-group">
              <label>Move-in Date</label>
              <input type="date" required
                onChange={(e) => setFormData({...formData, moveInDate: e.target.value})} />
            </div>
            <div className="input-group">
              <label>Stay Duration</label>
              <input type="text" placeholder="e.g. 6 Months" required
                onChange={(e) => setFormData({...formData, stayDuration: e.target.value})} />
            </div>
          </div>

          <div className="input-group">
            <label>Message to Owner</label>
            <textarea rows="3" placeholder="Any special requests?"
              onChange={(e) => setFormData({...formData, message: e.target.value})} />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button type="submit" className="btn-primary" style={{ flex: 2 }}>Send Request</button>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Simple inline styles for the modal
const overlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 };
const modalStyle = { background: '#fff', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '500px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '15px' };

export default RequestForm;