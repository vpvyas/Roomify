import React from "react";
import "../styles/footer.css";

function Footer() {
  return (
    <footer className="footer">

      {/* Top Section */}
      <div className="footer-top">
        <div className="footer-column">
          <h4>Get to Know Us</h4>
          <p>About Roomify</p>
          <p>Our Mission</p>
        </div>

        <div className="footer-column">
          <h4>Connect with Us</h4>
          <p>Instagram</p>
          <p>Twitter</p>
          <p>LinkedIn</p>
        </div>

        <div className="footer-column">
          <h4>Make Money with Us</h4>
          <p>List Your PG</p>
          <p>Become a Partner</p>
          <p>Advertise with Us</p>
        </div>

        <div className="footer-column">
          <h4>Let Us Help You</h4>
          <p>Your Account</p>
          <p>Support</p>
          <p>Privacy Policy</p>
          <p>Terms & Conditions</p>
        </div>
      </div>

      {/* Middle Section */}
      <div className="footer-middle">
        <h2>Roomify</h2>
        <button className="footer-btn">English</button>
        <button className="footer-btn">India</button>
      </div>

      {/* Bottom Section */}
      <div className="footer-bottom">
        <p>Conditions of Use & Sale | Privacy Notice</p>
        <p>© {new Date().getFullYear()} Roomify. All rights reserved.</p>
      </div>

    </footer>
  );
}

export default Footer;
