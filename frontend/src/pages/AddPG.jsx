import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/editPG.css"; // Using the style you provided

function AddPG() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    // RECTIFIED: Capture all files as an array for multiple upload
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ownerId = user?._id || user?.id;

    if (!ownerId) {
      alert("Session expired. Please log in again.");
      return;
    }

    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("city", formData.city);
    data.append("state", formData.state);
    data.append("location", formData.location);
    data.append("price", formData.price);
    data.append("totalRooms", formData.totalRooms);
    data.append("availableRooms", formData.availableRooms);
    data.append("ownerId", ownerId);

    // RECTIFIED: Formatting amenities and rules as JSON strings for the backend
    const amenitiesArr = formData.amenities ? formData.amenities.split(",").map(i => i.trim()) : [];
    const rulesArr = formData.rules ? formData.rules.split(",").map(i => i.trim()) : [];
    data.append("amenities", JSON.stringify(amenitiesArr));
    data.append("rules", JSON.stringify(rulesArr));

    // RECTIFIED: Appending each file to the 'images' key
    for (let i = 0; i < selectedFiles.length; i++) {
      data.append("images", selectedFiles[i]);
    }

    try {
      const response = await fetch("http://localhost:3000/pg/add", {
        method: "POST",
        body: data,
        // Headers are automatically set to multipart/form-data by fetch when sending FormData
      });

      if (response.ok) {
        alert("Success! Your PG is now listed.");
        navigate("/owner-dashboard");
      } else {
        const result = await response.json();
        alert("Error: " + result.message);
      }
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Could not connect to server.");
    }
  };

  return (
    <div className="edit-container">
      <div className="edit-card">
        <header className="edit-header">
          <h1>List Your Property</h1>
          <p>Fill in the details below to add your PG to Roomify.</p>
        </header>

        <form onSubmit={handleSubmit} className="edit-form">
          {/* Section 1: Basic Information */}
          <div className="form-section">
            <h3><span className="step-num">1</span> Basic Details</h3>
            <div className="input-group">
              <label>PG Name</label>
              <input 
                name="name" 
                placeholder="e.g. Sunshine Luxury Stays" 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="input-group">
              <label>Description</label>
              <textarea 
                name="description" 
                rows="4" 
                placeholder="Describe your PG, amenities, and surroundings..." 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          {/* Section 2: Location Details */}
          <div className="form-section">
            <h3><span className="step-num">2</span> Location Info</h3>
            <div className="form-row">
              <div className="input-group">
                <label>City</label>
                <input name="city" placeholder="City" onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label>State</label>
                <input name="state" placeholder="State" onChange={handleChange} required />
              </div>
            </div>
            <div className="input-group">
              <label>Full Address / Landmark</label>
              <input 
                name="location" 
                placeholder="Street address, colony, or landmark" 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          {/* Section 3: Pricing & Capacity */}
          <div className="form-section">
            <h3><span className="step-num">3</span> Pricing & Rooms</h3>
            <div className="form-row three-col">
              <div className="input-group">
                <label>Monthly Rent (₹)</label>
                <input name="price" type="number" placeholder="Rent" onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label>Total Rooms</label>
                <input name="totalRooms" type="number" placeholder="Total" onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label>Available Rooms</label>
                <input name="availableRooms" type="number" placeholder="Available" onChange={handleChange} required />
              </div>
            </div>
          </div>

          {/* Section 4: Additional Information */}
          <div className="form-section">
            <h3><span className="step-num">4</span> Rules & Amenities</h3>
            <div className="input-group">
              <label>Amenities</label>
              <input 
                name="amenities" 
                placeholder="Wifi, AC, Food, Laundry (comma separated)" 
                onChange={handleChange} 
              />
            </div>
            <div className="input-group">
              <label>Rules</label>
              <input 
                name="rules" 
                placeholder="No Smoking, 10 PM Entry (comma separated)" 
                onChange={handleChange} 
              />
            </div>
          </div>

          {/* Section 5: Media Upload */}
          <div className="form-section media-upload">
            <h3><span className="step-num">5</span> Property Images</h3>
            <label className="file-label">
              <span className="upload-icon">📸</span>
              <span>Click to upload property photos</span>
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleFileChange} 
                required 
                style={{ display: 'none' }} 
              />
              <small>{selectedFiles.length > 0 ? `${selectedFiles.length} files selected` : "Supported: JPG, PNG, WEBP"}</small>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="edit-actions">
            <button 
              type="button" 
              className="cancel-btn" 
              onClick={() => navigate("/owner-dashboard")}
            >
              Cancel
            </button>
            <button type="submit" className="save-btn">
              Add Property
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddPG;