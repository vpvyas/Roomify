import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Receipt.css";

const ReceiptView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/receipts/${id}`);
        setData(res.data.receipt_details);
      } catch (err) {
        console.error("Error fetching receipt:", err);
      }
    };
    fetchReceipt();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (!data) return <div className="loading">Loading Digital Receipt...</div>;

  return (
    /* Added white background and min-height to the wrapper */
    <div className="receipt-screen-wrapper" style={{ backgroundColor: "#ffffff", minHeight: "100vh", paddingBottom: "50px" }}>
      
      {/* Header Bar - Hidden during print via CSS */}
      <div className="receipt-header-bar" style={{ backgroundColor: "#f8f9fa", borderBottom: "1px solid #ddd" }}>
        <h2 className="header-title" style={{ color: "#333" }}>Rent Receipt - {data.receipt_no}</h2>
        <div className="header-actions">
          <button className="download-pdf-btn" onClick={handlePrint}>
            <span className="icon">📩</span> Download PDF
          </button>
          <button className="close-btn" onClick={() => navigate(-1)}>
            Close
          </button>
        </div>
      </div>

      {/* Printable Receipt Area */}
      <div className="receipt-paper" style={{ backgroundColor: "#ffffff", boxShadow: "none", border: "1px solid #eee" }}>
        <div className="receipt-content">
          <h1 className="receipt-title">RENT RECEIPT</h1>
          <div className="title-underline"></div>
          
          <div className="receipt-row mt-30">
            <span className="label">Owner:</span>
            <span className="value-underline">{data.owner}</span>
          </div>

          <div className="receipt-row flex-between">
            <span className="label">Receipt No: <span className="mono">{data.receipt_no}</span></span>
            <span className="label">Dated: <span className="mono">{new Date(data.date).toLocaleDateString()}</span></span>
          </div>

          <p className="receipt-text">Received with thanks from: <strong className="bold-text">{data.tenant_name}</strong></p>
          <div className="dotted-line"></div>
          
          <p className="receipt-text">Address: {data.property_address}</p>
          <div className="dotted-line"></div>

          <p className="receipt-text">The sum of Rs: <strong className="bold-text">{data.total_amount}</strong></p>
          <div className="dotted-line"></div>
          
          <div className="receipt-grid">
            <div className="grid-item">Monthly Rent: ₹{data.rent_amount}</div>
            <div className="grid-item">Water Charges: ₹{data.charges.water}</div>
            <div className="grid-item">Electricity: ₹{data.charges.electricity}</div>
            <div className="grid-item">House Tax: ₹{data.charges.tax}</div>
          </div>

          <div className="receipt-footer">
            <div className="total-box-display" style={{ border: "2px solid #333", backgroundColor: "#fff" }}>
              Rs. {data.total_amount}
            </div>
            <div className="signature-container">
               <div className="signature-placeholder">
                  {data.owner_signature && <img src={data.owner_signature} alt="sig" className="sig-img" />}
               </div>
              <div className="sig-line"></div>
              <span className="sig-label">Signature of Owner</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptView;