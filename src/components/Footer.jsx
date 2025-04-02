import React from 'react';
import { Link } from 'react-router-dom';
import { FaDownload, FaGithub, FaTwitter, FaTelegram } from 'react-icons/fa';
import '../styles/Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-logo">
            <Link to="/" className="footer-logo-link">
              <FaDownload className="footer-logo-icon" />
              <span className="footer-logo-text">SiteToZip</span>
            </Link>
            <p className="footer-tagline">
              Download any website as a ZIP file for offline use.
            </p>
            <div className="social-links">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="GitHub"
              >
                <FaGithub />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Twitter"
              >
                <FaTwitter />
              </a>
              <a 
                href="https://t.me" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Telegram"
              >
                <FaTelegram />
              </a>
            </div>
          </div>
          
          <div className="footer-links">
            <div className="footer-links-column">
              <h3>Site</h3>
              <ul>
                <li>
                  <Link to="/">Home</Link>
                </li>
                <li>
                  <Link to="/how-it-works">How It Works</Link>
                </li>
                <li>
                  <Link to="/about">About</Link>
                </li>
              </ul>
            </div>
            
            <div className="footer-links-column">
              <h3>Legal</h3>
              <ul>
                <li>
                  <Link to="/privacy">Privacy Policy</Link>
                </li>
                <li>
                  <Link to="/terms">Terms of Service</Link>
                </li>
              </ul>
            </div>
            
            <div className="footer-links-column">
              <h3>Other Tools</h3>
              <ul>
                <li>
                  <a href="https://t.me/sitetozipbot" target="_blank" rel="noopener noreferrer">
                    Telegram Bot
                  </a>
                </li>
                <li>
                  <a href="#chrome-extension" target="_blank" rel="noopener noreferrer">
                    Chrome Extension
                  </a>
                </li>
                <li>
                  <a href="#api" target="_blank" rel="noopener noreferrer">
                    API Access
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {currentYear} SiteToZip. All rights reserved.</p>
          <p className="footer-disclaimer">
            Please only download websites you have permission to archive.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;