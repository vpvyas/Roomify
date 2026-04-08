import React from "react";
import { useTranslation } from "react-i18next";
import "../styles/footer.css";

function Footer() {
  const { t, i18n } = useTranslation();

  return (
    <footer className="footer">
      {/* Top Section */}
      <div className="footer-top">
        <div className="footer-column">
          <h4>{t("footer.get_to_know")}</h4>
          <p>{t("footer.about")}</p>
          <p>{t("footer.mission")}</p>
        </div>

        <div className="footer-column">
          <h4>{t("footer.connect")}</h4>
          <p>Instagram</p>
          <p>Twitter</p>
          <p>LinkedIn</p>
        </div>

        <div className="footer-column">
          <h4>{t("footer.make_money")}</h4>
          <p>{t("footer.list_pg")}</p>
          <p>{t("footer.partner")}</p>
          <p>{t("footer.advertise")}</p>
        </div>

        <div className="footer-column">
          <h4>{t("footer.help")}</h4>
          <p>{t("footer.account")}</p>
          <p>{t("footer.support")}</p>
          <p>{t("footer.privacy")}</p>
          <p>{t("footer.terms")}</p>
        </div>
      </div>

      {/* Middle Section */}
      <div className="footer-middle">
        <h2>Roomify</h2>
        
        {/* Separate Buttons for English and Hindi */}
        <button 
          className="footer-btn" 
          onClick={() => i18n.changeLanguage('en')}
          style={{ fontWeight: i18n.language === 'en' ? 'bold' : 'normal' }}
        >
          English
        </button>

        <button 
          className="footer-btn" 
          onClick={() => i18n.changeLanguage('hi')}
          style={{ fontWeight: i18n.language === 'hi' ? 'bold' : 'normal' }}
        >
          Hindi
        </button>

        
      </div>

      {/* Bottom Section */}
      <div className="footer-bottom">
        <p>{t("footer.conditions")}</p>
        <p>© {new Date().getFullYear()} Roomify. {t("footer.rights")}</p>
      </div>
    </footer>
  );
}

export default Footer;