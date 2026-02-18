import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";
import Footer from "./components/footer"
export default function Home() {
  const [search, setSearch] = useState("");
  const [pgListData, setPgListData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:3000/pg/all")
      .then((res) => res.json())
      .then((data) => setPgListData(data))
      .catch((err) => console.log("Error fetching PGs:", err));
  }, []);

  const filteredPGs = pgListData.filter(
    (pg) =>
      pg.name?.toLowerCase().includes(search.toLowerCase()) ||
      pg.address?.city?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mainnav">
      {/* Navbar */}
      <nav className="navbar">
        <h1 className="logo">Roomify</h1>

        <div className="box2">
          <input
            type="text"
            placeholder="Search PG..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btnsearch">Search</button>
        </div>

        <div>
          <button className="loginbtn">Login</button>
          <button className="ownerbtn">Start as Owner</button>
        </div>
      </nav>

      {/* PG LIST */}
      <main className="maincontent">
        <h2 className="section-title">Available PGs</h2>

        <div className="pg-grid">
          {filteredPGs.map((pg) => (
            <div key={pg._id} className="pg-card">
              <img
                src={pg.images?.length ? pg.images[0] : "/no-image.png"}
                alt={pg.name}
                className="pg-image"
              />

              <h3>{pg.name}</h3>
              <p>{pg.address?.city}</p>
              <p className="pg-price">₹{pg.price}/mo</p>

              <button
                className="view-btn"
                onClick={() => navigate(`/pg/${pg._id}`)}
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      </main>
          <Footer/>
    </div>
  );
}
