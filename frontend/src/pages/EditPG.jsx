import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
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

  const [existingImages, setExistingImages] = useState([]); // ✅ Added to track current photos
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPG = async () => {
      try {
        const res = await axios.get(`${backendUrl}/pg/${id}`);
        const data = res.data;

        // ✅ FIXED: Null-safe mapping using ?. to prevent "Does Nothing" crash
        setFormData({
          name: data.name || "",
          description: data.description || "",
          city: data.address?.city || "",
          state: data.address?.state || "",
          location: data.address?.location || "",
          price: data.price || "",
          availableRooms: data.availableRooms || "",
          totalRooms: data.totalRooms || "",
          amenities: Array.isArray(data.amenities) ? data.amenities.join(", ") : "",
          rules: Array.isArray(data.rules) ? data.rules.join(", ") : "",
        });

        setExistingImages(data.images || []); // Store current images for the backend
      } catch (err) {
        console.error("Fetch error:", err);
        toast.error("Could not load property data");
      } finally {
        setLoading(false);
      }
    };
    fetchPG();
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
    
    // Core Data (excluding nested/array fields for manual handling)
    const exclude = ['amenities', 'rules', 'city', 'state', 'location'];
    Object.keys(formData).forEach(key => {
      if(!exclude.includes(key)) {
        data.append(key, formData[key]);
      }
    });

    // ✅ FIXED: Explicitly send address fields for backend reconstruction
    data.append("city", formData.city);
    data.append("state", formData.state);
    data.append("location", formData.location);

    // ✅ FIXED: Send existing images so backend doesn't delete them
    data.append("existingImages", JSON.stringify(existingImages));

    const amenitiesArray = formData.amenities ? formData.amenities.split(",").map(i => i.trim()) : [];
    const rulesArray = formData.rules ? formData.rules.split(",").map(i => i.trim()) : [];
    
    data.append("amenities", JSON.stringify(amenitiesArray));
    data.append("rules", JSON.stringify(rulesArray));

    if (selectedFiles.length > 0) {
      selectedFiles.forEach(file => data.append("images", file));
    }

    try {
      const response = await axios.put(`${backendUrl}/pg/update/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (response.status === 200) {
        toast.success("Property updated successfully! 🎉");
        navigate("/owner-dashboard");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  if (loading) return <div className="loading-spinner">Loading Property Details...</div>;

  return (
    <div className="edit-container">
      <div className="edit-card">
        <header className="edit-header">
          <h1>Edit Your Property</h1>
          <p>Update your details or add new photos below.</p>
        </header>

        <form onSubmit={handleSubmit} className="edit-form">
          {/* Section 1: Basic Info */}
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

          {/* Section 2: Location */}
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

          {/* Section 3: Pricing */}
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

          {/* Section 4: Features */}
          <section className="form-section">
            <h3><span className="step-num">4</span> Features & Rules</h3>
            <div className="input-group">
              <label>Amenities (WiFi, AC...)</label>
              <input name="amenities" value={formData.amenities} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label>House Rules</label>
              <input name="rules" value={formData.rules} onChange={handleChange} />
            </div>
          </section>

          {/* Section 5: Photos */}
          <section className="form-section media-upload">
            <h3><span className="step-num">5</span> Media Update</h3>
            
            {/* Display current photos count */}
            <p style={{fontSize: '14px', color: '#666'}}>
              Current photos in gallery: <strong>{existingImages.length}</strong>
            </p>

            <label className="file-label">
              <span className="upload-icon">📷</span>
              <span>Upload Additional Photos</span>
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleFileChange} 
                style={{ display: 'none' }} 
              />
              <small>
                {selectedFiles.length > 0 
                  ? `${selectedFiles.length} new files ready to upload` 
                  : "New photos will be added to your existing gallery."
                }
              </small>
            </label>
          </section>

          <div className="edit-actions">
            <button type="button" className="cancel-btn" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="save-btn">Update Property Now</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditPG;