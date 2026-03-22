import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast"; // Using toast for consistency
import axios from "axios"; // 1. Import axios
import "../styles/editPG.css"; 

function EditPG() {
  const { id } = useParams();
  const navigate = useNavigate();
  const backendUrl = "http://localhost:3000";

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    city: "",
    state: "",
    location: "",
    price: "",
    availableRooms: "",
    totalRooms: "",
    amenities: "",
    rules: "",
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 2. Converted to Axios GET
    axios.get(`${backendUrl}/pg/${id}`)
      .then((res) => {
        const data = res.data;
        setFormData({
          name: data.name,
          description: data.description,
          city: data.address.city,
          state: data.address.state,
          location: data.address.location,
          price: data.price,
          availableRooms: data.availableRooms,
          totalRooms: data.totalRooms,
          amenities: Array.isArray(data.amenities) ? data.amenities.join(", ") : "",
          rules: Array.isArray(data.rules) ? data.rules.join(", ") : "",
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching PG:", err);
        toast.error("Could not load property data");
        setLoading(false);
      });
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    
    // Core Data
    Object.keys(formData).forEach(key => {
        if(key !== 'amenities' && key !== 'rules') {
            data.append(key, formData[key]);
        }
    });

    const amenitiesArray = formData.amenities ? formData.amenities.split(",").map(i => i.trim()) : [];
    const rulesArray = formData.rules ? formData.rules.split(",").map(i => i.trim()) : [];
    
    data.append("amenities", JSON.stringify(amenitiesArray));
    data.append("rules", JSON.stringify(rulesArray));

    if (selectedFiles.length > 0) {
      for (let i = 0; i < selectedFiles.length; i++) {
        data.append("images", selectedFiles[i]);
      }
    }

    try {
      // 3. Converted to Axios PUT
      // The interceptor in App.js will now automatically add the Authorization header!
      const response = await axios.put(`${backendUrl}/pg/update/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (response.status === 200) {
        toast.success("Property updated successfully! 🎉");
        navigate("/owner-dashboard");
      }
    } catch (error) {
      console.error("Submission error:", error);
      const errorMsg = error.response?.data?.message || "Update failed";
      toast.error(errorMsg);
    }
  };

  if (loading) return <div className="loading-spinner">Loading Property Details...</div>;

  return (
    <div className="edit-container">
      <div className="edit-card">
        <header className="edit-header">
          <h1>Edit Your Property</h1>
          <p>Update your property details to keep listings accurate.</p>
        </header>

        <form onSubmit={handleSubmit} className="edit-form">
          <section className="form-section">
            <h3><span className="step-num">1</span> Basic Information</h3>
            <div className="input-group">
              <label>Property Name</label>
              <input name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label>Detailed Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows="4" required />
            </div>
          </section>

          <section className="form-section">
            <h3><span className="step-num">2</span> Location Details</h3>
            <div className="form-row">
              <div className="input-group">
                <label>City</label>
                <input name="city" value={formData.city} onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label>State</label>
                <input name="state" value={formData.state} onChange={handleChange} required />
              </div>
            </div>
            <div className="input-group">
              <label>Full Address / Landmark</label>
              <input name="location" value={formData.location} onChange={handleChange} required />
            </div>
          </section>

          <section className="form-section">
            <h3><span className="step-num">3</span> Pricing & Capacity</h3>
            <div className="form-row three-col">
              <div className="input-group">
                <label>Monthly Rent (₹)</label>
                <input name="price" type="number" value={formData.price} onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label>Total Rooms</label>
                <input name="totalRooms" type="number" value={formData.totalRooms} onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label>Available</label>
                <input name="availableRooms" type="number" value={formData.availableRooms} onChange={handleChange} required />
              </div>
            </div>
          </section>

          <section className="form-section">
            <h3><span className="step-num">4</span> Features & Rules</h3>
            <div className="input-group">
              <label>Amenities (Comma separated)</label>
              <input name="amenities" value={formData.amenities} placeholder="WiFi, AC, Food, Laundry..." onChange={handleChange} />
            </div>
            <div className="input-group">
              <label>House Rules (Comma separated)</label>
              <input name="rules" value={formData.rules} placeholder="No Smoking, 10 PM Entry..." onChange={handleChange} />
            </div>
          </section>

          <section className="form-section media-upload">
            <h3><span className="step-num">5</span> Media Update</h3>
            <label className="file-label">
              <span className="upload-icon">📷</span>
              <span>Upload New Photos (Optional)</span>
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleFileChange} 
                style={{ display: 'none' }} 
              />
              <small>
                {selectedFiles.length > 0 
                  ? `${selectedFiles.length} new files selected` 
                  : "Supported: JPG, PNG, WEBP. This will replace your current image gallery."
                }
              </small>
            </label>
          </section>

          <div className="edit-actions">
            <button type="button" className="cancel-btn" onClick={() => navigate(-1)}>Cancel Changes</button>
            <button type="submit" className="save-btn">Update Property Now</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditPG;