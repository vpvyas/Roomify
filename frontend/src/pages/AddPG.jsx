import React, { useState } from "react";
import "../styles/addRoom.css";

function AddPG({ isOpen, onClose, onRefresh }) {
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
    imageLink: "",
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // RECTIFIED: Check for both _id and id
    const ownerId = user?._id || user?.id;

    if (!ownerId) {
      alert("Session expired. Please log in again to list a property.");
      return;
    }

    const pgData = {
      name: formData.name,
      description: formData.description,
      address: {
        city: formData.city,
        state: formData.state,
        location: formData.location
      },
      // Converters to match Schema expectations
      amenities: formData.amenities ? formData.amenities.split(",").map(item => item.trim()) : [],
      rules: formData.rules ? formData.rules.split(",").map(item => item.trim()) : [],
      price: Number(formData.price),
      availableRooms: Number(formData.availableRooms),
      totalRooms: Number(formData.totalRooms),
      images: [formData.imageLink],
      ownerId: ownerId // This is what the backend route expects
    };

    try {
      const response = await fetch("http://localhost:3000/pg/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pgData),
      });

      const result = await response.json();
      if (response.ok) {
        alert("Success! Your PG is now listed.");
        onRefresh(); 
        onClose();   
      } else {
        alert("Error: " + result.message);
      }
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Could not connect to server.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="form-container modal-content">
        <div className="modal-header">
          <h2>List Your Property</h2>
          <button className="close-x" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="professional-form">
          <input name="name" placeholder="PG Name" onChange={handleChange} required />
          <textarea name="description" placeholder="Description" onChange={handleChange} required />
          
          <div className="row">
            <input name="city" placeholder="City" onChange={handleChange} required />
            <input name="state" placeholder="State" onChange={handleChange} required />
          </div>
          <input name="location" placeholder="Full Address / Landmark" onChange={handleChange} required />

          <div className="row">
            <input name="price" type="number" placeholder="Monthly Rent" onChange={handleChange} required />
            <input name="totalRooms" type="number" placeholder="Total Rooms" onChange={handleChange} required />
            <input name="availableRooms" type="number" placeholder="Available Rooms" onChange={handleChange} required />
          </div>

          <input name="amenities" placeholder="Amenities (Wifi, AC, Food...)" onChange={handleChange} />
          <input name="rules" placeholder="Rules (No Smoking, Timing...)" onChange={handleChange} />
          <input name="imageLink" placeholder="Image URL" onChange={handleChange} required />

          <div className="btn-group">
            <button type="button" className="back-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="submit-btn">Add Property</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddPG;