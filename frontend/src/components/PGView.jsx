import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PGView = ({ pg, user, token }) => {
    const [flashMessage, setFlashMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleReserve = async () => {
        if (!user || !token) {
            alert("Please login first to reserve!");
            navigate('/login');
            return;
        }

        setLoading(true);
        try {
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            const response = await axios.post('/api/bookings/reserve', { pgId: pg._id }, config);

            // Trigger Success Flash Message
            setFlashMessage(response.data.message);
            
            // Clear message after 4 seconds
            setTimeout(() => setFlashMessage(""), 4000);

        } catch (err) {
            alert(err.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pg-container" style={{ padding: '20px', position: 'relative' }}>
            
            {/* Success Flash Message */}
            {flashMessage && (
                <div style={{
                    backgroundColor: '#d4edda',
                    color: '#155724',
                    padding: '15px',
                    borderRadius: '5px',
                    marginBottom: '20px',
                    textAlign: 'center',
                    border: '1px solid #c3e6cb',
                    fontWeight: 'bold'
                }}>
                    ✅ {flashMessage}
                </div>
            )}

            <h2>{pg.title}</h2>
            <p>Location: {pg.location}</p>
            <p>Price: ₹{pg.price}</p>

            <button 
                onClick={handleReserve}
                disabled={loading}
                style={{
                    backgroundColor: user ? '#28a745' : '#6c757d',
                    color: 'white',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: loading ? 'wait' : 'pointer'
                }}
            >
                {loading ? "Processing..." : user ? "Reserve Now" : "Login to Reserve"}
            </button>
        </div>
    );
};

export default PGView;